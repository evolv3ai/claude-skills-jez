# Multi-AI Consultant - CLI Integration Reference

**Created**: 2025-11-07
**Purpose**: Quick reference for Gemini and Codex CLI syntax

---

## Gemini CLI (@google/generative-ai-cli)

### Installation
```bash
npm install -g @google/generative-ai-cli
```

### Authentication
```bash
# Set API key
export GEMINI_API_KEY="your-api-key-here"

# Or use gemini auth (interactive)
gemini auth
```

### Basic Usage

**Simple prompt**:
```bash
gemini -p "What is the capital of France?"
```

**With file context**:
```bash
gemini -p "Explain this file: @src/main.ts"
```

**With directory context**:
```bash
gemini -p "Review the architecture: @src/"
```

**Current directory**:
```bash
gemini -p "Analyze the entire codebase: @."
```

**Multiple paths**:
```bash
gemini -p "Compare @src/old.ts and @src/new.ts"
```

### Advanced Flags

**Model selection**:
```bash
gemini -p "..." -m gemini-1.5-flash      # Fast/cheap
gemini -p "..." -m gemini-1.5-pro        # Powerful
gemini -p "..." -m gemini-2.5-pro        # Latest (locked for our use)
```

**Thinking mode**:
```bash
gemini -p "..." --thinking               # Enable extended reasoning
```

**Google Search**:
```bash
gemini -p "..." --google-search          # Enable web search
```

**Context grounding**:
```bash
gemini -p "..." --grounding              # Verify against sources
```

**JSON output**:
```bash
gemini -p "..." --output-format json     # Structured output for parsing
```

**Combined** (our default):
```bash
gemini -p "..." \
  -m gemini-2.5-pro \
  --thinking \
  --google-search \
  --grounding \
  --output-format json
```

### Piping Prompts (For Scripts)

```bash
# Simple pipe
echo "What is 5+5?" | gemini

# Multi-line prompt
PROMPT=$(cat <<'EOF'
Problem: Authentication failing
Question: Is the JWT validation correct?
Context: @src/auth/
EOF
)

echo "$PROMPT" | gemini -m gemini-2.5-pro --output-format json
```

### Parsing JSON Output

```bash
# Get full response
RESPONSE=$(gemini -p "test" --output-format json)

# Extract text only
TEXT=$(echo "$RESPONSE" | jq -r '.response.text')

# Extract tokens
INPUT_TOKENS=$(echo "$RESPONSE" | jq -r '.stats.inputTokens')
OUTPUT_TOKENS=$(echo "$RESPONSE" | jq -r '.stats.outputTokens')
```

### Privacy & Filtering

**Automatic** (respects `.gitignore`):
```bash
# If .gitignore contains node_modules/, it's automatically excluded
gemini -p "Analyze: @."
```

**Additional exclusions** (`.geminiignore`):
```gitignore
# Create .geminiignore in project root
*.env*
*secret*
*credentials*
dist/
build/
```

### System Instructions (GEMINI.md)

**Auto-loaded from project root**:
```bash
# Create GEMINI.md in project root
# Contents are prepended to every prompt automatically
```

Example `GEMINI.md`:
```markdown
# AI Synthesis Protocol
You are providing a second opinion to Claude Code.
Always compare approaches and highlight differences.
```

### Pre-flight Check

```bash
# Test if CLI works
if ! gemini -p "test" &>/dev/null 2>&1; then
  echo "Gemini CLI not working"
  echo "Check: GEMINI_API_KEY set? CLI installed?"
  exit 1
fi
```

---

## OpenAI Codex CLI (codex npm package)

### Installation
```bash
npm install -g codex
```

### Authentication

**Option 1: API Key** (recommended for scripts):
```bash
export OPENAI_API_KEY="sk-..."
```

**Option 2: ChatGPT subscription** (interactive):
```bash
codex login  # Opens browser for OAuth
```

**Pre-flight check**:
```bash
# Test API key
if ! openai api models.list &>/dev/null 2>&1; then
  echo "OpenAI API key invalid"
  exit 1
fi
```

### Basic Usage

**Important**: Use `codex exec` for non-interactive scripts

**Simple prompt**:
```bash
codex exec "What is the capital of France?"
```

**From stdin**:
```bash
echo "Explain this code" | codex exec -
```

**Repo-aware** (automatically reads directory):
```bash
cd /path/to/project
codex exec "Review the architecture of this project"
# No @path needed - CLI scans automatically
```

### Advanced Flags

**Model selection**:
```bash
codex exec "..." -m gpt-4o-mini      # Fast/cheap
codex exec "..." -m gpt-4-turbo      # Balanced (default)
codex exec "..." -m gpt-4o           # Most powerful
```

**Auto-approval** (CRITICAL for scripts):
```bash
codex exec "..." --yolo              # Bypass approval prompts
# OR
codex exec "..." --dangerously-bypass-approvals-and-sandbox
# OR
codex exec "..." --full-auto         # Workspace writes allowed
```

**Output to file**:
```bash
codex exec "..." --output-last-message /tmp/response.txt
RESPONSE=$(cat /tmp/response.txt)
```

**JSON output**:
```bash
codex exec "..." --json              # Newline-delimited JSON events
```

**Change directory**:
```bash
codex exec "..." --cd /path/to/project
```

**Skip Git check**:
```bash
codex exec "..." --skip-git-repo-check
```

### Piping Prompts (For Scripts)

```bash
# Multi-line prompt
PROMPT=$(cat <<'EOF'
Problem: Authentication failing
Question: Is the JWT validation correct?

(You have access to the codebase in this directory.)
EOF
)

cd /path/to/project

echo "$PROMPT" | codex exec - \
  -m gpt-4-turbo \
  --yolo \
  --output-last-message /tmp/codex-response.txt
```

### Privacy & Filtering

**Automatic** (respects `.gitignore`):
```bash
# If .gitignore contains node_modules/, it's automatically excluded
cd /path/to/project
codex exec "Analyze this codebase"
```

**Git repo check**:
- Codex warns if not in Git repo (safety feature)
- Use `--skip-git-repo-check` to override

### System Instructions (codex.md)

**Auto-loaded from project root or ~/.codex/instructions.md**:
```bash
# Create codex.md in project root
# OR create ~/.codex/instructions.md for global rules
# Contents are prepended to every prompt automatically
```

Example `codex.md`:
```markdown
# AI Synthesis Protocol
You are providing a second opinion to Claude Code.
Reference specific files and line numbers.
Provide concrete code examples.
```

### Pre-flight Check

```bash
# Test if CLI works (via OpenAI API check)
if ! openai api models.list &>/dev/null 2>&1; then
  echo "Codex CLI not working"
  echo "Check: OPENAI_API_KEY set? CLI installed?"
  exit 1
fi
```

---

## Comparison: Gemini vs Codex CLI

| Feature | Gemini CLI | Codex CLI |
|---------|-----------|-----------|
| **Context method** | `@<path>` syntax | Repo-aware (auto-scans) |
| **Auth** | `GEMINI_API_KEY` | `OPENAI_API_KEY` or OAuth |
| **System instructions** | `GEMINI.md` in project root | `codex.md` in root or `~/.codex/instructions.md` |
| **Privacy** | `.gitignore` + `.geminiignore` | `.gitignore` (auto) |
| **JSON output** | `--output-format json` | `--json` or `--output-last-message` |
| **Model selection** | `-m gemini-2.5-pro` | `-m gpt-4-turbo` |
| **Special features** | `--thinking --google-search --grounding` | `--yolo` (auto-approve) |
| **Pre-flight check** | `gemini -p "test"` | `openai api models.list` |
| **Best for** | Web research, format validation | General reasoning, code analysis |

---

## Common Patterns

### Pattern 1: Consultation with JSON Parsing

**Gemini**:
```bash
PROMPT="Question: Is this secure? Context: @src/auth/"
RESPONSE=$(echo "$PROMPT" | gemini -m gemini-2.5-pro --output-format json 2>/dev/null)
ANALYSIS=$(echo "$RESPONSE" | jq -r '.response.text')
echo "$ANALYSIS"
```

**Codex**:
```bash
PROMPT="Question: Is this secure?"
cd /path/to/project
echo "$PROMPT" | codex exec - -m gpt-4-turbo --yolo --output-last-message /tmp/out.txt
ANALYSIS=$(cat /tmp/out.txt)
echo "$ANALYSIS"
```

### Pattern 2: Error Handling

```bash
# Gemini
if ! gemini -p "test" &>/dev/null 2>&1; then
  echo "❌ Gemini CLI not working"
  exit 1
fi

# Codex
if ! openai api models.list &>/dev/null 2>&1; then
  echo "❌ OpenAI API key invalid"
  exit 1
fi
```

### Pattern 3: Smart Context Selection

**Gemini** (manual context):
```bash
case "$PROBLEM_TYPE" in
  bug)
    CONTEXT="@src/buggy-file.ts"
    ;;
  architecture)
    CONTEXT="@src/ @docs/"
    ;;
  *)
    CONTEXT="@."
    ;;
esac

gemini -p "Analyze: $CONTEXT"
```

**Codex** (auto context):
```bash
# Just cd to relevant directory
case "$PROBLEM_TYPE" in
  bug)
    cd src/
    ;;
  *)
    cd .
    ;;
esac

codex exec "Analyze this code"
```

### Pattern 4: Cost Tracking

```bash
# Gemini
RESPONSE=$(gemini -p "..." --output-format json)
INPUT_TOKENS=$(echo "$RESPONSE" | jq -r '.stats.inputTokens')
OUTPUT_TOKENS=$(echo "$RESPONSE" | jq -r '.stats.outputTokens')

# Calculate cost (example rates)
COST=$(echo "scale=4; ($INPUT_TOKENS * 0.000015) + ($OUTPUT_TOKENS * 0.00006)" | bc)

# Log
echo "$(date -Iseconds),gemini,gemini-2.5-pro,$INPUT_TOKENS,$OUTPUT_TOKENS,$COST" \
  >> ~/.claude/consultations.log
```

---

## Troubleshooting

### Gemini CLI Issues

**Problem**: "API key invalid"
```bash
# Check if set
echo $GEMINI_API_KEY

# Set it
export GEMINI_API_KEY="your-key"

# Or add to ~/.bashrc
echo 'export GEMINI_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

**Problem**: "File not found" with `@<path>`
```bash
# Use absolute paths or relative from current dir
gemini -p "@./src/file.ts"   # Explicit relative
gemini -p "@$PWD/src/file.ts" # Absolute
```

**Problem**: JSON parsing fails
```bash
# Check for errors in response
RESPONSE=$(gemini -p "test" --output-format json 2>&1)
echo "$RESPONSE"  # Look for error messages

# Check jq works
echo "$RESPONSE" | jq . || echo "Invalid JSON"
```

### Codex CLI Issues

**Problem**: CLI hangs (waiting for approval)
```bash
# ALWAYS use --yolo for scripts
codex exec "..." --yolo
```

**Problem**: "Not in Git repo" warning
```bash
# Skip the check
codex exec "..." --skip-git-repo-check
```

**Problem**: "openai command not found"
```bash
# Install OpenAI Python package for pre-flight checks
pip install openai

# Or skip pre-flight check (risky)
```

**Problem**: Response file empty
```bash
# Check exit code
echo "$PROMPT" | codex exec - --output-last-message /tmp/out.txt
if [ $? -ne 0 ]; then
  echo "Codex failed"
  exit 1
fi
```

---

## Security Notes

### API Key Storage

**Do NOT**:
- ❌ Hardcode API keys in scripts
- ❌ Commit API keys to Git
- ❌ Share API keys in logs

**DO**:
- ✅ Use environment variables
- ✅ Store in `.env` (add to `.gitignore`)
- ✅ Use secret managers in CI/CD
- ✅ Rotate keys regularly

### Privacy Protection

**Automatic filtering**:
```bash
# Both CLIs respect .gitignore
# Add sensitive patterns:
echo "*.env*" >> .gitignore
echo "*secret*" >> .gitignore
echo "*credentials*" >> .gitignore
```

**Manual check before sending**:
```bash
# List what will be sent to Gemini
ls -la @src/  # Check directory contents

# Review context
echo "$PROMPT"  # Check prompt content
```

---

## Performance Tips

### Reduce Token Usage

**Gemini** (selective context):
```bash
# Instead of: @.
# Use specific paths: @src/relevant/ @docs/specific.md
```

**Codex** (narrow directory):
```bash
# Instead of: cd /project/root
# Use: cd /project/root/src/specific-feature
```

### Faster Responses

**Use faster models for simple tasks**:
```bash
# Gemini
gemini -p "..." -m gemini-1.5-flash  # ~2x faster

# Codex
codex exec "..." -m gpt-4o-mini      # ~3x faster
```

### Caching (if supported)

**Check CLI docs** for caching flags:
```bash
# Gemini (check if supported)
gemini -p "..." --cache-context

# Codex (check if supported)
codex exec "..." --cache
```

---

## References

- **Gemini CLI**: https://ai.google.dev/gemini-api/docs/cli
- **OpenAI Codex**: https://www.npmjs.com/package/codex
- **OpenAI API**: https://platform.openai.com/docs
- **Gemini API Pricing**: https://ai.google.dev/pricing
- **OpenAI API Pricing**: https://openai.com/pricing

---

**Last Updated**: 2025-11-07
**Status**: Planning phase
