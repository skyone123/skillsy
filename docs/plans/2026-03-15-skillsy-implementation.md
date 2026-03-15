# skillsy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a cross-platform npm CLI tool that downloads skills from URL archives and installs them to various AI agent platforms (Claude Code, Codex, Cursor, VS Code, Cline)

**Architecture:** Node.js CLI tool using commander.js for CLI parsing, adm-zip for ZIP extraction, and cross-platform path handling

**Tech Stack:** Node.js, commander, adm-zip, fs-extra, axios

---

## Phase 1: Project Setup

### Task 1: Initialize npm Project

**Files:**
- Create: `package.json`
- Create: `README.md`

**Step 1: Create package.json**

```json
{
  "name": "skillsy",
  "version": "1.0.0",
  "description": "Multi-Agent Skills Installer - Download and install skills from URL archives",
  "type": "module",
  "main": "src/index.js",
  "bin": {
    "skillsy": "./src/index.js"
  },
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "start": "node src/index.js"
  },
  "keywords": ["cli", "skills", "ai-agents", "claude", "codex", "cursor", "cline"],
  "author": "",
  "license": "MIT"
}
```

**Step 2: Create README.md**

```markdown
# skillsy

Multi-Agent Skills Installer - Download and install skills from URL archives to various AI agent platforms.

## Installation

```bash
npm install -g skillsy
```

Or use directly:

```bash
npx skillsy add <url>
```

## Usage

```bash
# Install skill (auto-detect agent)
npx skillsy add <url>

# Install to specific agent
npx skillsy add <url> --agent claude

# List skills
npx skillsy list

# Remove skill
npx skillsy remove <skill-name>
```

## Supported Agents

- Claude Code (~/.claude/skills/)
- Codex (~/.codex/skills/)
- Cursor (~/.cursor/skills/)
- Cline (~/.cline/skills/)
- VS Code (~/.vscode/extensions/)
```

**Step 3: Install dependencies**

```bash
npm install commander adm-zip fs-extra axios
npm install --save-dev jest
```

**Step 4: Commit**

```bash
git init
git add package.json README.md package-lock.json
git commit -m "feat: initialize skillsy project"
```

---

### Task 2: Create Project Structure

**Files:**
- Create: `src/index.js`
- Create: `src/commands/add.js`
- Create: `src/commands/list.js`
- Create: `src/commands/remove.js`
- Create: `src/utils/agent-detector.js`
- Create: `src/utils/downloader.js`
- Create: `src/utils/skill-finder.js`
- Create: `src/utils/installer.js`

**Step 1: Create src/index.js**

```javascript
#!/usr/bin/env node

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
```

**Step 2: Commit**

```bash
git add src/
git commit -m "feat: create project structure"
```

---

## Phase 2: Core Utilities

### Task 3: Agent Detector

**Files:**
- Create: `src/utils/agent-detector.js`
- Create: `tests/agent-detector.test.js`

**Step 1: Write failing test**

```javascript
// tests/agent-detector.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('detectAgent', () => {
  test('should detect Claude Code from environment', () => {
    // Test will be implemented
  });

  test('should return default agent when none found', () => {
    // Test will be implemented
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
Expected: FAIL - test file not found or no tests

# Then create actual test file
```

**Step 3: Write implementation**

```javascript
// src/utils/agent-detector.js
import os from 'os';
import fs from 'fs-extra';
import path from 'path';

const AGENT_CONFIGS = {
  claude: {
    name: 'Claude Code',
    envVar: 'CLAUDE_CODE_PATH',
    defaultPath: () => path.join(os.homedir(), '.claude', 'skills'),
    aliases: ['claude', 'claude-code']
  },
  codex: {
    name: 'Codex',
    envVar: 'CODEX_PATH',
    defaultPath: () => path.join(os.homedir(), '.codex', 'skills'),
    aliases: ['codex']
  },
  cursor: {
    name: 'Cursor',
    envVar: 'CURSOR_PATH',
    defaultPath: () => path.join(os.homedir(), '.cursor', 'skills'),
    aliases: ['cursor']
  },
  cline: {
    name: 'Cline',
    envVar: 'CLINE_PATH',
    defaultPath: () => path.join(os.homedir(), '.cline', 'skills'),
    aliases: ['cline']
  },
  vscode: {
    name: 'VS Code',
    envVar: 'VSCODE_PATH',
    defaultPath: () => path.join(os.homedir(), '.vscode', 'extensions'),
    aliases: ['vscode', 'vs-code']
  }
};

export function getSupportedAgents() {
  return Object.keys(AGENT_CONFIGS);
}

export function resolveAgentAlias(alias) {
  const lower = alias?.toLowerCase();
  for (const [key, config] of Object.entries(AGENT_CONFIGS)) {
    if (config.aliases.includes(lower) || key === lower) {
      return key;
    }
  }
  return null;
}

export async function detectAgent(userChoice = null) {
  // If user specified, use that
  if (userChoice) {
    const resolved = resolveAgentAlias(userChoice);
    if (!resolved) {
      throw new Error(`Unknown agent: ${userChoice}. Supported: ${getSupportedAgents().join(', ')}`);
    }
    return resolved;
  }

  // Auto-detect: check environment variables and paths
  for (const [key, config] of Object.entries(AGENT_CONFIGS)) {
    // Check env var
    const envPath = process.env[config.envVar];
    if (envPath && await fs.pathExists(envPath)) {
      return key;
    }

    // Check default path
    const defaultPath = config.defaultPath();
    if (await fs.pathExists(defaultPath)) {
      return key;
    }
  }

  // Default to Claude Code if nothing found
  return 'claude';
}

export function getSkillsPath(agent, customPath = null) {
  const config = AGENT_CONFIGS[agent];
  if (!config) {
    throw new Error(`Unknown agent: ${agent}`);
  }
  return customPath || config.defaultPath();
}
```

**Step 4: Run test to verify it passes**

```bash
npm test
Expected: PASS
```

**Step 5: Commit**

```bash
git add src/utils/agent-detector.js tests/
git commit -m "feat: add agent detector utility"
```

---

### Task 4: Downloader Utility

**Files:**
- Create: `src/utils/downloader.js`
- Create: `tests/downloader.test.js`

**Step 1: Write implementation**

```javascript
// src/utils/downloader.js
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export async function downloadFile(url, customFilename = null) {
  const tempDir = path.join(os.tmpdir(), 'skillsy-download');
  await fs.ensureDir(tempDir);

  const filename = customFilename || path.basename(new URL(url).pathname) || 'archive.zip';
  const filepath = path.join(tempDir, filename);

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
    timeout: 60000 // 1 minute timeout
  });

  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filepath));
    writer.on('error', reject);
  });
}

export async function cleanupTemp() {
  const tempDir = path.join(os.tmpdir(), 'skillsy-download');
  await fs.remove(tempDir);
}
```

**Step 2: Commit**

```bash
git add src/utils/downloader.js
git commit -m "feat: add downloader utility"
```

---

### Task 5: Skill Finder Utility

**Files:**
- Create: `src/utils/skill-finder.js`
- Create: `tests/skill-finder.test.js`

**Step 1: Write implementation**

```javascript
// src/utils/skill-finder.js
import fs from 'fs-extra';
import path from 'path';

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
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(archivePath);
  const tempDir = path.join(process.env.TEMP || '/tmp', 'skillsy-extract', Date.now().toString());

  await fs.ensureDir(tempDir);
  zip.extractAllTo(tempDir, true);

  const skills = await findSkillsInDirectory(tempDir);

  return { skills, extractPath: tempDir };
}
```

**Step 2: Commit**

```bash
git add src/utils/skill-finder.js
git commit -m "feat: add skill finder utility"
```

---

### Task 6: Installer Utility

**Files:**
- Create: `src/utils/installer.js`
- Create: `tests/installer.test.js`

**Step 1: Write implementation**

```javascript
// src/utils/installer.js
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
```

**Step 2: Commit**

```bash
git add src/utils/installer.js
git commit -m "feat: add installer utility"
```

---

## Phase 3: Commands

### Task 7: Add Command

**Files:**
- Modify: `src/commands/add.js`

**Step 1: Write implementation**

```javascript
// src/commands/add.js
import chalk from 'chalk';
import { downloadFile, cleanupTemp } from '../utils/downloader.js';
import { findSkills } from '../utils/skill-finder.js';
import { installSkill, getSkillsPath, detectAgent } from '../utils/agent-detector.js';

export async function addCommand(url, options) {
  try {
    console.log(chalk.blue(`Downloading from: ${url}`));

    // Download the archive
    const archivePath = await downloadFile(url);
    console.log(chalk.green('✓ Download complete'));

    // Find skills in the archive
    console.log(chalk.blue('Searching for skills...'));
    const { skills, extractPath } = await findSkills(archivePath);

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

    console.log(chalk.green.bold('\n✓ All skills installed successfully!'));
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
```

**Step 2: Install chalk**

```bash
npm install chalk
```

**Step 3: Commit**

```bash
git add src/commands/add.js package.json package-lock.json
git commit -m "feat: implement add command"
```

---

### Task 8: List Command

**Files:**
- Modify: `src/commands/list.js`

**Step 1: Write implementation**

```javascript
// src/commands/list.js
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
```

**Step 2: Commit**

```bash
git add src/commands/list.js
git commit -m "feat: implement list command"
```

---

### Task 9: Remove Command

**Files:**
- Modify: `src/commands/remove.js`

**Step 1: Write implementation**

```javascript
// src/commands/remove.js
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
```

**Step 2: Commit**

```bash
git add src/commands/remove.js
git commit -m "feat: implement remove command"
```

---

## Phase 4: Testing & Polish

### Task 10: Make Executable and Test

**Files:**
- Modify: `src/index.js`

**Step 1: Add shebang and make executable**

```javascript
#!/usr/bin/env node
// (Add at top of src/index.js)
```

```bash
chmod +x src/index.js
```

**Step 2: Test the CLI**

```bash
# Test help
node src/index.js --help

# Test version
node src/index.js --version

# Test list
node src/index.js list
```

**Step 3: Commit**

```bash
git commit -m "chore: make CLI executable and test"
```

---

### Task 11: Add Shebang to index.js

**Files:**
- Modify: `src/index.js`

**Step 1: Add shebang at the very top**

```javascript
#!/usr/bin/env node

/**
 * skillsy - Multi-Agent Skills Installer
 *
 * Download and install skills from URL archives to various AI agent platforms.
 */

import { Command } from 'commander';
// ... rest of file
```

**Step 2: Commit**

```bash
git add src/index.js
git commit -m "chore: add shebang to index.js"
```

---

## Verification Checklist

- [ ] `node src/index.js --help` shows all commands
- [ ] `node src/index.js add <url>` downloads and extracts archive
- [ ] Skills with SKILL.md are correctly identified
- [ ] Skills are installed to correct agent path
- [ ] `node src/index.js list` shows installed skills
- [ ] `node src/index.js remove <name>` removes skill
- [ ] Error messages are clear and helpful

---

## Plan Complete

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
