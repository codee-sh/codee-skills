import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve, relative } from 'path';
import * as readline from 'readline';

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.agents', '.claude', '.codex', 'bin', 'commands', 'scripts'];

async function parseFrontmatter(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const lines = match[1].split('\n');
    const data = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) data[key.trim()] = rest.join(':').trim();
    }
    return data.name && data.description ? data : null;
  } catch {
    return null;
  }
}

async function discoverSkillGroups(repoRoot) {
  const groups = [];
  const entries = await readdir(repoRoot, { withFileTypes: true });

  for (const topEntry of entries) {
    if (!topEntry.isDirectory() || SKIP_DIRS.includes(topEntry.name)) continue;

    const topDir = join(repoRoot, topEntry.name);
    const topEntries = await readdir(topDir, { withFileTypes: true }).catch(() => []);

    // Check if topDir contains skills directly (e.g. general/writing-questions/SKILL.md)
    const directSkills = [];
    const subGroups = [];

    for (const entry of topEntries) {
      if (!entry.isDirectory()) continue;

      const skillDir = join(topDir, entry.name);
      const skillFile = existsSync(join(skillDir, 'SKILL.md'))
        ? join(skillDir, 'SKILL.md')
        : existsSync(join(skillDir, 'skill.md'))
        ? join(skillDir, 'skill.md')
        : null;

      if (skillFile) {
        const meta = await parseFrontmatter(skillFile);
        if (meta) {
          directSkills.push({ name: meta.name, description: meta.description, dir: skillDir });
          continue;
        }
      }

      // No SKILL.md here — go one level deeper (e.g. frameworks/medusa/skill-name/)
      const subEntries = await readdir(skillDir, { withFileTypes: true }).catch(() => []);
      const subSkills = [];

      for (const sub of subEntries) {
        if (!sub.isDirectory()) continue;
        const subSkillDir = join(skillDir, sub.name);
        const subSkillFile = existsSync(join(subSkillDir, 'SKILL.md'))
          ? join(subSkillDir, 'SKILL.md')
          : existsSync(join(subSkillDir, 'skill.md'))
          ? join(subSkillDir, 'skill.md')
          : null;
        if (subSkillFile) {
          const meta = await parseFrontmatter(subSkillFile);
          if (meta) subSkills.push({ name: meta.name, description: meta.description, dir: subSkillDir });
        }
      }

      if (subSkills.length) {
        subGroups.push({ label: entry.name, skills: subSkills });
      }
    }

    if (directSkills.length) {
      groups.push({ label: topEntry.name, skills: directSkills });
    }
    for (const sg of subGroups) {
      groups.push({ label: `${topEntry.name} / ${sg.label}`, skills: sg.skills });
    }
  }

  return groups;
}

function renderMenu(groups, selected, cursor) {
  const lines = [];
  let itemIndex = 0;

  for (const group of groups) {
    lines.push(`\x1b[33m  ${group.label}\x1b[0m`);
    for (const skill of group.skills) {
      const isSelected = selected.has(skill.name);
      const isCursor = itemIndex === cursor;
      const checkbox = isSelected ? '\x1b[32m◼\x1b[0m' : '◻';
      const prefix = isCursor ? '\x1b[36m>\x1b[0m' : ' ';
      const nameStr = isCursor ? `\x1b[1m${skill.name}\x1b[0m` : skill.name;
      lines.push(`  ${prefix} ${checkbox} ${nameStr}`);
      itemIndex++;
    }
    lines.push('');
  }

  return lines.join('\n');
}

function flatItems(groups) {
  return groups.flatMap((g) => g.skills);
}

export async function interactiveAdd(repoRoot, flags) {
  const groups = await discoverSkillGroups(repoRoot);
  const items = flatItems(groups);

  if (!items.length) {
    console.log('No skills found in repository.');
    return [];
  }

  return new Promise((resolveP) => {
    const selected = new Set();
    let cursor = 0;

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();

    let lastLineCount = 0;

    const render = () => {
      const selectedCount = selected.size;
      const header = [
        `\x1b[1mSelect skills to install\x1b[0m`,
        `\x1b[2mSource:\x1b[0m  ${repoRoot}`,
        `\x1b[2mSkills:\x1b[0m  ${items.length} available  \x1b[32m${selectedCount} selected\x1b[0m`,
        `\x1b[2m↑↓ navigate · space toggle · a select all · enter confirm\x1b[0m`,
        '',
      ].join('\n');
      const content = header + renderMenu(groups, selected, cursor) + '\n';
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
      } else if (key.name === 'space') {
        const skill = items[cursor];
        if (selected.has(skill.name)) selected.delete(skill.name);
        else selected.add(skill.name);
      } else if (str === 'a') {
        if (selected.size === items.length) selected.clear();
        else items.forEach((s) => selected.add(s.name));
      } else if (key.name === 'return') {
        cleanup();
        process.stdout.write('\n');
        resolveP([...selected]);
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
