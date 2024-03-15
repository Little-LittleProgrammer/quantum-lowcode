import { ConfigEnv, UserConfig } from 'vite';
import { vite_common_vue_config } from '@q-front-npm-configs/vite';
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
        base: '/quantum-editor/',
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
                { find: /^@qimao\/quantum-editor\/dist\/style.css/, replacement: pathResolve('../../packages/editor/dist/style.css'), },
                { find: /^@qimao\/quantum-utils/, replacement: pathResolve('../../packages/utils/index.ts'), },
                { find: /^@qimao\/quantum-editor/, replacement: pathResolve('../../packages/editor/index.ts'), },
                { find: /^@qimao\/quantum-core/, replacement: pathResolve('../../packages/core/index.ts'), },
                { find: /^@qimao\/quantum-sandbox/, replacement: pathResolve('../../packages/sandbox/index.ts'), }
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
                '^/quantum-editor/runtime/vue2': {
                    target: 'http://127.0.0.1:8178',
                    changeOrigin: true,
                    prependPath: false,
                },
                '^/quantum-editor/runtime/vue3': {
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
            open: '/quantum-editor/',
        },
    };
};
