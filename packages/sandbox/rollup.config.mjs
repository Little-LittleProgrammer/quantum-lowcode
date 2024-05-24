import { rollup_commpn_lib_config } from '@quantum-design-configs/rollup';
import { createRequire } from 'node:module';
import alias from '@rollup/plugin-alias';
import {resolve} from 'path';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

function pathResolve(dir) {
    return resolve(process.cwd(), '.', dir);
}

const result = rollup_commpn_lib_config('quantum-sandbox', {
    external: ['@quantum-lowcode/utils', '@quantum-lowcode/core'],
    plugins: [alias({
        entries: process.env.TYPES === 'true' ? [] : [
            { find: /^@quantum-lowcode\/utils/, replacement: pathResolve('../utils/index.ts'), },
            { find: /^@quantum-lowcode\/core/, replacement: pathResolve('../core/index.ts'), },
            { find: /^@quantum-lowcode\/schemas/, replacement: pathResolve('../schemas/index.ts'), }
        ],
    })],
}, pkg.version);

export default result;
