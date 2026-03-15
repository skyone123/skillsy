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
    defaultPath: () => path.join(os.homedir(), '.vscode', 'skills'),
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

export function getAgentConfig(agent) {
  return AGENT_CONFIGS[agent];
}
