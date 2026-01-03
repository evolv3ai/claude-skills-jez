# Skill Updates - January 2026 Audit

**Created**: 2026-01-03
**Status**: In Progress
**Total Skills**: 68
**Skills Needing Updates**: 36
**Estimated Effort**: ~100 hours

---

## Priority Tiers

### TIER 1: URGENT (Fix This Week) - ~20 hours

| Skill | Issue | Est. Hours | Status |
|-------|-------|------------|--------|
| fastmcp | v2.13→v2.14: sampling with tools, background tasks, breaking changes | 10-11 | ⏳ Not Started |
| typescript-mcp | v1.23→v1.25.1: ReDoS fix, Tasks feature, Client credentials OAuth | 6-8 | ⏳ Not Started |
| tanstack-router | 10+ versions behind (1.134→1.144+): virtual routes, search params, error boundaries | 4-6 | ⏳ Not Started |

### TIER 2: HIGH (Next Sprint) - ~35 hours

| Skill | Issue | Est. Hours | Status |
|-------|-------|------------|--------|
| elevenlabs-agents | 4 packages outdated, widget improvements, Scribe fixes | 4-5 | ⏳ Not Started |
| openai-assistants | v6.7→6.15, sunset date clarification (Aug 26, 2026) | 2-3 | ⏳ Not Started |
| mcp-oauth-cloudflare | workers-oauth-provider 0.1→0.2.2, refresh tokens, Bearer coexistence | 4 | ⏳ Not Started |
| google-chat-api | Spaces API, Members API, Reactions, rate limits (40% feature gap) | 22-28 | ⏳ Not Started |
| ai-sdk-ui | Agent integration, tool approval, message parts structure | 4-6 | ⏳ Not Started |
| better-auth | Stateless sessions, JWT rotation, provider scopes | 2-3 | ⏳ Not Started |
| cloudflare-worker-base | wrangler 4.54, auto-provisioning, Workers RPC | 2-3 | ⏳ Not Started |
| openai-apps-mcp | MCP Connectors, Responses API, Zod version conflict | 4-5 | ⏳ Not Started |

### TIER 3: MEDIUM (Following Sprint) - ~30 hours

| Skill | Issue | Est. Hours | Status |
|-------|-------|------------|--------|
| cloudflare-python-workers | Memory snapshots, Workflows, error handling | 4-5 | ⏳ Not Started |
| tanstack-start | Memory leak #5734 tracking, version updates | 2 | ⏳ Not Started |
| tanstack-table | Row/column pinning, expanding, grouping docs | 3-4 | ⏳ Not Started |
| nextjs | v16.0→16.1.1, 3 CVE security advisories | 2-3 | ⏳ Not Started |
| drizzle-orm-d1 | 0.44.7→0.45.1, drizzle-kit 0.31.8 | 1-2 | ⏳ Not Started |
| google-gemini-api | Gemini 3 Flash, structured output, v1.30→v1.34 | 3-4 | ⏳ Not Started |
| azure-auth | (audit result needed - agent hit limit) | 2-3 | ⏳ Not Started |
| tailwind-v4-shadcn | (audit result needed - agent hit limit) | 2-3 | ⏳ Not Started |

### TIER 4: LOW (When Time Permits) - ~15 hours

| Skill | Issue | Est. Hours | Status |
|-------|-------|------------|--------|
| Various minor version updates across ~10 skills | Package bumps only | 10-15 | ⏳ Not Started |

---

## Skills Already Current (No Updates Needed)

✅ hono-routing
✅ clerk-auth (6.36.5)
✅ zustand-state-management
✅ motion
✅ project-planning
✅ project-session-management
✅ project-workflow
✅ skill-creator
✅ skill-review
✅ mcp-cli-scripts
✅ wordpress-plugin-core
✅ vercel-kv
✅ vercel-blob
✅ open-source-contributions
✅ flask
✅ fastapi
✅ react-native-expo
✅ tinacms
✅ sveltia-cms
✅ streamlit-snowflake
✅ thesys-generative-ui
✅ ts-agent-sdk
✅ (+ ~10 more with minor/no gaps)

---

## Detailed Action Items by Skill

### fastmcp (URGENT)

**Version**: 2.13.0 → 2.14.1

**Changes Required**:
1. [ ] Update requirements.txt to `fastmcp>=2.14.0`
2. [ ] Add "Sampling with Tools" section
   - AnthropicSamplingHandler configuration
   - Tool definition for sampling
   - Structured output with Pydantic
3. [ ] Add "Background Tasks" section
   - `@mcp.background_task()` decorator
   - Progress tracking integration
   - Task lifecycle hooks
4. [ ] Document v2.14.0 breaking changes
   - Removed `BearerAuthProvider`
   - Removed `Context.get_http_request()`
5. [ ] Add Cyclopts v4 license warning
6. [ ] Update all version references in SKILL.md, README.md

---

### typescript-mcp (URGENT)

**Version**: 1.23.0 → 1.25.1

**Changes Required**:
1. [ ] Update to @modelcontextprotocol/sdk@1.25.1 (security fix)
2. [ ] Add "Tasks" documentation (new core feature)
3. [ ] Add "Fetch Transport" section
4. [ ] Add "OAuth Client Credentials (M2M)" to auth guide
5. [ ] Document sampling patterns (SEP-1577)
6. [ ] Add elicitation guide
7. [ ] Create tasks-server.ts template
8. [ ] Create oauth-m2m-server.ts template
9. [ ] Add 5 new error patterns (#1291, #1308, #1342, #1314, #1354)

---

### tanstack-router (URGENT)

**Version**: 1.134.13 → 1.144.0+

**Changes Required**:
1. [ ] Update version references
2. [ ] Add virtual file routes documentation
3. [ ] Add search params validation patterns
4. [ ] Add error boundary patterns
5. [ ] Add beforeLoad hook documentation
6. [ ] Update migration guide for breaking changes
7. [ ] Add SSR patterns (if applicable)

---

## Session Log

| Date | Session | Work Done | Next Steps |
|------|---------|-----------|------------|
| 2026-01-03 | Initial Audit | Launched 68 parallel audits, compiled findings | Start TIER 1 updates |
| | | | |

---

## Notes

- Some agent audits hit usage limits and need re-running: azure-auth, tailwind-v4-shadcn
- google-chat-api has largest gap (~40% of API undocumented) - consider splitting work
- tanstack-router is significantly behind - may need dedicated session
- fastmcp changes are breaking - test thoroughly before releasing

---

## Completion Criteria

- [ ] All TIER 1 skills updated and tested
- [ ] All TIER 2 skills updated and tested
- [ ] Version numbers current across all skills
- [ ] VERSIONS_REPORT.md shows no critical gaps
- [ ] All skills pass `./scripts/check-all-versions.sh`
