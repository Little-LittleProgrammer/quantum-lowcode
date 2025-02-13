/**
 * 负责统一对外接口，编辑器通过StageCore传入runtime
 * 同时StageCore也会对外抛出事件
 * 管理: StageRender
 */

import { Subscribe } from '@quantum-lowcode/utils';
import { BoxRender } from './box-render';
import { BoxMask } from './box-mask';
import type {
    IActionManagerConfig,
    IBoxCoreConfig,
    IDeleteData,
    IGuidesEventData,
    IPoint,
    IRemoveEventData,
    IRuntime,
    IUpdateData,
    IUpdateEventData
} from './types';
import { DEFAULT_DESIGN_WIDTH, type Id } from '@quantum-lowcode/schemas';
import { DEFAULT_ZOOM } from './const';
import { ActionManager } from './action-manager';
import type { MoveableOptions, OnDragStart } from 'moveable';

/**
 * 负责管理画布, 管理renderer,mask, actionManage 并负责统一对外通信，包括提供接口和抛事件
 */
export class BoxCore extends Subscribe {
    public container?: HTMLDivElement;
    public renderer: BoxRender;
    public mask: BoxMask;
    public actionManager: ActionManager;
    public designWidth = DEFAULT_DESIGN_WIDTH;

    private pageResizeObserver: ResizeObserver | null = null;
    private autoScrollIntoView: boolean | undefined;

    constructor(config: IBoxCoreConfig) {
        super();

        this.autoScrollIntoView = config.autoScrollIntoView;
        if (config.designWidth) {
            this.designWidth = config.designWidth;
        }

        this.renderer = new BoxRender({
            runtimeUrl: config.runtimeUrl,
            zoom: config.zoom,
        });
        this.mask = new BoxMask({guidesOptions: config.guidesOptions, });
        this.actionManager = new ActionManager(
            this.getActionManagerConfig(config)
        );

        this.initRenderEvent();
        this.initActionEvent();
        this.initMaskEvent();
    }

    /**
	 * 单选选中元素
	 * @param idOrEl 选中的id或者元素
	 */
    public async select(idOrEl: Id | HTMLElement, event?: MouseEvent) {
        const el = this.renderer.getTargetElement(idOrEl);
        if (!el || el === this.actionManager.getSelectedEl()) {
            return;
        }
        await this.renderer.select([el]);

        this.mask.setLayout(el);

        this.actionManager.select(el, event);

        if (this.autoScrollIntoView || el.dataset.autoScrollIntoView) {
            this.mask.observerIntersection(el);
        }
    }

    /**
	 *
	 * @param zoom
	 */
    public async multiSelect(idOrElList: HTMLElement[] | Id[]): Promise<void> {
        const els = idOrElList.map((idOrEl) =>
            this.renderer.getTargetElement(idOrEl)
        );
        if (els.length === 0) return;

        const lastEl = els[els.length - 1];
        // 是否减少了组件选择
        const isReduceSelect =
			els.length < this.actionManager.getSelectedElList().length;
        await this.renderer.select(els);

        this.mask.setLayout(lastEl);

        this.actionManager.multiSelect(idOrElList);

        if (
            (this.autoScrollIntoView || lastEl.dataset.autoScrollIntoView) &&
			!isReduceSelect
        ) {
            this.mask.observerIntersection(lastEl);
        }
    }

    /**
	 * 高亮选中元素
	 * @param el 要高亮的元素
	 */
    public highlight(idOrEl: Id | HTMLElement): void {
        this.actionManager.highlight(idOrEl);
    }

    public clearHighlight(): void {
        this.actionManager.clearHighlight();
    }

    /**
	 * 更新组件
	 * @param data 更新组件的数据
	 */
    public async update(data: IUpdateData): Promise<void> {
        const { config, } = data;
        await this.renderer.update(data);
        // 通过setTimeout等画布中组件完成渲染更新
        setTimeout(() => {
            const el = this.renderer.getTargetElement(`${config.field}`);
            if (el && this.actionManager.isSelectedEl(el)) {
                // 更新了组件的布局，需要重新设置mask是否可以滚动
                this.mask.setLayout(el);
                // 组件有更新，需要set
                this.actionManager.setSelectedEl(el);
                this.actionManager.updateMoveable(el);
            }
        });
    }

    /**
	 * 往画布增加一个组件
	 * @param data 组件信息数据
	 */
    public async add(data: IUpdateData): Promise<void> {
        return await this.renderer.add(data);
    }

    /**
	 * 从画布删除一个组件
	 * @param data 组件信息数据
	 */
    public async delete(data: IDeleteData): Promise<void> {
        return await this.renderer.delete(data);
    }

    public setZoom(zoom: number = DEFAULT_ZOOM): void {
        this.renderer.setZoom(zoom);
    }

    /**
     * 挂载
     * @param el 画布父容器
     */
    public async mount(el: HTMLDivElement) {
        this.container = el; // 设置根容器
        await this.renderer.mount(el); // 挂载iframe画布
        this.mask.mount(el); // 遮罩挂载画布兄弟元素

        this.emit('mounted'); // 向外通知挂载完成
    }

    /**
	 * 清空所有参考线
	 */
    public clearGuides() {
        this.mask.clearGuides();
        this.actionManager.clearGuides();
    }

    /**
	 * 鼠标拖拽着元素，在容器上方悬停，延迟一段时间后，对容器进行标记，如果悬停时间够长将标记成功，悬停时间短，调用方通过返回的timeoutId取消标记
	 * 标记的作用：1、高亮容器，给用户一个加入容器的交互感知；2、释放鼠标后，通过标记的标志找到要加入的容器
	 * @param event 鼠标事件
	 * @param excludeElList 计算鼠标所在容器时要排除的元素列表
	 * @returns timeoutId，调用方在鼠标移走时要取消该timeout，阻止标记
	 */
    public delayedMarkContainer(
        event: MouseEvent,
        excludeElList: Element[] = []
    ): NodeJS.Timeout | undefined {
        return this.actionManager.delayedMarkContainer(event, excludeElList);
    }

    public getMoveableOption<K extends keyof MoveableOptions>(
        key: K
    ): MoveableOptions[K] | undefined {
        return this.actionManager.getMoveableOption(key);
    }

    public getDragStatus() {
        return this.actionManager.getDragStatus();
    }

    public disableMultiSelect() {
        this.actionManager.disableMultiSelect();
    }

    public enableMultiSelect() {
        this.actionManager.enableMultiSelect();
    }

    public destory() {
        this.renderer.destory();
        this.mask.destory();
        this.pageResizeObserver?.disconnect();
        this.actionManager.destory();
        this.clear();
        this.container = undefined;
    }

    /**
	 * 监听页面大小变化, 同步更改mask与actionmanage
	 * @param page 页面元素
	 */
    private observePageResize(page: HTMLElement): void {
        if (this.pageResizeObserver) {
            this.pageResizeObserver.disconnect();
        }

        if (typeof ResizeObserver !== 'undefined') {
            this.pageResizeObserver = new ResizeObserver((entries) => {
                console.log('observePageResize');
                this.mask.pageResize(entries);
                this.actionManager.updateMoveable();
            });

            this.pageResizeObserver.observe(page);
        }
    }

    /**
     * @returns actionManage配置
     */
    private getActionManagerConfig(
        config: IBoxCoreConfig
    ): IActionManagerConfig {
        const actionManagerConfig: IActionManagerConfig = {
            containerHighlightClassName: config.containerHighlightClassName,
            containerHighlightDuration: config.containerHighlightDuration,
            containerHighlightType: config.containerHighlightType,
            moveableOptions: config.moveableOptions,
            container: this.mask.content,
            disabledDragStart: config.disabledDragStart,
            disabledMultiSelect: config.disabledMultiSelect,
            designWidth: this.designWidth,
            canSelect: config.canSelect,
            isContainer: config.isContainer,
            updateDragEl: config.updateDragEl,
            getRootContainer: () => this.container,
            getRenderDocument: () => this.renderer.getDocument(),
            getTargetElement: (idOrEl: Id | HTMLElement) =>
                this.renderer.getTargetElement(idOrEl),
            getElementsFromPoint: (point: IPoint) =>
                this.renderer.getElementsFromPoint(point),
        };

        return actionManagerConfig;
    }

    // 初始化render事件
    private initRenderEvent() {
        console.log('initRenderEvent 注册runtime事件');
        // 注册rendnerer的runtime-ready事件
        this.renderer.on('runtime-ready', (runtime: IRuntime) => {
            this.emit('runtime-ready', runtime);
        });
        // page配置变化处罚
        this.renderer.on('page-el-update', (el: HTMLElement) => {
            // 画布 与 mask 同步
            this.mask?.observe(el);
            this.observePageResize(el);

            this.emit('page-el-update', el);
        });
    }

    /**
     * 初始化 mask 事件
     */
    private initMaskEvent(): void {
        this.mask.on('change-mask', (data: IGuidesEventData) => {
            this.actionManager.setGuidelines(data.type, data.guides);
            this.emit('change-mask', data);
        });
    }

    /**
	 * 初始化操作相关事件监听
	 */
    private initActionEvent(): void {
        this.initActionManagerEvent();
        this.initDrEvent();
        this.initMulDrEvent();
        this.initHighlightEvent();
        this.initMouseEvent();
    }
    /**
	 * 初始化ActionManager类本身抛出来的事件监听
     * 主要是为了触发执行 editor 的事件
	 */
    private initActionManagerEvent(): void {
        this.actionManager.on(
            'before-select',
            (idOrEl: Id | HTMLElement, event?: MouseEvent) => {
                this.select(idOrEl, event);
            }
        );
        this.actionManager.on(
            'select',
            (selectedEl: HTMLElement, event: MouseEvent) => {
                this.emit('select', selectedEl, event);
            }
        );
        this.actionManager.on(
            'before-multi-select',
            (idOrElList: HTMLElement[] | Id[]) => {
                this.multiSelect(idOrElList);
            }
        );
        this.actionManager.on(
            'multi-select',
            (selectedElList: HTMLElement[], event: MouseEvent) => {
                this.emit('multi-select', selectedElList, event);
            }
        );
        this.actionManager.on('dblclick', (event: MouseEvent) => {
            this.emit('dblclick', event);
        });
    }

    /**
	 * 初始化DragResize类通过ActionManager抛出来的事件监听
     * 在画布内拖动的事件
	 */
    private initDrEvent(): void {
        this.actionManager.on('update', (data: IUpdateEventData) => {
            this.emit('update', data);
        });
        this.actionManager.on('sort', (data: IUpdateEventData) => {
            this.emit('sort', data);
        });
        this.actionManager.on('select-parent', () => {
            this.emit('select-parent');
        });
        this.actionManager.on('remove', (data: IRemoveEventData) => {
            this.emit('remove', data);
        });
    }

    /**
	 * 初始化MultiDragResize类通过ActionManager抛出来的事件监听
	 */
    private initMulDrEvent(): void {
        // 多选切换到单选
        this.actionManager.on('change-to-select', (el: HTMLElement, e: MouseEvent) => {
            this.select(el);
            // 先保证画布内完成渲染，再通知外部更新
            setTimeout(() => this.emit('select', el, e));
        });
        this.actionManager.on('multi-update', (data: IUpdateEventData) => {
            this.emit('update', data);
        });
    }

    /**
	 * 初始化Highlight类通过ActionManager抛出来的事件监听
	 */
    private initHighlightEvent(): void {
        this.actionManager.on('highlight', async(highlightEl: HTMLElement) => {
            this.emit('highlight', highlightEl);
        });
    }

    /**
	 * 初始化Highlight类通过ActionManager抛出来的事件监听
	 */
    private initMouseEvent(): void {
        this.actionManager.on('mousemove', (event: MouseEvent) => {
            this.emit('mousemove', event);
        });
        this.actionManager.on('mouseleave', (event: MouseEvent) => {
            this.emit('mouseleave', event);
        });
        this.actionManager.on('drag-start', (e: OnDragStart) => {
            this.emit('drag-start', e);
        });
    }
}
