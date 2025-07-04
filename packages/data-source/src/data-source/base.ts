import type { ICodeBlockContent, IDataSchema, ILowCodeRoot } from '@quantum-lowcode/schemas';
import { Subscribe, js_utils_edit_attr } from '@quantum-lowcode/utils';
import type { ChangeDataEvent, IDataSourceOption } from '../types';
import { getDefaultValueFromFields } from '@quantum-lowcode/utils';

export class DataSource extends Subscribe {
    public isInit = false;

    public data: Record<string, any> = {};

    public app: ILowCodeRoot; // core 实例

    protected mockData?: Record<string | number, any>; // MOCK数据存放

    // 私有属性
    #type = 'base';
    #id: string; // 访问唯一id

    #fields: IDataSchema[] = []; // 数据源自定义字段配置, 数据
    #methods: ICodeBlockContent[] = []; // 数据源自定义方法配置, 方法

    constructor(options: IDataSourceOption) {
        super();

        this.app = options.app;
        this.#id = options.schema.id;
        this.setFields(options.schema.fields);
        this.setMethods(options.schema.methods);

        const defaultData = this.getDefaultData();

        if (typeof options.useMock === 'boolean' && options.useMock) {
            this.mockData = options.schema.mocks?.data || defaultData;
        }

        this.setData(this.mockData || defaultData);
    }

    public get id() {
        return this.#id;
    }

    public get type() {
        return this.#type;
    }

    public get fields() {
        return this.#fields;
    }

    public get methods() {
        return this.#methods;
    }

    public setFields(fields: IDataSchema[]) {
        this.#fields = fields;
    }

    public setMethods(methods: ICodeBlockContent[]) {
        this.#methods = methods;
    }

    public setData(data: Record<string, any>, path?: string) {
        if (path) {
            js_utils_edit_attr(path, data, this.data);
        } else {
            // TODO: 校验数据，看是否符合 schema
            this.data = data;
        }
        const changeEvent: ChangeDataEvent = {
            updateData: data,
            path
        };
        this.emit('change', changeEvent);
    }

    // 获取默认值
    public getDefaultData() {
        return getDefaultValueFromFields(this.#fields);
    }

    public destroy() {
        this.data = {};
        this.#fields = [];
        this.clear();
    }

    public async init() {
        this.isInit = true;
    }
}
