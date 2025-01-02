# @manbearwiz/eslint-plugin-rxjs-angular

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/@manbearwiz/eslint-plugin-rxjs-angular.svg)](https://www.npmjs.com/package/@manbearwiz/eslint-plugin-rxjs-angular)
[![Downloads](http://img.shields.io/npm/dm/@manbearwiz/eslint-plugin-rxjs-angular.svg)](https://www.npmjs.com/package/@manbearwiz/eslint-plugin-rxjs-angular)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/manbearwiz/eslint-plugin-rxjs-angular/release.yml)](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/actions/workflows/release.yml)

This package is a fork of the package [`cartant/eslint-plugin-rxjs-angular`](https://github.com/cartant/eslint-plugin-rxjs-angular) with trimmed and updated dependencies to work with both eslint 8 and 9.

There is no recommended configuration for this package, as all of the rules are opinionated.

## Install

Install the ESLint TypeScript parser using npm:

```sh
npm install @typescript-eslint/parser --save-dev
```

Install the package using npm:

```sh
npm install @manbearwiz/eslint-plugin-rxjs-angular --save-dev
```

Configure the `parser` and the `parserOptions` for ESLint. Here, I use a `.eslintrc.js` file for the configuration:

```js
const { join } = require("path");
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    project: join(__dirname, "./tsconfig.json"),
    sourceType: "module"
  },
  plugins: ["rxjs-angular"],
  extends: [],
  rules: {
    "rxjs-angular/prefer-async-pipe": "error"
  }
};
```

## Rules

The package includes the following rules:

| Rule | Description | Recommended |
| --- | --- | --- |
| [`prefer-async-pipe`](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-async-pipe.md) | Forbids the calling of `subscribe` within Angular components. | No |
| [`prefer-composition`](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-composition.md) | Forbids `subscribe` calls that are not composed within Angular components (and, optionally, within services, directives, and pipes). | No |
| [`prefer-takeuntil`](https://github.com/manbearwiz/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-takeuntil.md) | Forbids Calling `subscribe` without an accompanying `takeUntil`. | No |
