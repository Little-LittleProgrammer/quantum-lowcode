import { ConfigEnv, UserConfig } from 'vite';
import { vite_common_vue_config } from '@quantum-design-configs/vite';
import { antdCssData, baseScssFile } from './config/antd';
import { resolve } from 'path';

function pathResolve(dir: string) {
    console.log(process.cwd());
    return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode, }: ConfigEnv):UserConfig => {
    const _common = vite_common_vue_config({ command, mode, });
    return {
        ..._common,
        base: '/quantum-lowcode/playground/',
        define: {
            cssData: antdCssData,
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: baseScssFile,
                },
            },
        },
        resolve: {
            alias: process.env.NODE_ENV === 'production' ? [
                { find: /^@\//, replacement: pathResolve('./src/') + '/', }
            ] : [
                { find: /^@\//, replacement: pathResolve('./src/') + '/', },
                { find: /^@quantum-lowcode\/editor\/dist\/style.css/, replacement: pathResolve('../../packages/editor/dist/style.css'), },
                { find: /^@quantum-lowcode\/utils/, replacement: pathResolve('../../packages/utils/index.ts'), },
                { find: /^@quantum-lowcode\/editor\/dist\/quantum-editor.css/, replacement: pathResolve('../../packages/editor/dist/quantum-editor.css'), },
                { find: /^@quantum-lowcode\/editor/, replacement: pathResolve('../../packages/editor/index.ts'), },
                { find: /^@quantum-lowcode\/core/, replacement: pathResolve('../../packages/core/index.ts'), },
                { find: /^@quantum-lowcode\/sandbox/, replacement: pathResolve('../../packages/sandbox/index.ts'), }
            ],
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },
        server: {
            host: '0.0.0.0',
            port: 8198,
            strictPort: true,
            proxy: {
                '^/quantum-lowcode/playground/runtime/vue2': {
                    target: 'http://127.0.0.1:8178',
                    changeOrigin: true,
                    prependPath: false,
                },
                '^/quantum-lowcode/playground/runtime/vue3': {
                    target: 'http://127.0.0.1:8179',
                    changeOrigin: true,
                    prependPath: false,
                },
                '/api': {
                    target: 'https://front-ssg-platform.qmniu.com',
                    changeOrigin: true,
                    ws: true,
                    secure: false,
                },
            },
            open: '/quantum-lowcode/playground/',
        },
    };
};
