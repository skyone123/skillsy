# skillsi

Multi-Agent Skills Installer - Download and install skills from URL archives to various AI agent platforms.

## Installation

```bash
npm install -g skillsi
```

Or use directly:

```bash
npx skillsi add <url>
```

## Usage

```bash
# Install skill (auto-detect agent)
npx skillsi add <url>

# Install to specific agent
npx skillsi add <url> --agent claude

# List skills
npx skillsi list

# Remove skill
npx skillsi remove <skill-name>
```

## Supported Agents

- Claude Code (~/.claude/skills/)
- Codex (~/.codex/skills/)
- Cursor (~/.cursor/skills/)
- Cline (~/.cline/skills/)
- VS Code (~/.vscode/skills/)
- VS Code (~/.vscode/extensions/)
