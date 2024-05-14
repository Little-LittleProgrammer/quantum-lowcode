import { ILowCodeRoot, Id, IDepData } from '@qimao/quantum-schemas';
import { DataSourceManager } from './data-source-manager';
import { ChangeDataEvent } from './types';
import { js_utils_edit_attr } from '@qimao/quantum-utils';

/**
 * 创建数据源管理器
 * @param app ILowCodeRoot
 * @param useMock 是否使用mock数据
 * @returns DataSourceManager | undefined
 */
export function createDataSourceManager(app: ILowCodeRoot, useMock?:boolean) {
    const {schemasRoot, } = app;
    if (!schemasRoot?.dataSources) return;

    const dataSourceManager = new DataSourceManager({
        app,
        useMock,
    });

    // if (schemasRoot.dataSources)

    dataSourceManager.on('change', (sourceId: string, changeData: ChangeDataEvent) => {
        const map1: Map<Id, IDepData[]> = app.dataSourceDep;
        const map2: Map<Id, IDepData[]> = app.dataSourceCond;
        const nodes = [];
        const keys = new Set([...map1.keys(), ...map2.keys()]);
        // 触发依赖
        for (const key of keys) {
            const dataDeps = map1.get(key) || []; // 更新变量
            const condDeps = map2.get(key) || []; // 更新 ifShow;
            const dataObj: Record<string, IDepData> = {};
            const condObj: Record<string, IDepData> = {};
            for (const d of dataDeps) {
                dataObj[d.field] = d;
            }
            for (const d of condDeps) {
                condObj[d.field] = d;
            }
            const subKeys = new Set([...(dataDeps).map(d => d.field), ...(condDeps).map(d => d.field)]);
            for (const subKey of subKeys) {
                const node = app.getPage(key)?.getNode(subKey);
                if (node) {
                    const {field: field1, key: tir, rawValue, } = dataObj[subKey] || {};
                    const {field: field2, } = condObj[subKey] || {};
                    const cache = node.data;
                    if (field1) {
                        js_utils_edit_attr(tir!, rawValue, cache);
                    }
                    if (field2) {
                        cache.showResult = 'xxx';
                    }
                    node.setData(cache);
                    nodes.push(cache);
                }
            }
        }

        dataSourceManager.emit('update-data', nodes, sourceId, changeData);
    });

    return dataSourceManager;
}
