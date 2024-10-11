import { RuleTester } from '@typescript-eslint/rule-tester';
import { resolve } from 'node:path';
import * as path from 'node:path';

export function createRuleTester({
  filename = resolve('./tests/file.ts'),
  project = resolve('./tsconfig.json'),
}: {
  filename?: string;
  project?: string;
} = {}) {
  return function ruleTester({
    comments = false,
    typeScript = true,
    types = true,
  }: {
    comments?: boolean;
    typeScript?: boolean;
    types?: boolean;
  } = {}) {
    const rootPath = path.join(__dirname, 'fixtures');

    const parserOptions = {
      comments,
      ecmaFeatures: { jsx: true },
      ecmaVersion: 2020,
      project: typeScript && types ? './tsconfig.json' : undefined,
      tsconfigRootDir: rootPath,
      sourceType: 'module',
    } as const;
    const tester = new RuleTester({
      languageOptions: {
        parserOptions,
      },
    });
    // const run = tester.run;
    // tester.run = (name, rule, { invalid = [], valid = [] }) =>
    //   run.call(tester, name, rule, {
    //     invalid: invalid.map((test) => ({ ...test, filename })),
    //     valid: valid.map((test) =>
    //       typeof test === 'string'
    //         ? { code: test, filename }
    //         : { ...test, filename },
    //     ),
    //   });
    return tester;
  };
}

export const ruleTester = createRuleTester({});
