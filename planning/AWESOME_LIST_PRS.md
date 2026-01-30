# Awesome List PR Drafts

Prepared entries for submitting claude-skills to awesome Claude/Claude Code lists.

---

## 1. travisvn/awesome-claude-skills

**Repository**: https://github.com/travisvn/awesome-claude-skills
**Section**: Community Skills → Collections & Libraries
**PR Title**: `Add jezweb/claude-skills collection`

### Entry to Add

```markdown
- [claude-skills](https://github.com/jezweb/claude-skills) - 87 production-ready skills for Cloudflare Workers, React, Tailwind v4, AI/LLM integrations, and more. Includes 39 bundled agents. ~60% token savings.
```

### PR Description

```markdown
## Description

Adding a comprehensive collection of 87 production-ready Claude Code skills.

## About claude-skills

- **87 skills** across Cloudflare, AI/LLM, Frontend, Auth, Database, and Tooling domains
- **39 bundled agents** for specialized tasks (debugging, deployment, testing, etc.)
- **~60% average token savings** with documented error prevention
- **400+ errors prevented** through known-issue documentation
- Follows official Anthropic skill standards
- MIT licensed

### Key Domains

| Domain | Skills |
|--------|--------|
| Cloudflare Platform | 20 skills (Workers, D1, R2, KV, AI, etc.) |
| AI & Machine Learning | 10 skills (OpenAI, Gemini, Claude API, AI SDK) |
| Frontend & UI | 7 skills (Tailwind v4, shadcn, TanStack, etc.) |
| Auth & Security | 3 skills (Clerk, Better Auth) |
| Database & ORM | 4 skills (Drizzle, Neon, Vercel KV/Blob) |

### Installation

```bash
/plugin marketplace add jezweb/claude-skills
/plugin install cloudflare  # Install by bundle
```

## Checklist

- [x] Follows awesome list guidelines
- [x] Link is valid and points to active repository
- [x] Description is concise and accurate
- [x] Repository is MIT licensed
```

---

## 2. hesreallyhim/awesome-claude-code

**Repository**: https://github.com/hesreallyhim/awesome-claude-code
**Section**: Agent Skills → General
**PR Title**: `Add claude-skills: 87 production-ready skills with 39 agents`

### Entry to Add

```markdown
- [claude-skills](https://github.com/jezweb/claude-skills) - 87 production-ready skills for Cloudflare, React, Tailwind v4, and AI integrations with 39 bundled agents
```

### PR Description

```markdown
## Description

Adding a comprehensive skill collection to the Agent Skills section.

## About claude-skills

**87 production-ready skills** organized by domain:
- Cloudflare Platform (20): Workers, D1, R2, KV, Workers AI, Durable Objects, Queues, Workflows
- AI/LLM (10): OpenAI API, Gemini, Claude API, AI SDK Core/UI, Agents
- Frontend (7): Tailwind v4 + shadcn, TanStack Query/Router/Start, React Hook Form
- Auth (3): Clerk, Better Auth, Zero Trust
- Database (4): Drizzle ORM, Neon Postgres, Vercel KV/Blob

**39 bundled agents** for:
- Cloudflare debugging, deployment, migrations
- Code review, testing, documentation
- Project orchestration, session management

**Measured benefits:**
- ~60% average token savings
- 400+ documented errors prevented
- First-try success rate: 95%+

MIT licensed, follows official Anthropic skill standards.

## Installation

```bash
/plugin marketplace add jezweb/claude-skills
/plugin install cloudflare
/plugin install ai
/plugin install frontend
```
```

---

## 3. jqueryscript/awesome-claude-code

**Repository**: https://github.com/jqueryscript/awesome-claude-code
**Section**: Agent Skills (uses star counts)
**PR Title**: `Add claude-skills collection (87 skills, 39 agents)`

### Entry to Add

```markdown
- [claude-skills](https://github.com/jezweb/claude-skills) ![GitHub Repo stars](https://img.shields.io/github/stars/jezweb/claude-skills?style=social) - 87 production-ready skills for Cloudflare, React, Tailwind v4, and AI integrations with 39 bundled agents
```

### PR Description

```markdown
## Summary

Adding claude-skills - a comprehensive collection of 87 production-ready Claude Code skills with 39 bundled agents.

## Highlights

- **87 skills** covering Cloudflare (20), AI/LLM (10), Frontend (7), Auth (3), Database (4), Tooling (5)
- **39 agents** bundled with skills for debugging, deployment, testing, documentation
- **~60% token savings** measured across real projects
- **400+ errors prevented** via known-issue documentation
- Plugin system compatible (`/plugin marketplace add`)
- MIT licensed
- Follows official Anthropic skill standards

## Categories Covered

- Cloudflare Workers, D1, R2, KV, Workers AI, Durable Objects
- OpenAI, Google Gemini, Claude API, AI SDK
- Tailwind v4, shadcn/ui, TanStack ecosystem
- Clerk Auth, Better Auth
- Drizzle ORM, Neon Postgres
```

---

## Submission Commands

After creating forks, these commands will create the PRs:

```bash
# 1. Fork and clone each repo
gh repo fork travisvn/awesome-claude-skills --clone
gh repo fork hesreallyhim/awesome-claude-code --clone
gh repo fork jqueryscript/awesome-claude-code --clone

# 2. Create branches, make edits, commit, push, create PR
# (Manual editing required to add entries to correct sections)
```

---

## Status

| Repository | Section | Status | URL |
|------------|---------|--------|-----|
| travisvn/awesome-claude-skills | Collections & Libraries | ✅ PR Submitted | https://github.com/travisvn/awesome-claude-skills/pull/82 |
| hesreallyhim/awesome-claude-code | Agent Skills → General | ✅ Issue Submitted | https://github.com/hesreallyhim/awesome-claude-code/issues/587 |
| jqueryscript/awesome-claude-code | Agent Skills | ✅ PR Submitted | https://github.com/jqueryscript/awesome-claude-code/pull/18 |

**Note:** hesreallyhim/awesome-claude-code requires using their issue template for recommendations (no direct PRs accepted).

**Created**: 2026-01-30
**Submitted**: 2026-01-30
