# CLAUDE.md

This file provides guidance for Claude Code when working in this repository.

## Repository Overview

This is the organization-wide `.github` repo for TeqBench. It contains reusable GitHub Actions workflows, Renovate configuration, caller templates, and the community health files that default across every public TeqBench repo. Changes here affect every repo in the org.

**This repository is public.** Do not commit anything intended to be private. All secrets are defined at the organization level and referenced by name only.

## Contents

- `.github/workflows/` -- Reusable workflows called by thin callers in consuming repos (plus `validate.yml`, the self-CI workflow for this repo)
- `.github/ISSUE_TEMPLATE/` -- Org-default issue templates (bug report, feature request, config)
- `.github/PULL_REQUEST_TEMPLATE.md` -- Org-default pull request template
- `.github/CODEOWNERS` -- Auto-review assignment for this repo (`* @teqbench/engineering-team`)
- `.github/audit-allow-list.json` -- Centralized list of known upstream GHSA advisories suppressed by `ci.yml`
- `caller-templates/` -- Template thin caller workflow files for new repos
- `profile/README.md` -- Rendered on the **TeqBench organization profile page** (`github.com/teqbench`). Distinct from the repo `README.md`.
- `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md` -- Org-default community health files (see Community Health Files section below)
- `renovate-config.js` -- Central Renovate configuration for dependency updates across all repos
- `README.md` -- This repo's own documentation (rendered on `github.com/teqbench/.github`)

## Reusable Workflows

| Workflow | Purpose | Consuming repos |
|---|---|---|
| `ci.yml` | Lint, typecheck, format check, audit, test, build, badges (most steps individually toggleable via inputs) | Node.js packages and webapps |
| `noop-ci.yml` | No-op CI with version badge | Non-compilable repos (skill libraries, docs) |
| `release.yml` | Release Please versioning + (optional) publish to GitHub Packages | All repos (callers pass `publish: false` to opt out of publish) |
| `claude.yml` | Claude Code integration (@claude triggers) | All repos |
| `dep-compat-check.yml` | Dependency compatibility tracking | Node.js package repos |
| `docs-deploy.yml` | Build consumer-facing Storybook and deploy to GitHub Pages | Repos that publish docs |
| `renovate.yml` | Scheduled Renovate runs | Central (runs from this repo) |

## Impact of Changes

Every TeqBench repo references these workflows via `teqbench/.github/.github/workflows/<name>.yml@main`. Changes to a workflow file here take effect on the next workflow run in every consuming repo. Test changes carefully.

## Testing Reusable Workflow Changes

Because consuming repos pin to `@main`, any merge here is an immediate org-wide rollout. To validate a change safely:

1. Push the change to a feature branch on this repo (do **not** merge yet).
2. In one consuming repo, temporarily change the caller's `uses:` line from `@main` to `@feature/your-branch-name`.
3. Trigger the workflow (push, PR, or manual dispatch) and verify it succeeds end-to-end.
4. Revert the caller back to `@main` in the consuming repo.
5. Open the PR here targeting `main`, follow the normal merge flow.

## Community Health Files

Files at this repo's root (`CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`) and under `.github/` (`ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md`) act as **default community health files for every public repo in the `teqbench` organization** that does not have its own version. GitHub's inheritance rules:

- Inheritance only applies to **public** consuming repos. Private repos do not inherit.
- Per-repo copies always win. If a consuming repo has its own `CONTRIBUTING.md`, that one is used.
- `LICENSE` is **not** inherited — every repo needs its own.
- `profile/README.md` is rendered on the organization profile page (`github.com/teqbench`). It is separate from this repo's `README.md`.

Edits to these files propagate silently to every consuming repo without a CI run, so treat them with the same care as workflow changes.

## Audit Allow-List

`.github/audit-allow-list.json` is a centralized list of known high/critical GHSA IDs that `ci.yml` suppresses during `npm audit`. Each entry is an upstream advisory that cannot be patched locally (e.g. transitive dependency behind a framework).

- `ci.yml` fetches this file from `main` on every run and fails the build only on **unreviewed** advisories not in the list.
- Add entries only when the advisory is confirmed upstream-blocked. Include `id`, `package`, and `reason`.
- Remove entries when the upstream dependency publishes a fix and the framework adopts it — leaving stale entries hides real regressions.

## Dependency Updates

Renovate is the **single source of dependency updates** across all enrolled repos (including security advisories via `osvVulnerabilityAlerts`). Dependabot security updates are turned off org-wide to avoid two bots opening parallel PRs for the same advisory.

`renovate-config.js` defines a two-tier trust model:

- **Auto-merge tier** (no human review, CI is the gate): `lockFileMaintenance`, `devDependencies` patch + minor, `@teqbench/*` (all), `tooling` group patch + minor, `github-actions` group patch + minor + digest.
- **Manual review tier**: runtime `dependencies`, all majors (enforced by a defensive `matchUpdateTypes: ["major"]` rule), `typescript`, `eslint`.

`recreateWhen: "always"` means closing a Renovate PR without merging doesn't retire that update — the next Renovate run respawns it. Persistent rejections belong in a `packageRules` entry with `enabled: false`. Full details in `renovate.md`.

### Repo prerequisite: `allow_auto_merge`

Renovate's auto-merge tier uses `automergeType: "pr"` + the default `platformAutomerge: true`, which calls GitHub's `enablePullRequestAutoMerge` GraphQL mutation. That mutation requires the repo to have **Settings → General → Allow auto-merge** turned on. Without it, Renovate's call is silently rejected: PRs reach `mergeStateStatus: CLEAN` with `autoMergeRequest: null` and sit indefinitely.

Audit and enable:

```bash
gh api repos/<owner>/<repo> --jq '.allow_auto_merge'
gh api -X PATCH repos/<owner>/<repo> -F allow_auto_merge=true
```

Every enrolled repo in `renovate-config.js` needs this flag set.

## Automation GitHub App

Most automated workflows run under the **`teqbench-devops-gh-app`** GitHub App (formerly `teqbench-automation`; renamed on the App, same underlying account).

| Property | Value |
|---|---|
| App ID | `2935880` |
| Bot login | `teqbench-devops-gh-app[bot]` |
| Bot user ID | `263536528` |
| Bot noreply email | `263536528+teqbench-devops-gh-app[bot]@users.noreply.github.com` |

The App is a bypass actor on the org-level repository ruleset for `main` (mode: "for pull requests only"). This lets Renovate auto-merge trusted-tier dependency PRs and lets `release-please` self-merge release PRs once CI is green. Required status checks still apply — bypass does not skip CI.

## Required Secrets (Org-Level)

| Secret | Purpose |
|---|---|
| `APP_CLIENT_ID` | teqbench-devops-gh-app GitHub App Client ID (replaces deprecated `APP_ID`) |
| `APP_PRIVATE_KEY` | teqbench-devops-gh-app GitHub App private key |
| `GIST_TOKEN` | Token for pushing badge data to gist |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Code |

## Adding a New Repo

1. Create the repo from the appropriate template
2. Add thin caller workflows referencing the org reusable workflows
3. Add the repo name to the `repositories` array in `renovate-config.js` (if it has npm dependencies)
4. Set the `GIST_ID` repo variable to the shared gist ID
5. Enable `allow_auto_merge` on the repo so Renovate's trusted-tier auto-merge works (see Dependency Updates → Repo prerequisite): `gh api -X PATCH repos/teqbench/<repo> -F allow_auto_merge=true`

## Commit Convention

Follow Conventional Commits strictly:

- `feat(scope): ...` -- New feature (minor bump)
- `fix(scope): ...` -- Bug fix (patch bump)
- `feat(scope)!: ...` -- Breaking change (major bump)
- `docs(scope): ...` -- Documentation
- `refactor(scope): ...` -- Refactor
- `chore(scope): ...` -- Maintenance

Use the workflow name as scope (e.g., `feat(ci): add coverage threshold check`, `fix(release): correct tag format`). Use `renovate` for Renovate config changes.

## Branching & Workflow

Follows GitHub Flow:

- `main` is the only long-lived branch.
- Create short-lived branches off `main` for any work — `feature/*`, `bugfix/*`, `chore/*`. Branches live hours to days, not weeks.
- Open a PR to `main`. CI is the merge gate.
- Renovate PRs target `main`; trusted-tier dependency updates auto-merge once CI is green.
- release-please runs on `main` and opens release PRs for `feat:` / `fix:` commits. Merging a release PR tags the release and publishes.
- Hotfixes are normal PRs to `main` — no separate `hotfix/*` ceremony.

### What Claude Should Do

- Create branches off `main`, PR back to `main`.
- Use Conventional Commits messages.
- Keep PRs focused and atomic.
- When modifying reusable workflows, consider impact on all consuming repos.
- When a workflow's inputs change (add / remove / rename), update the matching file in `caller-templates/` in the same PR. No automated check catches drift between the two.
- When adding a new community health file (or modifying an existing one), remember it becomes the default for every public consuming repo — see the Community Health Files section.

### What Claude Should NOT Do

- Never push directly to `main`.
- Never force-push to any branch.
- Never delete branches.
- Never modify secrets or tokens.
- Never remove repos from the Renovate `repositories` array without explicit instruction.
- Never commit anything private. This repository is public.
