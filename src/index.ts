import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import rules from './rules';

export = {
  rules,
} satisfies Linter.Plugin;
