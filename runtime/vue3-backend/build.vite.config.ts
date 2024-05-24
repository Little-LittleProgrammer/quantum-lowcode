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

import path from 'path';

import { defineConfig } from 'vite';
// import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import externalGlobals from 'rollup-plugin-external-globals';
import {resolve} from 'path';

export default defineConfig(({ mode, }) => {
    // TODO 待优化
    if (['config'].includes(mode)) {
        const file = resolve(__dirname, 'node_modules/@qimao/quantum-ui/dist/es/config.js');
        return {
            publicDir: '../public',
            build: {
                cssCodeSplit: false,
                target: 'esnext',
                outDir: `../../apps/quantum-backend/public/entry/vue3/`,
                lib: {
                    entry: file,
                    name: `quantumCompConfigs`,
                    fileName: 'config',
                    formats: ['umd'],
                },
            },
        };
    }
    if (['page', 'playground'].includes(mode)) {
        return {
            plugins: [
                vue(),
                vueJsx(),
                // legacy({
                //     targets: ['defaults', 'not IE 11'],
                // }),
                externalGlobals({ vue: 'Vue', }, { exclude: [`./${mode}/index.html`], })
            ],

            root: `./${mode}/`,

            publicDir: '../public',

            base: `/quantum-editor/runtime/vue3/${mode}`,

            build: {
                emptyOutDir: true,
                outDir: path.resolve(process.cwd(), `../../apps/quantum-backend/public/runtime/vue3/${mode}`),
                rollupOptions: {
                    output: {
                        manualChunks: {
                            'library': ['@q-front-npm/vue3-antd-pc-ui'],
                        },
                    },
                    external: ['vue'],
                },
            },
        };
    }

    return {};
});
