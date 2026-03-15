import chalk from 'chalk';
import { detectAgent, getSkillsPath } from '../utils/agent-detector.js';
import { removeSkill } from '../utils/installer.js';

export async function removeCommand(name, options) {
  try {
    const agent = await detectAgent(options.agent);
    const skillsPath = getSkillsPath(agent, options.path);

    console.log(chalk.blue(`Removing "${name}" from ${agent}...`));

    await removeSkill(skillsPath, name);

    console.log(chalk.green(`✓ Removed: ${name}`));
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
