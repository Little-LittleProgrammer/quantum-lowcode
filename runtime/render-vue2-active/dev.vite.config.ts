/*
 * Tencent is pleased to support the open source community by making TMagicEditor available.
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

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import {resolve} from 'path';
import postCssPxtorem from 'postcss-pxtorem';

function pathResolve(dir: string) {
    return resolve(process.cwd(), '.', dir);
}

export default defineConfig({
    plugins: [
        vue()
    ],

    resolve: {
        alias: process.env.NODE_ENV === 'production' ? [] : [
            { find: /^@\//, replacement: pathResolve('./src/'), },
            { find: /^@qimao\/quantum-utils/, replacement: pathResolve('../../packages/utils/index.ts'), },
            { find: /^@qimao\/quantum-core/, replacement: pathResolve('../../packages/core/index.ts'), },
            { find: /^@qimao\/quantum-data/, replacement: pathResolve('../../packages/data-source/index.ts'), },
            { find: /^@qimao\/quantum-sandbox/, replacement: pathResolve('../../packages/sandbox/index.ts'), },
            { find: /^@qimao\/quantum-ui-vue2/, replacement: pathResolve('../../packages/ui-vue2/index.ts'), },
            { find: /^@qimao\/quantum-ui/, replacement: pathResolve('../../packages/ui/index.ts'), }
        ],
    },

    css: {
        postcss: {
            plugins: [postCssPxtorem({
                rootValue: 75,
                propList: ['*'],
            })],
        },
    },

    root: './',

    base: '/quantum-editor/runtime/vue2/',

    server: {
        host: true,
        port: 8178,
        strictPort: true,
    },

    build: {
        sourcemap: true,
        cssCodeSplit: false,
        rollupOptions: {
            input: {
                page: './page/index.html',
                playground: './playground/index.html',
            },
            output: {
                entryFileNames: 'assets/[name].js',
            },
        },
    },
});
