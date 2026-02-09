# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@younggglcy/create-npm-lib` is a CLI tool (`cnl`) that scaffolds npm library projects. It supports two project types: **single-package** and **monorepo**. The CLI collects user input via interactive prompts, copies layered templates (base + variant), processes placeholders, and initializes a ready-to-develop project.

## Commands

```bash
bun install          # Install dependencies
bun run build        # Bundle src/cli.ts → dist/cli.js (rolldown + template copy)
bun run dev          # Watch mode build
bun run lint         # ESLint check
bun run lint:fix     # ESLint auto-fix
bun run typecheck    # tsc --noEmit
bun run release      # Changeset-based release (version → commit → tag → push)
```

Test the CLI locally after build:

```bash
node dist/cli.js
```

## Architecture

**Build pipeline:** `src/cli.ts` is bundled by rolldown into `dist/cli.js`. The `template/` directory is copied verbatim (symlinks dereferenced) into `dist/template/` via `rollup-plugin-copy`.

**CLI flow** (`src/cli.ts`):
1. Prompt user → project type (single/monorepo), scope, name, private, description
2. Copy `template/base/` → target dir (shared files)
3. Overlay `template/single/` or `template/monorepo/` → target dir
4. For monorepo: rename `packages/__PKG__NAME__/` to actual name
5. Process template placeholders (`__PKG__NAME__`, `__PKG__DESC__`, `__YEAR__`, `__PKG__SCOPED_NAME__`)
6. `bun install` → `bun update` → `bunx husky init` → `bun run lint:fix` → git commit + tag v0.0.0

**Template layers:**
- `template/base/` — shared config: `.changeset/`, workflows (test, semantic-pr, pkg-size-report, changeset-check), LICENSE, README, release script, symlinks to root eslint/tsconfig/.gitignore/.editorconfig
- `template/single/` — package.json (publishable), src/index.ts, rolldown.config.ts, release.yml (npm publish --provenance)
- `template/monorepo/` — root package.json (private, workspaces), `packages/__PKG__NAME__/` sub-package, release.yml (changeset publish)

**Key source modules:**
- `src/io/prompts.ts` — interactive prompts, returns `PromptResult` with `projectType`, `packageName`, `scope`, etc.
- `src/io/template.ts` — placeholder replacement in LICENSE, README, package.json; handles both single and monorepo pkg.json
- `src/lib/exec.ts` — `createX(cwd)` returns a tagged-template executor using `tinyexec`
- `src/utils/node_lts.ts` — fetches latest active Node.js LTS version for `.node-version`

## Workflow

- **PRs must include a changeset file.** Run `bunx changeset` to create one before opening a PR. The `changeset-check` CI workflow will fail otherwise.
- Release is changeset-based: `bun run release` runs `changeset version` → commit → tag → push. GitHub Actions then publishes to npm on tag push.
- PR titles must follow conventional commit format (enforced by semantic-pr workflow).

## Conventions

- Package manager: **bun** (not pnpm/npm)
- ESLint config: `@antfu/eslint-config`
- All commit messages, code comments, and documentation in **English**
