// ─────────────────────────────────────────────────────────────
// Renovate — Central Configuration for all TeqBench repos
// ─────────────────────────────────────────────────────────────
// This config governs dependency updates across all teqbench
// package repos. Add new repos to the repositories[] array.
//
// Docs: https://docs.renovatebot.com/configuration-options/
// ─────────────────────────────────────────────────────────────

module.exports = {
  platform: "github",
  onboarding: false,
  requireConfig: "optional",

  // ── Security advisories ──────────────────────────────────────
  // Renovate handles GHSA / OSV advisories directly so we don't
  // need Dependabot security updates in parallel. One bot, one
  // path, one policy file.
  osvVulnerabilityAlerts: true,
  vulnerabilityAlerts: {
    enabled: true,
    labels: ["dependencies", "security"],
  },

  // ── Host rules ───────────────────────────────────────────────
  // GitHub Packages npm registry auth. @teqbench/* packages are
  // published to npm.pkg.github.com (not public npmjs.org), so
  // Renovate needs a token with packages:read to look up versions.
  // Without this, version lookups fail with "no-result" and the
  // multi-hop @teqbench package cascade doesn't trigger.
  //
  // GH_PACKAGES_TOKEN is set by renovate.yml to the workflow's
  // auto-generated GITHUB_TOKEN (scoped to teqbench/.github with
  // packages:read in the workflow's permissions block). The
  // workflow's package read access flows from the source
  // repository's inherited access on each @teqbench/* package.
  //
  // We use a separate env var from RENOVATE_TOKEN (which holds the
  // teqbench-devops-gh-app token) because the App installation
  // token has been returning HTTP 403 from npm.pkg.github.com
  // despite the App having packages:read permission — a known
  // quirk where the GitHub Packages npm registry's auth path
  // doesn't reliably honor App installation tokens for cross-repo
  // package reads.
  //
  // The non-`RENOVATE_*` name reaches the Renovate container only
  // because renovate.yml extends `env-regex` to allow it. Without
  // that override, the action's default regex drops the var and
  // this reads as `undefined`.
  hostRules: [
    {
      matchHost: "https://npm.pkg.github.com/",
      hostType: "npm",
      token: process.env.GH_PACKAGES_TOKEN,
    },
  ],

  // ── Submodules ───────────────────────────────────────────────
  // Track .gitmodules pointer updates so internal teqbench
  // repos (shared-skills with misc-skills, all consumers with
  // shared-skills) and the safety-net forks under teqbench-forks
  // stay current via Renovate rather than manual submodule bumps.
  "git-submodules": {
    enabled: true,
  },

  // ── PR lifecycle ─────────────────────────────────────────────
  // Closing a Renovate PR without merging defaults to "do not
  // reopen for this version" — quiet packages can then go silent
  // for weeks. Forcing recreation keeps the queue self-healing:
  // bulk-closing the backlog respawns everything still needed on
  // the next Renovate run. Persistent ignores belong in a
  // packageRules entry with `enabled: false`, not in closed PRs.
  recreateWhen: "always",

  // ── Repo list (add new repos here) ───────────────────────────
  repositories: [
    "teqbench/.github",
    "teqbench/teqbench.dev.templates.tbx-package",
    "teqbench/teqbench.dev.shared-skills",
    "teqbench/teqbench.dev.misc-skills",
    "teqbench/tbx-models",
    "teqbench/tbx-ngx-errors",
    "teqbench/tbx-ngx-http",
    "teqbench/tbx-mat-icons",
    "teqbench/tbx-mat-severity-theme",
    "teqbench/tbx-mat-notifications",
    "teqbench/tbx-mat-banners",
    "teqbench/tbx-mat-bottom-sheets",
    "teqbench/tbx-mat-dialogs",
    "teqbench/teqbench.app.website",
    "teqbench/teqbench.app.tradingtoolbox.webapp",
    "teqbench/teqbench.app.liists.webapp",
  ],

  // ── Branch targeting ─────────────────────────────────────────
  baseBranchPatterns: ["main"],

  // ── Commit & PR conventions ──────────────────────────────────
  commitMessagePrefix: "chore(deps):",
  labels: ["dependencies"],
  gitAuthor:
    "teqbench-devops-gh-app[bot] <263536528+teqbench-devops-gh-app[bot]@users.noreply.github.com>",

  // ── Custom managers ──────────────────────────────────────────
  // Track inline `npx --yes @microsoft/api-extractor@<version>` pins inside
  // release.yml so Renovate can surface version bumps for it. Without this,
  // the version is invisible to all standard managers.
  customManagers: [
    {
      customType: "regex",
      managerFilePatterns: ["/\\.github/workflows/release\\.yml$/"],
      matchStrings: [
        "npx --yes (?<depName>@microsoft/api-extractor)@(?<currentValue>[\\d.]+)",
      ],
      datasourceTemplate: "npm",
    },
  ],

  // ── Package rules ────────────────────────────────────────────
  //
  // Trust model (conservative tier):
  //   Auto-merge on green CI:
  //     - lockFileMaintenance (top-level key, below)
  //     - devDependencies patch + minor + pin + digest
  //     - @teqbench/* (all updates)
  //     - tooling group (patch + minor)
  //     - github-actions group (patch + minor + digest + pin)
  //   Manual review (no automerge):
  //     - runtime dependencies (any non-dev, non-@teqbench)
  //     - all majors (any package, any group)
  //     - typescript, eslint
  //
  // CI (lint, typecheck, audit, test, build, plus dep-compat-check on
  // libraries) is the merge gate. Branch protection on `main` requires
  // these checks; `teqbench-devops-gh-app[bot]` is a bypass actor on the
  // org-level ruleset so the bot can self-merge once checks are green.
  packageRules: [
    // Internal @teqbench packages: auto-merge all updates (including
    // majors — internal contract changes are coordinated in-PR).
    //
    // registryUrls: @teqbench/* packages live on GitHub Packages, not
    // public npm. Tells Renovate to query npm.pkg.github.com (paired
    // with the hostRules entry above that provides the auth token).
    //
    // commitMessagePrefix override: use `fix(deps):` so release-please
    // treats internal package updates as patch-bump triggers. This
    // unblocks the multi-hop cascade through the package hierarchy
    // (tbx-mat-icons -> tbx-mat-severity-theme -> notifications/banners
    // /bottom-sheets/dialogs). Without the override, `chore(deps):` is
    // a no-bump type and the cascade stops after the first hop.
    {
      matchPackageNames: ["/^@teqbench//"],
      registryUrls: ["https://npm.pkg.github.com"],
      automerge: true,
      automergeType: "pr",
      groupName: "teqbench packages",
      commitMessagePrefix: "fix(deps):",
    },

    // Submodule updates from teqbench-owned sources: auto-merge.
    // Restricts to teqbench/* and teqbench-forks/* — any future
    // submodule from elsewhere falls through to manual review.
    {
      matchManagers: ["git-submodules"],
      matchSourceUrls: [
        "https://github.com/teqbench/**",
        "https://github.com/teqbench-forks/**",
      ],
      automerge: true,
      automergeType: "pr",
    },

    // Dev dependencies: auto-merge patch + minor. Majors fall through
    // to manual review.
    {
      matchDepTypes: ["devDependencies"],
      matchUpdateTypes: ["patch", "minor", "pin", "digest"],
      automerge: true,
      automergeType: "pr",
    },

    // Tooling: group into one PR, auto-merge patch + minor.
    {
      matchPackageNames: [
        "prettier",
        "husky",
        "lint-staged",
        "vitest",
        "@microsoft/api-extractor",
        "/^prettier-/",
        "/^@prettier//",
        "/^@vitest//",
        "/^eslint-/",
        "/^@eslint//",
        "/^typescript-eslint/",
      ],
      groupName: "tooling",
      matchUpdateTypes: ["patch", "minor", "pin", "digest"],
      automerge: true,
      automergeType: "pr",
    },


    // TypeScript: separate PR, manual review. Toolchain-wide impact
    // (declarations, downstream consumers) warrants a human look even
    // on minors.
    {
      matchPackageNames: ["typescript"],
      groupName: "typescript",
    },

    // GitHub Actions: separate PR with CI prefix, auto-merge patch +
    // minor + digest. Majors require manual review.
    //
    // `pinDigests` enforces the `@<sha> # <tag>` pattern for all third-party
    // actions across teqbench repos — Renovate will add missing digests on
    // first scan and keep them current on subsequent runs.
    {
      matchManagers: ["github-actions"],
      pinDigests: true,
      groupName: "github-actions",
      commitMessagePrefix: "chore(ci):",
      labels: ["dependencies", "ci"],
      matchUpdateTypes: ["patch", "minor", "pin", "digest"],
      automerge: true,
      automergeType: "pr",
    },

    // teqbench/.github reusable workflows: pin by tag only (no digest pin).
    //
    // pinDigests on the broader github-actions rule above generates two
    // update candidates per workflow file (one for the version bump, one
    // for the digest pin) that both target the same `renovate/github-actions`
    // branch. Renovate logs "Ignoring upgrade collision" for the redundant
    // candidates and the group is dropped — no PR is opened. Disabling
    // pinDigests for our own org's reusable workflows leaves a single
    // bump candidate per file, which Renovate can group cleanly.
    //
    // Tag pins are sufficient for our own org's reusables: tags are
    // immutable once cut by release-please, and PR diffs read clearly
    // (e.g. `@v2.6.0 → @v2.9.1`).
    {
      matchManagers: ["github-actions"],
      matchPackageNames: ["teqbench/.github"],
      pinDigests: false,
    },

    // ── Version restrictions ──────────────────────────────────
    // ESLint: ignore majors until Angular ESLint supports them
    {
      matchPackageNames: ["eslint"],
      allowedVersions: "<10.0.0",
    },

    // @types/node: pin to even-numbered LTS releases
    {
      matchPackageNames: ["@types/node"],
      allowedVersions: "<25.0.0",
    },

    // TypeScript: cap to <6.0.0 until @angular/build supports v6.
    // Angular's @angular/build@21.x has a peerDependency of
    // typescript ">=5.9 <6.0", so v6 bumps fail `npm install` with
    // ERESOLVE. Lift this cap when Angular publishes a build that
    // supports TS v6 (likely Angular 22+).
    {
      matchPackageNames: ["typescript"],
      allowedVersions: "<6.0.0",
    },

    // ── Disabled deps ─────────────────────────────────────────
    // npm `overrides` field: do not manage.
    //
    // (1) Renovate's npm manager doesn't reliably regenerate the
    //     package-lock.json when only the overrides field changes,
    //     producing PRs that fail `npm ci` with
    //     "Missing: <pkg>@<v> from lock file".
    //
    // (2) More importantly: overrides exist to pin a specific
    //     transitive version for a deliberate reason (CVE workaround,
    //     build-time compatibility — see e.g. the documented vite
    //     7.3.2 pin under `@angular/build` in the tbx-mat-* / tbx-ngx-*
    //     repos). Renovate should not be fighting that pin. Bump
    //     overrides manually as a normal PR when the underlying
    //     reason is resolved.
    {
      matchDepTypes: ["overrides"],
      enabled: false,
    },

    // ── Defensive override ────────────────────────────────────
    // Belt-and-suspenders: even if a future rule sets automerge: true
    // without restricting matchUpdateTypes, majors stay manual. Keeps
    // the trust boundary explicit at the bottom of the file.
    {
      matchUpdateTypes: ["major"],
      automerge: false,
    },

    // ── Webapp weekly batching ────────────────────────────────
    // Vercel deploys on every push to main in the webapps. Without
    // batching, each cascading dep update would trigger a separate
    // production deploy. Schedule webapp updates to land once a week
    // so accumulated bumps deploy together — limits Vercel costs to
    // ~1 automated production deploy per webapp per week.
    //
    // Security CVE updates bypass schedules per Renovate's defaults
    // (osvVulnerabilityAlerts above) — those still PR immediately.
    {
      matchRepositories: [
        "teqbench/teqbench.app.website",
        "teqbench/teqbench.app.tradingtoolbox.webapp",
        "teqbench/teqbench.app.liists.webapp",
      ],
      schedule: ["before 6am on Wednesday"],
    },
  ],

  // ── Lockfile maintenance ─────────────────────────────────────
  // Refresh the lockfile weekly (no version bumps, just resolution
  // re-pinning). Safe to auto-merge: the bump is purely transitive
  // and gated by full CI.
  lockFileMaintenance: {
    enabled: true,
    automerge: true,
    automergeType: "pr",
    schedule: ["before 9am on Monday"],
  },
};
