import { ConfigEnv, UserConfig } from 'vite';
import { vite_common_vue_config } from '@q-front-npm-configs/vite';
import { antdCssData, baseScssFile } from './config/antd';
import { resolve } from 'path';

function pathResolve(dir: string) {
    return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode }: ConfigEnv):UserConfig => {
    const _common = vite_common_vue_config({ command, mode });
    return {
        ..._common,
        define: {
            cssData: antdCssData
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: baseScssFile
                }
            }
        },
        resolve: {
            alias: {
                '@/': pathResolve('src') + '/',
                '#/': pathResolve('types') + '/'
            }
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis'
                }
            }
        },
        server: {
            host: '0.0.0.0',
            port: 8098,
            strictPort: true,
            proxy: {
                '^/quantum-editor/playground/runtime': {
                    target: 'http://127.0.0.1:8078',
                    changeOrigin: true,
                    prependPath: false
                }
            },
            open: ''
        }
    };
};
