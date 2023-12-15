import { ILowCodeRoot } from '@qimao/quantum-schemas';
import { Subscribe } from '@qimao/quantum-utils';
import { IDataSourceManagerOptions } from './types';
import { DataSource } from './data-source';

class DataSourceManager extends Subscribe {
    public app: ILowCodeRoot;
    public dataSourceMap: Map<string, DataSource> = new Map();
    public useMock = false;
    constructor({app, useMock, }: IDataSourceManagerOptions) {
        super();
        this.app = app;
        this.useMock = !!useMock;
    }

    function addDataSource(params:type) {
        
    }
}
