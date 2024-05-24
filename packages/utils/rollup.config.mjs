import { rollup_commpn_lib_config } from '@quantum-design-configs/rollup';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const result = rollup_commpn_lib_config('quantum-utils', {
    external: ['@quantum-design/utils', 'lodash-es'],
}, pkg.version);

export default result;
