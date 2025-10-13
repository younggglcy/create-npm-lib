# @younggglcy/create-npm-lib

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

younggglcy's custom CLI tool for creating a npm library with a starter template

## Screen Recording

TODO:

## Installation

Optional: install globally

```bash
pnpm add -g @younggglcy/create-npm-lib
```

## Usage

### CLI Usage

```bash
# If it's installed globally
cnl
```

Or just
```bash
pnpm dlx @younggglcy/create-npm-lib
```

See full usage:
```bash
cnl -h
```

### GitHub Repo Setup

GitHub Actions serects are in need to make CI release pipeline work.

- `NPM_TOKEN` for npm package publishing (Consider migrating to [OIDC authentication](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/) in the future)
- (Optional)`GPG_PRIVATE_KEY` and `PASSPHRASE` for GPG commit signing. Just remove the 'Import GPG key' step if you do not want it

## Features

- [Rolldown](https://rolldown.rs/) as bundler
- [Pnpm](https://pnpm.io/) workspace integration
- [TypeScript](https://www.typescriptlang.org/), of course
- CI workflows w/
  - package size report for each pull request
  - publish to npm with provenance, automatically create GitHub release and update CHANGELOG
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
