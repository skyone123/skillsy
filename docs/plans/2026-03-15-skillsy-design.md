# skillsy - Multi-Agent Skills Installer

## Project Overview

**Project Name**: skillsy
**Type**: npm CLI Tool
**Core Functionality**: Download and install skills from URL archives to various AI agent platforms (Claude Code, Codex, Cursor, VS Code, Cline)
**Target Users**: Developers who use multiple AI coding agents and want to share/manage skills across platforms

---

## Requirements

### Functional Requirements

1. **Install Skill** (`add` command)
   - Download ZIP archive from URL
   - Extract and find valid skills (directories containing `SKILL.md`)
   - Install to appropriate agent's skills folder
   - Support automatic agent detection or manual specification

2. **List Skills** (`list` command)
   - List installed skills for specified agent
   - Show skill name and installation path

3. **Remove Skill** (`remove` command)
   - Remove installed skill from specified agent

### Non-Functional Requirements

1. **Cross-platform**: Support Windows, macOS, Linux
2. **Error Handling**: Clear error messages for common failure cases
3. **User Experience**: Progress indicators, confirmation prompts

---

## Architecture

### Supported Agents & Skills Locations

| Agent | Skills Folder | Detection Priority |
|-------|--------------|-------------------|
| Claude Code | `~/.claude/skills/` | 1 (highest) |
| Codex | `~/.codex/skills/` | 2 |
| Cursor | `~/.cursor/skills/` | 3 |
| Cline | `~/.cline/skills/` | 4 |
| VS Code | `~/.vscode/extensions/` | 5 |

### Auto-Detection Logic

1. Check environment variables (`CLAUDE_CODE_PATH`, `CODEX_PATH`, etc.)
2. Check common default paths per platform
3. If not found, prompt user for manual path

### Installation Workflow

```
1. Download ZIP to temp directory
2. Extract ZIP
3. Recursively search for directories containing SKILL.md
4. If found: copy to {agent}/skills/{skill-name}/
5. If not found: error exit
6. Clean up temp files
```

---

## CLI Interface

### Commands

```bash
# Install skill (auto-detect agent)
npx skillsy add <url>

# Install to specific agent
npx skillsy add <url> --agent claude

# Install to specific agent with custom path
npx skillsy add <url> --agent claude --path /custom/path

# List skills
npx skillsy list

# List skills for specific agent
npx skillsy list --agent claude

# Remove skill
npx skillsy remove <skill-name>

# Remove from specific agent
npx skillsy remove <skill-name> --agent claude
```

### Options

| Option | Description |
|--------|-------------|
| `-a, --agent <name>` | Target agent (claude, codex, cursor, cline, vscode) |
| `-p, --path <path>` | Custom skills folder path |
| `-f, --force` | Overwrite existing skill |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

---

## Skill Archive Structure

The ZIP archive can contain multiple potential skills. Only directories containing `SKILL.md` will be recognized as valid skills:

```
skill-package.zip
├── skill-a/
│   └── SKILL.md          # ✓ Valid skill
├── skill-b/
│   ├── SKILL.md          # ✓ Valid skill
│   └── other-files/
└── README.md             # Ignored
```

The `SKILL.md` file should contain skill metadata:

```markdown
name: skill-name
description: What this skill does
author: author-name
version: 1.0.0
```

---

## Acceptance Criteria

1. ✅ `npx skillsy add <url>` downloads and installs skill to auto-detected agent
2. ✅ `npx skillsy add <url> --agent claude` installs to specified agent
3. ✅ Only directories with SKILL.md are installed
4. ✅ `npx skillsy list` shows installed skills
5. ✅ `npx skillsy remove <name>` removes installed skill
6. ✅ Works on Windows, macOS, and Linux
7. ✅ Clear error messages for invalid URLs, missing skills, etc.
