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
 * 画布核心管理类
 * 负责管理画布, 管理renderer,mask, actionManage 并负责统一对外通信，包括提供接口和抛事件
 *
 * 职责：
 * 1. 管理画布渲染器(BoxRender)：负责iframe中的组件渲染
 * 2. 管理画布遮罩(BoxMask)：负责选中框、参考线等视觉反馈
 * 3. 管理操作管理器(ActionManager)：负责拖拽、缩放、多选等交互操作
 * 4. 统一对外事件通信：将各个子模块的事件统一向外暴露
 */
export class BoxCore extends Subscribe {
    /** 画布容器DOM元素 */
    public container?: HTMLDivElement;
    /** 画布渲染器，负责iframe中的组件渲染 */
    public renderer: BoxRender;
    /** 画布遮罩，负责选中框、参考线等视觉反馈 */
    public mask: BoxMask;
    /** 操作管理器，负责拖拽、缩放、多选等交互操作 */
    public actionManager: ActionManager;
    /** 设计稿宽度，用于适配不同屏幕 */
    public designWidth = DEFAULT_DESIGN_WIDTH;

    /** 页面尺寸变化监听器 */
    private pageResizeObserver: ResizeObserver | null = null;
    /** 是否自动滚动到选中组件 */
    private autoScrollIntoView: boolean | undefined;

    constructor(config: IBoxCoreConfig) {
        super();

        // 初始化配置
        this.autoScrollIntoView = config.autoScrollIntoView;
        if (config.designWidth) {
            this.designWidth = config.designWidth;
        }

        // 初始化各个子模块
        // 渲染器
        this.renderer = new BoxRender({
            runtimeUrl: config.runtimeUrl,
            zoom: config.zoom
        });
        // 遮罩层
        this.mask = new BoxMask({guidesOptions: config.guidesOptions });
        // 操作管理器
        this.actionManager = new ActionManager(
            this.getActionManagerConfig(config)
        );

        // 初始化事件监听
        this.initRenderEvent();
        this.initActionEvent();
        this.initMaskEvent();
    }

    /**
	 * 单选选中元素
	 * @param idOrEl 选中的id或者元素
	 * @param event 鼠标事件，用于判断是否是用户主动点击
	 */
    public async select(idOrEl: Id | HTMLElement, event?: MouseEvent) {
        // 获取目标元素
        const el = this.renderer.getTargetElement(idOrEl);
        if (!el || el === this.actionManager.getSelectedEl()) {
            return;
        }

        // 渲染器中选中元素（可能涉及高亮等视觉效果）
        await this.renderer.select([el]);

        // 设置遮罩层的位置和大小
        this.mask.setLayout(el);

        // 操作管理器中选中元素（处理拖拽、缩放等交互）
        this.actionManager.select(el, event);

        // 如果需要自动滚动到视图中
        if (this.autoScrollIntoView || el.dataset.autoScrollIntoView) {
            this.mask.observerIntersection(el);
        }
    }

    /**
	 * 多选选中元素
	 * @param idOrElList 要选中的元素id或元素列表
	 */
    public async multiSelect(idOrElList: HTMLElement[] | Id[]): Promise<void> {
        // 将id或元素转换为实际的DOM元素
        const els = idOrElList.map((idOrEl) =>
            this.renderer.getTargetElement(idOrEl)
        );
        if (els.length === 0) return;

        // 获取最后一个元素作为主要选中元素
        const lastEl = els[els.length - 1];
        if (!lastEl) return;

        // 判断是否减少了组件选择（用于判断是否需要滚动）
        const isReduceSelect = els.length < this.actionManager.getSelectedElList().length;

        // 渲染器中选中多个元素
        await this.renderer.select(els);

        // 遮罩层跟随最后一个元素
        this.mask.setLayout(lastEl);

        // 操作管理器中处理多选
        this.actionManager.multiSelect(idOrElList);

        // 如果需要自动滚动且不是减少选择的情况
        if (
            (this.autoScrollIntoView || lastEl.dataset.autoScrollIntoView) &&
			!isReduceSelect
        ) {
            this.mask.observerIntersection(lastEl);
        }
    }

    /**
	 * 高亮选中元素（鼠标悬停时的效果）
	 * @param idOrEl 要高亮的元素id或元素
	 */
    public highlight(idOrEl: Id | HTMLElement): void {
        this.actionManager.highlight(idOrEl);
    }

    /**
     * 清除高亮效果
     */
    public clearHighlight(): void {
        this.actionManager.clearHighlight();
    }

    /**
	 * 更新组件
	 * @param data 更新组件的数据
	 */
    public async update(data: IUpdateData): Promise<void> {
        const { config } = data;
        // 先更新渲染器中的组件
        await this.renderer.update(data);

        // 通过setTimeout等画布中组件完成渲染更新
        // 这里使用异步是因为DOM更新可能需要时间
        setTimeout(() => {
            const el = this.renderer.getTargetElement(`${config.field}`);
            if (el && this.actionManager.isSelectedEl(el)) {
                // 更新了组件的布局，需要重新设置mask位置
                this.mask.setLayout(el);
                // 组件有更新，需要重新设置选中状态
                this.actionManager.setSelectedEl(el);
                // 更新moveable的操作句柄
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

    /**
     * 设置画布缩放比例
     * @param zoom 缩放比例，不传则使用默认值
     */
    public setZoom(zoom: number = DEFAULT_ZOOM): void {
        this.renderer.setZoom(zoom);
    }

    /**
     * 挂载画布到指定容器
     * @param el 画布父容器DOM元素
     */
    public async mount(el: HTMLDivElement) {
        this.container = el; // 设置根容器
        await this.renderer.mount(el); // 挂载iframe画布
        this.mask.mount(el); // 遮罩挂载到画布兄弟元素

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
	 * 鼠标拖拽着元素，在容器上方悬停，延迟一段时间后，对容器进行标记
	 * 如果悬停时间够长将标记成功，悬停时间短，调用方通过返回的timeoutId取消标记
	 *
	 * 标记的作用：
	 * 1、高亮容器，给用户一个加入容器的交互感知
	 * 2、释放鼠标后，通过标记的标志找到要加入的容器
	 *
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

    /**
     * 获取Moveable操作组件的配置选项
     * @param key 配置项的键名
     * @returns 对应的配置值
     */
    public getMoveableOption<K extends keyof MoveableOptions>(
        key: K
    ): MoveableOptions[K] | undefined {
        return this.actionManager.getMoveableOption(key);
    }

    /**
     * 获取当前拖拽状态
     * @returns 拖拽状态信息
     */
    public getDragStatus() {
        return this.actionManager.getDragStatus();
    }

    /**
     * 禁用多选功能
     */
    public disableMultiSelect() {
        this.actionManager.disableMultiSelect();
    }

    /**
     * 启用多选功能
     */
    public enableMultiSelect() {
        this.actionManager.enableMultiSelect();
    }

    /**
     * 销毁画布实例，清理所有资源
     */
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
	 * 当页面大小改变时，需要同步更新遮罩层和操作管理器的位置
	 * @param page 页面元素
	 */
    private observePageResize(page: HTMLElement): void {
        // 如果已经有监听器，先断开
        if (this.pageResizeObserver) {
            this.pageResizeObserver.disconnect();
        }

        // 创建新的尺寸变化监听器
        if (typeof ResizeObserver !== 'undefined') {
            this.pageResizeObserver = new ResizeObserver((entries) => {
                console.log('observePageResize');
                // 通知遮罩层页面尺寸变化
                this.mask.pageResize(entries);
                // 更新操作管理器的moveable位置
                this.actionManager.updateMoveable();
            });

            this.pageResizeObserver.observe(page);
        }
    }

    /**
     * 获取ActionManager的配置
     * @param config 外部传入的配置
     * @returns actionManage配置对象
     */
    private getActionManagerConfig(
        config: IBoxCoreConfig
    ): IActionManagerConfig {
        const actionManagerConfig: IActionManagerConfig = {
            // 容器高亮相关配置
            containerHighlightClassName: config.containerHighlightClassName,
            containerHighlightDuration: config.containerHighlightDuration,
            containerHighlightType: config.containerHighlightType,

            // 操作相关配置
            moveableOptions: config.moveableOptions,
            container: this.mask.content,
            disabledDragStart: config.disabledDragStart,
            disabledMultiSelect: config.disabledMultiSelect,
            designWidth: this.designWidth,

            // 回调函数配置
            canSelect: config.canSelect,
            isContainer: config.isContainer,
            updateDragEl: config.updateDragEl,

            // 依赖注入的方法
            getRootContainer: () => this.container,
            getRenderDocument: () => this.renderer.getDocument(),
            getTargetElement: (idOrEl: Id | HTMLElement) =>
                this.renderer.getTargetElement(idOrEl),
            getElementsFromPoint: (point: IPoint) =>
                this.renderer.getElementsFromPoint(point)
        };

        return actionManagerConfig;
    }

    // 初始化渲染器事件监听
    private initRenderEvent() {
        console.log('initRenderEvent 注册runtime事件');

        // 注册渲染器的runtime-ready事件
        // 当iframe中的运行时环境准备就绪时触发
        this.renderer.on('runtime-ready', (runtime: IRuntime) => {
            this.emit('runtime-ready', runtime);
        });

        // 页面元素更新事件
        // 当页面配置变化时触发
        this.renderer.on('page-el-update', (el: HTMLElement) => {
            // 画布与遮罩层同步
            this.mask?.observe(el);
            // 监听页面尺寸变化
            this.observePageResize(el);

            this.emit('page-el-update', el);
        });
    }

    /**
     * 初始化遮罩层事件监听
     */
    private initMaskEvent(): void {
        // 监听遮罩层的参考线变化事件
        this.mask.on('change-mask', (data: IGuidesEventData) => {
            // 将参考线信息同步到操作管理器
            this.actionManager.setGuidelines(data.type, data.guides);
            this.emit('change-mask', data);
        });
    }

    /**
	 * 初始化操作相关事件监听
	 * 统一管理所有用户交互操作的事件
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
        // 选中前置事件，用于内部处理选中逻辑
        this.actionManager.on(
            'before-select',
            (idOrEl: Id | HTMLElement, event?: MouseEvent) => {
                this.select(idOrEl, event);
            }
        );

        // 选中完成事件，向外部通知选中结果
        this.actionManager.on(
            'select',
            (selectedEl: HTMLElement, event: MouseEvent) => {
                this.emit('select', selectedEl, event);
            }
        );

        // 多选前置事件，用于内部处理多选逻辑
        this.actionManager.on(
            'before-multi-select',
            (idOrElList: HTMLElement[] | Id[]) => {
                this.multiSelect(idOrElList);
            }
        );

        // 多选完成事件，向外部通知多选结果
        this.actionManager.on(
            'multi-select',
            (selectedElList: HTMLElement[], event: MouseEvent) => {
                this.emit('multi-select', selectedElList, event);
            }
        );

        // 双击事件
        this.actionManager.on('dblclick', (event: MouseEvent) => {
            this.emit('dblclick', event);
        });
    }

    /**
	 * 初始化DragResize类通过ActionManager抛出来的事件监听
     * 处理画布内拖动的事件
	 */
    private initDrEvent(): void {
        // 元素更新事件（位置、大小等属性变化）
        this.actionManager.on('update', (data: IUpdateEventData) => {
            this.emit('update', data);
        });

        // 元素排序事件（层级变化）
        this.actionManager.on('sort', (data: IUpdateEventData) => {
            this.emit('sort', data);
        });

        // 选中父元素事件
        this.actionManager.on('select-parent', () => {
            this.emit('select-parent');
        });

        // 移除元素事件
        this.actionManager.on('remove', (data: IRemoveEventData) => {
            this.emit('remove', data);
        });
    }

    /**
	 * 初始化MultiDragResize类通过ActionManager抛出来的事件监听
	 * 处理多选操作的事件
	 */
    private initMulDrEvent(): void {
        // 多选切换到单选
        this.actionManager.on('change-to-select', (el: HTMLElement, e: MouseEvent) => {
            this.select(el);
            // 先保证画布内完成渲染，再通知外部更新
            setTimeout(() => this.emit('select', el, e));
        });

        // 多选元素更新事件
        this.actionManager.on('multi-update', (data: IUpdateEventData) => {
            this.emit('update', data);
        });
    }

    /**
	 * 初始化Highlight类通过ActionManager抛出来的事件监听
	 * 处理元素高亮相关的事件
	 */
    private initHighlightEvent(): void {
        // 高亮元素事件
        this.actionManager.on('highlight', async(highlightEl: HTMLElement) => {
            this.emit('highlight', highlightEl);
        });
    }

    /**
	 * 初始化鼠标事件监听
	 * 处理画布上的鼠标交互事件
	 */
    private initMouseEvent(): void {
        // 鼠标移动事件
        this.actionManager.on('mousemove', (event: MouseEvent) => {
            this.emit('mousemove', event);
        });

        // 鼠标离开事件
        this.actionManager.on('mouseleave', (event: MouseEvent) => {
            this.emit('mouseleave', event);
        });

        // 拖拽开始事件
        this.actionManager.on('drag-start', (e: OnDragStart) => {
            this.emit('drag-start', e);
        });
    }
}
