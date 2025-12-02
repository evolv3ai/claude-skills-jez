# Code Maps for Claude Code CLI: Research Briefing

## Executive Summary

This briefing explores how Windsurf's "Codemaps" concept could be adapted as a skill/guidance system for Claude Code CLI to improve code navigation, context management, and decision-making. The research reveals that Claude Code already has a sophisticated memory system (CLAUDE.md files), and the opportunity lies in extending this with structured mapping approaches that help Claude maintain better awareness of "what files do what" across complex codebases.

## 1. Understanding Windsurf Codemaps

### What Are Codemaps?

Codemaps are "first-of-its-kind AI-annotated structured maps of your code" that help engineers understand code before modifying it, embodying the philosophy of "turning your brain ON, not OFF". They address a fundamental problem: modern codebases are sprawling, and even top engineers spend much of their time finding and remembering what matters.

### Key Features of Windsurf Codemaps:

1. **Interactive Navigation**: Results are grouped and nested parts of code that link to exact lines, with visual diagrams where nodes send you to specific codebase locations

2. **Trace Guides**: Expandable sections provide descriptive explanations of what groups discovered lines together

3. **Agent Integration**: Codemaps can be referenced in Cascade agent prompts via @{codemap} to provide specific context and dramatically improve agent performance

4. **Accountability Focus**: The goal is to keep humans accountable for code they ship - "you might not write every line, but you're still responsible for what ships"

### The Problem They Solve:

Standard approaches by Copilot, Claude Code, and others involve asking questions of a generalist agent in a typical chat experience, but these don't solve "focused onboarding and strongly grounded navigation"

## 2. Claude Code's Existing Memory System

### CLAUDE.md Files: The Core Context System

Claude Code automatically creates CLAUDE.md files to serve as memory for project structure, guidelines, conventions, and common commands

### Hierarchical Memory Architecture:

Starting from your working directory, Claude searches upward toward the root, loading every CLAUDE.md and CLAUDE.local.md file it finds - subdirectory memory files are only loaded when Claude actually accesses files in those directories

This creates:
- **Project Memory** (./CLAUDE.md) - Team's shared brain
- **Component Memory** (subdirectories) - Component-specific patterns
- **Personal Memory** (CLAUDE.local.md) - Private developer notes

### Best Practices from the Community

**Token Efficiency is Critical:**
CLAUDE.md contents are prepended to prompts, consuming part of your token budget with every interaction - keep it concise using "short, declarative bullet points" not "long, narrative paragraphs"

**File Organization:**
Your CLAUDE.md doesn't need to be one massive file - reference other files using @ref/other/files.md syntax, with structure like /claude/testing-guide.md, /claude/deployment.md, /claude/current-sprint.md

**Dynamic Updates:**
At the end of productive sessions, especially after deep debugging or architectural discussions, prompt Claude to update CLAUDE files with relevant knowledge to prevent "knowledge loss"

**Component-Specific Information:**
When specific information belongs to a particular subcomponent, place it in the CLAUDE file for that component (e.g., apps/heatsense-ui/CLAUDE.md for UI-specific info)

## 3. Common Pitfalls to Avoid

### Constraint Formulation:
Avoid negative-only constraints like "Never use the --foo-bar flag" because the agent gets stuck when it thinks it must use that flag - always provide an alternative

### Context Window Management:
During long sessions, Claude's context window can fill with irrelevant conversation, file contents, and commands - use /clear command frequently between tasks to reset the context window

### Documentation vs Implementation:
If your CLI commands are complex and verbose, don't write paragraphs of documentation - instead write a simple bash wrapper with a clear API and document that, as keeping CLAUDE.md short is a "forcing function for simplifying your codebase"

### Over-Engineering Subagents:
Custom subagents are a brittle solution - give your main agent the context in CLAUDE.md and let it use its own Task/Explore feature to manage delegation (the "Master-Clone" architecture)

## 4. The Power of Visual Diagrams

### Mermaid Integration Benefits:

Mermaid diagrams provide "unambiguous context" where "a single sequence diagram was worth hundreds of words of explanation" - visual diagrams eliminated ambiguity in requirements and enabled more precise implementations

### AI-Generated Architecture Understanding:

You can rapidly iterate on architecture by asking AI to adjust Mermaid diagrams: "add a database to that login flow" or "include an error path for invalid credentials" and get updated diagrams immediately

### Integration with Claude Code:
Claude excels with images and diagrams - you can paste screenshots, drag and drop images, or use design mocks as reference points for development

## 5. Proposed Implementation: Code Maps Skill for Claude Code

### Concept: Hybrid Approach

Combine three elements:
1. **Static Documentation** (CLAUDE.md) - High-level architecture and conventions
2. **Dynamic Mapping** (generated on-demand) - Current task-specific code maps
3. **Visual Context** (Mermaid diagrams) - Architecture and data flow visualization

### Structure:

```markdown
# Code Map Skill Architecture

## When to Generate Code Maps
- Before any task involving >3 files
- When encountering unfamiliar code sections
- Before architectural changes
- When debugging complex cross-file issues
- At the start of new feature development

## Map Storage Convention
.codemaps/
  ├── [feature-name].md          # Task-specific maps
  ├── [component-name]-arch.mmd  # Mermaid architecture diagrams
  └── active-context.md          # Current session context

## Map Format Template

### [Feature/Component Name]
**Purpose**: Brief description of what this does
**Last Updated**: [Date] by [Who/What]

#### Key Files and Responsibilities
- `path/to/file.ts` (lines X-Y)
  - Purpose: Handles...
  - Key functions: functionA(), functionB()
  - Dependencies: imports from...
  - Used by: referenced in...

#### Data Flow
[Mermaid diagram or text description]
1. Entry point: ...
2. Processing: ...
3. Exit/Return: ...

#### Critical Dependencies
- Internal: [other components]
- External: [packages/APIs]
- Configuration: [env vars, config files]

#### Known Issues & Gotchas
- [Warning about edge cases]
- [Performance considerations]
- [Technical debt notes]

#### Related Maps
- See also: [link to related map]
```

### Integration Patterns:

**Pattern 1: Pre-Task Mapping**
```
User: "I need to add authentication to the API"
Claude: 
1. Reads existing CLAUDE.md for architecture conventions
2. Generates code map: authentication-flow.md
3. Creates Mermaid diagram: api-auth-sequence.mmd
4. Plans implementation using map as reference
5. Updates maps after completion
```

**Pattern 2: Exploration Mode**
```
User: "How does the payment system work?"
Claude:
1. Searches for existing .codemaps/payment-*.md
2. If not found, generates new map by:
   - Identifying entry points (API routes, UI triggers)
   - Tracing through related files
   - Documenting data flow
   - Creating visual diagram
3. Saves map for future reference
4. Presents findings with map link
```

**Pattern 3: Maintenance Workflow**
```
After significant changes:
1. Check if affected components have maps
2. Update maps with new file locations/patterns
3. Regenerate or update Mermaid diagrams
4. Flag outdated maps for review
```

## 6. Skill Instructions Draft

### Core Principles:

**Understanding Before Action:**
- Never modify code in >2 files without first understanding or creating a code map
- Maps are living documents - update them as code evolves
- Token efficiency: reference maps don't embed them

**Map Generation Protocol:**

```markdown
# WHEN TO CREATE/UPDATE CODE MAPS:

## Triggers for New Maps:
- Task involves files you haven't worked with in this codebase
- User asks "how does X work?" for non-trivial X
- About to refactor or significantly modify existing code
- Debugging issues that span multiple files
- Onboarding to new section of codebase

## Map Update Triggers:
- After completing multi-file changes
- After discovering new patterns or gotchas
- When fixing bugs that reveal misconceptions
- When adding new files to existing feature

## Map Content Rules:
1. **File Purpose**: One-line description of what each file does
2. **Key Functions/Classes**: List main exports/entry points
3. **Data Flow**: How information moves through the system
4. **Dependencies**: What this depends on and what depends on it
5. **Gotchas**: Non-obvious behavior, edge cases, technical debt

## Mermaid Usage:
- Generate sequence diagrams for request/response flows
- Use flowcharts for decision logic
- Create architecture diagrams for component relationships
- Store in .codemaps/ directory with .mmd extension
```

**Reference vs Embed Strategy:**

```markdown
# CONTEXT MANAGEMENT:

## In CLAUDE.md (embedded - always loaded):
- Project conventions and standards
- Critical commands and workflows  
- Top-level architecture overview
- Common gotchas and patterns

## In .codemaps/ (referenced - loaded on demand):
- Detailed feature implementations
- Component-specific flows
- Task-specific mappings
- Historical context and decisions

## How to Reference:
Instead of: [embedding entire map in conversation]
Do: "See .codemaps/authentication-flow.md for details on auth implementation"
Then: Only read the map when actually needed for current task
```

### Custom Commands Integration:

Leverage Claude Code's custom command system:

```markdown
# .claude/commands/map-feature.md
Generate a comprehensive code map for $ARGUMENTS:

1. Identify all files related to this feature
2. Document each file's purpose and key exports
3. Create data flow diagram (Mermaid)
4. List dependencies and dependents
5. Note any gotchas or technical debt
6. Save to .codemaps/$ARGUMENTS.md

# .claude/commands/update-maps.md
Review and update code maps affected by recent changes:

1. Check git diff to see what changed
2. Identify related code maps in .codemaps/
3. Update affected sections
4. Regenerate diagrams if architecture changed
5. Note what was updated in map changelog

# .claude/commands/explain-architecture.md  
Explain the architecture of $ARGUMENTS using existing maps:

1. Check for existing map in .codemaps/
2. If found, summarize with diagram
3. If not found, offer to generate map first
4. Provide high-level overview from CLAUDE.md context
```

## 7. Implementation Roadmap

### Phase 1: Foundation (Start Here)
1. Create `.codemaps/` directory structure in your projects
2. Define map template format
3. Add code map conventions to CLAUDE.md
4. Create 2-3 example maps for key features

### Phase 2: Workflow Integration
1. Create custom `/map-feature` command
2. Establish map update protocol
3. Train yourself to request maps before complex tasks
4. Build habit of updating maps after changes

### Phase 3: Enhancement
1. Develop Mermaid diagram standards
2. Create automated map validation
3. Link maps to ARCHITECTURE.md
4. Establish map review process

### Phase 4: Optimization
1. Implement map staleness detection
2. Create map dependency tracking
3. Add automated diagram generation
4. Integrate with Roo Commander workflow

## 8. Specific Use Cases for Your Context

### For MDTM/Roo Commander Development:
```markdown
# .codemaps/roo-commander-v8.md
Purpose: VS Code extension for MDTM workflow management

Key Components:
- src/extension.ts (lines 1-150): Extension activation and command registration
- src/mdtm-parser.ts (lines 1-200): Parses markdown task format
- src/ai-modes.ts (lines 1-180): Custom agent mode definitions
- src/tree-provider.ts (lines 1-220): VS Code tree view for tasks

Data Flow:
[Mermaid sequence diagram showing: File Save → Parser → Task Tree → UI Update]

Integration Points:
- VS Code Extension API
- Claude Code CLI (via custom agents)
- File system watchers
- MCP protocol (planned)
```

### For Construction Safety Analysis:
```markdown
# .codemaps/swms-analysis.md
Purpose: n8n workflow for analyzing SWMS documents

Key Files:
- workflows/swms-parser.json: Main n8n workflow definition
- agents/checkbox-analyzer.ts: Specialized agent for checkbox interpretation
- agents/hrcw-detector.ts: High Risk Construction Work identification

Critical Dependencies:
- Anthropic API (Claude Sonnet 4.5)
- PDF.js for document parsing
- Custom prompt templates in /prompts/

Gotchas:
- Checkbox interpretation is safety-critical - no assumptions
- Must preserve exact terminology from Australian standards
- False negatives in HRCW detection are unacceptable
```

### For Client Projects (jezweb):
```markdown
# .codemaps/cloudflare-worker-template.md
Purpose: Standard template for small business web apps

Architecture Overview:
[Mermaid diagram: Cloudflare Pages → Worker → Durable Objects → KV]

Key Patterns:
- Route handling in src/routes/
- Durable Objects for state in src/do/
- KV for configuration
- React frontend in src/ui/

Australian SME Specific:
- ABN validation patterns
- AU timezone handling
- GST calculation utilities
```

## 9. Key Differences from Windsurf Approach

### What Windsurf Does:
- Automatic generation from codebase analysis
- Visual interactive interface with click-to-navigate
- Real-time generation with SWE-1.5 or Sonnet 4.5
- Built into IDE as first-class feature

### What Claude Code Can Do (via skill):
- Manual/semi-automated generation via prompts
- Markdown-based maps stored in repo
- Generated on-demand when needed
- Uses existing file system and commands

### Advantages of Claude Code Approach:
- Maps are version-controlled with code
- Team shares same maps (not per-developer)
- Maps can include human annotations
- Integrates with existing CLAUDE.md system
- Works across all editors/terminals

### Limitations:
- Requires discipline to maintain
- Not automatically updated
- No visual interface (but can use Mermaid)
- More manual than Windsurf

## 10. Measuring Success

### Quantitative Metrics:
- Reduction in "read file" operations before code changes
- Fewer context resets needed (/clear commands)
- Decrease in bugs from misunderstanding architecture
- Time to onboard to unfamiliar code sections

### Qualitative Indicators:
- Claude makes correct file choice on first attempt
- Fewer "I need to check X file" loops
- Better preservation of context across sessions
- Improved accuracy in multi-file refactors

## 11. Next Steps

### Immediate Actions:
1. **Create the skill file** for Claude Code to follow
2. **Set up .codemaps/** structure in Roo Commander repo
3. **Generate 1-2 example maps** for key features
4. **Test the workflow** with a small feature addition
5. **Iterate on template** based on what works

### Questions to Explore:
- Should maps be auto-generated via MCP server?
- Integration with existing ARCHITECTURE.md docs?
- Best way to handle map staleness detection?
- Can we leverage git hooks to prompt for map updates?

## 12. References and Resources

### Primary Sources:
- Windsurf Codemaps announcement: https://cognition.ai/blog/codemaps
- Claude Code Best Practices: https://anthropic.com/engineering/claude-code-best-practices
- Claude Code Documentation: https://docs.claude.com/en/docs/claude-code/

### Community Resources:
- CLAUDE.md best practices: https://shipyard.build/blog/your-claude-md-file-developer-guide/
- Memory management guide: https://medium.com/@tl_99311/claude-codes-memory-working-with-ai-in-large-codebases-a948f66c2d7e
- Mermaid + AI workflows: https://www.awesome-testing.com/2025/09/mermaid-diagrams

### Key Takeaways for Implementation:
1. Keep core CLAUDE.md lean - put details in maps
2. Use Mermaid diagrams for complex flows
3. Update maps after significant changes
4. Reference maps, don't embed them
5. Make map creation a habit, not a chore

---

## Appendix: Example Skill File Structure

```markdown
# /mnt/skills/user/codemaps/SKILL.md

# Code Maps Skill for Claude Code CLI

## Purpose
Help Claude maintain structured understanding of codebase architecture
and file relationships to make better decisions about what to modify.

## When to Use
- Multi-file features
- Unfamiliar code
- Complex debugging
- Architecture changes
- Feature additions

## Map Format
[Template structure from Section 5]

## Commands
- /map-feature <name>: Generate new map
- /update-maps: Refresh maps after changes
- /explain-architecture <component>: Use maps to explain

## Best Practices
[Key principles from research]

## Integration with CLAUDE.md
[How maps complement main context file]
```

---

**End of Briefing**

This document synthesizes research on Windsurf Codemaps, Claude Code best practices, and community insights to propose a practical code mapping system for Claude Code CLI that helps maintain context and improve decision-making in complex codebases.
