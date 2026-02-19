import type { UserConfig } from 'vitest/config';

export default {
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/rules/index.ts', 'src/utils/index.ts'],
      thresholds: {
        statements: 94.16,
        branches: 80.81,
        functions: 100,
        lines: 94.06,
        autoUpdate: true,
      },
    },
  },
} satisfies UserConfig;
