import { ComponentResolver } from 'unplugin-vue-components/types';
import Components from 'unplugin-vue-components/vite';

const matchComponents = [
    // default
    {
        pattern: /^QLoading/,
        styleDir: 'q-loading',
    },
    {
        pattern: /^QTag/,
        styleDir: 'q-tag',
    },
    {
        pattern: /^QTreeTable/,
        styleDir: 'q-tree-table',
    },
    {
        pattern: /^QWatermark/,
        styleDir: 'q-watermark',
    },
    {
        pattern: /^QBreadcrumb/,
        styleDir: 'q-breadcrumb',
    },
    {
        pattern: /^QCodeEditor/,
        styleDir: 'q-code-editor',
    },
    // antd
    {
        pattern: /^QAntdShrinkCard/,
        styleDir: 'q-card',
    },
    {
        pattern: /^QAntdDrawer/,
        styleDir: 'q-drawer',
    },
    {
        pattern: /^QAntdForm|^QAntdSelectAll/,
        styleDir: 'q-form',
    },
    {
        pattern: /^QAntdIconPicker/,
        styleDir: 'q-icon',
    },
    {
        pattern: /^QAntdKeepAliveTabs/,
        styleDir: 'q-keep-alive-tabs',
    },
    {
        pattern: /^QAntdSetting/,
        styleDir: 'q-setting',
    },
    {
        pattern: /^QAntdTable$|^QAntdTableAction|^QAntdTablePagination|^QAntdTableImg/,
        styleDir: 'q-table',
    },
    {
        pattern: /^QAntdTransfer/,
        styleDir: 'q-transfer',
    },

    {
        pattern: /^QAntdUpload/,
        styleDir: 'q-upload',
    }
];
function kebab_case(key: string) {
    const result = key.replace(/([A-Z])/g, ' $1').trim();
    return result.split(' ').join('-').toLowerCase();
}

export interface QResolverOptions {
    importStyle: boolean | 'css' | 'scss';

    prefix: string; // package 的默认开头
    notPrefix?: string[]
    packageName: string // package名称

    moduleType: 'es' | 'lib'
}

function get_style_dir(compName: string) {
    let _styleDir;
    const _total = matchComponents.length;
    for (let i = 0; i < _total; i++) {
        const matcher = matchComponents[i];
        if (compName.match(matcher.pattern)) {
            _styleDir = matcher.styleDir;
            break;
        }
    }
    if (!_styleDir)
        _styleDir = false;

    return _styleDir;
}

function get_side_effects(dirName: string, options: QResolverOptions) {
    const { importStyle, packageName, moduleType, prefix, } = options;
    if (!importStyle)
        return;

    const _styleDir = get_style_dir(dirName);
    if (!_styleDir) {
        return;
    }
    const _compName = kebab_case(dirName.slice(prefix.length));
    return `${packageName}/dist/${moduleType}/style/${_styleDir}/${_compName}.${importStyle}`;
}

const defaultOptions: QResolverOptions[] = [{
    importStyle: 'css',
    prefix: 'Q',
    notPrefix: ['QAntd', 'QEle'],
    packageName: '@q-front-npm/vue3-pc-ui',
    moduleType: 'es',
}, {
    importStyle: 'css',
    prefix: 'QAntd',
    packageName: '@q-front-npm/vue3-antd-pc-ui',
    moduleType: 'es',
}];

function QResolver(options: QResolverOptions[] = defaultOptions) {
    const _resolver = options.map(item => {
        const { prefix, moduleType, packageName, } = item;
        return {
            type: 'component',
            resolve: (name: string) => {
                if (name.startsWith(prefix) && (!item.notPrefix?.length || (item.notPrefix?.length && !item.notPrefix.some(e => name.startsWith(e))))) {
                    return {
                        name: name,
                        from: `${packageName}/${moduleType}`,
                        sideEffects: get_side_effects(name, item),
                    };
                }
            },
        };
    }) as ComponentResolver[];
    return _resolver;
}

export const componentPlugin = Components({
    resolvers: [QResolver()],
});
