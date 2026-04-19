# TeqBench

TeqBench is an open-source collection of [TypeScript ↗](https://www.typescriptlang.org) libraries, [Angular ↗](https://angular.dev) components, and developer tooling published under the `@teqbench` [npm ↗](https://www.npmjs.com) scope. The stack is designed around opinionated, composable primitives for building modern web applications on Angular and Angular Material.

## The Stack

### Core

Foundational contracts shared across every `@teqbench` package.

| Repository | Description |
| :--- | :--- |
| [tbx-models ↗](https://github.com/teqbench/tbx-models) | Generic domain entity interface (`TbxDomainEntityModel<TId>`) consumed by every `@teqbench` package that persists or exchanges entities. |

### Angular Infrastructure

Cross-cutting Angular services and interceptors — error handling, HTTP resilience, observability.

| Repository | Description |
| :--- | :--- |
| [tbx-ngx-errors ↗](https://github.com/teqbench/tbx-ngx-errors) | Multi-layer error handling pipeline: HTTP interceptor, global error handler, and manual logging utility unified through a swappable logger abstraction. |
| [tbx-ngx-http ↗](https://github.com/teqbench/tbx-ngx-http) | Resilient base HTTP service with automatic GET retries, exponential backoff, configurable timeouts, and typed request options. |

### Angular Material Icon System

Abstract icon service contracts and severity-aware resolvers that let you swap SVG, font-ligature, or custom icon strategies without changing consuming code.

| Repository | Description |
| :--- | :--- |
| [tbx-mat-icons ↗](https://github.com/teqbench/tbx-mat-icons) | Abstract icon service contracts for Angular Material with two strategy bases: SVG (via `MatIconRegistry`) and font-ligature. |
| [tbx-mat-severity-theme ↗](https://github.com/teqbench/tbx-mat-severity-theme) | Foundation for severity theming: severity enum, resolver contract, abstract icon service bases, default SVG/font icon sets, shared SCSS colour tokens, and DI configuration. |

### Angular Material UI Components

Opinionated, severity-aware UI primitives.

| Repository | Description |
| :--- | :--- |
| [tbx-mat-notifications ↗](https://github.com/teqbench/tbx-mat-notifications) | Angular notification service built on Material snackbar with severity methods, FIFO queue, signal-based state, optional action button, countdown bar, and pluggable icons. |
| [tbx-mat-banners ↗](https://github.com/teqbench/tbx-mat-banners) | Banner component and service with severity-leveled display, action groups (buttons and form controls), overlay or inline modes, and animations. |
| [tbx-mat-dialogs ↗](https://github.com/teqbench/tbx-mat-dialogs) | Dialog service on Material dialog with typed methods for info, warning, error, confirm, and input dialogs; emphasis-driven styling; pluggable icon resolution. |

### Developer Tooling

Scaffolding, shared workflows, and productivity tooling for contributors and consumers of the stack.

| Repository | Description |
| :--- | :--- |
| [.github ↗](https://github.com/teqbench/.github) | Central reusable [GitHub Actions ↗](https://github.com/features/actions) workflows ([CI ↗](https://github.com/teqbench/.github/blob/main/.github/workflows/ci.yml), release, docs deploy, sync), [Renovate ↗](https://docs.renovatebot.com) configuration, and organization-wide community health files. |
| [teqbench.dev.templates.tbx-package ↗](https://github.com/teqbench/teqbench.dev.templates.tbx-package) | Template repository for scaffolding new `@teqbench` packages with build, lint, test, format, and release plumbing already wired in. |
| [teqbench.dev.misc-skills ↗](https://github.com/teqbench/teqbench.dev.misc-skills) | Reusable [Claude Code ↗](https://claude.com/claude-code) Agent Skills covering documentation, code review, link verification, module boundaries, and TeqBench conventions. |
| [teqbench.dev.shared-skills ↗](https://github.com/teqbench/teqbench.dev.shared-skills) | Bundles [Anthropic ↗](https://www.anthropic.com) skills, Angular skills, and `teqbench.dev.misc-skills` into a single installable surface for `.claude/skills/`. |

## Architecture at a Glance

The Angular Material layer stacks cleanly:

```
tbx-mat-notifications ─┐
tbx-mat-banners ───────┼─── tbx-mat-severity-theme ─── tbx-mat-icons
tbx-mat-dialogs ───────┘
```

- `tbx-mat-icons` is the root abstraction — everything above it consumes its contracts.
- `tbx-mat-severity-theme` adds a severity dimension (levels, icons, colour tokens) on top.
- The UI component packages (`notifications`, `banners`, `dialogs`) consume the severity layer and are independent of each other.

`tbx-ngx-errors`, `tbx-ngx-http`, and `tbx-models` are independent of the Material tree and can be adopted à la carte.

## Package Distribution

All `@teqbench` packages are published to [GitHub Packages ↗](https://github.com/orgs/teqbench/packages). Installing requires a [GitHub ↗](https://github.com) PAT with `read:packages` scope. See any package's `CONTRIBUTING.md` or the [org-wide CONTRIBUTING.md ↗](https://github.com/teqbench/.github/blob/main/CONTRIBUTING.md) for setup details.

## Tech Stack

- **Language** — [TypeScript ↗](https://www.typescriptlang.org)
- **Framework** — [Angular ↗](https://angular.dev) + [Angular Material ↗](https://material.angular.dev)
- **Testing** — [Vitest ↗](https://vitest.dev)
- **Linting** — [ESLint ↗](https://eslint.org) (Flat Config)
- **Formatting** — [Prettier ↗](https://prettier.io)
- **Versioning** — [Release Please ↗](https://github.com/googleapis/release-please) + [Conventional Commits ↗](https://www.conventionalcommits.org)
- **Dependency Updates** — [Renovate ↗](https://docs.renovatebot.com)
- **CI/CD** — Reusable [GitHub Actions ↗](https://github.com/features/actions) workflows from the [.github ↗](https://github.com/teqbench/.github) repository

## Contributing

See the [organization-wide CONTRIBUTING.md ↗](https://github.com/teqbench/.github/blob/main/CONTRIBUTING.md) for branching, commit, PR, and release conventions shared across every repository.

## License

All `@teqbench` packages are licensed under [AGPL-3.0 ↗](https://www.gnu.org/licenses/agpl-3.0.en.html). See the `LICENSE` file in each repository for the full text.
