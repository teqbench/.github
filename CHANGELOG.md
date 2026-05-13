# Changelog

## [4.1.4](https://github.com/teqbench/.github/compare/v4.1.3...v4.1.4) (2026-05-13)


### Bug Fixes

* **renovate:** allow GH_PACKAGES_TOKEN through action env-regex ([12b93b0](https://github.com/teqbench/.github/commit/12b93b0709fd4e797d3f6ab1ba32fba8a542a20a))
* **renovate:** wire GitHub Packages token through action env-regex ([c95498c](https://github.com/teqbench/.github/commit/c95498c16f2dbbde6cd87272853dfd05d418ade0))

## [4.1.3](https://github.com/teqbench/.github/compare/v4.1.2...v4.1.3) (2026-05-13)


### Bug Fixes

* **renovate:** use workflow GITHUB_TOKEN for GitHub Packages auth ([496e635](https://github.com/teqbench/.github/commit/496e6353987b0f68d3479f6d9ea49c0c70de4e1f))
* **renovate:** use workflow GITHUB_TOKEN for GitHub Packages auth ([f36f6b6](https://github.com/teqbench/.github/commit/f36f6b66022b902c2fda4342af55e23098b41e47))

## [4.1.2](https://github.com/teqbench/.github/compare/v4.1.1...v4.1.2) (2026-05-13)


### Bug Fixes

* **renovate:** correct GitHub Packages hostRules matchHost format ([f94a847](https://github.com/teqbench/.github/commit/f94a8476691b7b8a885926a9fa0b9056b6a0a3b0))
* **renovate:** correct GitHub Packages hostRules matchHost format ([873f4a3](https://github.com/teqbench/.github/commit/873f4a3eea61cdf6c5e52b573083bff7bbf68244))

## [4.1.1](https://github.com/teqbench/.github/compare/v4.1.0...v4.1.1) (2026-05-13)


### Bug Fixes

* **renovate:** cap typescript at &lt;6.0.0 and authenticate to GitHub Packages ([bfed8e7](https://github.com/teqbench/.github/commit/bfed8e701902146b39b84e0c7aae0a4671cb2cf9))
* **renovate:** cap typescript at &lt;6.0.0 and authenticate to GitHub Packages ([45ac963](https://github.com/teqbench/.github/commit/45ac963e2174756b04f8a9c8664cd74b033b6a05))

## [4.1.0](https://github.com/teqbench/.github/compare/v4.0.0...v4.1.0) (2026-05-11)


### Features

* **renovate:** enable submodule cascade and webapp daily batching ([76d5ed2](https://github.com/teqbench/.github/commit/76d5ed205c850e51cff74d8614b714cb8b4b1ae6))
* **renovate:** enable submodule cascade and webapp daily batching ([4db8b1d](https://github.com/teqbench/.github/commit/4db8b1d65353c3aeba536c7226f0a098db2cd273))

## [4.0.0](https://github.com/teqbench/.github/compare/v3.0.1...v4.0.0) (2026-05-11)


### ⚠ BREAKING CHANGES

* **ci:** The teqbench/.github/.github/workflows/sync.yml reusable workflow is removed. Any external caller referencing it will fail. All 15 internal consumer repos have already had their sync.yml callers removed in advance of this change.

### Miscellaneous Chores

* **ci:** remove deprecated sync.yml workflow ([de84649](https://github.com/teqbench/.github/commit/de8464953ae79dad51c5d2926df5083243ed2452))

## [3.0.1](https://github.com/teqbench/.github/compare/v3.0.0...v3.0.1) (2026-05-11)


### Bug Fixes

* **ci:** remove GitFlow source-branch guard ([071169c](https://github.com/teqbench/.github/commit/071169c0b1a26960ba2dd31f87b122d0e94aba56))
* **ci:** remove GitFlow source-branch guard ([621be79](https://github.com/teqbench/.github/commit/621be79908fdbeb7c4064b3391627417a6a3d759))

## [3.0.0](https://github.com/teqbench/.github/compare/v2.10.0...v3.0.0) (2026-05-11)


### ⚠ BREAKING CHANGES

* **renovate:** Renovate now opens PRs against main. Consumer repos need to follow up by removing sync.yml callers and retiring their dev branches as part of the GitHub Flow migration.

### Features

* **renovate:** adopt GitHub Flow ([d0d1224](https://github.com/teqbench/.github/commit/d0d1224bda1a892e2801458bb5d8c3b7b345bd75))

## [2.10.0](https://github.com/teqbench/.github/compare/v2.9.3...v2.10.0) (2026-05-11)


### Features

* **renovate:** conservative auto-merge tier + bot rename ([779070d](https://github.com/teqbench/.github/commit/779070d8771d21d9616a3ee9c4c513811c59b27d))
* **renovate:** introduce conservative auto-merge tier and rename bot identity ([f08eb35](https://github.com/teqbench/.github/commit/f08eb35ebcdd13a819fe7757fa1a55c2717368f2))

## [2.9.3](https://github.com/teqbench/.github/compare/v2.9.2...v2.9.3) (2026-05-09)


### Bug Fixes

* **renovate:** drop global Monday schedule + redundant per-rule overrides ([5c77652](https://github.com/teqbench/.github/commit/5c77652a704bd58bc1a6894aba72855dfed6e595))
* **renovate:** drop global Monday schedule + redundant per-rule overrides ([dd71bd9](https://github.com/teqbench/.github/commit/dd71bd9dc1a56b326579e101a66cf5012656083f))

## [2.9.2](https://github.com/teqbench/.github/compare/v2.9.1...v2.9.2) (2026-05-09)


### Bug Fixes

* **renovate:** disable pinDigests for teqbench/.github reusable workflows ([46b91da](https://github.com/teqbench/.github/commit/46b91daf4162beb1c8d21578c544e33a8497ea13))
* **renovate:** disable pinDigests for teqbench/.github reusable workflows ([794e8ac](https://github.com/teqbench/.github/commit/794e8acb27fba86801f4e81e26a6d47df1c3aa57))

## [2.9.1](https://github.com/teqbench/.github/compare/v2.9.0...v2.9.1) (2026-05-09)


### Bug Fixes

* **renovate:** correct typo and complete repositories[] array ([6d84d8b](https://github.com/teqbench/.github/commit/6d84d8b57a1f372c7b020ab10369245a25d476bd))

## [2.9.0](https://github.com/teqbench/.github/compare/v2.8.1...v2.9.0) (2026-05-09)


### Features

* **ci:** add build toggle + self-ci.yml so .github satisfies org required check ([6ceefbb](https://github.com/teqbench/.github/commit/6ceefbb619d4ead567a62edfa40fbc94d0c01b8c))
* **ci:** adopt self-ci.yml thin caller for the org required check ([97c435f](https://github.com/teqbench/.github/commit/97c435f4ef6347713289eb5e62ccfb89bcfc108a)), closes [#28](https://github.com/teqbench/.github/issues/28)


### Bug Fixes

* **ci:** add build toggle to ci.yml ([fa5d85e](https://github.com/teqbench/.github/commit/fa5d85e374fe886bb7380d786fbbc67063d058a1)), closes [#28](https://github.com/teqbench/.github/issues/28)
* **ci:** add npm toggle to gate every npm-dependent step ([2f35eef](https://github.com/teqbench/.github/commit/2f35eef0730f384f5f988b2dba672c489e36991e)), closes [#28](https://github.com/teqbench/.github/issues/28)
* **ci:** self-ci.yml uses npm: false; remove placeholder .nvmrc ([223693b](https://github.com/teqbench/.github/commit/223693bd35268ebe174ef05e226f2838901ecbfa)), closes [#28](https://github.com/teqbench/.github/issues/28)

## [2.8.1](https://github.com/teqbench/.github/compare/v2.8.0...v2.8.1) (2026-05-09)


### Bug Fixes

* **ci:** export NPM_TOKEN alongside NODE_AUTH_TOKEN for npm steps ([94cfa19](https://github.com/teqbench/.github/commit/94cfa193e9080f0e5e78630b81f6091e1881d27d))
* **ci:** export NPM_TOKEN alongside NODE_AUTH_TOKEN for npm steps ([9ccb5a2](https://github.com/teqbench/.github/commit/9ccb5a2504ad3d8614f53290699758030124fc84))

## [2.8.0](https://github.com/teqbench/.github/compare/v2.7.2...v2.8.0) (2026-05-09)


### Features

* **ci:** add typecheck/lint/format/test toggles to ci.yml; remove webapp-ci.yml ([8c2c8a2](https://github.com/teqbench/.github/commit/8c2c8a2739d7de3df44d59fe616b414dad082717))
* **ci:** add typecheck/lint/format/test toggles, remove webapp-ci.yml ([cf8591a](https://github.com/teqbench/.github/commit/cf8591ad4fb962b61791791b689e84b7d522ff6c))

## [2.7.2](https://github.com/teqbench/.github/compare/v2.7.1...v2.7.2) (2026-05-09)


### Bug Fixes

* **ci:** rename webapp-ci.yml job to "Lint & Typecheck" ([9dbd292](https://github.com/teqbench/.github/commit/9dbd292c98f4a79e1d699a2f8091c0f45a15a6e2))

## [2.7.1](https://github.com/teqbench/.github/compare/v2.7.0...v2.7.1) (2026-05-09)


### Bug Fixes

* **ci:** drop format:check from webapp-ci.yml ([bb05201](https://github.com/teqbench/.github/commit/bb05201e8ffe403d59785d27ed390d8a3682a71c))

## [2.7.0](https://github.com/teqbench/.github/compare/v2.6.0...v2.7.0) (2026-05-09)


### Features

* **ci:** add webapp-ci.yml reusable for non-package consumers ([bc6b790](https://github.com/teqbench/.github/commit/bc6b790f0e91a6d9d24cc2f617f1e56c203cc4b0))

## [2.6.0](https://github.com/teqbench/.github/compare/v2.5.0...v2.6.0) (2026-05-09)


### Features

* add centralized reusable workflows and Renovate config ([41aa1ed](https://github.com/teqbench/.github/commit/41aa1ed18e86374cf2dd66c850016b5d510d77d3))
* **ci:** add actionlint self-CI and docs-deploy caller template ([8b64c9b](https://github.com/teqbench/.github/commit/8b64c9bb76b66d84386a14fd3c99997f2a913efd))
* **ci:** add centralized audit allow-list for known upstream advisories ([559f716](https://github.com/teqbench/.github/commit/559f716c07e6340217880f620c30fc8036fc7375))
* **ci:** add check-readme-drift input to opt out ([10497d9](https://github.com/teqbench/.github/commit/10497d9bebbc2d58875fba591f1fd934769785d8))
* **ci:** add noop-ci reusable workflow, CLAUDE.md, and update README ([68b0ba5](https://github.com/teqbench/.github/commit/68b0ba5722ac5a0123c03e9fea0d924cb5796afb))
* **ci:** add noop-ci reusable workflow, CLAUDE.md, and update README ([08b7fa5](https://github.com/teqbench/.github/commit/08b7fa5d7c7cf37f0fd2e38993d1f5ef01d11054))
* **community:** add org-wide community health files and profile README ([e3f5c2f](https://github.com/teqbench/.github/commit/e3f5c2f88c3167477a50c06891a240716c6b3b1c))
* prep for public release + workflow hardening ([c90c31a](https://github.com/teqbench/.github/commit/c90c31a6ae01d7fdc1aabffed82f264c047808b9))
* **release:** add publish input to opt out of npm publish ([4713b8f](https://github.com/teqbench/.github/commit/4713b8f8a0ba456355a5a275829cf9f16f16b8c0))
* **release:** add publish input to opt out of npm publish ([b7e6735](https://github.com/teqbench/.github/commit/b7e673537f31d6a4f49c3bfb378301ec5f47691f))
* **release:** adopt release-please for .github repo (seed 2.5.0) ([574b6ce](https://github.com/teqbench/.github/commit/574b6cecb0f17b63e87d244f93db0e0d6190261a))
* **release:** adopt release-please for .github repo, seeded at 2.5.0 ([803fea5](https://github.com/teqbench/.github/commit/803fea5152245be3b320b52adad7ef873e73048d))
* **release:** generate docs/api.json + compatibility.json + links.json pre-publish ([2fef143](https://github.com/teqbench/.github/commit/2fef1434f04d2100cc1eaf894a80b304cfe2fefb))
* **release:** generate docs/api.json, compatibility.json, links.json pre-publish ([c645e47](https://github.com/teqbench/.github/commit/c645e470504072c4b8285aabf25159a95c432da1))
* **release:** rename docs/links.json → docs/metadata.json and widen contents ([7e82625](https://github.com/teqbench/.github/commit/7e8262511596da0d49874b35fb7af989732d70a3))
* **release:** rename docs/links.json to docs/metadata.json and widen contents ([4f04589](https://github.com/teqbench/.github/commit/4f0458982a3421c85f204422dfc6a5a57777532d))
* **workflows:** add reusable Docs Deploy workflow ([740c2f6](https://github.com/teqbench/.github/commit/740c2f65f38900722ba8679bd25aa28676465006))
* **workflows:** add reusable Docs Deploy workflow for Storybook → GitHub Pages ([5d58ca8](https://github.com/teqbench/.github/commit/5d58ca85edd0e4dc6c869638dbe089ce5d2e1762))


### Bug Fixes

* **ci:** handle Unknown coverage percentage gracefully ([6ae1966](https://github.com/teqbench/.github/commit/6ae1966fbe5e4116375ba43627f1b95a971ad79b))
* **ci:** pass github.head_ref through env var to avoid script injection ([5db154a](https://github.com/teqbench/.github/commit/5db154a84aeca9c44dae7f951aa17f9428246286))
* **ci:** quote variables in coverage/version badge scripts (shellcheck SC2086) ([899a3f6](https://github.com/teqbench/.github/commit/899a3f6b9e0bbc0631dee057290d8a4025930dd2))
* **ci:** support linked technology names in README version drift check ([c63c925](https://github.com/teqbench/.github/commit/c63c925b2259b2d65106945b05316efc3ffffd03))
* **ci:** use authenticated GitHub API to fetch audit allow-list ([71b5505](https://github.com/teqbench/.github/commit/71b5505d73491168efd86f1e106a8afb10cce042))
* **noop-ci:** use GIST_TOKEN for badge auth ([a87e519](https://github.com/teqbench/.github/commit/a87e51924c1f4fe6aa6f77ab0ae641a30a484157))
* **noop-ci:** use GIST_TOKEN for badge auth instead of app token ([e7701f7](https://github.com/teqbench/.github/commit/e7701f7ea8df9ff436e4fd2277884cee968a0fa3))
