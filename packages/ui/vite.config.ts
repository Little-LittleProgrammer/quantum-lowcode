import { ConfigEnv } from 'vite';
import { UserConfig } from 'vite';
import {vite_common_lib_config} from '@quantum-design-configs/vite';
import {resolve} from 'path';

function pathResolve(dir: string) {
    return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode, }: ConfigEnv):UserConfig => {
    const _common = vite_common_lib_config({
        entry: ['./index.ts', './src/config.ts'],
        name: 'qmComponents',
        outDir: 'dist',
        isComponentsBuild: true,
        target: 'modules',
        rollupOptions: {
            external: ['vue', '@quantum-lowcode/utils', '@quantum-lowcode/core', '@quantum-lowcode/schemas', '@quantum-design/vue3-antd-pc-ui'],
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
        //             additionalData: "@use 'sass:math'; @import '@quantum-design/shared/style/base/base.scss'; @import '@quantum-design/shared/style/base/mixin.scss';",
        //         },
        //     },
        // },
        resolve: {
            alias: process.env.NODE_ENV === 'production' ? [] : [
                { find: /^@\//, replacement: pathResolve('./src/'), },
                { find: /^@quantum-lowcode\/utils/, replacement: pathResolve('../utils/index.ts'), },
                { find: /^@quantum-lowcode\/core/, replacement: pathResolve('../core/index.ts'), },
                { find: /^@quantum-lowcode\/sandbox/, replacement: pathResolve('../sandbox/index.ts'), },
                { find: /^@quantum-lowcode\/schemas/, replacement: pathResolve('../schemas/index.ts'), }
            ],
        },
    };
};
