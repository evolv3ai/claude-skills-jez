# Implementation Phases: Hugo Static Site Generator Skill

**Project Type**: Claude Code Skill
**Stack**: Hugo SSG + Cloudflare Workers Static Assets + Sveltia CMS
**Estimated Total**: 18-22 hours (~18-22 minutes human time with Claude Code)

---

## Phase 1: Research & Validation
**Type**: Research
**Estimated**: 3-4 hours
**Files**: planning/research-logs/hugo.md, test-hugo-project/ (temporary)

**Tasks**:
- [ ] Install Hugo Extended (latest version v0.152.2)
- [ ] Create test Hugo blog project with PaperMod theme
- [ ] Integrate Sveltia CMS with Hugo test project
- [ ] Configure wrangler.jsonc for Workers Static Assets
- [ ] Deploy test project to Cloudflare Workers
- [ ] Test TinaCMS integration (document limitations)
- [ ] Reproduce all 7-9 documented errors from research
- [ ] Document error reproduction steps and solutions
- [ ] Capture screenshots of working setup
- [ ] Record package versions and dependencies

**Verification Criteria**:
- [ ] Hugo Extended installed and `hugo version` shows v0.152.2+
- [ ] Test blog builds successfully with `hugo` command
- [ ] PaperMod theme renders correctly
- [ ] Sveltia CMS admin interface accessible at `/admin`
- [ ] Can create/edit/delete posts via Sveltia CMS
- [ ] Workers deployment successful (`wrangler deploy` works)
- [ ] Static assets served correctly from Workers
- [ ] All 7-9 errors reproduced and documented with solutions
- [ ] Research log complete with findings and evidence

**Exit Criteria**: Complete understanding of Hugo setup, Sveltia integration, Workers deployment, and all common errors documented with solutions.

---

## Phase 2: Skill Structure Setup
**Type**: Infrastructure
**Estimated**: 1-2 hours
**Files**: skills/hugo/SKILL.md, skills/hugo/README.md, skills/hugo/.gitignore

**Tasks**:
- [ ] Create `skills/hugo/` directory from template
- [ ] Copy SKILL-TEMPLATE.md to skills/hugo/SKILL.md
- [ ] Copy README-TEMPLATE.md to skills/hugo/README.md
- [ ] Fill YAML frontmatter (name, description, license, metadata)
- [ ] Write description with "Use when" scenarios
- [ ] Add comprehensive keywords (technologies, use cases, errors)
- [ ] Create directory structure (scripts/, templates/, references/, assets/)
- [ ] Create .gitignore for skill directory
- [ ] Add auto-trigger keywords to README.md
- [ ] Write initial "What This Skill Does" section

**Verification Criteria**:
- [ ] YAML frontmatter valid (name: "hugo", description present)
- [ ] Description includes 3+ "Use when" scenarios
- [ ] Keywords include: hugo, static-site, blog, documentation, sveltia-cms, cloudflare-workers
- [ ] Directory structure matches official standards
- [ ] README.md has clear auto-trigger keywords section
- [ ] .gitignore includes node_modules, .hugo_build.lock, public/, resources/

**Exit Criteria**: Skill directory structure complete and compliant with official Anthropic standards.

---

## Phase 3: Core Hugo Documentation (SKILL.md)
**Type**: Documentation
**Estimated**: 3-4 hours
**Files**: skills/hugo/SKILL.md (main content)

**Tasks**:
- [ ] Write "Installation" section (Hugo Extended vs Standard, methods)
- [ ] Document version requirements and compatibility
- [ ] Write "Project Structure" section (content/, layouts/, static/, themes/, config/)
- [ ] Document configuration files (hugo.yaml vs hugo.toml, recommended format)
- [ ] Write "Configuration" section (baseURL, theme, taxonomies, params)
- [ ] Document content organization (sections, taxonomies, frontmatter)
- [ ] Write "Themes" section (installation methods, customization, popular themes)
- [ ] Document Hugo Modules vs Git submodules
- [ ] Write "Content Management" section (content types, archetypes, frontmatter formats)
- [ ] Document templating basics (Go templates, partials, shortcodes)
- [ ] Write "Build & Development" section (hugo server, hugo, flags)
- [ ] Document advanced features (multilingual, image processing, Sass/SCSS)

**Verification Criteria**:
- [ ] Installation section covers all methods (binary, Homebrew, Docker, NPM)
- [ ] Extended vs Standard differences clearly explained
- [ ] Directory structure diagram included
- [ ] Configuration examples provided for both YAML and TOML
- [ ] Theme installation patterns documented (Git submodules recommended)
- [ ] Frontmatter format comparison table (YAML vs TOML)
- [ ] Build commands documented with common flags
- [ ] Advanced features documented with links to official docs

**Exit Criteria**: SKILL.md contains comprehensive Hugo documentation covering installation through advanced features, all in imperative form.

---

## Phase 4: Template Creation
**Type**: Implementation
**Estimated**: 5-6 hours
**Files**:
- skills/hugo/templates/hugo-blog/
- skills/hugo/templates/hugo-docs/
- skills/hugo/templates/hugo-landing/
- skills/hugo/templates/minimal-starter/

**Tasks**:
- [ ] Create hugo-blog template (PaperMod theme)
  - [ ] hugo.yaml configuration
  - [ ] content/ structure with sample posts
  - [ ] PaperMod theme as Git submodule reference
  - [ ] static/ directory with favicon
  - [ ] .gitignore
  - [ ] README.md with setup instructions
- [ ] Create hugo-docs template
  - [ ] hugo.yaml for documentation site
  - [ ] content/ structure with nested sections
  - [ ] Docs theme configuration
  - [ ] Sidebar navigation setup
  - [ ] Search configuration
  - [ ] README.md
- [ ] Create hugo-landing template
  - [ ] hugo.yaml for landing page
  - [ ] Single-page structure
  - [ ] Sections layout (hero, features, CTA)
  - [ ] Minimal theme or custom layouts
  - [ ] README.md
- [ ] Create minimal-starter template
  - [ ] Bare hugo.yaml
  - [ ] Empty directories (content/, layouts/, static/)
  - [ ] No theme
  - [ ] README.md with customization guide

**Verification Criteria**:
- [ ] All 4 templates build successfully with `hugo` command
- [ ] Each template has complete hugo.yaml configuration
- [ ] Sample content renders correctly
- [ ] Themes properly configured (where applicable)
- [ ] READMEs explain setup and customization
- [ ] .gitignore files present and correct
- [ ] Templates use YAML format (not TOML) for Sveltia compatibility
- [ ] Frontmatter in all templates follows consistent YAML format

**Exit Criteria**: All 4 Hugo templates functional, documented, and ready to copy into user projects.

---

## Phase 5: Sveltia CMS Integration
**Type**: Integration
**Estimated**: 2-3 hours
**Files**:
- skills/hugo/templates/sveltia-cms/
- skills/hugo/references/sveltia-integration-guide.md

**Tasks**:
- [ ] Create Sveltia CMS config template (static/admin/config.yml)
- [ ] Configure collections for Hugo content types (posts, pages, docs)
- [ ] Set up frontmatter templates for each content type
- [ ] Configure media folder (static/images)
- [ ] Set up GitHub/GitLab backend configuration
- [ ] Document Sveltia + Hugo workflow in SKILL.md
- [ ] Create integration guide in references/
- [ ] Document YAML vs TOML frontmatter for Sveltia (YAML required)
- [ ] Add Sveltia admin files to hugo-blog template
- [ ] Add Sveltia admin files to hugo-docs template
- [ ] Document OAuth setup for Sveltia (Cloudflare Workers proxy)
- [ ] Write troubleshooting guide for common Sveltia + Hugo issues

**Verification Criteria**:
- [ ] config.yml template valid (Sveltia CMS loads without errors)
- [ ] Collections configured for posts, pages, docs
- [ ] Frontmatter widgets match Hugo's expected fields
- [ ] Media uploads work (images saved to static/images/)
- [ ] GitHub backend configuration documented
- [ ] OAuth setup documented (Cloudflare Workers proxy pattern)
- [ ] Integration guide covers setup from scratch
- [ ] YAML frontmatter enforced (TOML issues documented)
- [ ] Sveltia + Hugo workflow tested end-to-end

**Exit Criteria**: Sveltia CMS fully integrated with Hugo templates, configuration templates ready, comprehensive integration guide written.

---

## Phase 6: Workers Deployment & CI/CD
**Type**: Integration
**Estimated**: 2-3 hours
**Files**:
- skills/hugo/templates/wrangler/wrangler.jsonc
- skills/hugo/templates/github-actions/deploy.yml
- skills/hugo/scripts/deploy-workers.sh
- skills/hugo/references/workers-deployment-guide.md

**Tasks**:
- [ ] Create wrangler.jsonc template for Hugo static assets
- [ ] Configure assets directory (./public)
- [ ] Set html_handling and not_found_handling options
- [ ] Create GitHub Actions workflow for auto-deployment
- [ ] Configure Hugo version in workflow
- [ ] Add build and deploy steps
- [ ] Create manual deployment script (deploy-workers.sh)
- [ ] Document Workers vs Pages deployment in SKILL.md
- [ ] Write deployment guide in references/
- [ ] Document environment variables (CLOUDFLARE_API_TOKEN)
- [ ] Add optional Worker script examples (redirects, headers)
- [ ] Document custom domain setup
- [ ] Create troubleshooting guide for deployment issues

**Verification Criteria**:
- [ ] wrangler.jsonc template valid (wrangler deploy works)
- [ ] assets.directory set to "./public"
- [ ] html_handling set to "auto-trailing-slash"
- [ ] GitHub Actions workflow runs successfully
- [ ] Hugo version pinned in workflow
- [ ] Manual script deploys successfully
- [ ] Deployment guide covers both manual and CI/CD
- [ ] Optional Worker script examples work (redirects tested)
- [ ] Custom domain setup documented

**Exit Criteria**: Complete deployment workflow documented and tested, templates ready for both manual and automated deployment.

---

## Phase 7: Error Prevention Documentation
**Type**: Documentation
**Estimated**: 2-3 hours
**Files**: skills/hugo/references/common-errors.md, SKILL.md (errors section)

**Tasks**:
- [ ] Document Error 1: Version Mismatch (Hugo vs Hugo Extended)
  - [ ] Cause, symptoms, solution, prevention
  - [ ] Link to GitHub issue or source
- [ ] Document Error 2: baseURL Configuration Errors
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 3: TOML vs YAML Configuration Confusion
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 4: Hugo Version Mismatch (Local vs Deployment)
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 5: Content Frontmatter Format Errors
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 6: Theme Not Found Errors
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 7: Date Time Warp Issues
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 8: Public Folder Conflicts
  - [ ] Cause, symptoms, solution, prevention
- [ ] Document Error 9: Module Cache Issues
  - [ ] Cause, symptoms, solution, prevention
- [ ] Add error prevention section to SKILL.md
- [ ] Create quick reference table of errors

**Verification Criteria**:
- [ ] All 9 errors documented with cause, symptoms, solution, prevention
- [ ] Each error has link to source (GitHub issue, docs, Stack Overflow)
- [ ] Solutions tested and verified working
- [ ] Prevention tips included for each error
- [ ] SKILL.md has prominent "Common Errors" section
- [ ] Quick reference table created (error, symptom, fix)
- [ ] Error documentation is actionable (clear steps)

**Exit Criteria**: All 9 common Hugo errors comprehensively documented with verified solutions and prevention strategies.

---

## Phase 8: Example Project & Verification
**Type**: Testing
**Estimated**: 3-4 hours
**Files**: examples/hugo-sveltia-workers/, skills/hugo/ (final touches)

**Tasks**:
- [ ] Create example project using hugo-blog template
- [ ] Configure Sveltia CMS for example project
- [ ] Set up wrangler.jsonc for Workers deployment
- [ ] Add sample blog posts (3-5 posts)
- [ ] Configure PaperMod theme
- [ ] Add GitHub Actions workflow
- [ ] Deploy example to Cloudflare Workers
- [ ] Test Sveltia CMS admin interface on deployed site
- [ ] Verify all templates work (copy each, test build)
- [ ] Install skill to ~/.claude/skills/hugo
- [ ] Test skill discovery (ask Claude Code to use skill)
- [ ] Verify auto-trigger keywords work
- [ ] Run ONE_PAGE_CHECKLIST.md verification
- [ ] Update CHANGELOG.md
- [ ] Create production evidence document
- [ ] Take screenshots of working example

**Verification Criteria**:
- [ ] Example project builds successfully
- [ ] Example deploys to Workers without errors
- [ ] Sveltia CMS admin accessible and functional
- [ ] All 4 templates tested and working
- [ ] Skill installed in ~/.claude/skills/
- [ ] Claude Code discovers skill automatically when "Hugo" mentioned
- [ ] Auto-trigger keywords working
- [ ] ONE_PAGE_CHECKLIST.md passes 100%
- [ ] CHANGELOG.md updated with version and changes
- [ ] Production evidence documented

**Exit Criteria**: Working example project deployed, all templates verified, skill discoverable and compliant with standards, ready for production use.

---

## Notes

**Testing Strategy**: Build real example project (hugo-sveltia-workers) to validate all templates and documentation.

**Deployment Strategy**: Deploy example project to Cloudflare Workers to prove deployment workflow works.

**Context Management**: Phases sized to fit in single sessions with clear verification criteria. Can clear context after each phase if needed.

**Token Efficiency Target**: 60-65% savings (8,000-10,000 tokens) vs manual Hugo setup.

**Standards Compliance**: Follow official Anthropic standards per planning/claude-code-skill-standards.md and planning/STANDARDS_COMPARISON.md.

---

## Phase Dependencies

```
Phase 1 (Research)
    ↓
Phase 2 (Structure)
    ↓
Phase 3 (Documentation) ← Can run parallel with Phase 4
Phase 4 (Templates)      ← Can run parallel with Phase 3
    ↓
Phase 5 (Sveltia CMS) ← Depends on Phase 4 templates
    ↓
Phase 6 (Workers Deployment) ← Can run parallel with Phase 7
Phase 7 (Error Docs)          ← Can run parallel with Phase 6
    ↓
Phase 8 (Example & Verification)
```

**Parallelization Opportunities**: Phases 3 & 4 can overlap, Phases 6 & 7 can overlap.

---

**Total Estimated Time**: 18-22 hours (~18-22 minutes human time)
**Total Files Created**: ~50+ files (skill, templates, references, example)
**Production Ready**: After Phase 8 verification
