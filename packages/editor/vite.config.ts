/*
 * Tencent is pleased to support the open source community by making QuantumEditor available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConfigEnv, UserConfig, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import pkg from './package.json';
import {resolve} from 'path';
import { componentPlugin } from './plugins/component';
function pathResolve(dir) {
    return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode, }: ConfigEnv):UserConfig => {
    const plugins = [vue(), componentPlugin];
    return {
        plugins: plugins,

        esbuild: {
            drop: ['console', 'debugger'],
        },

        resolve: {
            alias: process.env.NODE_ENV === 'production' ? [] : [
                { find: /^@\//, replacement: pathResolve('./src/'), },
                { find: /^@quantum-lowcode\/utils/, replacement: pathResolve('../utils/index.ts'), },
                { find: /^@quantum-lowcode\/core/, replacement: pathResolve('../core/index.ts'), },
                { find: /^@quantum-lowcode\/sandbox/, replacement: pathResolve('../sandbox/index.ts'), },
                { find: /^@quantum-lowcode\/schemas/, replacement: pathResolve('../schemas/index.ts'), }
            ],
        },

        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },

        build: {
            cssCodeSplit: false,
            sourcemap: false,
            minify: false,
            target: 'esnext',

            lib: {
                entry: './index.ts',
                name: 'QuantumEditor',
                fileName: 'quantum-editor',
            },

            rollupOptions: {
                // 确保外部化处理那些你不想打包进库的依赖
                external(id: string) {
                    return Object.keys(pkg.dependencies).some((k) => new RegExp(`^${k}`).test(id));
                },

                output: {
                    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        vue: 'Vue',
                        'ant-design-vue': 'AntDeisgnVue',
                    },
                },
            },
        },
    };
};
