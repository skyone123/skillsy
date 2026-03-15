import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { getTempDir } from './downloader.js';

const SKILL_MARKER = 'SKILL.md';

export async function findSkillsInDirectory(extractPath) {
  const skills = [];

  async function search(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory contains SKILL.md
        const skillMdPath = path.join(fullPath, SKILL_MARKER);
        if (await fs.pathExists(skillMdPath)) {
          const metadata = await parseSkillMetadata(skillMdPath);
          skills.push({
            name: entry.name,
            path: fullPath,
            metadata
          });
        } else {
          // Recurse into subdirectories
          await search(fullPath);
        }
      }
    }
  }

  await search(extractPath);
  return skills;
}

async function parseSkillMetadata(skillMdPath) {
  try {
    const content = await fs.readFile(skillMdPath, 'utf-8');
    const metadata = {
      name: null,
      description: null,
      author: null,
      version: null
    };

    // Parse YAML frontmatter if present
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const lines = frontmatterMatch[1].split('\n');
      for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          const value = valueParts.join(':').trim();
          if (metadata.hasOwnProperty(key.trim())) {
            metadata[key.trim()] = value;
          }
        }
      }
    }

    // If no frontmatter, use first line as name
    if (!metadata.name) {
      const firstLine = content.split('\n').find(l => l.trim());
      if (firstLine) {
        metadata.name = firstLine.replace(/^#*\s*/, '').trim();
      }
    }

    return metadata;
  } catch (error) {
    return { name: null, description: null, author: null, version: null };
  }
}

export async function findSkills(archivePath) {
  const zip = new AdmZip(archivePath);
  const tempDir = path.join(getTempDir(), Date.now().toString());

  await fs.ensureDir(tempDir);
  zip.extractAllTo(tempDir, true);

  const skills = await findSkillsInDirectory(tempDir);

  return { skills, extractPath: tempDir };
}

export async function cleanupExtract(extractPath) {
  await fs.remove(extractPath);
}
