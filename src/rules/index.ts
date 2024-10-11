import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import preferAsyncPipe from './prefer-async-pipe';
import preferComposition from './prefer-composition';
import preferTakeuntil from './prefer-takeuntil';

const rules = {
  'prefer-async-pipe': preferAsyncPipe,
  'prefer-composition': preferComposition,
  'prefer-takeuntil': preferTakeuntil,
} satisfies Linter.PluginRules;

export = rules;
