# Claude Code Slash Commands

Four slash commands for automating project planning and session workflow with Claude Code.

## Installation

Copy commands to your `.claude/commands/` directory:

```bash
# From the claude-skills repo
cp commands/plan-project.md ~/.claude/commands/
cp commands/plan-feature.md ~/.claude/commands/
cp commands/wrap-session.md ~/.claude/commands/
cp commands/resume-session.md ~/.claude/commands/
```

Commands are immediately available in Claude Code after copying.

## Commands

### Planning Commands

#### `/plan-project`

**Purpose**: Automate initial project planning for NEW projects

**Usage**: Type `/plan-project` after you've discussed and decided on project requirements with Claude

**What it does**:
1. Invokes project-planning skill to generate IMPLEMENTATION_PHASES.md
2. Creates SESSION.md automatically
3. Creates initial git commit with planning docs
4. Shows formatted planning summary
5. Asks permission to start Phase 1
6. Optionally pushes to remote

**Time savings**: 5-7 minutes per new project (15-20 manual steps → 1 command)

---

#### `/plan-feature`

**Purpose**: Add feature to existing project by generating and integrating new phases

**Usage**: Type `/plan-feature` when you want to add a new feature to an existing project

**What it does**:
1. Verifies prerequisites (SESSION.md + IMPLEMENTATION_PHASES.md exist)
2. Checks current phase status (warns if in progress)
3. Gathers feature requirements (5 questions)
4. Generates new phases via project-planning skill
5. Integrates into IMPLEMENTATION_PHASES.md (handles phase renumbering)
6. Updates SESSION.md with new pending phases
7. Updates related docs (DATABASE_SCHEMA.md, API_ENDPOINTS.md if needed)
8. Creates git commit for feature planning
9. Shows formatted summary

**Time savings**: 7-10 minutes per feature addition (25-30 manual steps → 1 command)

---

### Session Management Commands

#### `/wrap-session`

**Purpose**: Automate end-of-session workflow

**Usage**: Type `/wrap-session` in Claude Code

**What it does**:
1. Uses Task agent to analyze current session state
2. Updates SESSION.md with progress
3. Detects and updates relevant docs (CHANGELOG.md, ARCHITECTURE.md, etc.)
4. Creates structured git checkpoint commit
5. Outputs formatted handoff summary
6. Optionally pushes to remote

**Time savings**: 2-3 minutes per wrap-up (10-15 manual steps → 1 command)

---

### `/resume-session`

**Purpose**: Automate start-of-session context loading

**Usage**: Type `/resume-session` in Claude Code

**What it does**:
1. Uses Explore agent to load session context (SESSION.md + planning docs)
2. Shows recent git history (last 5 commits)
3. Displays formatted session summary (phase, progress, Next Action)
4. Shows verification criteria if in "Verification" stage
5. Optionally opens "Next Action" file
6. Asks permission to continue or adjust direction

**Time savings**: 1-2 minutes per resume (5-8 manual reads → 1 command)

---

## Requirements

**Planning Commands**:
- Project description (discussed with Claude)
- Git repository initialized (recommended)
- For `/plan-feature`: Existing SESSION.md and IMPLEMENTATION_PHASES.md

**Session Management Commands**:
- `SESSION.md` file in project root (created by `/plan-project` or `project-session-management` skill)
- `IMPLEMENTATION_PHASES.md` in project (optional but recommended)
- Git repository initialized

## Integration

These commands work together and integrate with planning/session skills:
- **Planning**: `project-planning` skill generates IMPLEMENTATION_PHASES.md
- **Session**: `project-session-management` skill provides SESSION.md protocol
- **Agents**: Commands use Claude Code's built-in Task, Explore, and Plan agents
- Manual workflow still available if preferred

## Complete Workflow

```
1. Brainstorm with Claude → /plan-project → Start Phase 1
2. Work on phases → /wrap-session → Context clear
3. New session → /resume-session → Continue work
4. Need feature → /plan-feature → Continue or start feature
5. Repeat wrap → resume cycle
```

## Features

**`/plan-project`**:
- ✅ Invokes project-planning skill automatically
- ✅ Creates SESSION.md from generated phases
- ✅ Structured git commit format
- ✅ Formatted planning summary
- ✅ Asks permission before starting Phase 1

**`/plan-feature`**:
- ✅ Checks current phase status
- ✅ Gathers requirements (5 questions)
- ✅ Generates new phases via skill
- ✅ Handles phase renumbering automatically
- ✅ Updates all relevant docs
- ✅ Smart integration into existing plan

**`/wrap-session`**:
- ✅ Auto-updates SESSION.md
- ✅ Smart doc detection
- ✅ Structured git checkpoint format
- ✅ Comprehensive error handling

**`/resume-session`**:
- ✅ Multi-file context loading
- ✅ Stage-aware (shows verification checklist when needed)
- ✅ Detects uncommitted changes
- ✅ Optional "Next Action" file opening

## Total Time Savings

**15-25 minutes per project lifecycle**:
- Planning: 5-7 minutes (plan-project)
- Feature additions: 7-10 minutes each (plan-feature)
- Session cycles: 3-5 minutes each (wrap + resume)

---

**Version**: 2.0.0
**Last Updated**: 2025-11-07
**Author**: Jeremy Dawes | Jezweb
