import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config({ ignores: ['dist/**', 'src/generated/**', 'node_modules/**'] }, eslint.configs.recommended, ...tseslint.configs.recommended, { languageOptions: { globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', Express: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', jest: 'readonly', beforeAll: 'readonly', afterAll: 'readonly', beforeEach: 'readonly' } } });
