/**
 * 负责统一对外接口，编辑器通过StageCore传入runtime
 * 同时StageCore也会对外抛出事件
 * 管理: StageRender
 */

import { Subscribe } from '@qimao/quantum-utils';
import { BoxRender } from './box-render';
import { IBoxCoreConfig, IRuntime } from './types';
import { Id } from '@qimao/quantum-schemas';

/**
 * 负责管理画布, 管理renderer, 并负责统一对外通信，包括提供接口和抛事件
 */
export class BoxCore extends Subscribe {
    public container?: HTMLDivElement;
    public renderer: BoxRender

    constructor(config: IBoxCoreConfig){
        super();
        this.renderer = new BoxRender({
            runtimeUrl: config.runtimeUrl,
        });
        this.initRenderEvent();
    }

    // 初始化render事件
    private initRenderEvent() {
        // 注册rendnerer的runtime-ready事件
        this.renderer.on('runtime-ready', (runtime:IRuntime) => {
            this.emit('runtime-ready', runtime);
        });
    }

    // 根据 field和id绑定获取选中的节点
    public async select(field: Id) {
        const el = this.renderer.getTargetElement(field);
        if (!el) {
            return;
        }
        await this.renderer.select([el]);
    }

    public async mount(el: HTMLDivElement) {
        this.container = el;
        await this.renderer.mount(el);

        this.emit('mount');
    }

    public destory() {
        this.renderer.destory();
        this.clear();
        this.container = undefined;
    }
}
