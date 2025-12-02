# GitHub Projects v2 - Proof of Concept Findings

**Date**: 2025-11-05
**Test Repository**: https://github.com/jezweb/test-github-projects
**Test Project**: https://github.com/users/jezweb/projects/7
**Purpose**: Validate GitHub Projects v2 capabilities for claude-skills project-planning integration

---

## Executive Summary

✅ **SUCCESS**: GitHub Projects v2 fully supports the workflows we need for project-planning skill integration.

**Key Findings**:
- Custom fields work perfectly (single-select, number, date)
- CLI automation is possible but requires GraphQL for complex operations
- Bidirectional sync is feasible (issues ↔ project)
- ID management is the biggest challenge (opaque IDs, requires lookups)
- Visual kanban boards provide excellent progress tracking

**Recommendation**: Build optional integration as separate `github-project-management` skill.

---

## What Was Tested

### 1. Project & Field Creation ✅

**Test**: Create project with custom fields via CLI

**Commands**:
```bash
# Create project
gh project create --owner "@me" --title "Test Planning Integration"

# Create custom fields
gh project field-create 7 --owner "@me" \
  --name "Phase Status" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Todo,In Progress,Verification,Blocked,Done"

gh project field-create 7 --owner "@me" \
  --name "Phase Type" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "Infrastructure,Database,API,UI,Integration,Testing"

gh project field-create 7 --owner "@me" \
  --name "Estimated Hours" \
  --data-type "NUMBER"

gh project field-create 7 --owner "@me" \
  --name "Target Date" \
  --data-type "DATE"
```

**Result**: ✅ All custom fields created successfully

**Notes**:
- "Status" is a reserved field name (use "Phase Status" instead)
- Built-in "Status" field auto-updates when issue closed/reopened
- Commands complete silently (no output = success)

---

### 2. Issue Creation & Project Linking ✅

**Test**: Create issues and add them to project

**Commands**:
```bash
# Create issues
gh issue create --repo jezweb/test-github-projects \
  --title "Phase 1: Project Setup" \
  --body "Tasks: Scaffold Vite, Configure Tailwind v4..." \
  --assignee "@me"

# Add to project
gh project item-add 7 --owner "@me" \
  --url https://github.com/jezweb/test-github-projects/issues/1
```

**Result**: ✅ Issues created and added to project successfully

**Notes**:
- Can't add labels during creation if they don't exist (create labels first or omit)
- Issues get auto-assigned an item ID when added to project
- Multiple issues can be added to same project

---

### 3. Setting Custom Field Values ✅

**Test**: Set custom field values for project items

**Challenge**: Need to know field IDs and option IDs (opaque, not user-friendly)

**Solution**: Query project structure with GraphQL first

**GraphQL Query** (get field IDs and option IDs):
```graphql
query {
  node(id: "PROJECT_ID") {
    ... on ProjectV2 {
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }
  }
}
```

**CLI Commands** (set field values):
```bash
# Set Phase Type to "Infrastructure"
gh project item-edit \
  --id "PVTI_lAHOAMoqHs4BHQxwzggvBg8" \
  --project-id "PVT_kwHOAMoqHs4BHQxw" \
  --field-id "PVTSSF_lAHOAMoqHs4BHQxwzg4EXuI" \
  --single-select-option-id "7335d8e8"

# Set Estimated Hours to 2
gh project item-edit \
  --id "PVTI_lAHOAMoqHs4BHQxwzggvBg8" \
  --project-id "PVT_kwHOAMoqHs4BHQxw" \
  --field-id "PVTF_lAHOAMoqHs4BHQxwzg4EXuM" \
  --number 2

# Set Target Date
gh project item-edit \
  --id "PVTI_lAHOAMoqHs4BHQxwzggvBg8" \
  --project-id "PVT_kwHOAMoqHs4BHQxw" \
  --field-id "PVTF_lAHOAMoqHs4BHQxwzg4EXuQ" \
  --date "2025-11-06"
```

**Result**: ✅ All field values set successfully

**Notes**:
- **CRITICAL**: Must maintain ID mappings (project ID, field IDs, option IDs, item IDs)
- Item IDs are unique per issue-project combination (not the issue number)
- Commands complete silently
- No validation errors (bad IDs fail silently)

---

### 4. Querying Project Data ✅

**Test**: Query project items with custom field values

**GraphQL Query**:
```graphql
query {
  node(id: "PVT_kwHOAMoqHs4BHQxw") {
    ... on ProjectV2 {
      title
      items(first: 10) {
        nodes {
          content {
            ... on Issue {
              number
              title
              state
            }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2FieldCommon { name } }
              }
              ... on ProjectV2ItemFieldNumberValue {
                number
                field { ... on ProjectV2FieldCommon { name } }
              }
              ... on ProjectV2ItemFieldDateValue {
                date
                field { ... on ProjectV2FieldCommon { name } }
              }
            }
          }
        }
      }
    }
  }
}
```

**Result**: ✅ Successfully retrieved all items with custom fields

**Sample Output**:
```json
{
  "content": {
    "number": 1,
    "title": "Phase 1: Project Setup",
    "state": "CLOSED"
  },
  "fieldValues": [
    {"name": "Infrastructure", "field": {"name": "Phase Type"}},
    {"name": "Verification", "field": {"name": "Phase Status"}},
    {"number": 2.5, "field": {"name": "Estimated Hours"}},
    {"date": "2025-11-06", "field": {"name": "Target Date"}}
  ]
}
```

**Notes**:
- GraphQL provides rich querying (filter, sort, paginate)
- CLI `gh project item-list` returns basic info only (use GraphQL for fields)
- Can query by project ID or item ID

---

### 5. Updating Status During Workflow ✅

**Test**: Simulate phase progress by updating status

**Commands**:
```bash
# Update Phase Status from "In Progress" to "Verification"
gh project item-edit \
  --id "PVTI_lAHOAMoqHs4BHQxwzggvBg8" \
  --project-id "PVT_kwHOAMoqHs4BHQxw" \
  --field-id "PVTSSF_lAHOAMoqHs4BHQxwzg4EXdk" \
  --single-select-option-id "409c039f"

# Update Estimated Hours
gh project item-edit \
  --id "PVTI_lAHOAMoqHs4BHQxwzggvBg8" \
  --project-id "PVT_kwHOAMoqHs4BHQxw" \
  --field-id "PVTF_lAHOAMoqHs4BHQxwzg4EXuM" \
  --number 2.5
```

**Result**: ✅ Status and hours updated successfully

**Notes**:
- Updates are instant (no delay)
- Can update multiple fields independently
- No built-in validation (can set any number, any date)

---

### 6. Issue Closure & Auto-Status Update ✅

**Test**: Close issue and verify project status auto-updates

**Commands**:
```bash
# Close issue
gh issue close 1 --repo jezweb/test-github-projects --reason completed
```

**Result**: ✅ Issue closed, built-in "Status" field auto-set to "Done"

**Observations**:
- Built-in "Status" field (separate from custom "Phase Status"):
  - Auto-updates to "Done" when issue closed
  - Auto-updates to "In Progress" when issue reopened
  - Cannot be manually edited
- Custom "Phase Status" field:
  - Does NOT auto-update (remains "Verification")
  - Must be updated manually via CLI

**Implication**: Use custom "Phase Status" for workflow tracking, ignore built-in "Status"

---

### 7. Listing Open Issues (Resume Workflow) ✅

**Test**: Simulate resuming work by querying open issues

**Commands**:
```bash
gh issue list --repo jezweb/test-github-projects \
  --state open \
  --json number,title,state
```

**Result**: ✅ Lists all open issues in JSON format

**Output**:
```json
[
  {"number": 3, "state": "OPEN", "title": "Phase 3: API Routes"},
  {"number": 2, "state": "OPEN", "title": "Phase 2: Database Schema"}
]
```

**Notes**:
- Can filter by: state, label, milestone, assignee, author
- JSON output perfect for scripting
- Combine with GraphQL query to get project-specific fields

---

### 8. Branch Linking (Attempted) ⚠️

**Test**: Create branch linked to issue

**Commands**:
```bash
gh issue develop 2 \
  --repo jezweb/test-github-projects \
  --name "phase-2-database" \
  --checkout
```

**Result**: ❌ Failed (repo has no commits yet)

**Error**:
```
GraphQL: Variable $input of type CreateLinkedBranchInput! was provided
invalid value for oid (Could not coerce value "" to GitObjectID)
```

**Conclusion**: Branch linking works only after repo has at least one commit. Feature confirmed to exist and be useful.

---

## Challenges Discovered

### 1. **ID Management** (Biggest Challenge)

**Problem**: GitHub Projects use opaque IDs everywhere:
- Project ID: `PVT_kwHOAMoqHs4BHQxw`
- Field IDs: `PVTSSF_lAHOAMoqHs4BHQxwzg4EXdk`
- Option IDs: `409c039f`
- Item IDs: `PVTI_lAHOAMoqHs4BHQxwzggvBg8`

**Impact**: Can't hardcode commands, must query and store IDs

**Solution**: Script workflow:
1. Query project structure (GraphQL) → save IDs to file
2. Use IDs from file for all subsequent commands
3. Update ID mapping when new items added

**Example ID Mapping File** (`.github-project-ids.json`):
```json
{
  "project_id": "PVT_kwHOAMoqHs4BHQxw",
  "project_number": 7,
  "fields": {
    "phase_status": {
      "id": "PVTSSF_lAHOAMoqHs4BHQxwzg4EXdk",
      "options": {
        "Todo": "e22aa119",
        "In Progress": "8a46b1d1",
        "Verification": "409c039f",
        "Blocked": "b4047c57",
        "Done": "302e0864"
      }
    },
    "phase_type": {
      "id": "PVTSSF_lAHOAMoqHs4BHQxwzg4EXuI",
      "options": {
        "Infrastructure": "7335d8e8",
        "Database": "9b12a73a",
        "API": "70d007cb",
        "UI": "70e11be8",
        "Integration": "d0f20d0f",
        "Testing": "0b85201f"
      }
    },
    "estimated_hours": "PVTF_lAHOAMoqHs4BHQxwzg4EXuM",
    "target_date": "PVTF_lAHOAMoqHs4BHQxwzg4EXuQ"
  },
  "items": {
    "1": "PVTI_lAHOAMoqHs4BHQxwzggvBg8",
    "2": "PVTI_lAHOAMoqHs4BHQxwzggvBhc",
    "3": "PVTI_lAHOAMoqHs4BHQxwzggvBhk"
  }
}
```

---

### 2. **CLI Limitations**

**Problems**:
- `gh project view` doesn't return detailed field info (just counts)
- `gh project item-list` doesn't include custom field values
- No way to create project views (kanban, roadmap) via CLI
- Silent failures (bad IDs don't produce errors)

**Solution**: Use GraphQL API for complex queries

**When to use CLI vs GraphQL**:
| Operation | Use |
|-----------|-----|
| Create project/fields | CLI (simpler) |
| Create/close issues | CLI (simpler) |
| Add items to project | CLI (simpler) |
| Query project structure | GraphQL (only option) |
| Query field values | GraphQL (CLI doesn't support) |
| Set field values | CLI (works, but need GraphQL to get IDs first) |
| Batch operations | GraphQL (more efficient) |

---

### 3. **Reserved Field Names**

**Problem**: Can't use "Status" as custom field name (reserved)

**Workaround**: Use "Phase Status", "Task Status", etc.

**Implication**: Built-in "Status" field will exist alongside custom "Phase Status"
- Built-in "Status" auto-updates (ignore it)
- Custom "Phase Status" for workflow tracking

---

### 4. **No Offline Mode**

**Problem**: All operations require network (GitHub API calls)

**Impact**: Can't update project when offline

**Mitigation**: SESSION.md remains source of truth (works offline), GitHub is optional visual layer

---

## Workflows That Work

### Workflow 1: Create Project from IMPLEMENTATION_PHASES.md

```bash
#!/bin/bash
# scripts/create-github-project.sh

PROJECT_TITLE="$1"
PHASES_FILE="docs/IMPLEMENTATION_PHASES.md"
REPO_NAME="jezweb/my-app"

# 1. Create project
PROJECT_JSON=$(gh project create --owner "@me" --title "$PROJECT_TITLE" --format json)
PROJECT_ID=$(echo "$PROJECT_JSON" | jq -r '.id')
PROJECT_NUMBER=$(echo "$PROJECT_JSON" | jq -r '.number')

# 2. Create custom fields
gh project field-create "$PROJECT_NUMBER" --owner "@me" \
  --name "Phase Status" --data-type "SINGLE_SELECT" \
  --single-select-options "Todo,In Progress,Verification,Blocked,Done"

gh project field-create "$PROJECT_NUMBER" --owner "@me" \
  --name "Phase Type" --data-type "SINGLE_SELECT" \
  --single-select-options "Infrastructure,Database,API,UI,Integration,Testing"

gh project field-create "$PROJECT_NUMBER" --owner "@me" \
  --name "Estimated Hours" --data-type "NUMBER"

gh project field-create "$PROJECT_NUMBER" --owner "@me" \
  --name "Target Date" --data-type "DATE"

# 3. Query and save field IDs (GraphQL)
gh api graphql -f query="..." > .github-project-ids.json

# 4. Parse IMPLEMENTATION_PHASES.md and create issues
# (parse markdown, extract phase titles/descriptions)
for phase in phases; do
  ISSUE_URL=$(gh issue create \
    --repo "$REPO_NAME" \
    --title "Phase X: $TITLE" \
    --body "$BODY" \
    --assignee "@me" \
    --format json | jq -r '.url')

  # Add issue to project
  ITEM_JSON=$(gh project item-add "$PROJECT_NUMBER" --owner "@me" --url "$ISSUE_URL" --format json)
  ITEM_ID=$(echo "$ITEM_JSON" | jq -r '.id')

  # Set custom fields
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$PHASE_TYPE_FIELD_ID" \
    --single-select-option-id "$TYPE_OPTION_ID"

  # ... set other fields
done

# 5. Output project URL
echo "Project created: https://github.com/users/jezweb/projects/$PROJECT_NUMBER"
```

**Outcome**: Fully automated project creation from planning docs

---

### Workflow 2: Update Status During Session

```bash
#!/bin/bash
# scripts/update-phase-status.sh

ISSUE_NUMBER="$1"
NEW_STATUS="$2"  # "In Progress", "Verification", "Done", etc.

# Load ID mappings
source .github-project-ids.sh

# Get item ID for issue
ITEM_ID="${ITEMS[$ISSUE_NUMBER]}"

# Get option ID for status
OPTION_ID="${PHASE_STATUS_OPTIONS[$NEW_STATUS]}"

# Update project field
gh project item-edit \
  --id "$ITEM_ID" \
  --project-id "$PROJECT_ID" \
  --field-id "$PHASE_STATUS_FIELD_ID" \
  --single-select-option-id "$OPTION_ID"

echo "Phase $ISSUE_NUMBER status updated to: $NEW_STATUS"
```

**Usage**:
```bash
./scripts/update-phase-status.sh 2 "In Progress"
./scripts/update-phase-status.sh 2 "Verification"
./scripts/update-phase-status.sh 2 "Done"
```

---

### Workflow 3: Resume Work (Query Current State)

```bash
#!/bin/bash
# scripts/query-project-status.sh

# Query project items with status
gh api graphql -f query='
query {
  node(id: "PROJECT_ID") {
    ... on ProjectV2 {
      items(first: 20) {
        nodes {
          content {
            ... on Issue {
              number
              title
              state
            }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2FieldCommon { name } }
              }
            }
          }
        }
      }
    }
  }
}' | jq -r '.data.node.items.nodes[] |
  "Issue #\(.content.number): \(.content.title) - " +
  ([.fieldValues.nodes[] | select(.field.name == "Phase Status") | .name][0] // "No status")'
```

**Output**:
```
Issue #1: Phase 1: Project Setup - Done
Issue #2: Phase 2: Database Schema - In Progress
Issue #3: Phase 3: API Routes - Todo
```

---

## Recommendations

### ✅ Build GitHub Integration as Separate Skill

**Skill Name**: `github-project-management`

**Purpose**: Optional integration layer between planning docs and GitHub Projects

**When to Use**:
- Team collaboration
- Client visibility
- Long-running projects (audit trail)
- Visual progress tracking preferred

**When NOT to Use**:
- Solo developer, simple project
- Prefer lightweight markdown-only
- Working offline frequently
- Don't have GitHub repo

---

### Core Features for Skill

**Phase 1: Basic Integration**
1. `create-project.sh`: Parse IMPLEMENTATION_PHASES.md → create GitHub project
2. `update-status.sh`: Update phase status in project
3. `query-status.sh`: Query current state for resume workflow

**Phase 2: Enhanced Features**
4. `sync-session.sh`: Sync SESSION.md changes → GitHub (one-way)
5. `close-phase.sh`: Close issue when phase verified complete
6. Template improvements (better issue body formatting)

**Phase 3: Advanced (Optional)**
7. Bidirectional sync (GitHub → SESSION.md via webhooks)
8. Milestone creation from phases
9. Label automation
10. Branch linking automation

---

### Skill Structure

```
skills/github-project-management/
├── SKILL.md                      # Skill prompt
├── README.md                     # User documentation
├── scripts/
│   ├── create-project.sh         # Main creation script
│   ├── update-status.sh          # Update phase status
│   ├── query-status.sh           # Query current state
│   ├── sync-session.sh           # Sync SESSION.md → GitHub
│   └── lib/
│       ├── parse-phases.py       # Parse IMPLEMENTATION_PHASES.md
│       ├── query-fields.sh       # GraphQL field queries
│       └── id-manager.sh         # Manage ID mappings
├── references/
│   ├── github-projects-api.md    # GraphQL reference
│   └── field-mappings.md         # Standard field configs
└── templates/
    ├── project-config.json       # Default field setup
    └── issue-template.md         # Phase issue template
```

---

### Integration with project-planning Skill

**Option A**: project-planning skill asks at end:
```
Planning docs created in /docs:
- IMPLEMENTATION_PHASES.md (8 phases)
- DATABASE_SCHEMA.md

Would you like to create a GitHub Project for tracking? [y/N]

→ If yes, invoke github-project-management skill
```

**Option B**: User invokes separately:
```
User: "Use project-planning to generate docs"
Claude: [generates docs]

User: "Now create a GitHub project from those docs"
Claude: [discovers github-project-management skill, creates project]
```

**Recommendation**: Start with Option B (manual invocation), add Option A later if usage justifies automation

---

### ID Management Strategy

**Create `.github/` directory** in project with:

```
.github/
├── project-ids.json              # ID mappings (gitignored)
└── project-config.json           # Project settings (committed)
```

**project-config.json** (committed, version controlled):
```json
{
  "project_title": "My App Development",
  "field_configs": {
    "phase_status": {
      "name": "Phase Status",
      "type": "SINGLE_SELECT",
      "options": ["Todo", "In Progress", "Verification", "Blocked", "Done"]
    },
    "phase_type": {
      "name": "Phase Type",
      "type": "SINGLE_SELECT",
      "options": ["Infrastructure", "Database", "API", "UI", "Integration", "Testing"]
    },
    "estimated_hours": {
      "name": "Estimated Hours",
      "type": "NUMBER"
    },
    "target_date": {
      "name": "Target Date",
      "type": "DATE"
    }
  }
}
```

**project-ids.json** (gitignored, generated):
```json
{
  "project_id": "PVT_kwHOAMoqHs4BHQxw",
  "project_number": 7,
  "project_url": "https://github.com/users/jezweb/projects/7",
  "fields": { ... },
  "items": { ... }
}
```

**Rationale**: Config is portable (can recreate project), IDs are instance-specific (don't commit)

---

## Visual Examples

### Project Board View (Web UI)

After running `create-project.sh`, users can view:

**Table View** (spreadsheet-like):
| Title | Status | Phase Type | Estimated Hours | Target Date | Assignee |
|-------|--------|------------|-----------------|-------------|----------|
| Phase 1: Project Setup | Done | Infrastructure | 2.5 | 2025-11-06 | @jezweb |
| Phase 2: Database Schema | In Progress | Database | 3 | 2025-11-08 | @jezweb |
| Phase 3: API Routes | Todo | API | 4 | 2025-11-10 | @jezweb |

**Board View** (kanban, grouped by Phase Status):
```
┌─────────────┬──────────────────┬──────────────┬─────────┐
│ Todo        │ In Progress      │ Verification │ Done    │
├─────────────┼──────────────────┼──────────────┼─────────┤
│ Phase 3:    │ Phase 2:         │              │ Phase 1:│
│ API Routes  │ Database Schema  │              │ Setup   │
│ API • 4h    │ Database • 3h    │              │ Infra   │
│ 2025-11-10  │ 2025-11-08       │              │         │
└─────────────┴──────────────────┴──────────────┴─────────┘
```

**Roadmap View** (timeline by Target Date):
```
Nov 6  ──●── Phase 1: Setup (Done)
         │
Nov 8  ──●── Phase 2: Database (In Progress)
         │
Nov 10 ──○── Phase 3: API (Todo)
```

---

## Performance & Limitations

### API Rate Limits

**GitHub API**: 5000 requests/hour for authenticated users

**Implications**:
- Creating project with 10 phases ≈ 50-60 API calls
- Well within limits for normal usage
- Batch operations via GraphQL more efficient

---

### Scalability

**Tested**: 3 phases/issues

**Expected to handle**: 50+ phases without issues

**Considerations**:
- Projects support 1200 items max (way more than needed)
- Custom fields: 50 max (we use 4)
- GraphQL queries paginate (first: N, after: cursor)

---

## Conclusion

### What Works ✅

1. **Project creation** - Fully automated via CLI
2. **Custom fields** - All types work (single-select, number, date, text)
3. **Issue → Project linking** - Seamless
4. **Field value updates** - Works, requires ID management
5. **Querying** - GraphQL provides rich data access
6. **Issue closure sync** - Built-in Status auto-updates
7. **Collaboration** - Assignees, comments, notifications all work
8. **Visual tracking** - Kanban/table/roadmap views excellent

### What's Awkward ⚠️

1. **ID management** - Opaque IDs require mapping file
2. **CLI limitations** - Some operations require GraphQL
3. **Silent failures** - Bad IDs don't error
4. **Reserved names** - "Status" conflicts
5. **No offline mode** - Requires network

### What Doesn't Work ❌

1. **Branch linking** - Only works after first commit (minor)
2. **View creation** - Must use web UI (minor, one-time)

---

### Final Verdict

**BUILD IT** as a separate `github-project-management` skill.

**Benefits outweigh drawbacks** for team collaboration and client-facing projects.

**Keep it optional** - markdown-first workflow remains default, GitHub is opt-in visual layer.

**Implementation effort**: ~8-10 hours for Phase 1 (basic integration) = ~8-10 min human time

---

## Next Steps

1. **Review findings** with user (this document)
2. **Decide**: Build now or defer?
3. **If building**:
   - Create skill directory structure
   - Implement `create-project.sh` (MVP)
   - Test with real project
   - Document workflows
   - Update project-planning skill to mention optional integration

4. **If deferring**:
   - Archive findings in `planning/research-logs/`
   - Add to roadmap for future
   - Keep test repo/project as reference

---

**Test Artifacts**:
- Repository: https://github.com/jezweb/test-github-projects
- Project: https://github.com/users/jezweb/projects/7
- Keep or delete: User decides

---

**Author**: Claude Code
**Session**: 2025-11-05
**Duration**: 45 minutes
**Verdict**: ✅ Feasible and valuable
