# TeqBench

TeqBench is an open-source collection of [TypeScript ↗](https://www.typescriptlang.org) libraries, [Angular ↗](https://angular.dev) components, and developer tooling published under the `@teqbench` [npm ↗](https://www.npmjs.com) scope. The stack is designed around opinionated, composable primitives for building modern web applications on Angular and Angular Material.

## The Stack

### Core

Foundational contracts shared across every `@teqbench` package.

<dl>
  <dt><a href="https://github.com/teqbench/tbx-models">tbx-models ↗</a></dt>
  <dd>Generic domain entity interface (<code>TbxDomainEntityModel&lt;TId&gt;</code>) consumed by every <code>@teqbench</code> package that persists or exchanges entities.</dd>
</dl>

### Angular Infrastructure

Cross-cutting Angular services and interceptors — error handling, HTTP resilience, observability.

<dl>
  <dt><a href="https://github.com/teqbench/tbx-ngx-errors">tbx-ngx-errors ↗</a></dt>
  <dd>Multi-layer error handling pipeline: HTTP interceptor, global error handler, and manual logging utility unified through a swappable logger abstraction.</dd>

  <dt><a href="https://github.com/teqbench/tbx-ngx-http">tbx-ngx-http ↗</a></dt>
  <dd>Resilient base HTTP service with automatic GET retries, exponential backoff, configurable timeouts, and typed request options.</dd>
</dl>

### Angular Material Icon System

Abstract icon service contracts and severity-aware resolvers that let you swap SVG, font-ligature, or custom icon strategies without changing consuming code.

<dl>
  <dt><a href="https://github.com/teqbench/tbx-mat-icons">tbx-mat-icons ↗</a></dt>
  <dd>Abstract icon service contracts for Angular Material with two strategy bases: SVG (via <code>MatIconRegistry</code>) and font-ligature.</dd>

  <dt><a href="https://github.com/teqbench/tbx-mat-severity-theme">tbx-mat-severity-theme ↗</a></dt>
  <dd>Foundation for severity theming: severity enum, resolver contract, abstract icon service bases, default SVG/font icon sets, shared SCSS colour tokens, and DI configuration.</dd>
</dl>

### Angular Material UI Components

Opinionated, severity-aware UI primitives.

<dl>
  <dt><a href="https://github.com/teqbench/tbx-mat-notifications">tbx-mat-notifications ↗</a></dt>
  <dd>Angular notification service built on Material snackbar with severity methods, FIFO queue, signal-based state, optional action button, countdown bar, and pluggable icons.</dd>

  <dt><a href="https://github.com/teqbench/tbx-mat-banners">tbx-mat-banners ↗</a></dt>
  <dd>Banner component and service with severity-leveled display, action groups (buttons and form controls), overlay or inline modes, and animations.</dd>

  <dt><a href="https://github.com/teqbench/tbx-mat-dialogs">tbx-mat-dialogs ↗</a></dt>
  <dd>Dialog service on Material dialog with typed methods for info, warning, error, confirm, and input dialogs; emphasis-driven styling; pluggable icon resolution.</dd>
</dl>

### Developer Tooling

Scaffolding, shared workflows, and productivity tooling for contributors and consumers of the stack.

<dl>
  <dt><a href="https://github.com/teqbench/.github">.github ↗</a></dt>
  <dd>Central reusable <a href="https://github.com/features/actions">GitHub Actions ↗</a> workflows (<a href="https://github.com/teqbench/.github/blob/main/.github/workflows/ci.yml">CI ↗</a>, release, docs deploy, sync), <a href="https://docs.renovatebot.com">Renovate ↗</a> configuration, and organization-wide community health files.</dd>

  <dt><a href="https://github.com/teqbench/teqbench.dev.templates.tbx-package">teqbench.dev.templates.tbx-package ↗</a></dt>
  <dd>Template repository for scaffolding new <code>@teqbench</code> packages with build, lint, test, format, and release plumbing already wired in.</dd>

  <dt><a href="https://github.com/teqbench/teqbench.dev.misc-skills">teqbench.dev.misc-skills ↗</a></dt>
  <dd>Reusable <a href="https://claude.com/claude-code">Claude Code ↗</a> Agent Skills covering documentation, code review, link verification, module boundaries, and TeqBench conventions.</dd>

  <dt><a href="https://github.com/teqbench/teqbench.dev.shared-skills">teqbench.dev.shared-skills ↗</a></dt>
  <dd>Bundles <a href="https://www.anthropic.com">Anthropic ↗</a> skills, Angular skills, and <code>teqbench.dev.misc-skills</code> into a single installable surface for <code>.claude/skills/</code>.</dd>
</dl>

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
