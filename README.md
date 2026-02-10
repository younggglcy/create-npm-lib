# @younggglcy/create-npm-lib

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

younggglcy's custom CLI tool for creating a npm library with a starter template

## Screen Recording

TODO:

## Installation

Optional: install globally

```bash
bun add -g @younggglcy/create-npm-lib
```

## Usage

### CLI Usage

```bash
# If it's installed globally
cnl
```

Or just
```bash
bunx @younggglcy/create-npm-lib
```

See full usage:
```bash
cnl -h
```

### GitHub Repo Setup

The CI release pipeline uses [npm OIDC trusted publishing](https://docs.npmjs.com/generating-provenance-statements#publishing-packages-with-provenance-via-github-actions) — no `NPM_TOKEN` secret needed. Configure trusted publishing on npmjs.com for your package to enable provenance-based publishing.

## Features

- [Rolldown](https://rolldown.rs/) as bundler
- [Bun](https://bun.sh/) workspace integration
- [TypeScript](https://www.typescriptlang.org/), of course
- CI workflows w/
  - package size report for each pull request
  - publish to npm with provenance
  - semantic pull request check
  - unit tests
  - renovate that keeps your dependencies fresh
- [Husky](https://github.com/typicode/husky) & [lint-staged](https://github.com/lint-staged/lint-staged) & [antfu's eslint config preset](https://github.com/antfu/eslint-config)

## License

[MIT](./LICENSE) License © 2025-PRESENT [younggglcy](https://github.com/younggglcy)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@younggglcy/create-npm-lib.svg
[npm-version-href]: https://npmjs.com/package/@younggglcy/create-npm-lib
[license-src]: https://img.shields.io/github/license/younggglcy/create-npm-lib.svg
[license-href]: https://github.com/younggglcy/create-npm-lib/blob/main/LICENSE
