import { rollup_commpn_lib_config } from '@q-front-npm-configs/rollup';
import { createRequire } from 'node:module';
import alias from '@rollup/plugin-alias';
import {resolve} from 'path';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

function pathResolve(dir) {
    return resolve(process.cwd(), '.', dir);
}

const result = rollup_commpn_lib_config('quantum-core', {
    external: ['@qimao/quantum-utils', 'lodash-es'],
    plugins: [alias({
        entries: process.env.NODE_ENV === 'production' ? [] : [
            { find: /^@qiamo\/quantum-utils/, replacement: pathResolve('../utils/src/index.ts') }
        ]
    })]
}, pkg.version);

export default result;
