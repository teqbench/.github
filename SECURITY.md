# Security Policy

This security policy is the organization-wide default for every public repository under [github.com/teqbench ↗](https://github.com/teqbench) that does not define its own `SECURITY.md`.

## Supported Versions

Each TeqBench repository supports the latest released version only. Older releases are not patched.

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |
| older   | ❌        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Use GitHub's private vulnerability reporting against the **affected repository**:

1. Navigate to the repository on [GitHub ↗](https://github.com).
2. Go to **Security → Advisories → Report a vulnerability**.

Direct link for this repository: [github.com/teqbench/.github/security/advisories/new ↗](https://github.com/teqbench/.github/security/advisories/new).

If GitHub's private reporting is unavailable to you, email [info@teqbench.dev ↗](mailto:info@teqbench.dev) as a fallback.

Please include as much of the following as possible:

- Type of vulnerability (e.g. XSS, dependency with a known CVE, credential exposure)
- Affected repository, file(s), and line number(s)
- Steps to reproduce or proof-of-concept
- Potential impact

You will receive a response within **5 business days**. If the report is confirmed, a fix will be prioritised and a coordinated disclosure timeline agreed upon.

## Dependency Vulnerabilities

TeqBench [npm ↗](https://www.npmjs.com) package repositories run `npm audit` on every CI run via the shared [ci.yml ↗](.github/workflows/ci.yml) workflow. High and critical severity advisories fail the build and must be resolved before merging.

Known upstream advisories that cannot be patched locally are tracked in the centralized allow-list at [`.github/audit-allow-list.json` ↗](.github/audit-allow-list.json). The CI workflow fetches this list at runtime and suppresses only the listed advisory IDs.

To check locally:

```bash
npm audit --audit-level=high
```

If you discover a dependency-related vulnerability that `npm audit` does not flag, please report it via GitHub Security Advisories as described above.
