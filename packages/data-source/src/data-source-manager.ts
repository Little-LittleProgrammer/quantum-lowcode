import { IDataSourceSchema, ILowCodeRoot, ISchemasNode, Id } from '@qimao/quantum-schemas';
import { Subscribe, js_is_function } from '@qimao/quantum-utils';
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
        Promise.all(Array.from(this.dataSourceMap).map(async([, ds]) => this.init(ds)));
    }

    public async init(ds: DataSource) {
        console.log('dataSourceManager', ds);
        if (ds.isInit) {
            return;
        }
        // 处理初始化数据逻辑
        const beforeInit: ((...args: any[]) => any)[] = [];
        const afterInit: ((...args: any[]) => any)[] = [];

        ds.methods.forEach((method) => {
            if (!js_is_function(method.content)) return;

            // 注册全局事件, 放在此处注册, 优化性能
            this.app.registerEvent && this.app.registerEvent(`${ds.id}:${method.name}`, method.content, ds);
            switch (method.timing) {
                case 'beforeInit':
                    beforeInit.push(method.content as (...args: any[]) => any);
                    break;
                case 'afterInit':
                    afterInit.push(method.content as (...args: any[]) => any);
            }
        });

        for (const method of beforeInit) {
            await method({ dataSource: ds, app: this.app, });
        }

        await ds.init();

        for (const method of afterInit) {
            await method({ dataSource: ds, app: this.app, });
        }
    }

    public get(id: string) {
        return this.dataSourceMap.get(id);
    }

    public async addDataSource(config?: IDataSourceSchema) {
        if (!config) return;

        let ds: DataSource;
        // 如果是 http 类型
        if (config.type === 'http') {
            ds = new HttpDataSource({
                app: this.app,
                schema: config as IHttpDataSourceSchema,
                useMock: this.useMock,
                request: this.app.request,
            });
        } else {
            // 如果是基本类型
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

    public updateSchema(schemas: IDataSourceSchema[]) {
        schemas.forEach((schema) => {
            const ds = this.dataSourceMap.get(schema.id);
            if (!ds) {
                return;
            }

            this.removeDataSource(schema.id);

            this.addDataSource(schema);
            const newDs = this.get(schema.id);
            if (newDs) {
                this.init(newDs);
            }
        });
    }

    public removeDataSource(id: string) {
        const ds = this.dataSourceMap.get(id);
        if (!ds) return;
        ds.destroy();
        this.dataSourceMap.delete(id);
        delete this.data[id];
    }

    // public compiledNode(node: ISchemasNode, sourceId?: Id) {
    //     if (node.ifShow === false) return node;

    //     return com
    // }

    public destroy() {
        this.clear();
        this.data = {};
        this.dataSourceMap.forEach((ds) => {
            ds.destroy();
        });
        this.dataSourceMap.clear();
    }
}
