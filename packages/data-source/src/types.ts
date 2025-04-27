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
    options: IHttpOptions;
    responseOptions?: {
        dataPath?: string;
    };
    autoFetch?: boolean;
    beforeRequest: string | ((options: IHttpOptions, content: { app: ILowCodeRoot; dataSource: HttpDataSource }) => IHttpOptions);
    afterResponse: string | ((response: any, content: { app: ILowCodeRoot; dataSource: HttpDataSource }) => any);
}

export interface IDataSourceManagerData {
    [key: string]: Record<string, any>;
}

export interface ChangeDataEvent {
    path?: string;
    updateData: any;
}

