import { ESLintUtils } from '@typescript-eslint/utils';

export const ruleCreator = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/cartant/eslint-plugin-rxjs-angular/tree/main/docs/rules/${name}.md`,
);
