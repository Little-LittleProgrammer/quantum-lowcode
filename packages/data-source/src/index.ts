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

    dataSourceManager.on('change', (sourceId: string, changeData: ChangeDataEvent) => {
        const map: Map<Id, IDepData[]> = app.dataSourceDep;
        const nodes = [];
        for (const [pageId, deps] of map) {
            for (const dep of deps) {
                const {field, key, rawValue, } = dep;
                const node = app.getPage(pageId)?.getNode(field);
                if (node) {
                    js_utils_edit_attr(key, rawValue, node.data);
                    node.setData(node.data);
                    nodes.push(node.data);
                }
            }
        }
        console.log('ds change 3', nodes, app.dataSourceDep);
        dataSourceManager.emit('update-data', nodes, sourceId, changeData);
    });

    return dataSourceManager;
}
