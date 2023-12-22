import { ISchemasContainer, ISchemasNode, ISchemasPage } from '@qimao/quantum-schemas';
import { LowCodeRoot } from './app';
import { LowCodePage } from './page';
import { Subscribe, js_is_function, js_is_object } from '@qimao/quantum-utils';

interface INodeOptions {
    config: ISchemasNode | ISchemasContainer;
    page?: LowCodePage;
    parent?: LowCodeNode;
    root: LowCodeRoot;
}

export class LowCodeNode extends Subscribe {
    public data:ISchemasNode | ISchemasContainer | ISchemasPage;
    public page?: LowCodePage
    public parent?: LowCodeNode;
    public root: LowCodeRoot;

    constructor(options: INodeOptions) {
        super();
        this.page = options.page;
        this.parent = options.parent;
        this.root = options.root;
        this.setData(options.config);
    }

    public setData(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        this.data = data;
        this.setEvents(data);
        this.emit('updata-data');
    }

    public addEvent(event: string, fn: Fn) {
    }

    public setEvents(config: ISchemasNode | ISchemasContainer) {
        // TODO: 1. 通过 拖拽配置生成 event; 2. 联动组件事件
        if (config.componentProps && js_is_object(config.componentProps)) {
            for (let [key, val] of Object.entries(config.componentProps)) {
                /**
                 * 事件绑定
                 * onClick: (app, e) => {app.emit('datasourceId:funcName', e)}
                 *  */ 
                // if (key.startsWith('on') || key.endsWith('Func')) {
                if (js_is_function(val)) {
                    const fn = (...args: any[]) => {
                        val(this.root, ...args)
                    }
                    config.componentProps[key] = fn
                }
            }
        }
    }

    public destroy() {
        this.clear();
    }

    // 生命周期
    private listenLifeSafe() {

    }
}