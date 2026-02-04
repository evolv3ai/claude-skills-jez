# Claude Code Plugin Architecture

**Last Updated**: 2026-02-04

This document explains how Claude Code plugins work, with specific focus on skill-bundled agents and commands.

---

## Key Concepts

### 1. Marketplace vs Installation

**Critical distinction:**
- **Marketplace** = Catalog of available plugins (like an app store)
- **Installation** = Actually enabling a plugin to work

```bash
# Step 1: Add marketplace (registers catalog, installs NOTHING)
/plugin marketplace add jezweb/claude-skills

# Step 2: Install specific plugin (actually enables it)
/plugin install skill-development@jezweb-skills

# Step 3: Restart Claude Code to load the plugin
```

Listing a plugin in `marketplace.json` does NOT auto-install it. Users must explicitly install each plugin they want.

### 2. Plugin Discovery Paths

Claude Code looks for components at specific paths:

```
~/.claude/plugins/cache/[marketplace]/[plugin-name]/[version]/
├── .claude-plugin/
│   └── plugin.json       ← Declares commands, agents
├── commands/             ← Slash commands (/*.md files)
├── agents/               ← Custom agents (/*.md files)
├── skills/               ← Skills (SKILL.md files)
└── ...
```

**Important**: Claude Code does NOT recursively search nested directories. If your plugin has `skills/my-skill/commands/`, those commands will NOT be discovered. Commands must be at `[plugin-root]/commands/`.

### 3. Why Bundle Plugins Don't Expose Nested Commands

When you install a bundle like `all@jezweb-skills`:
- The entire repo is copied to cache
- Only ROOT level `commands/` and `agents/` are discovered
- Nested `skills/*/commands/` are NOT discovered

```
all@jezweb-skills (installed)
├── .claude/agents/           ← ✅ Discovered (root level)
├── skills/
│   ├── skill-development/
│   │   ├── commands/         ← ❌ NOT discovered (nested)
│   │   └── agents/           ← ❌ NOT discovered (nested)
│   └── cloudflare-worker-base/
│       └── agents/           ← ❌ NOT discovered (nested)
└── ...
```

---

## Installation Patterns

### Pattern 1: Bundle Install (Current)

Install the `all` bundle to get all skills:

```bash
/plugin install all@jezweb-skills
```

**Pros**: Gets everything
**Cons**: Skill-bundled commands/agents NOT discovered

### Pattern 2: Individual Skill Install (Recommended for Commands/Agents)

Install specific skills that have commands or agents:

```bash
# Skills with bundled agents/commands
/plugin install skill-development@jezweb-skills
/plugin install developer-toolbox@jezweb-skills
/plugin install cloudflare-worker-base@jezweb-skills
```

**Pros**: Commands and agents ARE discovered
**Cons**: More install commands

### Pattern 3: Hybrid (Best Practice)

1. Install `all` for skills
2. Install individual plugins for their commands/agents

```bash
/plugin install all@jezweb-skills                     # Get all skills
/plugin install skill-development@jezweb-skills       # Get /scrape-api command
/plugin install developer-toolbox@jezweb-skills       # Get debugger agent, etc.
```

---

## Marketplace.json Structure

Each plugin entry needs:

```json
{
  "name": "skill-development",
  "description": "What this plugin does",
  "source": "./skills/skill-development",
  "category": "development"
}
```

The `source` path is relative to marketplace root.

### Full Example

```json
{
  "name": "jezweb-skills",
  "plugins": [
    {
      "name": "all",
      "description": "All skills bundled together",
      "source": "./"
    },
    {
      "name": "skill-development",
      "description": "Skill authoring tools with api-doc-scraper agent",
      "source": "./skills/skill-development"
    }
  ]
}
```

---

## Plugin.json Structure

Each plugin directory needs `.claude-plugin/plugin.json`:

```json
{
  "name": "skill-development",
  "description": "...",
  "version": "1.0.0",
  "commands": "./commands/",
  "agents": "./agents/"
}
```

**Path rules:**
- Must start with `./`
- Relative to plugin root
- Directory paths (not individual files)

---

## Why Agents from .claude/agents/ Work

The `all@jezweb-skills` bundle DOES discover:
- `~/.claude/plugins/cache/jezweb-skills/all/VERSION/.claude/agents/`

Because `.claude/agents/` is a special path that Claude Code always checks.

This is why repo-level agents (in `.claude/agents/`) work, but skill-bundled agents (in `skills/*/agents/`) don't.

---

## Troubleshooting

### Commands Not Appearing

1. Check if plugin is installed:
   ```bash
   grep "plugin-name@marketplace" ~/.claude/plugins/installed_plugins.json
   ```

2. Check if commands exist at correct path:
   ```bash
   ls ~/.claude/plugins/cache/[marketplace]/[plugin]/[version]/commands/
   ```

3. If nested inside skills/, install the individual skill plugin:
   ```bash
   /plugin install skill-name@marketplace
   ```

### Agents Not Available

Same as commands. Check that:
1. Plugin is installed (not just in marketplace catalog)
2. Agents are at `[plugin-root]/agents/`, not nested

### After Marketplace Update

Updating marketplace does NOT update installed plugins. Run:
```bash
/plugin install plugin-name@marketplace  # Reinstall to get updates
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MARKETPLACE (catalog)                     │
│  ~/.claude/plugins/marketplaces/jezweb-skills/              │
│  ├── .claude-plugin/marketplace.json  ← Lists available     │
│  └── [full repo clone]                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ /plugin install name@marketplace
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INSTALLED PLUGINS (active)                   │
│  ~/.claude/plugins/installed_plugins.json                   │
│  ├── "all@jezweb-skills"               ← Bundle             │
│  ├── "skill-development@jezweb-skills" ← Individual         │
│  └── "cloudflare-worker-base@jezweb-skills"                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Copied to cache
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PLUGIN CACHE                            │
│  ~/.claude/plugins/cache/jezweb-skills/                     │
│  ├── all/VERSION/              ← Bundle (skills nested)     │
│  ├── skill-development/VERSION/ ← Individual (flat)         │
│  │   ├── commands/              ✅ Discovered               │
│  │   └── agents/                ✅ Discovered               │
│  └── cloudflare-worker-base/VERSION/                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Claude Code loads on startup
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RUNTIME DISCOVERY                         │
│  /scrape-api         ← From skill-development/commands/     │
│  api-doc-scraper     ← From skill-development/agents/       │
│  /debug              ← From developer-toolbox/commands/     │
│  debugger            ← From .claude/agents/ (always found)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Recommendations

### For Marketplace Maintainers

1. **Always list individual plugins** in marketplace.json for skills with commands/agents
2. **Document the install flow** - users must install each plugin
3. **Keep repo-level agents** in `.claude/agents/` for bundle-based discovery

### For Users

1. **Install individual plugins** if you need their commands/agents
2. **Restart Claude Code** after installing plugins
3. **Check installed_plugins.json** if something isn't working

---

## Related Files

- `~/.claude/plugins/installed_plugins.json` - What's actually installed
- `~/.claude/plugins/marketplaces/*/` - Marketplace catalogs
- `~/.claude/plugins/cache/*/` - Installed plugin files
- `.claude-plugin/marketplace.json` - Marketplace definition
- `.claude-plugin/plugin.json` - Individual plugin definition
