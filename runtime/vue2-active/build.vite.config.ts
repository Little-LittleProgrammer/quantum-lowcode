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
import vue from '@vitejs/plugin-vue2';
import externalGlobals from 'rollup-plugin-external-globals';
import postCssPxtorem from 'postcss-pxtorem';
import { resolve } from 'path';

export default defineConfig(({ mode, }) => {
    // TODO 待优化
    if (['config'].includes(mode)) {
        const file = resolve(
            __dirname,
            'node_modules/@quantum-lowcode/ui-vue2/dist/es/config.js'
        );
        return {
            publicDir: '../public',
            build: {
                cssCodeSplit: false,
                target: 'esnext',
                outDir: `../../apps/playground/public/entry/vue2/`,
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
                // legacy({
                //     targets: ['defaults', 'not IE 11'],
                // }),
                externalGlobals(
                    { vue: 'Vue', },
                    { exclude: [`./${mode}/index.html`], }
                )
            ],
            css: {
                postcss: {
                    plugins: [
                        postCssPxtorem({
                            rootValue: 75,
                            propList: ['*'],
                        })
                    ],
                },
            },

            root: `./${mode}/`,

            publicDir: '../public',

            base: `/quantum-lowcode/playground/runtime/vue2/${mode}`,

            build: {
                emptyOutDir: true,
                outDir: path.resolve(
                    process.cwd(),
                    `../../apps/playground/public/runtime/vue2/${mode}`
                ),
                rollupOptions: {
                    external: ['vue'],
                },
            },
        };
    }

    return {};
});
