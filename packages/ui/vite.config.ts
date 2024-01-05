import { ConfigEnv } from 'vite';
import { UserConfig } from 'vite';
import {vite_common_lib_config} from '@q-front-npm-configs/vite';
import {resolve} from 'path';

function pathResolve(dir: string) {
    return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode, }: ConfigEnv):UserConfig => {
    const _common = vite_common_lib_config({
        entry: './index.ts',
        name: 'qmComponents',
        outDir: 'dist',
        isComponentsBuild: true,
        target: 'modules',
        rollupOptions: {
            external: ['vue', '@qimao/quantum-utils', 'monaco-editor'],
        },
        buildOptions: {
            cssCodeSplit: true,
            minify: true,
        },
        dtsOptions: {
            entryRoot: resolve(__dirname),
        },
    });
    return {
        ...(_common as any),
        // css: {
        //     preprocessorOptions: {
        //         scss: {
        //             additionalData: "@use 'sass:math'; @import '@q-front-npm/shared/style/base/base.scss'; @import '@q-front-npm/shared/style/base/mixin.scss';",
        //         },
        //     },
        // },
        resolve: {
            alias: process.env.NODE_ENV === 'production' ? [] : [
                { find: /^@\//, replacement: pathResolve('./src/'), },
                { find: /^@qimao\/quantum-utils/, replacement: pathResolve('../utils/index.ts'), },
                { find: /^@qimao\/quantum-core/, replacement: pathResolve('../core/index.ts'), },
                { find: /^@qimao\/quantum-sandbox/, replacement: pathResolve('../sandbox/index.ts'), },
                { find: /^@qimao\/quantum-schemas/, replacement: pathResolve('../schemas/index.ts'), }
            ],
        },
    };
};
