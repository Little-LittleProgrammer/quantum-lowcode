import { IDataSourceSchema, ILowCodeRoot } from '@qimao/quantum-schemas';
import { Subscribe } from '@qimao/quantum-utils';
import { IDataSourceManagerData, IDataSourceManagerOptions, IHttpDataSourceSchema } from './types';
import { DataSource } from './data-source/base';
import { HttpDataSource } from './data-source/http';

export class DataSourceManager extends Subscribe {
    public app: ILowCodeRoot;
    public dataSourceMap: Map<string, DataSource> = new Map();
    public useMock = false;

    public data: IDataSourceManagerData = {}
    constructor({app, useMock, }: IDataSourceManagerOptions) {
        super();
        this.app = app;
        this.useMock = !!useMock;

        app.schemasRoot?.dataSources?.forEach((config) => {
            this.addDataSource(config);
        });
    }

    public async addDataSource(config?: IDataSourceSchema) {
        if (!config) return;

        let ds: DataSource;
        if (config.type === 'http') {
            ds = new HttpDataSource({
                app: this.app,
                schema: config as IHttpDataSourceSchema,
                useMock: this.useMock,
                request: this.app.request,
            });
        } else {
            const DataSourceClass = DataSource;

            ds = new DataSourceClass({
                app: this.app,
                schema: config,
                useMock: this.useMock,
            });
        }

        this.dataSourceMap.set(config.id, ds);

        this.data[ds.id] = ds.data;

        ds.emit('change', () => this.setData(ds));
    }

    public setData(ds: DataSource) {
        Object.assign(this.data[ds.id], ds.data);
        this.emit('change', ds.id);
    }

    public destroy() {
        this.clear();
        this.data = {};
        this.dataSourceMap.forEach((ds) => {
            ds.destroy();
        });
        this.dataSourceMap.clear();
    }
}
