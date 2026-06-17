import { readFile, copyFile } from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import * as readline from 'readline';

function run(cmd, cwd) {
  return spawnSync(cmd, { shell: true, cwd, encoding: 'utf-8' });
}

const isUrl = (s) => s.startsWith('https://') || s.startsWith('git@') || s.startsWith('github:');

// push-skill writes back to a source repo on disk. External (github/url) sources
// have no local checkout, so they can't be pushed this way.
function isLocalSource({ source, sourceType }) {
  if (sourceType && sourceType !== 'local') return false;
  if (isUrl(source)) return false;
  return true;
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question + ' ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function readLockFile(cwd) {
  const lockPath = join(cwd, 'skills-lock.json');
  if (!existsSync(lockPath)) {
    throw new Error('skills-lock.json not found. Run "ags skills add" first.');
  }
  return JSON.parse(await readFile(lockPath, 'utf-8'));
}

function findSkillFile(dir) {
  for (const name of ['SKILL.md', 'skill.md']) {
    const p = join(dir, name);
    if (existsSync(p)) return p;
  }
  return null;
}

function findSkillInSource(sourcePath, skillName) {
  const direct = findSkillFile(join(sourcePath, skillName));
  if (direct) return direct;

  for (const entry of readdirSync(sourcePath)) {
    const candidate = join(sourcePath, entry, skillName);
    if (existsSync(candidate)) {
      const found = findSkillFile(candidate);
      if (found) return found;
    }
  }

  return null;
}

function localSkillFile(cwd, skillName) {
  return (
    findSkillFile(join(cwd, '.agents', 'skills', skillName)) ||
    findSkillFile(join(cwd, '.claude', 'skills', skillName))
  );
}

function allLocalSkillFiles(cwd, skillName) {
  const files = [];
  const agents = findSkillFile(join(cwd, '.agents', 'skills', skillName));
  const claude = findSkillFile(join(cwd, '.claude', 'skills', skillName));
  if (agents) files.push({ file: agents, location: '.agents' });
  if (claude) files.push({ file: claude, location: '.claude' });
  return files;
}

async function syncOtherLocation(cwd, skillName, pushedFile) {
  const agentsFile = findSkillFile(join(cwd, '.agents', 'skills', skillName));
  const claudeFile = findSkillFile(join(cwd, '.claude', 'skills', skillName));

  const isAgents = pushedFile === agentsFile;
  const target = isAgents ? claudeFile : agentsFile;
  const targetLabel = isAgents ? '.claude' : '.agents';

  if (!target) return;

  const pushedContent = await readFile(pushedFile, 'utf-8');
  const targetContent = await readFile(target, 'utf-8');

  if (pushedContent !== targetContent) {
    await copyFile(pushedFile, target);
    console.log(`✓ Synced ${targetLabel}/skills/${skillName}`);
  }
}

async function detectModified(cwd, lock) {
  const modified = [];

  for (const [skillName, entry] of Object.entries(lock.skills)) {
    if (!isLocalSource(entry)) continue;
    const sourcePath = resolve(entry.source);
    const sourceFile = findSkillInSource(sourcePath, skillName);
    if (!sourceFile) continue;

    const sourceContent = await readFile(sourceFile, 'utf-8');
    const locals = allLocalSkillFiles(cwd, skillName);

    for (const { file, location } of locals) {
      const localContent = await readFile(file, 'utf-8');
      if (localContent !== sourceContent) {
        modified.push({ skillName, displayName: `${skillName} (${location})`, localSkillFile: file, sourceSkillFile: sourceFile, sourcePath, localContent, sourceContent });
        break;
      }
    }
  }

  return modified;
}

function selectFromList(items) {
  return new Promise((resolveP) => {
    let cursor = 0;
    let lastLineCount = 0;

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();

    const render = () => {
      const lines = [
        `\x1b[1mModified skills\x1b[0m  \x1b[2m(↑↓ navigate · enter select · ctrl+c cancel)\x1b[0m`,
        '',
        ...items.map((item, i) => {
          const isCursor = i === cursor;
          const prefix = isCursor ? '\x1b[36m>\x1b[0m' : ' ';
          const label = item.displayName || item.skillName;
          const name = isCursor ? `\x1b[1m${label}\x1b[0m` : label;
          return `  ${prefix} ${name}`;
        }),
        '',
      ];

      const content = lines.join('\n');
      const lineCount = content.split('\n').length - 1;

      if (lastLineCount > 0) {
        process.stdout.write(`\x1b[${lastLineCount}A\x1b[0J`);
      }

      process.stdout.write(content);
      lastLineCount = lineCount;
    };

    const cleanup = () => {
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('keypress', onKeypress);
    };

    const onKeypress = (str, key) => {
      if (!key) return;
      if (key.name === 'up') {
        cursor = Math.max(0, cursor - 1);
      } else if (key.name === 'down') {
        cursor = Math.min(items.length - 1, cursor + 1);
      } else if (key.name === 'return') {
        cleanup();
        process.stdout.write('\n');
        resolveP(items[cursor]);
        return;
      } else if (key.name === 'c' && key.ctrl) {
        cleanup();
        process.stdout.write('\n');
        process.exit(0);
      }
      render();
    };

    process.stdin.on('keypress', onKeypress);
    render();
  });
}

async function doPush(item, dryRun, cwd) {
  const { skillName, localSkillFile, sourceSkillFile, sourcePath, localContent, sourceContent } = item;

  // Check remote
  console.log(`\nChecking remote for changes...`);
  const fetchResult = run('git fetch', sourcePath);
  if (fetchResult.status !== 0) {
    console.warn(`⚠ Could not fetch from remote: ${fetchResult.stderr.trim()}`);
  } else {
    const statusResult = run('git status -uno', sourcePath);
    if (statusResult.stdout.includes('behind')) {
      throw new Error(`⚠ Remote repo has newer commits. Pull first:\n  git -C "${sourcePath}" pull`);
    }
  }

  // Show diff
  const localLines = localContent.split('\n').length;
  const sourceLines = sourceContent.split('\n').length;
  console.log(`\nChanges in "${skillName}":`);
  console.log(`  source: ${sourceLines} lines`);
  console.log(`  local:  ${localLines} lines`);
  console.log(`\n--- source (first 20 lines)`);
  console.log(sourceContent.split('\n').slice(0, 20).join('\n'));
  console.log(`\n+++ local (first 20 lines)`);
  console.log(localContent.split('\n').slice(0, 20).join('\n'));

  if (dryRun) {
    console.log(`\n[dry-run] Would copy:\n  ${localSkillFile}\n  → ${sourceSkillFile}`);
    console.log(`[dry-run] Would commit and push in ${sourcePath}`);
    return;
  }

  const answer = await prompt('\nOverwrite source with your local version? [y/N]');
  if (answer !== 'y') {
    console.log('Aborted.');
    return;
  }

  // Push to source repo
  await copyFile(localSkillFile, sourceSkillFile);
  console.log(`\n✓ Copied → ${sourceSkillFile}`);

  run(`git add "${sourceSkillFile}"`, sourcePath);
  const commitResult = run(`git commit -m "Update skill: ${skillName}"`, sourcePath);
  if (commitResult.status !== 0) {
    throw new Error(`git commit failed:\n${commitResult.stderr}`);
  }

  const pushResult = run('git push', sourcePath);
  if (pushResult.status !== 0) {
    throw new Error(`git push failed:\n${pushResult.stderr}`);
  }

  console.log(`✓ Pushed to remote.`);

  // Sync do drugiej lokalizacji
  await syncOtherLocation(cwd, skillName, localSkillFile);

  console.log(`\nTo pull this update in other projects: ags skills update`);
}

export async function pushSkill(args) {
  const dryRun = args.includes('--dry-run');
  const skillName = args.find((a) => !a.startsWith('--'));

  const cwd = process.cwd();
  const lock = await readLockFile(cwd);

  if (skillName) {
    if (!lock.skills[skillName]) {
      throw new Error(`Skill "${skillName}" not found in skills-lock.json.`);
    }
    const entry = lock.skills[skillName];
    if (!isLocalSource(entry)) {
      throw new Error(`Skill "${skillName}" comes from an external source (${entry.source}) and has no local checkout — push-skill only works with local source repos.`);
    }
    const { source } = entry;
    const sourcePath = resolve(source);
    const local = localSkillFile(cwd, skillName);
    if (!local) throw new Error(`Local skill not found: ${skillName}`);
    const sourceFile = findSkillInSource(sourcePath, skillName);
    if (!sourceFile) throw new Error(`Source skill not found in ${sourcePath}`);
    const [localContent, sourceContent] = await Promise.all([
      readFile(local, 'utf-8'),
      readFile(sourceFile, 'utf-8'),
    ]);
    await doPush({ skillName, localSkillFile: local, sourceSkillFile: sourceFile, sourcePath, localContent, sourceContent }, dryRun, cwd);
    return;
  }

  // No skill name — detect modified and show list
  console.log('Scanning for modified skills...');
  const modified = await detectModified(cwd, lock);

  if (!modified.length) {
    console.log('✓ All skills are up to date.');
    return;
  }

  const selected = await selectFromList(modified);
  await doPush(selected, dryRun, cwd);
}
