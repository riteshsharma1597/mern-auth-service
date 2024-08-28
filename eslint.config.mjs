// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    { ignores: ['node_modules/*', 'dist/*', '**/*.spec.ts', 'tests/'] },
    {
        rules: {
            // semi: ['error', 'never']
            'no-console': ['error'],
            'dot-notation': ['error'],
        },
    },
);
