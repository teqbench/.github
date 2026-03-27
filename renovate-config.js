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
    "teqbench/tbx-models",
    "teqbench/tbx-ngx-http",
    "teqbench/tbx-ngx-errors",
    "teqbench/tbx-mat-icons",
    "teqbench/tbx-mat-severity-icons",
    "teqbench/tbx-mat-notifications",
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

    // GitHub Actions: separate PR with CI prefix
    {
      matchManagers: ["github-actions"],
      groupName: "github-actions",
      commitMessagePrefix: "chore(ci):",
      labels: ["dependencies", "ci"],
    },

    // ── Version restrictions (carried over from Dependabot) ────
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
