import { ISchemasContainer, ISchemasNode, ISchemasPage, IDepData } from '@qimao/quantum-schemas';
import { LowCodeRoot } from './app';
import { LowCodePage } from './page';
import { Subscribe, js_is_function, js_is_object, compiledNode, js_is_array } from '@qimao/quantum-utils';
import {template} from 'lodash-es';

interface INodeOptions {
    config: ISchemasNode | ISchemasContainer;
    page?: LowCodePage;
    parent?: LowCodeNode;
    root: LowCodeRoot;
    init?: boolean
}

export class LowCodeNode extends Subscribe {
    public data: ISchemasNode | ISchemasContainer | ISchemasPage;
    public page?: LowCodePage
    public parent?: LowCodeNode;
    public root: LowCodeRoot;
    public instance?: any

    constructor(options: INodeOptions) {
        super();
        this.page = options.page;
        this.parent = options.parent;
        this.root = options.root;
        this.data = options.config;
        if (options.init) {
            this.setData(options.config);
            this.setEvents(this.data);
        }
        this.listenLifeSafe();
    }

    public setData(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        this.data = this.compileNode(data);
        this.emit('update-data');
    }

    public compileNode(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        // TODO 整个数据收集部分待优化
        if (this.page) { // 复原node依赖
            const ids = this.root.dataSourceDep.get(this.page?.data.field || '') || [];
            this.root.dataSourceDep.set(this.page.data.field, ids.filter(item => item.field !== this.data.field));
        }
        return compiledNode(data, (value, key) => {
            if (this.page) {
                if (this.root.dataSourceDep.has(this.page.data.field)) {
                    const ids = this.root.dataSourceDep.get(this.page.data.field)!;
                    ids.push({
                        field: this.data.field,
                        key,
                        rawValue: value,
                    });
                    this.root.dataSourceDep.set(this.page.data.field, ids);
                } else {
                    this.root.dataSourceDep.set(this.page.data.field, [{
                        field: this.data.field,
                        key,
                        rawValue: value,
                    }]);
                }
            }
            if (typeof value === 'string') {
                return template(value)(this.root.dataSourceManager?.data);
            }
        });
    }

    public setEvents(config: ISchemasNode | ISchemasContainer) {
        if (config.componentProps && js_is_object(config.componentProps)) {
            for (const [key, val] of Object.entries(config.componentProps)) {
                /**
                 * 事件绑定, 覆盖两种方式
                 * 1. onClick: (app, e) => {app.emit('datasourceId:funcName', e)} 适用于 code 模式
                 * 2. onClick: [{field: 'nodeId:funcName', params: {}}, {field: 'datasourceId:funcName', params: {}}] 适用于配置模式
                 *  */
                // if (key.startsWith('on') || key.endsWith('Func')) {
                if (js_is_function(val)) {
                    const fn = (...args: any[]) => {
                        val(this.root, ...args);
                    };
                    config.componentProps[key] = fn;
                } else if (js_is_array(val) && val[0]?.field) {
                    const fn = () => {
                        for (const item of val) {
                            const { field, params = {}, } = item;
                            this.root.emit(`${field}`, params);
                        }
                    };
                    config.componentProps[key] = fn;
                }
            }
        }
    }

    public destroy() {
        this.clear();
    }

    // 生命周期 + 将 node组件里的事件注册成全局事件
    private listenLifeSafe() {
        this.once('created', async(instance: any) => {
            this.once('destroy', () => {
                this.instance = null;
                if (js_is_function(this.data.destroy)) {
                    this.data.destroy();
                }

                this.listenLifeSafe();
            });

            this.instance = instance;

            await this.runCode('created');
        });

        // 执行配置的生命周期, 并且绑定组件暴露出来的方法
        this.once('mounted', async(instance: any) => {
            this.instance = instance;

            for (const [key, val] of Object.entries(instance)) {
                this.root && this.root.registerEvent(key, val, undefined, this);
            }

            await this.runCode('mounted');
        });
    }

    // 生命周期方法触发
    private async runCode(hook: string) {
        if (js_is_function(this.data[hook])) {
            await this.data[hook](this);
            return;
        }
        if (this.data[hook]) {
            for (const item of this.data[hook].hookData) {
                const { field, params = {}, } = item;
                this.root.emit(`${field}`, params);
            }
        }
    }
}
