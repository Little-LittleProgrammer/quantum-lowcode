import type { IDataSourceSchema, IHttpOptions, ILowCodeRoot, IRequestFunction } from '@quantum-lowcode/schemas';

import {HttpDataSource} from './data-source/http';

export interface IDataSourceManagerOptions {
    app: ILowCodeRoot;
    useMock?: boolean;
}

export interface IDataSourceOption {
    schema: IDataSourceSchema;
    app: ILowCodeRoot;
    useMock?: boolean;
}

export interface IHttpDataSourceOption extends IDataSourceOption{
    request?: IRequestFunction;
    schema: IHttpDataSourceSchema
}

export interface IHttpDataSourceSchema extends IDataSourceSchema {
    type: 'http';
    options: IHttpOptions; // 请求配置
    responseOptions?: {
        dataPath?: string; // 数据路径
    };
    autoFetch?: boolean; // 是否自动请求
    beforeRequest: string | ((options: IHttpOptions, content: { app: ILowCodeRoot; dataSource: HttpDataSource }) => IHttpOptions); // 请求拦截器
    afterResponse: string | ((response: any, content: { app: ILowCodeRoot; dataSource: HttpDataSource }) => any); // 响应拦截器
}

export interface IDataSourceManagerData {
    [key: string]: Record<string, any>;
}

export interface ChangeDataEvent {
    path?: string;
    updateData: any;
}

