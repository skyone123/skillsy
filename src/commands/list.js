import chalk from 'chalk';
import { detectAgent, getSkillsPath } from '../utils/agent-detector.js';
import { listInstalledSkills } from '../utils/installer.js';

export async function listCommand(options) {
  try {
    const agent = await detectAgent(options.agent);
    const skillsPath = getSkillsPath(agent, options.path);

    console.log(chalk.blue(`Skills for ${agent}:`));
    console.log(chalk.gray(`Location: ${skillsPath}\n`));

    const skills = await listInstalledSkills(skillsPath);

    if (skills.length === 0) {
      console.log(chalk.yellow('No skills installed.'));
      return;
    }

    for (const skill of skills) {
      console.log(chalk.green(`• ${skill.name}`));
      if (skill.description) {
        console.log(chalk.gray(`  ${skill.description}`));
      }
      console.log(chalk.gray(`  ${skill.path}\n`));
    }
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
