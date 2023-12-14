import { rollup_commpn_lib_config } from '@q-front-npm-configs/rollup';
import { createRequire } from 'node:module';
import alias from '@rollup/plugin-alias';
import {resolve} from 'path';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

function pathResolve(dir) {
    return resolve(process.cwd(), '.', dir);
}

const result = rollup_commpn_lib_config('quantum-sandbox', {
    external: ['@qimao/quantum-utils', '@qimao/quantum-core'],
    plugins: [alias({
        entries: process.env.NODE_ENV === 'production' ? [] : [
            { find: /^@qimao\/quantum-utils/, replacement: pathResolve('../utils/index.ts'), },
            { find: /^@qimao\/quantum-core/, replacement: pathResolve('../core/index.ts'), },
            { find: /^@qimao\/quantum-schemas/, replacement: pathResolve('../schemas/index.ts'), }
        ],
    })],
}, pkg.version);

export default result;
