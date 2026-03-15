import fs from 'fs-extra';
import path from 'path';

export async function installSkill(skillPath, targetPath, force = false) {
  const skillName = path.basename(skillPath);
  const destPath = path.join(targetPath, skillName);

  // Check if already exists
  if (await fs.pathExists(destPath) && !force) {
    throw new Error(`Skill "${skillName}" already exists. Use --force to overwrite.`);
  }

  // Ensure target directory exists
  await fs.ensureDir(targetPath);

  // Remove existing if force
  if (force && await fs.pathExists(destPath)) {
    await fs.remove(destPath);
  }

  // Copy skill to target
  await fs.copy(skillPath, destPath);

  return destPath;
}

export async function listInstalledSkills(targetPath) {
  if (!await fs.pathExists(targetPath)) {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = path.join(targetPath, entry.name);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      if (await fs.pathExists(skillMdPath)) {
        const content = await fs.readFile(skillMdPath, 'utf-8');
        const firstLine = content.split('\n').find(l => l.trim() && !l.startsWith('#'));
        skills.push({
          name: entry.name,
          path: skillPath,
          description: firstLine?.trim() || ''
        });
      }
    }
  }

  return skills;
}

export async function removeSkill(targetPath, skillName) {
  const skillPath = path.join(targetPath, skillName);

  if (!await fs.pathExists(skillPath)) {
    throw new Error(`Skill "${skillName}" not found at ${targetPath}`);
  }

  await fs.remove(skillPath);
  return skillPath;
}
