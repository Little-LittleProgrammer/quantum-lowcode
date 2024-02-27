import { Subscribe, js_utils_get_uuid } from '@qimao/quantum-utils';
import { IDataSourceStateKey, IDataSourceState, FormConfig, EventOption } from '../types';
import { reactive } from 'vue';
import { getFormConfig, getFormValue } from '../utils/data-source';
import { IDataSourceSchema } from '@qimao/quantum-schemas';
import { cloneDeep } from 'lodash-es';

class DataSourceService extends Subscribe {
    private state = reactive<IDataSourceState>({
        datasourceTypeList: [],
        dataSources: [],
        editable: true,
        configs: {},
        values: {},
        methods: {},
    })

    public set<K extends IDataSourceStateKey, T extends IDataSourceState[K]>(name: K, value: T) {
        this.state[name] = value;
    }

    public get<K extends IDataSourceStateKey>(key: K):IDataSourceState[K] {
        return this.state[key];
    }

    public getFormConfig(type = 'base') {
        return getFormConfig(type, this.get('configs'));
    }

    public setFormConfig(type: string, config: FormConfig) {
        this.get('configs')[type] = config;
    }

    public getFormValue(type = 'base') {
        return getFormValue(type, this.get('values')[type]);
    }

    public setFormValue(type: string, value: Partial<IDataSourceSchema>) {
        this.get('values')[type] = value;
    }

    public getFormMethod(type = 'base') {
        return this.get('methods')[type] || [];
    }

    public setFormMethod(type: string, value: EventOption[] = []) {
        this.get('methods')[type] = value;
    }

    public add(config: IDataSourceSchema) {
        const newConfig = {
            ...config,
            id: this.createId(),
        };

        this.get('dataSources').push(newConfig);

        this.emit('add', newConfig);

        return newConfig;
    }

    public update(config: IDataSourceSchema) {
        const dataSources = this.get('dataSources');

        const index = dataSources.findIndex((ds) => ds.id === config.id);

        dataSources[index] = cloneDeep(config);

        this.emit('update', config);

        return config;
    }

    public delete(id: string) {
        const dataSources = this.get('dataSources');
        const index = dataSources.findIndex((ds) => ds.id === id);
        dataSources.splice(index, 1);

        this.emit('remove', id);
    }

    public getDataSourceById(id: string) {
        return this.get('dataSources').find((ds) => ds.id === id);
    }

    public reset() {
        this.set('dataSources', []);
    }

    public destroy() {
        this.clear();
        this.reset();
    }

    private createId(): string {
        return `ds_${js_utils_get_uuid(4)}`;
    }
}

export type {DataSourceService};

export const dataSourceService = new DataSourceService();
