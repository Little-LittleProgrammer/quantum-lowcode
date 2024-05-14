import { ILowCodeRoot} from '@qimao/quantum-schemas';
import { DataSourceManager } from './data-source-manager';
import { ChangeDataEvent } from './types';
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
        const fieldId = changeData.path?.split('.')?.[0];
        const nodes = dataSourceManager.trigger(sourceId, fieldId);
        dataSourceManager.emit('update-data', nodes, sourceId, changeData);
    });

    return dataSourceManager;
}
