import { ILowCodeRoot } from "@qimao/quantum-schemas";
import { DataSourceManager } from "./data-source-manager";

/**
 * 创建数据源管理器
 * @param app ILowCodeRoot
 * @param useMock 是否使用mock数据
 * @returns DataSourceManager | undefined
 */
export function createDataSourceManager( app: ILowCodeRoot, useMock?:boolean) {
    const {schemasRoot} = app;
    if (!schemasRoot?.dataSources) return;

    const dataSourceManager = new DataSourceManager({
        app,
        useMock,
    });

    return dataSourceManager
}