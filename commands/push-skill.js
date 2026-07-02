import { readFile, cp, rm } from 'fs/promises';
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

// A skill is a *directory* (the one holding SKILL.md), not just that file.
// Supporting files and folders live alongside SKILL.md and must travel with it.
function findSkillDirInSource(sourcePath, skillName) {
  const directDir = join(sourcePath, skillName);
  if (findSkillFile(directDir)) return directDir;

  // Walk the tree: find any directory named skillName that holds a SKILL.md.
  // Skills can be nested at any depth (e.g. frameworks/payload/<skill>), so a
  // single-level scan misses them.
  const stack = [sourcePath];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = join(dir, entry.name);
      if (entry.name === skillName && findSkillFile(full)) return full;
      stack.push(full);
    }
  }

  return null;
}

// `.agents/skills` is the single local source of truth. `.claude/skills` is a
// derived copy kept in sync after a push, never read as the canonical version.
function localSkillDir(cwd, skillName) {
  const agents = join(cwd, '.agents', 'skills', skillName);
  const claude = join(cwd, '.claude', 'skills', skillName);
  if (findSkillFile(agents)) return agents;
  if (findSkillFile(claude)) return claude;
  return null;
}

// All files under `dir`, as paths relative to `dir`, sorted. Missing dir → [].
function listFilesRelative(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const stack = [''];
  while (stack.length) {
    const rel = stack.pop();
    const abs = rel ? join(dir, rel) : dir;
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const childRel = rel ? join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) stack.push(childRel);
      else out.push(childRel);
    }
  }
  return out.sort();
}

// Compare two skill directories file-by-file (binary-safe, so assets count too).
// Returns files that, applying local → source, would be added / removed / changed.
async function diffSkillDirs(sourceDir, localDir) {
  const sourceFiles = listFilesRelative(sourceDir);
  const localFiles = listFilesRelative(localDir);
  const sourceSet = new Set(sourceFiles);
  const localSet = new Set(localFiles);

  const added = localFiles.filter((f) => !sourceSet.has(f));
  const removed = sourceFiles.filter((f) => !localSet.has(f));

  const changed = [];
  for (const f of localFiles) {
    if (!sourceSet.has(f)) continue;
    const [sourceContent, localContent] = await Promise.all([
      readFile(join(sourceDir, f)),
      readFile(join(localDir, f)),
    ]);
    if (!sourceContent.equals(localContent)) changed.push(f);
  }

  return { added, removed, changed };
}

const hasDiff = ({ added, removed, changed }) =>
  added.length > 0 || removed.length > 0 || changed.length > 0;

// Make `destDir` an exact mirror of `srcDir`: copy new/changed files and drop
// files that no longer exist in the source. Git then sees adds, edits, deletes.
async function mirrorDir(srcDir, destDir) {
  const srcSet = new Set(listFilesRelative(srcDir));
  for (const f of listFilesRelative(destDir)) {
    if (!srcSet.has(f)) await rm(join(destDir, f));
  }
  await cp(srcDir, destDir, { recursive: true, force: true });
}

async function syncOtherLocation(cwd, skillName, pushedDir) {
  const agentsDir = join(cwd, '.agents', 'skills', skillName);
  const claudeDir = join(cwd, '.claude', 'skills', skillName);

  const isAgents = resolve(pushedDir) === resolve(agentsDir);
  const target = isAgents ? claudeDir : agentsDir;
  const targetLabel = isAgents ? '.claude' : '.agents';

  // Only sync a location that already exists; never conjure a second copy.
  if (!findSkillFile(target)) return;

  if (hasDiff(await diffSkillDirs(target, pushedDir))) {
    await mirrorDir(pushedDir, target);
    console.log(`✓ Synced ${targetLabel}/skills/${skillName}`);
  }
}

async function detectModified(cwd, lock) {
  const modified = [];

  for (const [skillName, entry] of Object.entries(lock.skills)) {
    if (!isLocalSource(entry)) continue;
    const sourcePath = resolve(entry.source);
    const sourceDir = findSkillDirInSource(sourcePath, skillName);
    if (!sourceDir) continue;

    const localDir = localSkillDir(cwd, skillName);
    if (!localDir) continue;

    const diff = await diffSkillDirs(sourceDir, localDir);
    if (hasDiff(diff)) {
      modified.push({ skillName, localDir, sourceDir, sourcePath, diff });
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
          const name = isCursor ? `\x1b[1m${item.skillName}\x1b[0m` : item.skillName;
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
  const { skillName, localDir, sourceDir, sourcePath, diff } = item;
  const { added, removed, changed } = diff;

  // Nothing to push when the local dir already matches the source. Without this
  // guard the named form would still prompt and then `git commit` an empty
  // change, which exits non-zero and surfaces as a misleading "commit failed".
  if (!hasDiff(diff)) {
    console.log(`✓ "${skillName}" is already in sync with the source — nothing to push.`);
    return;
  }

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

  // Show the file-level changes that will be pushed.
  console.log(`\nChanges in "${skillName}":`);
  for (const f of changed) console.log(`  \x1b[33m~\x1b[0m ${f}`);
  for (const f of added) console.log(`  \x1b[32m+\x1b[0m ${f}`);
  for (const f of removed) console.log(`  \x1b[31m-\x1b[0m ${f}`);

  if (dryRun) {
    console.log(`\n[dry-run] Would mirror:\n  ${localDir}\n  → ${sourceDir}`);
    console.log(`[dry-run] Would commit and push in ${sourcePath}`);
    return;
  }

  const answer = await prompt('\nOverwrite source with your local version? [y/N]');
  if (answer !== 'y') {
    console.log('Aborted.');
    return;
  }

  // Push to source repo — mirror the whole skill directory, not just SKILL.md.
  await mirrorDir(localDir, sourceDir);
  console.log(`\n✓ Mirrored → ${sourceDir}`);

  // `git add -A <dir>` stages adds, edits and deletes, scoped to this skill.
  run(`git add -A "${sourceDir}"`, sourcePath);
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
  await syncOtherLocation(cwd, skillName, localDir);

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
    const sourcePath = resolve(entry.source);
    const localDir = localSkillDir(cwd, skillName);
    if (!localDir) throw new Error(`Local skill not found: ${skillName}`);
    const sourceDir = findSkillDirInSource(sourcePath, skillName);
    if (!sourceDir) throw new Error(`Source skill not found in ${sourcePath}`);
    const diff = await diffSkillDirs(sourceDir, localDir);
    await doPush({ skillName, localDir, sourceDir, sourcePath, diff }, dryRun, cwd);
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
