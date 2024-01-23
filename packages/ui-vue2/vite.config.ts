import vue from '@vitejs/plugin-vue2';
import vueJsx from '@vitejs/plugin-vue2-jsx';
import dts from 'vite-plugin-dts';
import {resolve} from 'path';
import { UserConfig } from 'vite';
import { ConfigEnv } from 'vite';

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
            external: ['vue', '@qimao/quantum-utils', '@qimao/quantum-core', '@qimao/quantum-schemas'],
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

const _assetQueue: string[] = [];
// 定义 build 和 plugin
const vite_common_lib_config = (options: any):UserConfig => {
    const {entry, name, formats = ['es', 'umd'], outDir = 'dist', buildOptions = {}, rollupOptions = {}, dtsOptions = {}, } = options;
    let plugin = [
        vue(),
        vueJsx()
    ];
    if (options.isComponentsBuild) {
        plugin.push({
            name: 'css-all',
            resolveFileUrl({ fileName, }) {
                return `new URL('${fileName}', document.baseURI).href`;
            },
            generateBundle(options, bundle) {
                //这里可以获取打包后的文件目录以及代码code
                const _keys = Object.keys(bundle);
                let _source = '';
                for (const key of _keys) {
                    const source:any = bundle[key];
                    if (source.fileName && source.fileName.includes('.css')) {
                        if (_source.includes('@charset')) {
                            const _codeArr = source.source.split(';').slice(1);
                            _source += _codeArr.join(';');
                        } else {
                            _source += source.source;
                        }
                    }
                }
                this.emitFile({
                    type: 'asset',
                    fileName: 'style/index.css',
                    source: _source,
                });
            },
        });
    }
    if (options.customPlugins) {
        plugin = plugin.concat(options.customPlugins);
    }
    const isDeclaration =
        !(process.env.PIPELINE_NAME?.includes('生产') || process.env.PIPELINE_TAGS?.includes('生产') || process.env.PIPELINE_NAME?.includes('测试') || process.env.PIPELINE_TAGS?.includes('测试'));
    if (isDeclaration) {
        plugin.push(dts({
            outDir: 'dist',
            ...dtsOptions,
        }));
    }
    const _output = options.isComponentsBuild ? [{
        format: 'es',
        exports: 'named',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
            if (assetInfo.name?.includes('scss')) {
                const _dirName = assetInfo.name.split('/').find(item => item.includes('q-'));
                if (_dirName) {
                    _assetQueue.push(_dirName);
                } else {
                    console.error('组件文件夹必须以 q-开头命名');
                    throw Error('组件文件夹必须以 q-开头命名');
                }
            } else if (assetInfo.name?.includes('css')) {
                const _realName = assetInfo.name.split('.')[0];
                const _curDir = _assetQueue.shift();
                return `style/${_curDir}/${_realName}[extname]`;
            }
            return `[name][extname]`;
        },
        dir: './dist/es',
        //让打包目录和我们目录对应
        preserveModules: true,
        preserveModulesRoot: 'src',
    }, {
        format: 'cjs',
        exports: 'named',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
            if (assetInfo.name?.includes('scss')) {
                const _dirName = assetInfo.name.split('/').find(item => item.includes('q-'));
                if (_dirName) {
                    _assetQueue.push(_dirName);
                } else {
                    console.error('组件文件夹必须以 q-开头命名');
                    throw Error('组件文件夹必须以 q-开头命名');
                }
            } else if (assetInfo.name?.includes('css')) {
                const _realName = assetInfo.name.split('.')[0];
                const _curDir = _assetQueue.shift();
                return `style/${_curDir}/${_realName}[extname]`;
            }
            return `[name][extname]`;
        },
        dir: './dist/lib',
        //让打包目录和我们目录对应
        preserveModules: true,
        preserveModulesRoot: 'src',
    }] : [{
        globals: {
            vue: 'Vue',
        },
    }];
    return {
        esbuild: {
            drop: ['console', 'debugger'],
        },
        build: {
            target: options.target || 'es2015',
            outDir: outDir,
            rollupOptions: {
                external: rollupOptions?.external,
                output: rollupOptions?.output ? rollupOptions.output : _output,
            },
            lib: {
                formats: formats,
                entry: entry,
                name: name,
                // the proper extensions will be added
                fileName: name,
            },
            ...(buildOptions || {}),
        },
        plugins: plugin,
    };
};
