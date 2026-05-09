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
  baseBranchPatterns: ["dev"],

  // ── Commit & PR conventions ──────────────────────────────────
  commitMessagePrefix: "chore(deps):",
  labels: ["dependencies"],
  gitAuthor:
    "teqbench-automation[bot] <263536528+teqbench-automation[bot]@users.noreply.github.com>",

  // ── Schedule ─────────────────────────────────────────────────
  schedule: ["before 9am on Monday"],

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
  packageRules: [
    // Internal @teqbench packages: auto-merge + group
    {
      matchPackageNames: ["/^@teqbench//"],
      automerge: true,
      automergeType: "pr",
      groupName: "teqbench packages",
      // Override schedule for internal deps — update ASAP
      schedule: ["at any time"],
    },

    // Tooling: group into one PR
    {
      matchPackageNames: [
        "prettier",
        "husky",
        "lint-staged",
        "vitest",
        "/^prettier-/",
        "/^@prettier//",
        "/^@vitest//",
        "/^eslint-/",
        "/^@eslint//",
        "/^typescript-eslint/",
      ],
      groupName: "tooling",
    },


    // TypeScript: separate PR
    {
      matchPackageNames: ["typescript"],
      groupName: "typescript",
    },

    // GitHub Actions: separate PR with CI prefix.
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
  ],
};
