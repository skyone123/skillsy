#!/usr/bin/env node

/**
 * skillsy - Multi-Agent Skills Installer
 *
 * Download and install skills from URL archives to various AI agent platforms.
 */

import { Command } from 'commander';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { removeCommand } from './commands/remove.js';

const program = new Command();

program
  .name('skillsy')
  .description('Multi-Agent Skills Installer')
  .version('1.0.0');

program
  .command('add <url>')
  .description('Install a skill from URL')
  .option('-a, --agent <name>', 'Target agent (claude, codex, cursor, cline, vscode)')
  .option('-p, --path <path>', 'Custom skills folder path')
  .option('-f, --force', 'Overwrite existing skill')
  .action(addCommand);

program
  .command('list')
  .description('List installed skills')
  .option('-a, --agent <name>', 'Target agent')
  .action(listCommand);

program
  .command('remove <name>')
  .description('Remove an installed skill')
  .option('-a, --agent <name>', 'Target agent')
  .action(removeCommand);

program.parse();
