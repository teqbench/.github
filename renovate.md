# Renovate

**Files:** `teqbench/.github/.github/workflows/renovate.yml` and `teqbench/.github/renovate-config.js`. Per-repo Renovate configuration is not used — every enrolled repo is managed centrally from this repository.

---

## Purpose

Automatically opens pull requests to update dependencies in every enrolled `@teqbench` repository. PRs target the `dev` branch (not `main`) and use [Conventional Commits ↗](https://www.conventionalcommits.org/) message prefixes so they integrate cleanly with the [release-please ↗](https://github.com/googleapis/release-please) workflow.

---

## How It's Wired

The workflow lives in `.github/workflows/renovate.yml` and runs every three hours under the `teqbench-devops-gh-app` GitHub App. It reads `renovate-config.js`, which lists the repositories Renovate should manage in the `repositories[]` array.

To enroll a new repository, add `teqbench/<repo-name>` to that array. No file needs to live inside the consuming repo.

---

## Schedule

- **Workflow cron:** every 3 hours (`17 */3 * * *`).
- **PR opening window (default):** `before 9am on Monday`.
- **Internal `@teqbench/*` packages:** `at any time` — the schedule is overridden so internal updates flow as soon as a new version is published.

The workflow can also be triggered manually via `workflow_dispatch` from this repo.

---

## Target Branch

All Renovate PRs target **`dev`** (`baseBranchPatterns: ["dev"]`). Updates flow through the standard PR review and CI pipeline before reaching production.

---

## Commit Message Conventions

<dl>
    <dt><code>npm</code> packages</dt>
    <dd>Commit prefix: <code>chore(deps):</code>. Labels: <code>dependencies</code>.</dd>
    <dt><code>github-actions</code> updates</dt>
    <dd>Commit prefix: <code>chore(ci):</code>. Labels: <code>dependencies</code>, <code>ci</code>.</dd>
</dl>

`gitAuthor` is set to the `teqbench-devops-gh-app[bot]` account so commits are correctly attributed.

---

## Grouping

Related packages are grouped into a single PR to reduce noise:

<dl>
    <dt><code>teqbench packages</code></dt>
    <dd>All <code>@teqbench/*</code> packages — auto-merged.</dd>
    <dt><code>tooling</code></dt>
    <dd><code>prettier</code>, <code>husky</code>, <code>lint-staged</code>, <code>vitest</code>, <code>prettier-*</code>, <code>@prettier/*</code>, <code>@vitest/*</code>, <code>eslint-*</code>, <code>@eslint/*</code>, <code>typescript-eslint</code>.</dd>
    <dt><code>typescript</code></dt>
    <dd><code>typescript</code>.</dd>
    <dt><code>github-actions</code></dt>
    <dd>All <a href="https://docs.github.com/en/actions">GitHub Actions ↗</a> action updates (uses the <code>chore(ci):</code> prefix and <code>dependencies, ci</code> labels).</dd>
</dl>

Ungrouped packages (e.g., `@types/node`) get individual PRs.

---

## SHA Digest Pinning

[GitHub Actions ↗](https://docs.github.com/en/actions) references — including reusable workflow calls like `uses: teqbench/.github/.github/workflows/ci.yml@<sha>` — are pinned to full commit SHAs. `renovate-config.js` sets `pinDigests: true` on the `github-actions` rule, so [Renovate ↗](https://docs.renovatebot.com/) adds the SHA on first scan and keeps it current as the referenced tag moves.

Pinning to a full SHA is a supply-chain hardening: a compromised tag cannot silently redirect the workflow to malicious code between scheduled Renovate runs. The `# <tag>` comment after the SHA is preserved by [Renovate ↗](https://docs.renovatebot.com/) for human readability. The format in every workflow file is:

```yaml
uses: teqbench/.github/.github/workflows/ci.yml@7de482dbdfad13f3ca7ba3f9be3111d69881c56a # main
```

---

## Auto-Merge

Dependency PRs are split into two tiers by `packageRules` in `renovate-config.js`. CI (lint, typecheck, audit, test, build, plus `dep-compat-check` on library repos) is the merge gate for the auto-merge tier — once checks are green, Renovate merges the PR via the GitHub API.

**Auto-merge tier (no human review):**

<dl>
    <dt><code>lockFileMaintenance</code></dt>
    <dd>Weekly lockfile refresh (transitive resolution re-pinning, no version bumps).</dd>
    <dt><code>devDependencies</code> patch + minor</dt>
    <dd>Any package declared under <code>devDependencies</code>. Build-time only; runtime is unaffected.</dd>
    <dt><code>@teqbench/*</code></dt>
    <dd>All updates including majors. Internal contract changes are coordinated in-PR.</dd>
    <dt><code>tooling</code> group patch + minor</dt>
    <dd><code>prettier</code>, <code>husky</code>, <code>lint-staged</code>, <code>vitest</code>, <code>eslint-*</code>, <code>@eslint/*</code>, <code>typescript-eslint</code>, etc.</dd>
    <dt><code>github-actions</code> group patch + minor + digest</dt>
    <dd>Third-party action bumps (digest re-pins on tag movement).</dd>
</dl>

**Manual review tier:**

- Runtime `dependencies` (any non-dev, non-`@teqbench/*` package)
- **All majors**, regardless of group — a defensive `matchUpdateTypes: ["major"]` rule at the bottom of `packageRules` enforces this even if a future rule sets `automerge: true` without restricting update types.
- `typescript` and `eslint` (toolchain-wide impact; held manual on purpose)

### How auto-merge is gated

The `dev` branch is protected by an org-level repository ruleset that requires PR review and passing status checks. `teqbench-devops-gh-app[bot]` is configured as a **bypass actor** on that ruleset (mode: "for pull requests only"), so the App can self-merge once CI is green without satisfying the required-review rule. Required status checks still apply — bypass does not skip CI.

The same App also has bypass on the `main` ruleset, which is what allows `release-please` PRs to self-merge during the release flow.

### Closed-PR behaviour

`recreateWhen: "always"` is set so closing a Renovate PR without merging does **not** silently retire that update. The next Renovate run respawns it. Persistent rejections belong in a `packageRules` entry with `enabled: false`, not in closed PRs.

---

## Security Advisories

`osvVulnerabilityAlerts: true` is set, so Renovate handles GHSA / OSV advisories directly: when a vulnerable version is detected, Renovate opens a PR bumping the package — same flow as a normal update PR, but labelled `dependencies, security`. **Dependabot security updates are turned off org-wide** to avoid two bots opening parallel security PRs for the same advisory.

---

## Version Restrictions

Some packages are intentionally pinned below a major version. These are enforced centrally in `renovate-config.js` via `allowedVersions`, not in any consuming repo's `package.json`:

<dl>
    <dt><code>eslint</code> (<code>&lt; 10.0.0</code>)</dt>
    <dd>ESLint majors are held until <a href="https://github.com/angular-eslint/angular-eslint">angular-eslint ↗</a> supports them across the framework's package family.</dd>
    <dt><code>@types/node</code> (<code>&lt; 25.0.0</code>)</dt>
    <dd>Pinned to the major matching the <a href="https://nodejs.org/">Node.js ↗</a> runtime (currently 24). Re-evaluated on each Node LTS bump.</dd>
</dl>

Enrolled repos may also document these intents in a custom `devDependenciesPinned` metadata field in their own `package.json` for local visibility.

---

## CI Integration

Renovate PRs trigger the standard CI workflow in each enrolled repo like any other PR. Because Renovate runs as the `teqbench-devops-gh-app[bot]` GitHub App, CI has full access to organisation secrets and submodules — there are no Renovate-specific carve-outs in the workflow.

---

## Disabling Updates

To stop Renovate from managing a repository, remove `teqbench/<repo-name>` from `repositories[]` in `renovate-config.js`. To pause individual packages org-wide, add a `packageRules` entry with `enabled: false` matched against the package name.
