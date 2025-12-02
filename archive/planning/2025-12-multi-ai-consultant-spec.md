# Multi-AI Consultant Skill - Implementation Specification

**Created**: 2025-11-07
**Status**: Planning
**Target**: skills/multi-ai-consultant/

---

## Overview

A skill enabling Claude Code to consult external AIs (Gemini 2.5 Pro, OpenAI Codex, fresh Claude) when stuck on bugs or making critical architecture decisions.

**Key Insight**: Use existing CLI tools (no MCP servers needed) + per-project conversation history for speed.

---

## Core Requirements

### 1. AI Providers

| Provider | CLI Tool | Model | Special Flags | Context Method |
|----------|----------|-------|---------------|----------------|
| **Gemini** | `gemini` | `gemini-2.5-pro` (locked) | `--thinking --google-search --grounding` | `@<path>` syntax |
| **OpenAI Codex** | `codex` | `gpt-4-turbo` or `gpt-4o` | `--yolo --output-last-message` | Repo-aware (auto-scans directory) |
| **Claude** | Task tool (subagent) | N/A (uses Claude Code's model) | `subagent_type="general-purpose"` | Inherits full context |

### 2. Conversation Tracking

**Per-project conversation threads**:
- Each consultation starts a new conversation
- Conversation ID = project directory hash + timestamp
- Subsequent consultations in same session reference previous ID
- Purpose: Speed up follow-ups ("As I mentioned before...")

**Storage**: `~/.claude/ai-consultations/<project-hash>/<session-id>.json`

### 3. Automatic Triggers

Claude should **proactively suggest** consultation when:

1. **Bug/fix attempted once without success** → Suggest consultation
2. **Architecture decisions** → Auto-consult (no ask)
3. **Security-sensitive changes** → Auto-consult
4. **Uncertain about trade-offs** → Suggest consultation

### 4. Synthesis Protocol

Every consultation MUST produce:
1. **Your Analysis** - Claude's original reasoning
2. **Other AI's Analysis** - External AI's response (with thinking/reasoning)
3. **Key Differences** - Agreement/disagreement points
4. **Synthesis** - Combined insights
5. **Recommended Action** - Clear next step

**Enforcement**: Via `GEMINI.md` and `codex.md` in project root (auto-loaded by CLIs)

---

## CLI Integration Details

### Gemini CLI (Google)

**Authentication**:
```bash
export GEMINI_API_KEY="your-key"
```

**Pre-flight Check**:
```bash
if ! gemini -p "test" &>/dev/null 2>&1; then
  echo "❌ Gemini API key invalid"
  exit 1
fi
```

**Execution Pattern**:
```bash
PROMPT=$(cat <<'EOF'
Problem: {{PROBLEM}}
Question: {{QUESTION}}

Analyze: @{{CONTEXT_PATHS}}
EOF
)

RESPONSE=$(echo "$PROMPT" | gemini \
  -m gemini-2.5-pro \
  --thinking \
  --google-search \
  --grounding \
  --output-format json 2>/dev/null)

ANALYSIS=$(echo "$RESPONSE" | jq -r '.response.text')
```

**Context Packaging**:
- Bug/error: `@src/buggy-file.ts @src/related-import.ts`
- Architecture: `@src/ @docs/ARCHITECTURE.md`
- Security: `@src/auth/ @src/middleware/`
- Default: `@.` (current directory)

**Privacy**:
- Automatically respects `.gitignore`
- Optional `.geminiignore` for extra rules
- Never sends: `.env*`, `*secret*`, `*credentials*`, `*key*`

**System Instructions**:
- File: `GEMINI.md` in project root
- Auto-loaded by CLI
- Contains synthesis protocol

**Conversation Tracking** (TODO: Research if Gemini supports session IDs):
```bash
# If supported:
gemini -p "First question" --session-id "bug-2025-11-07-abc123"
gemini -p "Follow-up" --session-id "bug-2025-11-07-abc123"
```

---

### OpenAI Codex CLI

**Authentication**:
```bash
export OPENAI_API_KEY="sk-..."
```

**Pre-flight Check**:
```bash
if ! openai api models.list &>/dev/null 2>&1; then
  echo "❌ OpenAI API key invalid"
  exit 1
fi
```

**Execution Pattern**:
```bash
PROMPT=$(cat <<'EOF'
Problem: {{PROBLEM}}
Question: {{QUESTION}}

(You have access to the codebase in this directory.)
EOF
)

cd {{PROJECT_DIR}}

echo "$PROMPT" | codex exec - \
  -m gpt-4-turbo \
  --yolo \
  --output-last-message /tmp/codex-response.txt

ANALYSIS=$(cat /tmp/codex-response.txt)
```

**Context Packaging**:
- **Repo-aware**: Automatically scans current directory
- No manual `@path` needed (just `cd` to project)
- Respects `.gitignore` automatically
- Warns if not in Git repo (use `--skip-git-repo-check` to override)

**Privacy**:
- Git-aware by default
- Same exclusions as Gemini (`.env*`, secrets, etc.)

**System Instructions**:
- File: `codex.md` in project root
- Auto-loaded by CLI
- Contains synthesis protocol (same as `GEMINI.md` but for Codex)

**Critical Flag**:
- `--yolo` (or `--dangerously-bypass-approvals-and-sandbox`)
- Required for non-interactive scripts
- Without this, CLI hangs waiting for approval

**Conversation Tracking** (TODO: Research if Codex supports conversation history):
```bash
# If supported, likely similar to Gemini
```

---

### Claude Subagent (Fresh Perspective)

**Execution Pattern**:
```markdown
Use Task tool with:
- subagent_type: "general-purpose"
- prompt: Detailed context + question
- model: "haiku" (fast) or "sonnet" (thorough)
```

**Context Packaging**:
- Subagent inherits full conversation context
- Provide specific files via Read tool first
- Reference them in subagent prompt

**Why This Works**:
- Fresh Claude has no conversation history bias
- Can challenge assumptions without "remembering" previous failed approaches
- Uses same model family (consistent quality)

**No Authentication Needed**: Built-in to Claude Code

---

## Slash Command Specifications

### `/consult-gemini [question]`

**Purpose**: Get Gemini 2.5 Pro's perspective with full reasoning, Google Search, and grounding.

**Workflow**:
1. Pre-flight check (API key valid)
2. Determine context scope (bug vs architecture)
3. Build prompt with `@<path>` references
4. Execute with locked flags (thinking + search + grounding)
5. Parse JSON response
6. Synthesize with Claude's analysis
7. Log consultation (cost tracking)
8. Present synthesis + recommendation

**Smart Context Selection**:
```bash
case "$PROBLEM_TYPE" in
  bug|error|fix)
    CONTEXT="@src/affected-file.ts"
    ;;
  architecture|design)
    CONTEXT="@src/ @docs/ARCHITECTURE.md"
    ;;
  security|auth)
    CONTEXT="@src/auth/ @src/middleware/"
    ;;
  *)
    CONTEXT="@."
    ;;
esac
```

---

### `/consult-codex [question]`

**Purpose**: Get OpenAI GPT-4's perspective via Codex CLI (repo-aware, agentic).

**Workflow**:
1. Pre-flight check (API key valid)
2. `cd` to project directory (Codex auto-scans)
3. Build prompt (no manual context needed)
4. Execute with `--yolo` flag
5. Parse response from output file
6. Synthesize with Claude's analysis
7. Log consultation
8. Present synthesis + recommendation

**Model Selection**:
- Default: `gpt-4-turbo` (best balance)
- Fast: `gpt-4o-mini` (quick checks)
- Powerful: `gpt-4o` (complex reasoning)

---

### `/consult-claude [question]`

**Purpose**: Get fresh Claude perspective via subagent (no conversation history bias).

**Workflow**:
1. Use Read tool to gather relevant files
2. Build detailed prompt with context
3. Launch Task tool (general-purpose subagent)
4. Wait for subagent response
5. Compare with own reasoning
6. Synthesize insights
7. Present recommendation

**When to Use**:
- Want Claude's reasoning but need "fresh eyes"
- No external API keys available
- Free (no additional cost)

---

### `/consult-ai [question]`

**Purpose**: Router - asks user which AI to consult.

**Workflow**:
1. Prompt user: "Which AI should I consult?"
   - Gemini 2.5 Pro (best for: structure, format, web research)
   - OpenAI GPT-4 (best for: general reasoning, documentation)
   - Fresh Claude (best for: fresh perspective, free)
2. Route to appropriate command
3. Execute consultation
4. Return result

---

## File Templates

### `GEMINI.md` (Project Root)

```markdown
# AI Synthesis Protocol for Multi-AI Consultation

You are Google Gemini 2.5 Pro, providing a second opinion in collaboration with Claude Code.

## Your Role
- **Independent analysis**: Challenge assumptions if warranted
- **Critical evaluation**: Don't just agree with Claude
- **Complementary perspective**: Focus on structure, format, rapid prototyping
- **Cite sources**: Use Google Search for latest docs (2024-2025)

## Required Format

1. **Direct Answer**: Clear answer to the question
2. **Reasoning**: Evidence from code/docs
3. **Trade-offs**: Pros/cons of approaches
4. **Risks**: Security, performance, maintainability issues
5. **Alternatives**: 1-2 alternative approaches
6. **Latest Practices**: Search and cite recent documentation

## Comparison Protocol

1. **Agreement**: Where analysis aligns with Claude
2. **Divergence**: Where you disagree (explain why)
3. **Missed Aspects**: What Claude overlooked
4. **Additional Context**: New info from Google Search

## Do NOT:
- ❌ Parrot Claude's response
- ❌ Be overly agreeable
- ❌ Ignore obvious issues

## DO:
- ✅ Challenge approaches with better alternatives
- ✅ Use Google Search for latest docs
- ✅ Focus on your strengths (structure, format, patterns)
- ✅ Be specific with code examples
```

---

### `codex.md` (Project Root)

```markdown
# AI Synthesis Protocol for Multi-AI Consultation

You are OpenAI Codex (GPT-4), providing a second opinion in collaboration with Claude Code.

## Your Role
- **Independent analysis**: Provide unbiased technical assessment
- **Critical evaluation**: Challenge assumptions when warranted
- **Complementary perspective**: Focus on general reasoning, best practices
- **Code-first**: Reference specific files and line numbers

## Required Format

1. **Direct Answer**: Clear answer to the question
2. **Code Analysis**: Specific files/functions with issues
3. **Reasoning**: Why current approach is/isn't optimal
4. **Trade-offs**: Pros/cons comparison
5. **Alternatives**: Better approaches with code examples
6. **Best Practices**: Industry standards and patterns

## Comparison Protocol

1. **Agreement**: Where you align with Claude's analysis
2. **Divergence**: Where you see things differently
3. **Code Issues**: Specific problems Claude might have missed
4. **Improvements**: Concrete code suggestions

## Do NOT:
- ❌ Simply validate Claude's approach without analysis
- ❌ Provide vague suggestions without code examples
- ❌ Ignore edge cases or error handling

## DO:
- ✅ Reference specific files and line numbers
- ✅ Provide concrete code examples
- ✅ Highlight potential bugs or edge cases
- ✅ Suggest tested patterns from your training data
```

---

### `.geminiignore` (Project Root)

```gitignore
# .geminiignore - Additional privacy rules beyond .gitignore

# Secrets
*.env*
*secret*
*credentials*
*key*
.env.local

# Large generated files
package-lock.json
pnpm-lock.yaml
yarn.lock
dist/
build/
.next/
.cache/

# Test fixtures with fake data
__fixtures__/
__mocks__/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db
```

---

## Cost Tracking

**Log File**: `~/.claude/ai-consultations/consultations.log`

**Format** (CSV):
```csv
timestamp,project,ai,model,question_preview,input_tokens,output_tokens,cost_usd
2025-11-07T10:30:00,my-app,gemini,gemini-2.5-pro,"Is auth secure?",15420,850,0.23
2025-11-07T11:45:00,my-app,codex,gpt-4-turbo,"Review API",8320,645,0.18
2025-11-07T12:15:00,my-app,claude,sonnet-4.5,"Fresh perspective",0,0,0.00
```

**Viewing**:
```bash
# Recent consultations
tail -n 10 ~/.claude/ai-consultations/consultations.log | column -t -s','

# Total cost per project
awk -F',' '{sum[$2] += $8} END {for (p in sum) print p": $"sum[p]}' \
  ~/.claude/ai-consultations/consultations.log
```

---

## Conversation Tracking Structure

**Directory**: `~/.claude/ai-consultations/<project-hash>/`

**Files**:
- `session-<timestamp>.json` - Full conversation history
- `metadata.json` - Project info, cumulative costs

**Session File Structure**:
```json
{
  "session_id": "bug-2025-11-07-abc123",
  "project": "my-app",
  "project_hash": "a1b2c3d4",
  "started_at": "2025-11-07T10:30:00Z",
  "consultations": [
    {
      "id": 1,
      "timestamp": "2025-11-07T10:30:00Z",
      "ai": "gemini",
      "model": "gemini-2.5-pro",
      "question": "Is this auth pattern secure?",
      "context_paths": ["@src/auth/", "@src/middleware/"],
      "response": "...",
      "input_tokens": 15420,
      "output_tokens": 850,
      "cost_usd": 0.23
    },
    {
      "id": 2,
      "timestamp": "2025-11-07T10:35:00Z",
      "ai": "gemini",
      "model": "gemini-2.5-pro",
      "question": "What about the JWT expiry logic?",
      "context_paths": ["@src/auth/jwt.ts"],
      "response": "...",
      "input_tokens": 3200,
      "output_tokens": 420,
      "cost_usd": 0.08,
      "references_consultation_id": 1
    }
  ]
}
```

---

## CLAUDE.md Integration

**Add to user's `~/.claude/CLAUDE.md`**:

```markdown
## Multi-AI Consultation Protocol

**Automatically suggest consultation when**:
1. **Bug/fix attempted once without success** → Suggest: "Should I consult [Gemini/Codex]?"
2. **Architecture decisions** → Auto-consult proactively (don't ask)
3. **Security-sensitive changes** → Auto-consult proactively
4. **Uncertain about trade-offs** → Suggest consultation

**Format suggestion**:
"I've tried [approach] without success. Should I consult Gemini for a fresh perspective?"

**Manual commands**:
- `/consult-gemini [question]` - Gemini 2.5 Pro (thinking + search + grounding)
- `/consult-codex [question]` - OpenAI GPT-4 (repo-aware)
- `/consult-claude [question]` - Fresh Claude (subagent)
- `/consult-ai [question]` - Choose which AI

**Synthesis requirements**:
1. Your analysis
2. Other AI's analysis
3. Key differences
4. Synthesis
5. Recommended action
```

---

## Known Issues & Prevention

### 1. CLI Not Installed
**Issue**: User doesn't have `gemini` or `codex` CLI installed
**Prevention**: Pre-flight checks in every command
**Fix**: Clear error message with installation instructions

### 2. API Keys Invalid
**Issue**: `GEMINI_API_KEY` or `OPENAI_API_KEY` not set or expired
**Prevention**: Pre-flight check before consultation
**Fix**: Guide user to set API key

### 3. Context Too Large
**Issue**: Passing `@.` (entire directory) exceeds token limits
**Prevention**: Smart context selection (only relevant files)
**Fix**: Fall back to specific files only

### 4. Privacy Leaks
**Issue**: Accidentally sending `.env` or secrets to external API
**Prevention**: Git-aware filtering + `.geminiignore`
**Fix**: Log warning if sensitive files detected

### 5. Cost Overruns
**Issue**: Too many consultations rack up API costs
**Prevention**: Cost tracking + warn at thresholds
**Fix**: Show running total, suggest using free Claude subagent

### 6. Codex Hanging on Approval
**Issue**: Forgot `--yolo` flag, Codex waits for approval
**Prevention**: Always include `--yolo` in scripts
**Fix**: Kill process, re-run with flag

### 7. JSON Parsing Fails
**Issue**: CLI output format changes or errors
**Prevention**: Check exit code before parsing
**Fix**: Fall back to plain text output

### 8. No Git Repo Warning
**Issue**: Codex CLI warns/fails if not in Git repo
**Prevention**: Add `--skip-git-repo-check` for non-Git projects
**Fix**: Guide user to init Git or use override flag

---

## Token Efficiency Estimates

**Without Skill** (manual consultation):
- Research how to use CLI: ~2,000 tokens
- Trial-and-error with flags: ~3,000 tokens
- Formatting response: ~1,000 tokens
- **Total**: ~6,000 tokens + 15-20 minutes

**With Skill**:
- Execute slash command: ~500 tokens
- Auto-formatted synthesis: ~1,500 tokens
- **Total**: ~2,000 tokens + 2-3 minutes

**Savings**: ~67% tokens, ~80% time

---

## Testing Checklist

### Pre-Implementation
- [ ] Verify `gemini` CLI installed and authenticated
- [ ] Verify `codex` CLI installed and authenticated (or document as optional)
- [ ] Test `gemini -p "test"` works
- [ ] Test `codex exec "test"` works
- [ ] Test JSON parsing with `jq`

### Post-Implementation
- [ ] Test `/consult-gemini` with bug scenario
- [ ] Test `/consult-codex` with architecture question
- [ ] Test `/consult-claude` with fresh perspective request
- [ ] Test `/consult-ai` router
- [ ] Verify `GEMINI.md` auto-loads
- [ ] Verify `codex.md` auto-loads
- [ ] Verify `.geminiignore` filters secrets
- [ ] Verify cost tracking logs correctly
- [ ] Test automatic suggestion triggers (after 1 failed attempt)
- [ ] Test synthesis format (all 5 sections present)

---

## Next Steps

1. **Create skill directory structure**
2. **Write slash commands** (4 total)
3. **Create templates** (GEMINI.md, codex.md, .geminiignore)
4. **Write SKILL.md** (full documentation)
5. **Write README.md** (trigger keywords)
6. **Create scripts** (setup, pre-flight, testing)
7. **Test end-to-end** (real bug scenario)
8. **Update CLAUDE.md** (add consultation protocol)
9. **Document in roadmap** (planning/skills-roadmap.md)

---

**Estimated Total Time**: 60-75 minutes
**Token Efficiency**: ~67% savings vs manual
**Errors Prevented**: 8+ (CLI auth, parsing, privacy, cost tracking, hanging)
