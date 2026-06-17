#!/usr/bin/env node

import { pushSkill } from '../commands/push-skill.js';
import { skillsCommand } from '../commands/skills.js';

const [,, command, ...args] = process.argv;

if (!command || command === 'help' || command === '--help') {
  console.log(`
ags <command> [options]

Commands:
  push-skill <name>       Push a skill from current project back to the source repo
                          --dry-run   Preview changes without pushing

  skills <subcommand>     Wrapper for "npx skills" with auto source path
    skills add [name]     Install skill(s) from source repo
    skills list           List installed skills
    skills update [name]  Update installed skill(s)
    skills remove <name>  Remove a skill
    skills find [query]   Search available skills

Examples:
  ags push-skill writing-questions
  ags push-skill writing-questions --dry-run

  ags skills add writing-questions
  ags skills add frameworks/medusa
  ags skills add
  ags skills list
  ags skills update writing-questions
  ags skills remove writing-questions
`);
  process.exit(0);
}

const commands = {
  'push-skill': pushSkill,
  'skills': skillsCommand,
};

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  console.error(`Run "ags help" for available commands.`);
  process.exit(1);
}

commands[command](args).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
