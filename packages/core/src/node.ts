import { ISchemasContainer, ISchemasNode, ISchemasPage } from '@qimao/quantum-schemas';
import { LowCodeRoot } from './app';
import { LowCodePage } from './page';
import { Subscribe, js_is_function, js_is_object, compiledNode, js_is_array } from '@qimao/quantum-utils';
import {template} from 'lodash-es';

interface INodeOptions {
    config: ISchemasNode | ISchemasContainer;
    page?: LowCodePage;
    parent?: LowCodeNode;
    root: LowCodeRoot;
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
        this.setData(options.config);

        this.listenLifeSafe();
    }

    public setData(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        this.data = this.compileNode(data);
        this.setEvents(data);
        this.emit('updata-data');
    }

    public compileNode(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        return compiledNode(data, (value) => {
            if (typeof value === 'string') {
                return template(value)(this.root.dataSourceManager?.data);
            }
        });
    }

    // TODO
    // public addEvent(event: string, fn: Fn) {
    // }

    public setEvents(config: ISchemasNode | ISchemasContainer) {
        // TODO: 1. 通过 拖拽配置生成 event; 2. 联动组件事件
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
        console.log('load node listenLifeSafe');
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
                // TODO: 1. 绑定组件暴露出来的方法; 2. 绑定组件的事件
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
