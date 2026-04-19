# Contributing

Thanks for your interest in contributing to a TeqBench project. This document applies to every public repository in the [TeqBench organization ↗](https://github.com/teqbench).

## Ways to Contribute

- Report a bug — open an issue using the **Bug Report** template
- Propose a feature — open an issue using the **Feature Request** template
- Submit a fix or improvement — open a pull request following the process below
- Report a security vulnerability — **do not** open a public issue; see [SECURITY.md ↗](SECURITY.md)

## Commit Convention

All repositories follow **[Conventional Commits ↗](https://www.conventionalcommits.org)** strictly. For `@teqbench` [npm ↗](https://www.npmjs.com) packages, [Release Please ↗](https://github.com/googleapis/release-please) uses these to determine version bumps, so accuracy matters.

- `feat(scope): ...` — New feature (minor version bump)
- `fix(scope): ...` — Bug fix (patch version bump)
- `feat(scope)!: ...` or `BREAKING CHANGE:` — Breaking change (major version bump)
- `docs(scope): ...` — Documentation changes
- `refactor(scope): ...` — Code changes that neither fix a bug nor add a feature
- `chore(scope): ...` — Maintenance (no version bump)

Use a meaningful `scope` — typically the affected module, package area, or workflow name.

## Branching & Workflow

### Branch Structure

- `main` — Production. Protected. Only receives merges from `release/*`, `hotfix/*`, or `release-please--*` branches.
- `dev` — Integration branch. Protected. Receives merges from feature and bugfix branches.
- `feature/*` — New features. Branch from `dev`, merge back to `dev` via PR.
- `bugfix/*` — Bug fixes. Branch from `dev`, merge back to `dev` via PR.
- `release/*` — Release preparation. Branch from `dev`, merge `main` into it to resolve conflicts, then PR to `main`.
- `hotfix/*` — Urgent production fixes. Branch from `main`, merge `main` into it before PR to `main`.

### Rules

- All merges to `main` and `dev` require a pull request.
- Direct pushes to `main` and `dev` are blocked (except for the automation bot).
- CI must pass before a PR can be merged.
- Release and hotfix branches must merge `main` into themselves before opening a PR to `main`.
- After a release merges to `main`, the sync workflow automatically merges `main` back into `dev`.

## Pull Request Process

1. Branch from `dev` (or `main` for hotfixes).
2. Make changes following the conventions above.
3. Ensure all repository-specific checks pass locally (see the target repository's README for the exact commands).
4. Open a PR targeting `dev`. PRs targeting `main` must come from `release/*`, `hotfix/*`, or `release-please--*` branches.
5. Address review feedback.
6. Merge after CI passes and approval is granted.

## Repository Types

TeqBench repositories fall into a few categories. Per-repository prerequisites vary — consult each repo's README for specifics.

### `@teqbench` [npm ↗](https://www.npmjs.com) Packages (`tbx-*`)

TypeScript libraries published to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).

**Prerequisites:**

1. Install the [Node.js ↗](https://nodejs.org) version specified in `.nvmrc`. With [nvm ↗](https://github.com/nvm-sh/nvm):
   ```bash
   nvm install
   nvm use
   ```
2. Configure [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) authentication. These packages depend on other `@teqbench`-scoped packages, which require a [GitHub ↗](https://github.com) personal access token (PAT) with `read:packages` scope:
   - Create a PAT at **GitHub > Settings > Developer settings > Personal access tokens**.
   - Export it: `export GITHUB_TOKEN=ghp_yourTokenHere` in your shell profile.
   - Add to your **user-level** `~/.npmrc`: `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}`.
   - Run `npm ci` to verify.

**Cross-repo package access (CI):** every `@teqbench` package in the dependency tree (direct and transitive) must grant this repository read access under [github.com/orgs/teqbench/packages ↗](https://github.com/orgs/teqbench/packages) → Manage access. Without this, CI fails with `403 Forbidden` during `npm ci`.

**Tech stack:** [TypeScript ↗](https://www.typescriptlang.org), [Vitest ↗](https://vitest.dev), [ESLint ↗](https://eslint.org), [Prettier ↗](https://prettier.io), [Husky ↗](https://typicode.github.io/husky/), [Release Please ↗](https://github.com/googleapis/release-please).

**Key commands:** `npm ci`, `npm run build`, `npm test`, `npm run test:coverage`, `npm run typecheck`, `npm run lint`, `npm run format`, `npm run format:check`.

### Skill Libraries (`teqbench.dev.*-skills`)

Collections of [Claude Code ↗](https://claude.com/claude-code) Agent Skills. No compiled code.

**Prerequisites:** [Git ↗](https://git-scm.com) (submodules are used in some skill bundles). See the repository README for install-script usage.

### Angular Applications (`teqbench.website`)

Public [Angular ↗](https://angular.dev) app with [Storybook ↗](https://storybook.js.org) documentation and [API Extractor ↗](https://api-extractor.com) reports. Consumes `@teqbench` packages.

**Prerequisites:** same [Node.js ↗](https://nodejs.org) + [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) auth setup as packages above. Submodules are used to pull in library source for docs generation — initialize with `git submodule update --init --recursive`.

### Template Repositories (`teqbench.dev.templates.*`)

Source for new-repository scaffolding. Changes here propagate to every repo created from the template.

### Organization `.github` Repository

Central CI/CD workflows, Renovate configuration, and these community health files. Changes to reusable workflows affect every consuming repo — test carefully.

## Release Process

Applies to `@teqbench` [npm ↗](https://www.npmjs.com) packages. Skill libraries, websites, and `.github` do not cut versioned releases in the same way — see the specific repo for its release conventions.

1. Create a `release/*` branch from `dev`.
2. Merge `main` into the release branch to resolve any conflicts (especially badge files).
3. Open a PR from the release branch to `main`.
4. After merge, [Release Please ↗](https://github.com/googleapis/release-please) opens a version-bump PR on `main`.
5. Merge the [Release Please ↗](https://github.com/googleapis/release-please) PR to trigger a [GitHub ↗](https://github.com) Release and publish to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages).
6. The sync workflow automatically merges `main` back into `dev`.

## Code of Conduct

This project and everyone participating in it is governed by the [TeqBench Code of Conduct ↗](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Questions

For help or questions, see [SUPPORT.md ↗](SUPPORT.md).
