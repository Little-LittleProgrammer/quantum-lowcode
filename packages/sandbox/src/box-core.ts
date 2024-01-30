/**
 * 负责统一对外接口，编辑器通过StageCore传入runtime
 * 同时StageCore也会对外抛出事件
 * 管理: StageRender
 */

import { Subscribe } from '@qimao/quantum-utils';
import { BoxRender } from './box-render';
import { BoxMask } from './box-mask';
import { IBoxCoreConfig, IRuntime } from './types';
import { Id } from '@qimao/quantum-schemas';
import { DEFAULT_ZOOM } from './const';

/**
 * 负责管理画布, 管理renderer, 并负责统一对外通信，包括提供接口和抛事件
 */
export class BoxCore extends Subscribe {
    public container?: HTMLDivElement;
    public renderer: BoxRender
    public mask: BoxMask;

    private pageResizeObserver: ResizeObserver | null = null;
    private autoScrollIntoView: boolean | undefined;

    constructor(config: IBoxCoreConfig){
        super();

        this.autoScrollIntoView = config.autoScrollIntoView;

        this.renderer = new BoxRender({
            runtimeUrl: config.runtimeUrl,
            zoom: config.zoom,
        });
        this.mask = new BoxMask();

        this.initRenderEvent();
        this.initMaskEvent();
    }

    // 初始化render事件
    private initRenderEvent() {
        console.log('initRenderEvent');
        // 注册rendnerer的runtime-ready事件
        this.renderer.on('runtime-ready', (runtime:IRuntime) => {
            this.emit('runtime-ready', runtime);
        });
        this.renderer.on('page-el-update', (el: HTMLElement) => {
            // 画布 与 mask 同步
            this.mask?.observe(el);
            this.observePageResize(el);
        });
    }

    private initMaskEvent(): void {
        this.mask.on('change-mask', (data) => {
            // this.actionManager.setGuidelines(data.type, data.guides);
            this.emit('change-mask', data);
        });
    }

    // 单选选中元素
    public async select(field: Id) {
        const el = this.renderer.getTargetElement(field);
        if (!el) {
            return;
        }
        await this.renderer.select([el]);

        this.mask.setLayout(el);

        if (this.autoScrollIntoView || el.dataset.autoScrollIntoView) {
            this.mask.observerIntersection(el);
        }
    }

    public setZoom(zoom: number = DEFAULT_ZOOM): void {
        this.renderer.setZoom(zoom);
    }

    public async mount(el: HTMLDivElement) {
        this.container = el;
        await this.renderer.mount(el);
        this.mask.mount(el);

        this.emit('mounted');
    }

    public disableMultiSelect() {
        // this.actionManager.disableMultiSelect();
    }

    public enableMultiSelect() {
        // this.actionManager.enableMultiSelect();
    }

    public destory() {
        this.renderer.destory();
        this.mask.destory();
        this.pageResizeObserver?.disconnect();
        this.clear();
        this.container = undefined;
    }

    /**
     * 监听页面大小变化
     * @param page 页面元素
     */
    private observePageResize(page: HTMLElement): void {
        console.log('observePageResize');
        if (this.pageResizeObserver) {
            this.pageResizeObserver.disconnect();
        }

        if (typeof ResizeObserver !== 'undefined') {
            this.pageResizeObserver = new ResizeObserver((entries) => {
                this.mask.pageResize(entries);
                // this.actionManager.updateMoveable();
            });

            this.pageResizeObserver.observe(page);
        }
    }
}
