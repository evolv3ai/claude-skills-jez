#!/usr/bin/env python3
"""Audit CLAUDE.md memory hierarchy in a repository.

Scans for all CLAUDE.md files, reports sizes, identifies bloat,
and suggests directories that could benefit from their own CLAUDE.md.

Usage:
    python3 audit_memory.py [repo-path]
    python3 audit_memory.py              # uses current directory
"""

import os
import sys
from pathlib import Path

# Size targets (lines)
ROOT_TARGET = 150
SUBDIR_TARGET = 50
RULES_TARGET = 80

# Directories to skip
SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".wrangler",
    ".output", ".vercel", ".cache", "__pycache__", ".venv",
    "vendor", ".next", ".nuxt",
}


def count_lines(path: Path) -> int:
    try:
        return len(path.read_text(encoding="utf-8").splitlines())
    except (OSError, UnicodeDecodeError):
        return -1


def find_claude_md(repo: Path) -> list[Path]:
    """Find all CLAUDE.md files, skipping ignored directories."""
    results = []
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f == "CLAUDE.md":
                results.append(Path(root) / f)
    return sorted(results)


def find_rules(repo: Path) -> list[Path]:
    """Find .claude/rules/ files."""
    rules_dir = repo / ".claude" / "rules"
    if not rules_dir.is_dir():
        return []
    return sorted(rules_dir.glob("*.md"))


def find_complex_dirs(repo: Path, existing: set[Path]) -> list[Path]:
    """Find directories that might benefit from a CLAUDE.md.

    Heuristic: directories with config files, external integrations,
    or many source files but no CLAUDE.md.
    """
    indicators = {
        "wrangler.jsonc", "wrangler.toml", ".env.example",
        "docker-compose.yml", "Dockerfile", "firebase.json",
        "vercel.json", "netlify.toml",
    }
    suggestions = []
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        root_path = Path(root)
        if root_path in existing:
            continue
        # Skip if parent already has CLAUDE.md very close
        has_indicator = bool(set(files) & indicators)
        src_count = sum(1 for f in files if f.endswith((".ts", ".tsx", ".py", ".go")))
        if has_indicator or src_count > 10:
            suggestions.append(root_path)
    return sorted(suggestions)


def extract_sections(path: Path) -> list[tuple[str, int]]:
    """Extract H2 sections with line counts."""
    lines = path.read_text(encoding="utf-8").splitlines()
    sections = []
    current_heading = "(preamble)"
    current_start = 0
    for i, line in enumerate(lines):
        if line.startswith("## "):
            if current_heading:
                sections.append((current_heading, i - current_start))
            current_heading = line.strip("# ").strip()
            current_start = i
    if current_heading:
        sections.append((current_heading, len(lines) - current_start))
    return sections


def main():
    repo = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not repo.is_dir():
        print(f"Error: {repo} is not a directory")
        sys.exit(1)

    print(f"Auditing CLAUDE.md hierarchy in: {repo}\n")

    # Find CLAUDE.md files
    claude_files = find_claude_md(repo)
    existing_dirs = {f.parent for f in claude_files}

    if not claude_files:
        print("No CLAUDE.md files found.\n")
    else:
        print(f"Found {len(claude_files)} CLAUDE.md file(s):\n")

        oversized = []
        for f in claude_files:
            lines = count_lines(f)
            rel = f.relative_to(repo)
            is_root = f.parent == repo
            target = ROOT_TARGET if is_root else SUBDIR_TARGET
            status = "OK" if lines <= target else "OVER"

            marker = " <<< OVER TARGET" if status == "OVER" else ""
            print(f"  {rel}: {lines} lines (target: {target}){marker}")

            if status == "OVER":
                oversized.append((f, lines, target))

        if oversized:
            print(f"\n--- Oversized files ({len(oversized)}) ---\n")
            for f, lines, target in oversized:
                rel = f.relative_to(repo)
                print(f"  {rel}: {lines}/{target} lines (+{lines - target} over)")
                sections = extract_sections(f)
                if sections:
                    print("    Sections:")
                    for name, count in sections:
                        big = " <<<" if count > 30 else ""
                        print(f"      {name}: {count} lines{big}")
                print()

    # Find rules
    rules = find_rules(repo)
    if rules:
        print(f"\nFound {len(rules)} rule file(s) in .claude/rules/:\n")
        for r in rules:
            lines = count_lines(r)
            status = " <<< OVER TARGET" if lines > RULES_TARGET else ""
            print(f"  {r.name}: {lines} lines{status}")

    # Suggest new CLAUDE.md locations
    suggestions = find_complex_dirs(repo, existing_dirs)
    if suggestions:
        print(f"\n--- Suggested new CLAUDE.md locations ({len(suggestions)}) ---\n")
        for s in suggestions:
            rel = s.relative_to(repo)
            print(f"  {rel}/CLAUDE.md")

    # Summary
    total_lines = sum(count_lines(f) for f in claude_files)
    print(f"\n--- Summary ---")
    print(f"  CLAUDE.md files: {len(claude_files)}")
    print(f"  Total lines: {total_lines}")
    print(f"  Rules files: {len(rules)}")
    print(f"  Suggested additions: {len(suggestions)}")


if __name__ == "__main__":
    main()
