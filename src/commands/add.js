import chalk from 'chalk';
import { downloadFile, cleanupTemp } from '../utils/downloader.js';
import { findSkills, cleanupExtract } from '../utils/skill-finder.js';
import { detectAgent, getSkillsPath } from '../utils/agent-detector.js';
import { installSkill } from '../utils/installer.js';

export async function addCommand(url, options) {
  let extractPath = null;

  try {
    console.log(chalk.blue(`Downloading from: ${url}`));

    // Download the archive
    const archivePath = await downloadFile(url);
    console.log(chalk.green('✓ Download complete'));

    // Find skills in the archive
    console.log(chalk.blue('Searching for skills...'));
    const { skills, extractPath: expPath } = await findSkills(archivePath);
    extractPath = expPath;

    if (skills.length === 0) {
      throw new Error('No valid skills found in archive. Skills must contain SKILL.md');
    }

    console.log(chalk.green(`✓ Found ${skills.length} skill(s): ${skills.map(s => s.name).join(', ')}`));

    // Detect or use specified agent
    const agent = await detectAgent(options.agent);
    const skillsPath = options.path || getSkillsPath(agent);

    console.log(chalk.blue(`Installing to: ${agent} (${skillsPath})`));

    // Install each skill
    for (const skill of skills) {
      const installedPath = await installSkill(
        skill.path,
        skillsPath,
        options.force
      );
      console.log(chalk.green(`✓ Installed: ${skill.name} → ${installedPath}`));
    }

    // Cleanup
    await cleanupTemp();
    if (extractPath) {
      await cleanupExtract(extractPath);
    }

    console.log(chalk.green.bold('\n✓ All skills installed successfully!'));
  } catch (error) {
    // Cleanup on error
    if (extractPath) {
      await cleanupExtract(extractPath).catch(() => {});
    }
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
