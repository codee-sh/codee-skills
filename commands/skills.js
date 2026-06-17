import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { resolve, join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { interactiveAdd } from './interactive-add.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const DEFAULT_AGENTS = ['-a', 'claude-code', '-a', 'codex', '--copy'];

const SOURCE_SUBCOMMANDS = new Set(['add', 'update', 'remove', 'find']);

const isUrl = (s) => s.startsWith('https://') || s.startsWith('git@') || s.startsWith('github:');

// A lock entry is "external" (github/url) when its sourceType isn't local, or its
// source string is a URL. External sources are reinstalled via npx skills, not pulled.
const isLocalSource = ({ source, sourceType }) => {
  if (sourceType && sourceType !== 'local') return false;
  if (isUrl(source)) return false;
  return true;
};

export async function skillsCommand(args) {
  const [subcommand, ...rest] = args;

  if (!subcommand) {
    console.error('Usage: ags skills <subcommand> [args]');
    console.error('Run "ags help" for available subcommands.');
    process.exit(1);
  }

  let skillsArgs;

  if (subcommand === 'add') {
    const [target, ...flags] = rest;

    if (!target || target.startsWith('--')) {
      const extraFlags = target ? [target, ...flags] : flags;
      const selectedSkills = await interactiveAdd(REPO_ROOT, extraFlags);

      if (!selectedSkills.length) {
        console.log('No skills selected.');
        return;
      }

      const skillFlags = selectedSkills.flatMap((s) => ['--skill', s]);
      skillsArgs = ['add', REPO_ROOT, ...skillFlags, ...DEFAULT_AGENTS, '-y', ...extraFlags];
    } else if (isUrl(target)) {
      // External source — pass straight to npx skills, which handles URLs natively
      skillsArgs = ['add', target, ...DEFAULT_AGENTS, ...flags];
    } else if (target.includes('/') && !target.startsWith('--')) {
      skillsArgs = ['add', join(REPO_ROOT, target), ...DEFAULT_AGENTS, ...flags];
    } else if (!target.startsWith('--')) {
      skillsArgs = ['add', REPO_ROOT, '--skill', target, ...DEFAULT_AGENTS, ...flags];
    } else {
      skillsArgs = ['add', REPO_ROOT, ...DEFAULT_AGENTS, target, ...flags];
    }
  } else if (subcommand === 'update') {
    const skillName = rest.find((a) => !a.startsWith('--'));
    await updateFromLock(process.cwd(), skillName);
    return;
  } else if (SOURCE_SUBCOMMANDS.has(subcommand)) {
    skillsArgs = [subcommand, ...rest];
  } else {
    skillsArgs = [subcommand, ...rest];
  }

  const result = spawnSync('npx', ['skills', ...skillsArgs], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  process.exit(result.status ?? 0);
}

async function findSkillFile(dir) {
  for (const name of ['SKILL.md', 'skill.md']) {
    const p = join(dir, name);
    if (existsSync(p)) return p;
  }
  return null;
}

async function findSkillInSource(sourcePath, skillName, depth = 0) {
  if (depth > 3) return null;
  const direct = await findSkillFile(join(sourcePath, skillName));
  if (direct) return direct;
  const { readdirSync, statSync } = await import('fs');
  for (const entry of readdirSync(sourcePath)) {
    const entryPath = join(sourcePath, entry);
    try {
      if (!statSync(entryPath).isDirectory()) continue;
    } catch { continue; }
    if (entry === skillName) {
      const found = await findSkillFile(entryPath);
      if (found) return found;
    } else {
      const found = await findSkillInSource(entryPath, skillName, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

async function updateFromLock(cwd, skillName) {
  const lockPath = join(cwd, 'skills-lock.json');
  if (!existsSync(lockPath)) {
    console.error('skills-lock.json not found. Run "ags skills add" first.');
    process.exit(1);
  }

  const lock = JSON.parse(await readFile(lockPath, 'utf-8'));
  const skills = skillName
    ? { [skillName]: lock.skills[skillName] }
    : lock.skills;

  if (skillName && !lock.skills[skillName]) {
    console.error(`Skill "${skillName}" not found in skills-lock.json.`);
    process.exit(1);
  }

  // Pull latest for local sources
  const localSources = [...new Set(
    Object.values(skills).filter((e) => isLocalSource(e)).map(({ source }) => resolve(source))
  )];
  for (const sourcePath of localSources) {
    console.log(`Pulling latest from remote...`);
    const result = spawnSync('git pull', { shell: true, cwd: sourcePath, encoding: 'utf-8' });
    if (result.status !== 0) {
      const msg = result.stderr?.trim() || result.error?.message || `exit code ${result.status}`;
      console.warn(`⚠ git pull failed in ${sourcePath}: ${msg}`);
    }
  }

  let updatedCount = 0;

  for (const [name, entry] of Object.entries(skills)) {
    const { source } = entry;
    if (!isLocalSource(entry)) {
      // External (github/url) — reinstall directly via npx skills (it handles these natively)
      console.log(`↓ Updating ${name} from ${source}...`);
      const result = spawnSync(
        'npx',
        ['skills', 'add', source, '--skill', name, ...DEFAULT_AGENTS, '-y'],
        { stdio: 'inherit', shell: true, cwd }
      );
      if (result.status !== 0) {
        console.error(`Failed to update ${name}`);
      } else {
        updatedCount++;
      }
      continue;
    }

    // Local source — compare files first
    const sourcePath = resolve(source);
    const sourceFile = await findSkillInSource(sourcePath, name);
    if (!sourceFile) {
      console.log(`⚠ Source not found for ${name} — skipping`);
      continue;
    }

    const sourceContent = await readFile(sourceFile, 'utf-8');
    const claudeFile = await findSkillFile(join(cwd, '.claude', 'skills', name));
    const agentsFile = await findSkillFile(join(cwd, '.agents', 'skills', name));

    const claudeOk = claudeFile && (await readFile(claudeFile, 'utf-8')) === sourceContent;
    const agentsOk = agentsFile && (await readFile(agentsFile, 'utf-8')) === sourceContent;

    if (claudeOk && agentsOk) {
      console.log(`✓ ${name} — up to date`);
      continue;
    }

    console.log(`↓ Updating ${name}...`);
    const result = spawnSync(
      'npx',
      ['skills', 'add', sourcePath, '--skill', name, ...DEFAULT_AGENTS, '-y'],
      { stdio: 'inherit', shell: true, cwd }
    );
    if (result.status !== 0) {
      console.error(`Failed to update ${name}`);
    } else {
      updatedCount++;
    }
  }

  console.log(`\n${updatedCount > 0 ? `Updated ${updatedCount} skill(s).` : '✓ All skills are up to date.'}`);
}
