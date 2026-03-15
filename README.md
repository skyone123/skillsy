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
