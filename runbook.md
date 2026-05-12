# Runbook

Operational runbook for the TeqBench organization. Covers manual operations, incident response, recovery procedures, and routine maintenance for the 16 enrolled repos.

This document complements but does not replace:

- [`CLAUDE.md`](CLAUDE.md) — org-wide rules and conventions
- [`README.md`](README.md) — what this repo contains
- [`renovate.md`](renovate.md) — Renovate configuration and cascade behaviour

**Audience:** anyone operating the TeqBench CI/CD pipeline. Primary user is the maintainer. Secondary use cases: handoff, on-call substitute, sabbatical recovery.

**How to use this doc:** find the scenario, follow the steps, verify the outcome. Each entry is self-contained.

---

## Table of contents

1. [Manual operations](#manual-operations)
   - [Trigger Renovate on demand](#trigger-renovate-on-demand)
   - [Sync a fork from upstream](#sync-a-fork-from-upstream)
   - [Force a webapp deploy outside the daily batching window](#force-a-webapp-deploy-outside-the-daily-batching-window)
   - [Enroll a new repo into the org pipeline](#enroll-a-new-repo-into-the-org-pipeline)
   - [Retire a repo from the org pipeline](#retire-a-repo-from-the-org-pipeline)
   - [Manually merge a major-bump PR after review](#manually-merge-a-major-bump-pr-after-review)
2. [Recovery & incident response](#recovery--incident-response)
   - [Main is broken after a merge](#main-is-broken-after-a-merge)
   - [release-please stuck — no release PR opened when expected](#release-please-stuck--no-release-pr-opened-when-expected)
   - [Renovate workflow times out](#renovate-workflow-times-out)
   - [CVE published, need immediate non-batched update](#cve-published-need-immediate-non-batched-update)
   - [Auto-merge merged something that broke main](#auto-merge-merged-something-that-broke-main)
   - [Renovate runs but no PRs appear](#renovate-runs-but-no-prs-appear)
   - [Stale Renovate PR keeps respawning](#stale-renovate-pr-keeps-respawning)
   - [Lost access to teqbench-forks org](#lost-access-to-teqbench-forks-org)
   - [Bot credential rotation needed](#bot-credential-rotation-needed)
3. [Routine maintenance](#routine-maintenance)
   - [Audit-allow-list pruning](#audit-allow-list-pruning)
   - [Major version bump review cadence](#major-version-bump-review-cadence)
   - [Stale branch cleanup](#stale-branch-cleanup)
   - [Org-level secret rotation](#org-level-secret-rotation)
4. [Decision tables](#decision-tables)
   - [When to add `enabled: false` to packageRules](#when-to-add-enabled-false-to-packagerules)
   - [When to require manual review for a category](#when-to-require-manual-review-for-a-category)
   - [When to bypass batching for a webapp](#when-to-bypass-batching-for-a-webapp)
5. [Reference](#reference)
   - [Bot identity](#bot-identity)
   - [Workflow inventory](#workflow-inventory)
   - [Repo inventory](#repo-inventory)
   - [Trust tier summary](#trust-tier-summary)
   - [Cascade behaviour summary](#cascade-behaviour-summary)
6. [First 10 minutes after an alert](#first-10-minutes-after-an-alert)

---

## Manual operations

### Trigger Renovate on demand

**When:** you want Renovate to scan immediately instead of waiting for the 3-hour cron (e.g. after a config change, after a fork sync, after a release).

**Steps:**

```bash
gh workflow run renovate.yml -R teqbench/.github
```

Wait ~30 seconds, then verify it started:

```bash
gh run list -R teqbench/.github --workflow=renovate.yml --limit 1
```

To watch progress:

```bash
gh run watch <run-id> -R teqbench/.github --interval 30
```

**Expected behaviour:** the run completes in ~5–15 min. PRs created/updated/auto-merged across the 16 enrolled repos.

**If the run times out:** see [Renovate workflow times out](#renovate-workflow-times-out).

---

### Sync a fork from upstream

**When:** you want to absorb new upstream commits into a `teqbench-forks/*` fork (currently `anthropics-skills` and `angular-skills`).

The forks are pure mirrors used as safety-net backups for the submodules. They don't auto-sync — by design, the maintainer decides when to absorb upstream.

**Option A — GitHub UI (simplest):**

1. Go to the fork repo (e.g. https://github.com/teqbench-forks/anthropics-skills)
2. Click the "Sync fork" dropdown above the file list
3. Click "Update branch"

**Option B — gh CLI:**

```bash
gh api -X POST repos/teqbench-forks/<fork-name>/merge-upstream -f branch=main
```

**Expected cascade after sync:**

1. Renovate's next scan detects the fork's `main` moved
2. Opens a PR in `teqbench.dev.shared-skills` bumping the submodule pointer → auto-merges
3. Renovate detects `shared-skills` `main` moved
4. Opens PRs in every consumer repo bumping the `shared-skills` submodule pointer → auto-merge
5. Steady state in ~9h on the default 3h cron, or instant if you also trigger Renovate (see [Trigger Renovate on demand](#trigger-renovate-on-demand)) after each hop

**Verify success:** check Vercel deploys (for webapps) or Actions tab (for libraries) for the resulting builds.

---

### Force a webapp deploy outside the daily batching window

**When:** you need a webapp to deploy now (e.g. a hotfix, a manual content update), bypassing the `before 6am` schedule for `teqbench/teqbench.app.*` repos.

**The webapps batch their Renovate updates daily.** Manual PRs and direct commits to `main` are not affected by the schedule — only Renovate-authored PRs.

**Options:**

- **Direct commit:** if it's an authored change (not a dep update), commit to a feature branch, PR to `main`, merge. Vercel deploys on push to main. Not subject to Renovate's schedule.
- **Bypass Renovate schedule for a specific PR:** Renovate's `schedule` setting controls when PRs are *opened*. If a Renovate PR already exists, you can merge it manually outside the window (auto-merge will fire as soon as the schedule permits, but a manual click works any time).
- **Adjust the schedule temporarily:** edit `renovate-config.js` to remove the `matchRepositories` schedule rule for the webapps, push, let Renovate run, then revert. Heavy-handed; rarely needed.

**Most common cause for needing this:** you noticed something needs to ship immediately. The fastest path: commit the change directly to a feature branch, open a PR, merge.

---

### Enroll a new repo into the org pipeline

**When:** you've created a new repo (typically from `teqbench/teqbench.dev.templates.tbx-package`) and want it to participate in the org-wide CI/CD pipeline.

**Steps:**

1. Confirm the repo's default branch is `main` (template should already set this).
2. Verify thin caller workflows are present in `.github/workflows/`:
   - `ci.yml` (or `noop-ci.yml` for non-compilable repos)
   - `release.yml`
   - `claude.yml`
   - `dep-compat-check.yml` (Node.js libraries only)
   - `docs-deploy.yml` (Storybook repos only)
3. Add the repo name to the `repositories[]` array in `renovate-config.js` (only if it has dependencies to manage). PR + merge.
4. Enable `allow_auto_merge` on the new repo:
   ```bash
   gh api -X PATCH repos/teqbench/<repo> -F allow_auto_merge=true
   ```
5. Set the `GIST_ID` repo variable to the shared gist ID:
   - Go to **Settings → Secrets and variables → Actions → Variables**
   - Add `GIST_ID` = `a69600f4ed4ebed89ffb35d808e05eb4`
6. Verify the org-level secrets (`APP_CLIENT_ID`, `APP_PRIVATE_KEY`, `GIST_TOKEN`, `ANTHROPIC_API_KEY`) are scoped to include this repo. In **Organization Settings → Secrets and variables → Actions**, confirm each secret either uses "All repositories" or explicitly lists the new one.
7. Trigger a first CI run to validate. Push a trivial commit or open a PR.
8. Update the [Repo inventory](#repo-inventory) section of this runbook.

**Verify success:** the next Renovate run picks up the new repo, opens initial bump PRs (if any), and CI passes on a PR.

---

### Retire a repo from the org pipeline

**When:** a repo is being archived, deprecated, or moved out of TeqBench.

**Steps:**

1. Remove the repo from the `repositories[]` array in `renovate-config.js`. PR + merge.
2. Close any open Renovate PRs on the repo (Renovate won't manage it after the config change).
3. Optionally remove the repo from this runbook's [Repo inventory](#repo-inventory).
4. If the repo is being archived: **Settings → Archive this repository** (GitHub UI).
5. If the repo is being transferred or deleted: handle via standard GitHub repo settings.

**Do NOT** delete the repo from the `repositories[]` array without explicit decision — there's a CLAUDE.md rule against this for safety.

---

### Manually merge a major-bump PR after review

**When:** a Renovate PR is open for a major version bump (typescript v6, lint-staged v17, an action's vX upgrade). These are blocked from auto-merge by the defensive `matchUpdateTypes: ["major"]` rule and require human review.

**Steps:**

1. Read the upstream package's CHANGELOG for breaking changes
2. Check the PR's CI status — if it failed on `npm ci` with a lockfile-mismatch error, the PR is hitting Renovate's [overrides lockfile-regen bug](#stale-renovate-pr-keeps-respawning). See that entry.
3. If CI is failing for a real reason (breaking change), update the repo's code in a separate PR first, then update or close the Renovate PR
4. If CI is green and the breaking change is acceptable: `gh pr merge <num> -R <repo> --squash`
5. Monitor the resulting release-please PR for the new version of the affected repo

---

## Recovery & incident response

### Main is broken after a merge

**Symptoms:** CI is failing on `main` after a merge. Vercel deploys fail. Downstream consumers may also see failures.

**Triage in order:**

1. **Identify the breaking PR.** `gh run list -R <repo> --branch main --limit 5` shows recent runs. Find the first failing run; the PR merged immediately before it is the culprit.

2. **Decide: revert or fix-forward?**
   - **Revert** if the fix isn't immediate or you need to restore green main now. `gh pr revert <num> -R <repo>` creates a revert PR.
   - **Fix-forward** if the breakage is a small fix and you can ship it within a few minutes.

3. **For revert:** open the revert PR with `--squash` merge. Monitor `main` CI to confirm green.

4. **For fix-forward:** create a `chore/fix-main` branch, push the fix, open PR to main, merge with `--squash`.

**For webapps:** Vercel may have already deployed the broken `main` to production. Once `main` is green again, the next deploy will heal automatically. If the broken deploy is user-facing and severe, you can in Vercel UI: **Deployments → find the last good build → Promote to Production**.

**Common causes:**

- Two PRs auto-merged in close succession with a semantic conflict (the "Require branches to be up to date" setting is supposed to prevent this — see [Decision tables](#decision-tables))
- A dep update had a breaking change that wasn't caught by CI
- A Renovate lockfile-regen issue produced a corrupted lockfile (see [Stale Renovate PR keeps respawning](#stale-renovate-pr-keeps-respawning))

---

### release-please stuck — no release PR opened when expected

**Symptoms:** A `feat:` or `fix:` commit landed on `main`, but no `chore(main): release X.Y.Z` PR appeared.

**Triage:**

1. Check the most recent release-please workflow run: `gh run list -R <repo> --workflow=release.yml --limit 5`
2. View the run logs — release-please typically logs what it found and what it decided
3. Common reasons:
   - **No releasable commits since last tag.** Only `feat:` / `fix:` / `feat!:` count. `chore:` and `docs:` don't bump. Verify the recent commits actually use one of the releasable prefixes.
   - **release-please-config.json or .release-please-manifest.json out of sync.** These files are managed by release-please itself; manual edits can confuse it. Don't touch them per the CLAUDE.md rule.
   - **The workflow isn't triggering.** Check `release.yml` workflow filter — it triggers on push to `main`.
   - **Existing release PR is open.** release-please updates an existing PR rather than opening a new one. Check `gh pr list --search "release-please--" -R <repo>`.

**Fix:**

- If the cause is a `chore:` commit type when you wanted a release, push a follow-up commit with a releasable prefix (e.g. `fix(scope): explanation`)
- If release-please's state files are corrupted, manually edit them carefully — but this is rare and risky
- If the workflow isn't triggering at all, manually trigger via `gh workflow run release.yml -R <repo>`

---

### Renovate workflow times out

**Symptoms:** the Renovate workflow run is cancelled with "The job has exceeded the maximum execution time of 30m0s". Some repos in the `repositories[]` array don't get processed.

**Immediate workaround:**

```bash
gh workflow run renovate.yml -R teqbench/.github
```

Re-trigger. The new run picks up where the previous left off; it has less work because the timed-out run still made some progress.

**Permanent fix if timeout is recurring:**

Edit `.github/workflows/renovate.yml` to bump `timeout-minutes`. Currently set to 30 (post-Phase-5 of the GitHub Flow migration). Bumping to 45 or 60 is reasonable. Open a normal PR, merge.

**Root cause investigation:**

If timeouts are frequent in steady state (not just during cleanup churn), Renovate may be struggling with one specific repo's lockfile or large dependency graph. Inspect the run log to find which repo it was processing when time ran out.

---

### CVE published, need immediate non-batched update

**Symptoms:** a critical security advisory is published for a dependency. You want the fix to land immediately, bypassing the daily-batching schedule on webapps.

**How it usually works automatically:**

Renovate's `vulnerabilityAlerts` and `osvVulnerabilityAlerts` settings (in `renovate-config.js`) cause CVE-bumps to bypass schedules. The PR is labelled `security` and opens immediately, regardless of the `before 6am` window.

**Verify the bypass happened:**

1. Check the PR's labels — should include `dependencies, security`
2. Check the PR's `createdAt` — should be near the time of advisory publication, not the next morning window

**If Renovate didn't catch it automatically:**

- The advisory may not have been picked up by OSV yet (delay can be several hours)
- Trigger Renovate manually to force a re-scan: `gh workflow run renovate.yml -R teqbench/.github`
- If still no PR after a Renovate run completes, the package may not be tracked correctly. Check whether the package is in any `enabled: false` rule.

**Emergency manual path:**

If automation isn't picking it up and you need the fix now:

1. Clone the affected repo
2. Manually edit `package.json` to the safe version
3. Run `npm install` to regenerate lockfile cleanly
4. Open a PR titled `fix(security): bump <package> to <safe-version> for <CVE-id>`
5. Merge once CI passes

---

### Auto-merge merged something that broke main

**Symptoms:** a Renovate trusted-tier PR auto-merged, CI passed on the PR, but main is now broken (post-merge CI failed).

This is the failure mode the trust-tier model accepts: CI on the PR's commit passed, but the PR's content interacts badly with later changes on main.

**Immediate response:**

1. Identify the merged PR from the failing main run.
2. Revert it: `gh pr revert <num> -R <repo>` (creates a revert PR with auto-merge enabled by default for trusted-tier reverts).
3. Once main is green again, decide whether the original update is salvageable:
   - If the dep update can be redone with a different version pin or workaround, open a manual PR
   - If the dep update is fundamentally incompatible, add a `packageRules` entry in `renovate-config.js` to disable or restrict it. See [When to add `enabled: false`](#when-to-add-enabled-false-to-packagerules)

**Pattern to recognize:**

If main starts breaking from auto-merges more than once a quarter, the trust tier may be too aggressive. Possible adjustments:

- Enable "Require branches to be up to date before merging" in the main ruleset if currently off (forces a fresh CI run after rebase, catches semantic conflicts)
- Tighten `matchDepTypes` to be more conservative
- Move specific high-risk deps to manual review tier

---

### Renovate runs but no PRs appear

**Symptoms:** the Renovate workflow ran to completion (success conclusion) but no new PRs are created or updated.

**Diagnostic checklist:**

1. **Was there anything to update?** Renovate only creates PRs for actual version changes. If nothing's behind, nothing opens. Check the run log for "no updates needed" messages.
2. **Is the schedule active?** Webapp PRs only open during the `before 6am` window. If Renovate ran at 11am, webapp updates won't be PR'd until tomorrow's morning window.
3. **Was the PR creation blocked by `prHourlyLimit`?** Default is 2 PRs per repo per hour. Renovate logs when it hits this.
4. **Is the package disabled?** Check `renovate-config.js` for `enabled: false` rules.
5. **Did Renovate get past the `repositories[]` array?** If the workflow timed out, repos at the end may not have been processed. See [Renovate workflow times out](#renovate-workflow-times-out).

**Force a fresh scan:**

```bash
gh workflow run renovate.yml -R teqbench/.github
```

If still nothing after a successful run, the org is genuinely up-to-date.

---

### Stale Renovate PR keeps respawning

**Symptoms:** A Renovate PR fails CI (typically with `npm ci` lockfile-mismatch errors), gets closed, then Renovate respawns it on the next run with the same failure. Endless cycle.

**Root cause:** Renovate's npm manager has rough edges around lockfile regeneration in certain cases:

- Major version bumps that cross tilde or caret range boundaries (e.g. `~5.9.0` → `~6.0.0`)
- Updates inside the `overrides` field of package.json
- Some peer-dep changes

The PR's `package.json` reflects the new version but `package-lock.json` still references the old version → `npm ci` fails with `Invalid: lock file's X@A does not satisfy X@B`.

**Resolution options:**

**Option A — disable Renovate management of that dep / depType:**

Add to `renovate-config.js`:

```js
{
  matchPackageNames: ["<problem-package>"],
  enabled: false,
},
```

Or for the whole overrides field (already done as of v4.0.0):

```js
{
  matchDepTypes: ["overrides"],
  enabled: false,
},
```

**Option B — bump the dep manually:**

```bash
# In a local clone of the affected repo
npm install <package>@<new-version>
git add package.json package-lock.json
git commit -m "fix(deps): manually bump <package> to <version> (Renovate lockfile-regen bug)"
# PR + merge
```

This regenerates the lockfile cleanly. Renovate will then stop trying to bump that version (it's already there).

**Pattern recognition:**

Repeated CI failures with `npm ci ... Missing: <pkg>@<version> from lock file` across multiple repos for the same dep almost always indicate this bug. Treat it as a known class of failures, not a per-PR issue.

---

### Lost access to teqbench-forks org

**Symptoms:** the `teqbench-forks/*` repos are unreachable (org disbanded, account lockout, etc.). Consumer repos with submodule references to those forks can't initialize submodules.

**Impact:**

- New clones of any repo with `.shared-skills` (and thus submodules of submodules) will fail at `git submodule update --init`
- CI runs that do `submodules: true` checkout fail

**Recovery options:**

1. **Restore org access** — preferred. Contact GitHub support to recover the org.
2. **Repoint submodules to upstream directly** — edit each `.gitmodules` to use `anthropics/skills.git` instead of `teqbench-forks/anthropics-skills.git`. Loses the supply-chain-safety property of having a frozen mirror but restores function.
3. **Recreate the fork from a known-good clone** — if you have any local clone of the fork content at the right SHA, push it to a new fork location.

**Prevention:** see [Bot credential rotation](#bot-credential-rotation-needed) — if a bot has admin on `teqbench-forks`, ensure credentials are documented and rotated periodically.

---

### Bot credential rotation needed

**Symptoms:** the `teqbench-devops-gh-app` GitHub App needs new credentials (expired key, security incident, scheduled rotation).

**Inputs:**

- App ID: `2935880`
- Bot login: `teqbench-devops-gh-app[bot]`
- Org-level secrets to update: `APP_CLIENT_ID`, `APP_PRIVATE_KEY`

**Steps:**

1. Go to **Organization Settings → GitHub Apps → teqbench-devops-gh-app**
2. Generate a new client secret and/or private key
3. Download the new private key (keep the file secure; do not commit)
4. Update the org-level secrets at **Organization Settings → Secrets and variables → Actions**:
   - `APP_CLIENT_ID` — if it changed
   - `APP_PRIVATE_KEY` — paste the new key (full PEM contents including BEGIN/END lines)
5. Revoke the old key (only after confirming the new one works)
6. Trigger a workflow that uses the bot to verify:
   ```bash
   gh workflow run renovate.yml -R teqbench/.github
   ```
   If the run succeeds, credentials are working.

**If the bot is unavailable:** Renovate, release-please auto-merge, and any workflow that uses `actions/create-github-app-token` will fail. Restore credentials urgently.

---

## Routine maintenance

### Audit-allow-list pruning

**Location:** `.github/audit-allow-list.json` in this repo.

**When:** review quarterly, or any time you suspect a suppressed advisory has been patched upstream.

**Process:**

1. For each entry in the file, check whether the upstream advisory has been fixed:
   - Visit the GHSA URL (e.g. `https://github.com/advisories/GHSA-xxxx-xxxx-xxxx`)
   - Check the latest version of the affected package
   - Check whether your dependency tree resolves to a fixed version (`npm audit` in an affected repo)
2. Remove entries for resolved advisories (so future regressions are caught)
3. Leave entries for advisories still upstream-blocked

**Stale entries hide real regressions.** This is the most important reason for periodic pruning.

---

### Major version bump review cadence

**When:** monthly, or whenever the queue of major-bump PRs grows uncomfortable.

**Common queue items:**

- `typescript` major
- `lint-staged` major
- `eslint` major (currently version-capped — check whether angular-eslint supports the new major before lifting the cap)
- `vite` major (currently transitively used; check whether @angular/build version supports it)
- GitHub Actions majors (`actions/checkout`, `actions/setup-node`, etc.)

**Process:**

1. List open major-bump PRs across the org:
   ```bash
   for repo in <list of repos>; do
     gh pr list -R "$repo" --state open --author 'app/teqbench-devops-gh-app' --json number,title --jq '.[] | select(.title | test("(v|to )\\d+(?!\\.\\d)"))'
   done
   ```
2. For each, read the upstream package's CHANGELOG/migration guide
3. Either merge (after any required code changes) or close (if upgrade is blocked)
4. If a major is *systematically* blocked (e.g. angular-eslint not yet supporting eslint v10), add an `allowedVersions` cap in `renovate-config.js` so Renovate stops opening the PR

---

### Stale branch cleanup

**When:** quarterly, or any time the branch list of a repo grows beyond expected.

**Process:**

```bash
# List non-main, non-renovate, non-release-please branches:
gh api --paginate repos/teqbench/<repo>/branches --jq '.[].name' | grep -Ev '^(main|renovate|release-please--)'

# Delete a stale branch:
gh api -X DELETE repos/teqbench/<repo>/git/refs/heads/<branch-name>
```

**Expected:** in normal operation, no branches other than main and active automation branches should be lingering. The `delete_branch_on_merge: true` setting should auto-clean merged feature branches.

**If branches accumulate unexpectedly:** check whether `delete_branch_on_merge` is actually enabled on the affected repo:

```bash
gh api repos/teqbench/<repo> --jq '.delete_branch_on_merge'
```

---

### Org-level secret rotation

**When:** annually, or after a security incident.

**Secrets to rotate:**

| Secret | Source | Rotation procedure |
|---|---|---|
| `APP_CLIENT_ID` | teqbench-devops-gh-app | See [Bot credential rotation](#bot-credential-rotation-needed) |
| `APP_PRIVATE_KEY` | teqbench-devops-gh-app | See [Bot credential rotation](#bot-credential-rotation-needed) |
| `GIST_TOKEN` | personal access token for badge gist | Generate new PAT with `gist` scope, update org secret |
| `ANTHROPIC_API_KEY` | Anthropic console | Generate new key, update org secret, revoke old |

**Verify after rotation:** trigger a workflow that uses the rotated secret. If the run succeeds, rotation is complete.

---

## Decision tables

### When to add `enabled: false` to packageRules

| Situation | Add `enabled: false`? | Notes |
|---|---|---|
| Renovate PRs keep failing CI with lockfile-mismatch bugs | Yes | Scope to the specific dep or depType |
| You want to pin a package permanently (e.g. for compat) | No — use `allowedVersions` instead | Keeps visibility into the existence of newer versions |
| You're tired of seeing PRs for a manual-review dep | Sometimes | Trades visibility for inbox quiet |
| The dep is intentionally pinned in `overrides` field | Already disabled (post-PR #101) | `matchDepTypes: ["overrides"]` is `enabled: false` org-wide |
| You forked the dep and want to stop tracking upstream | Yes | The fork is now the source of truth |

---

### When to require manual review for a category

| Category | Currently trust-tier | Reason to move to manual |
|---|---|---|
| `@teqbench/*` major bumps | Manual (defensive rule) | Always — major bumps in internal packages need coordinated review |
| `devDependencies` patch/minor | Auto-merge | Move to manual if a dev tool has historically broken CI |
| `tooling` group patch/minor | Auto-merge | Move to manual if a tooling change requires code adaptation |
| `github-actions` patch/minor/digest | Auto-merge | Move to manual if a third-party action has had recent security issues |
| Runtime dependencies | Manual (default) | Stay manual — runtime deps affect production directly |

**How to move a category:**

Edit `renovate-config.js`, remove `automerge: true` from the relevant `packageRules` entry, PR + merge.

---

### When to bypass batching for a webapp

| Situation | Bypass? | How |
|---|---|---|
| Routine dep update | No | Let it batch to the next 6am window |
| CVE security update | Already bypassed | `osvVulnerabilityAlerts` does this automatically |
| Hotfix for production | Yes | Direct manual PR (not Renovate); the schedule only affects Renovate-authored PRs |
| Content change | Yes | Direct PR; not subject to schedule |
| Want to test the cascade end-to-end | Sometimes | Trigger Renovate manually right before the 6am window so a fresh PR is ready in the window |

---

## Reference

### Bot identity

| Property | Value |
|---|---|
| App name | `teqbench-devops-gh-app` (formerly `teqbench-automation`) |
| App ID | `2935880` |
| Bot login | `teqbench-devops-gh-app[bot]` |
| Bot user ID | `263536528` |
| Bot noreply email | `263536528+teqbench-devops-gh-app[bot]@users.noreply.github.com` |
| Bypass actor on `main` ruleset | Yes (mode: "for pull requests only") |

---

### Workflow inventory

Reusable workflows in `.github/workflows/`:

| Workflow | Purpose |
|---|---|
| `ci.yml` | Lint, typecheck, format check, audit, test, build, badges |
| `noop-ci.yml` | No-op CI with version badge (non-compilable repos) |
| `release.yml` | release-please versioning + (optional) publish to GitHub Packages |
| `claude.yml` | Claude Code @claude trigger integration |
| `dep-compat-check.yml` | Dependency compatibility tracking (libraries only) |
| `docs-deploy.yml` | Storybook build + GitHub Pages deploy (4 mat-* libraries with Storybook) |
| `renovate.yml` | Scheduled Renovate runs (runs from this repo, every 3 hours) |

Self-workflows (this repo only): `self-ci.yml`, `self-claude.yml`, `self-release.yml`, `validate.yml`.

Caller templates: `caller-templates/` directory.

---

### Repo inventory

16 repos enrolled in the org pipeline as of post-migration:

**Meta:**

- `teqbench/.github` — org-wide config repo (this repo)

**Templates / skills:**

- `teqbench/teqbench.dev.templates.tbx-package` — Node.js package template
- `teqbench/teqbench.dev.shared-skills` — shared Claude skills (submodule of consumers)
- `teqbench/teqbench.dev.misc-skills` — misc Claude skills (submodule of shared-skills)

**Libraries (tbx-*):**

- `teqbench/tbx-models`
- `teqbench/tbx-ngx-errors`
- `teqbench/tbx-ngx-http`
- `teqbench/tbx-mat-icons`
- `teqbench/tbx-mat-severity-theme`
- `teqbench/tbx-mat-notifications` ← Storybook
- `teqbench/tbx-mat-banners` ← Storybook
- `teqbench/tbx-mat-bottom-sheets` ← Storybook
- `teqbench/tbx-mat-dialogs` ← Storybook

**Webapps:**

- `teqbench/teqbench.app.website`
- `teqbench/teqbench.app.tradingtoolbox.webapp`
- `teqbench/teqbench.app.liists.webapp`

**Safety-net forks (separate org):**

- `teqbench-forks/anthropics-skills`
- `teqbench-forks/angular-skills`

---

### Trust tier summary

See [`renovate.md`](renovate.md) for full details. Quick reference:

**Auto-merge tier (CI is the gate):**

- `lockFileMaintenance` (weekly lockfile refresh)
- `devDependencies` patch + minor + pin + digest
- `@teqbench/*` (all updates including majors)
- `tooling` group patch + minor
- `github-actions` group patch + minor + digest
- `git-submodules` from `teqbench/**` and `teqbench-forks/**` sources

**Manual review tier:**

- Runtime `dependencies` (any non-dev, non-`@teqbench/*`)
- All majors (defensive rule)
- `typescript` and `eslint`

---

### Cascade behaviour summary

See [`renovate.md`](renovate.md) → Cascade Behaviour for full details.

**Submodule cascade:** fork sync (manual click) → shared-skills submodule pointer (auto) → consumer submodule pointers (auto).

**npm package cascade:** library release → consumer `fix(deps):` PR (auto) → consumer release-please patch → next-tier consumer PRs (auto).

**Webapp batching:** all auto-merging updates land in the `before 6am` UTC window. Security CVE updates bypass the schedule.

---

## First 10 minutes after an alert

Generic incident triage when something is on fire and you don't yet know what:

1. **What's broken?** Identify the affected surface:
   - CI failing on `main` of one repo → [Main is broken](#main-is-broken-after-a-merge)
   - Webapp returning errors / Vercel deploy failed → check Vercel deploys + GitHub Actions runs for that repo
   - Multiple repos failing similarly → likely shared workflow regression in `teqbench/.github`
   - No PRs from Renovate → [Renovate runs but no PRs appear](#renovate-runs-but-no-prs-appear) or [Renovate workflow times out](#renovate-workflow-times-out)

2. **What changed recently?**
   - `git log --since="1 day ago" --oneline` on the affected repo
   - Recent merged PRs in `teqbench/.github` (affects everyone)
   - Recent release-please releases of any internal `@teqbench/*` package

3. **Is the trust tier auto-merge implicated?**
   - Check what auto-merged in the last hour: `gh pr list -R <repo> --state merged --limit 10 --author 'app/teqbench-devops-gh-app'`
   - If a Renovate auto-merge happened just before the breakage, revert it

4. **Is it the bot?**
   - Most recent Renovate run status: `gh run list -R teqbench/.github --workflow=renovate.yml --limit 1`
   - Most recent release-please runs across affected repos
   - If credentials are the issue, see [Bot credential rotation](#bot-credential-rotation-needed)

5. **Stabilize first, diagnose second.**
   - Revert > fix-forward if uncertain
   - Get `main` green before investigating root cause
   - Use the runbook entry for the specific scenario once identified
