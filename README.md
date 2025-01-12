# @rxlint/eslint-plugin-angular

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/@rxlint/eslint-plugin-angular.svg)](https://www.npmjs.com/package/@rxlint/eslint-plugin-angular)
[![Downloads](http://img.shields.io/npm/dm/@rxlint/eslint-plugin-angular.svg)](https://www.npmjs.com/package/@rxlint/eslint-plugin-angular)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/manbearwiz/eslint-plugin-rxjs-angular/release.yml)](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/actions/workflows/release.yml)

This package is a fork of the package [`cartant/eslint-plugin-rxjs-angular`](https://github.com/cartant/eslint-plugin-rxjs-angular) with trimmed and updated dependencies to work with both eslint 8 and 9.

There is no recommended configuration for this package, as all of the rules are opinionated.

## Installation

Install the ESLint TypeScript parser using npm:

```sh
npm install --save-dev eslint typescript @typescript-eslint/parser @rxlint/eslint-plugin-angular --save-dev
# or
yarn add --dev eslint typescript @typescript-eslint/parser @rxlint/eslint-plugin-angular
```

## Configuration

This plugin should work with both ESLint v8 eslintrc and ESLint v9 eslint.config.js format files.

For ESLint v8, add `@rxlint/angular` to your plugin array:

`.eslintrc.js`

```js
module.exports = {
  files: ["**/*.ts"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: true,
    sourceType: "module"
  },
  plugins: ["@rxlint/angular"],
  rules: {
    "@rxlint/angular/prefer-async-pipe": "error"
  }
};
```

For ESLint v9, import the plugin and map it to a name:

`eslint.config.js`

```js
const rxjsAngular = require("@rxlint/eslint-plugin-angular");

module.exports = [{
  files: ["**/*.ts"],
  plugins: {
    "@rxlint-angular": rxjsAngular
  },
  rules: {
    "@rxlint-angular/prefer-async-pipe": "error"
  }
}];
```

## Rules

The package includes the following rules:

| Rule | Description | Recommended |
| --- | --- | --- |
| [`prefer-async-pipe`](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-async-pipe.md) | Forbids the calling of `subscribe` within Angular components. | No |
| [`prefer-composition`](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-composition.md) | Forbids `subscribe` calls that are not composed within Angular components (and, optionally, within services, directives, and pipes). | No |
| [`prefer-takeuntil`](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-takeuntil.md) | Forbids Calling `subscribe` without an accompanying `takeUntil`. | No |
