# Anthropic Skills Registry Submission Draft

**Target**: https://github.com/anthropics/skills
**Action**: Open issue proposing inclusion

---

## Issue Title

Add jezweb/claude-skills: 87 production-ready skills for Cloudflare, AI, and web development

---

## Issue Body

### Summary

I'd like to propose adding [jezweb/claude-skills](https://github.com/jezweb/claude-skills) to the official skills collection or linking it as a community resource.

**Repository**: https://github.com/jezweb/claude-skills
**Skills Count**: 87 production-ready skills
**License**: MIT
**Maintained**: Actively (multiple updates weekly)

### What It Provides

A curated collection of skills focused on:

- **Cloudflare Platform** (16 skills): Workers, D1, R2, KV, Durable Objects, Agents, MCP Server, Workflows, Queues, etc.
- **AI/ML Integration** (12 skills): Vercel AI SDK, OpenAI Agents/Assistants/Responses, Claude API, Gemini API
- **Frontend** (12 skills): Tailwind v4 + shadcn, TanStack suite (Query, Router, Table, Start), Zustand, React Hook Form
- **Database/Storage** (4 skills): Drizzle ORM, Neon Postgres, Vercel KV/Blob
- **Auth** (2 skills): Clerk, Better Auth
- **Planning/Workflow** (5 skills): Project planning, session management, docs workflow

### Standards Compliance

This collection is **100% compliant** with the official Agent Skills Spec:

- YAML frontmatter uses only `name`, `description`, and `allowed-tools` fields
- Directory structure follows `scripts/`, `references/`, `assets/` pattern
- Writing style uses third-person descriptions and imperative instructions
- Skills are tested in production environments

We maintain a [standards comparison document](https://github.com/jezweb/claude-skills/blob/main/planning/STANDARDS_COMPARISON.md) tracking compliance with the official spec.

### Quality Metrics

- **Token efficiency**: ~60% savings vs manual trial-and-error
- **Errors prevented**: 400+ documented error patterns with solutions
- **Production tested**: All skills validated in real deployments
- **Version tracking**: Scripts to verify package versions are current

### Why Include It

1. **Complements official skills**: Focused on Cloudflare ecosystem and modern web stack (areas not heavily covered officially)
2. **Battle-tested**: Used in production across multiple projects
3. **Actively maintained**: Regular updates, version checking, community contributions welcomed
4. **Well-documented**: GEMINI_GUIDE.md for AI agent onboarding, comprehensive CLAUDE.md

### Proposed Actions

**Option A**: Add as "Community Skills Collection" in official repo
**Option B**: Link from official docs as third-party resource
**Option C**: Cherry-pick specific high-value skills for official inclusion

Happy to discuss the best approach or make any adjustments to meet official requirements.

### Contact

- **Maintainer**: Jeremy Dawes (Jezweb)
- **Email**: jeremy@jezweb.net
- **GitHub**: [@jezweb](https://github.com/jezweb)

---

## Notes for Jez Before Submitting

1. **Check official repo first**: See if they have a process for community submissions
2. **Review their existing skills**: Make sure ours don't duplicate
3. **Consider scope**: They may prefer a subset rather than all 87
4. **Be flexible**: They may have different ideas for integration

## To Submit

```bash
# Open issue via gh CLI
gh issue create --repo anthropics/skills \
  --title "Add jezweb/claude-skills: 87 production-ready skills for Cloudflare, AI, and web development" \
  --body "$(cat planning/ANTHROPIC_REGISTRY_SUBMISSION.md | tail -n +20 | head -n 80)"
```

Or manually:
1. Go to https://github.com/anthropics/skills/issues/new
2. Use the title and body above
3. Add appropriate labels if available
