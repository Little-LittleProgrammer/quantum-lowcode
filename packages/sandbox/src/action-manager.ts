import {
    Subscribe,
    js_utils_dom_add_class,
    js_utils_dom_remove_class,
    js_utils_throttle_event,
    getDocument
} from '@quantum-lowcode/utils';
import type {
    GetContainer,
    GetElementsFromPoint,
    GetRenderDocument,
    GetTargetElement,
    IActionManagerConfig,
    ICanSelect,
    ICustomizeMoveableOptions,
    ICustomizeMoveableOptionsCallbackConfig,
    IPoint,
    IRemoveEventData,
    IUpdateEventData,
    IsContainer
} from './types';
import { BoxHighlight } from './box-highlight';
import type { Id } from '@quantum-lowcode/schemas';
import { BoxDragResize } from './box-drag-resize';
import {
    BoxDragStatus,
    CONTAINER_HIGHLIGHT_CLASS_NAME,
    ContainerHighlightType,
    GHOST_EL_ID_PREFIX,
    GuidesType,
    MouseButton,
    PAGE_CLASS,
    SelectStatus
} from './const';
import type { MoveableOptions, OnDragStart } from 'moveable';
import { BoxMultiDragResize } from './box-multi-drag-resize';
import DragResizeHelper from './box-drag-resize-helper';
import { Env } from '@quantum-lowcode/core';
import KeyController from 'keycon';
import { isMoveableButton } from './utils';

/** 鼠标事件节流时间（毫秒） */
const throttleTime = 100;
/** 默认容器高亮持续时间（毫秒） */
const defaultContainerHighlightDuration = 800;

/**
 * 操作管理器
 *
 * 这是低代码编辑器的核心操作管理器，负责管理画布上的所有交互操作。
 * 主要功能包括：
 * 1. 监听和处理鼠标事件（单选、多选、高亮、拖拽等）
 * 2. 管理键盘事件（快捷键、状态切换）
 * 3. 协调单选(BoxDragResize)、多选(BoxMultiDragResize)、高亮(BoxHighlight)三个模块
 * 4. 管理选中状态和高亮状态
 * 5. 处理容器高亮和组件加入容器的逻辑
 *
 * @extends Subscribe - 继承事件订阅发布能力
 */
export class ActionManager extends Subscribe {
    /** 设计稿宽度，用于计算缩放比例 */
    private designWidth: number;
    /** 单选拖拽调整管理器 */
    private dr: BoxDragResize;
    /** 多选拖拽调整管理器 */
    private multiDr?: BoxMultiDragResize;
    /** 高亮层管理器 */
    private highlightLayer: BoxHighlight;
    /** 单选、多选、高亮的容器（蒙层mask的content） */
    private container: HTMLElement;
    /** 当前选中的节点 */
    private selectedEl: HTMLElement | undefined;
    /** 多选选中的节点组 */
    private selectedElList: HTMLElement[] = [];
    /** 当前高亮的节点 */
    private highlightedEl: HTMLElement | undefined;
    /** 当前是否处于多选状态 */
    private isMultiSelectStatus = false;
    /** 当拖拽组件到容器上方进入可加入容器状态时，给容器添加的一个class名称 */
    private containerHighlightClassName: string;
    /** 当拖拽组件到容器上方时，需要悬停多久才能将组件加入容器 */
    private containerHighlightDuration: number;
    /** 将组件加入容器的操作方式 */
    private containerHighlightType?: ContainerHighlightType;
    /** Alt键是否被按下 */
    private isAltKeydown = false;

    /** 获取目标元素的方法 */
    private getTargetElement: GetTargetElement;
    /** 获取指定点位置下所有元素的方法 */
    private getElementsFromPoint: GetElementsFromPoint;
    /** 判断元素是否可选中的方法， 没有id的元素不能被选中 */
    private canSelect: ICanSelect;
    /** 判断元素是否为容器的方法， 默认是判断元素是否包含quantum-ui-container类名 */
    private isContainer?: IsContainer;
    /** 获取iframe渲染的文档的方法 */
    private getRenderDocument: GetRenderDocument;
    /** 是否禁用多选功能 */
    private disabledMultiSelect = false;
    /** 配置对象 */
    private config: IActionManagerConfig;

    /**
     * 构造函数
     * @param config 操作管理器配置
     */
    constructor(config: IActionManagerConfig) {
        super();
        this.config = config;
        this.container = config.container;
        this.containerHighlightClassName =
			config.containerHighlightClassName ||
			CONTAINER_HIGHLIGHT_CLASS_NAME;
        this.containerHighlightDuration =
			config.containerHighlightDuration ||
			defaultContainerHighlightDuration;
        this.containerHighlightType = config.containerHighlightType;
        this.designWidth = config.designWidth;
        this.disabledMultiSelect = config.disabledMultiSelect ?? false;
        this.getTargetElement = config.getTargetElement;
        this.getElementsFromPoint = config.getElementsFromPoint;
        this.canSelect = config.canSelect || ((el: HTMLElement) => !!el.id);
        this.getRenderDocument = config.getRenderDocument;
        this.isContainer = config.isContainer;

        // 初始化单选管理器
        this.dr = this.createDr(config);

        // 初始化多选管理器（如果启用）
        if (!this.disabledMultiSelect) {
            this.multiDr = this.createMultiDr(config);
        }

        // 初始化高亮层管理器
        this.highlightLayer = new BoxHighlight({
            container: config.container,
            updateDragEl: config.updateDragEl,
            getRootContainer: config.getRootContainer
        });

        // 初始化事件监听
        this.initMouseEvent();
        this.initKeyEvent();
    }

    /**
     * 禁用多选功能
     */
    public disableMultiSelect() {
        this.disabledMultiSelect = true;
        if (this.multiDr) {
            this.multiDr.destroy();
            this.multiDr = undefined;
        }
    }

    /**
     * 启用多选功能
     */
    public enableMultiSelect() {
        this.disabledMultiSelect = false;
        if (!this.multiDr) {
            this.multiDr = this.createMultiDr(this.config);
        }
    }

    /**
     * 设置水平/垂直参考线
     * @param type 参考线类型（水平或垂直）
     * @param guidelines 参考线坐标数组
     */
    public setGuidelines(type: GuidesType, guidelines: number[]): void {
        this.dr.setGuidelines(type, guidelines);
        this.multiDr?.setGuidelines(type, guidelines);
    }

    /**
     * 清空所有参考线
     */
    public clearGuides(): void {
        this.dr.clearGuides();
        this.multiDr?.clearGuides();
    }

    /**
     * 更新moveable实例
     * 主要调用场景：元素配置变更、页面大小变更时需要更新
     * @param el 发生变更的元素，如果不传则更新所有
     */
    public updateMoveable(el?: HTMLElement): void {
        this.dr.updateMoveable(el);
        // 多选时不可配置元素，因此不存在多选元素变更，不需要传el
        this.multiDr?.updateMoveable();
    }

    /**
     * 判断指定元素是否为当前单选选中的元素
     * @param el 要判断的元素
     * @returns 是否为选中元素
     */
    public isSelectedEl(el: HTMLElement): boolean {
        // 有可能dom已经重新渲染，不再是原来的dom了，所以这里判断id，而不是判断el === this.selectedDom
        return el.id === this.selectedEl?.id;
    }

    /**
     * 设置当前选中的元素
     * @param el 要设置为选中的元素
     */
    public setSelectedEl(el?: HTMLElement): void {
        this.selectedEl = el;
    }

    /**
     * 获取当前选中的元素
     * @returns 当前选中的元素
     */
    public getSelectedEl(): HTMLElement | undefined {
        return this.selectedEl;
    }

    /**
     * 获取多选选中的元素列表
     * @returns 多选选中的元素列表
     */
    public getSelectedElList(): HTMLElement[] {
        return this.selectedElList;
    }

    /**
     * 获取moveable的配置选项
     * @param key 配置选项的键名
     * @returns 配置选项的值
     */
    public getMoveableOption<K extends keyof MoveableOptions>(
        key: K
    ): MoveableOptions[K] | undefined {
        if (this.dr.getTarget()) {
            return this.dr.getOption(key);
        }
        if (this.multiDr?.targetList.length) {
            return this.multiDr.getOption(key);
        }
    }

    /**
     * 获取鼠标位置下方第一个可选中的元素
     * 如果元素层叠，返回的是最上层的可选中元素
     * @param event 鼠标事件
     * @returns 鼠标下方第一个可选中元素，如果没有则返回undefined
     */
    public async getElementFromPoint(
        event: MouseEvent
    ): Promise<HTMLElement | undefined> {
        const els = this.getElementsFromPoint(event as IPoint);

        this.emit('get-elements-from-point', els);

        let stopped = false;
        const stop = () => (stopped = true);

        // 遍历元素列表，找到第一个可选中的元素
        for (const el of els) {
            if (
                !el.id.startsWith(GHOST_EL_ID_PREFIX) &&
				(await this.isElCanSelect(el, event, stop))
            ) {
                if (stopped) break;
                return el;
            }
        }
    }

    /**
     * 判断一个元素能否在当前场景被选中
     * @param el 被判断的元素
     * @param event 鼠标事件
     * @param stop 通过该函数通知调用方终止对剩余元素的判断
     * @returns 能否选中
     */
    public async isElCanSelect(
        el: HTMLElement,
        event: MouseEvent,
        stop: () => boolean
    ): Promise<boolean> {
        // 执行业务方传入的判断逻辑
        const canSelectByProp = await this.canSelect(el, event, stop);
        if (!canSelectByProp) return false;

        // 多选状态下的特殊判断规则
        if (this.isMultiSelectStatus) {
            return this.canMultiSelect(el, stop);
        }
        return true;
    }

    /**
     * 判断一个元素是否可以被多选
     * 如果当前元素是page，则调用stop函数告诉调用方不必继续判断其它元素了
     * @param el 要判断的元素
     * @param stop 停止判断的回调函数
     * @returns 是否可以多选
     */
    public canMultiSelect(el: HTMLElement, stop: () => boolean): boolean {
        // 多选状态下不可以选中magic-ui-page，并停止继续向上层选中
        if (el.className.includes(PAGE_CLASS)) {
            stop();
            return false;
        }
        const selectedEl = this.getSelectedEl();
        // 先单击选中了页面(magic-ui-page)，再按住多选键多选时，任一元素均可选中
        if (selectedEl?.className.includes(PAGE_CLASS)) {
            return true;
        }
        return this.multiDr?.canSelect(el, selectedEl) || false;
    }

    /**
     * 选中指定元素（单选）
     * @param el 要选中的元素
     * @param event 鼠标事件
     */
    public select(el: HTMLElement, event: MouseEvent | undefined): void {
        this.setSelectedEl(el);
        this.clearSelectStatus(SelectStatus.MULTI_SELECT);
        this.dr.select(el, event);
    }

    /**
     * 多选指定元素列表
     * @param idOrElList 元素列表或元素ID列表
     */
    public multiSelect(idOrElList: HTMLElement[] | Id[]): void {
        this.selectedElList = idOrElList.map((idOrEl) => this.getTargetElement(idOrEl));
        this.clearSelectStatus(SelectStatus.SELECT);
        this.multiDr?.multiSelect(this.selectedElList);
    }

    /**
     * 获取当前高亮的元素
     * @returns 当前高亮的元素
     */
    public getHighlightEl(): HTMLElement | undefined {
        return this.highlightedEl;
    }

    /**
     * 设置当前高亮的元素
     * @param el 要设置为高亮的元素
     */
    public setHighlightEl(el: HTMLElement | undefined): void {
        this.highlightedEl = el;
    }

    /**
     * 高亮指定元素
     * @param idOrEl 要高亮的元素或元素ID
     */
    public highlight(idOrEl: Id | HTMLElement) {
        let el;
        try {
            el = this.getTargetElement(idOrEl);
        } catch {
            // 如果获取元素失败，清除高亮
            this.clearHighlight();
            return;
        }

        // 选中组件不高亮、多选拖拽状态不高亮
        if (
            el === this.getSelectedEl() ||
			this.multiDr?.dragState === BoxDragStatus.ING
        ) {
            this.clearHighlight();
            return;
        }

        // 如果是同一个元素或元素不存在，直接返回
        if (el === this.highlightedEl || !el) return;

        this.highlightLayer.highlight(el);
        this.highlightedEl = el;
        this.emit('highlight', el);
    }

    /**
     * 清除高亮状态
     */
    public clearHighlight() {
        this.setHighlightEl(undefined);
        this.highlightLayer.clearHighlight();
    }

    /**
     * 用于在切换选择模式时清除上一次的状态
     * @param selectType 需要清理的选择模式
     */
    public clearSelectStatus(selectType: SelectStatus) {
        if (selectType === SelectStatus.MULTI_SELECT) {
            this.multiDr?.clearSelectStatus();
            this.selectedElList = [];
        } else {
            this.dr.clearSelectStatus();
        }
    }

    /**
     * 找到鼠标下方的容器，通过添加className对容器进行标记
     * @param event 鼠标事件
     * @param excludeElList 计算鼠标点所在容器时要排除的元素列表
     */
    public async addContainerHighlightClassName(
        event: MouseEvent,
        excludeElList: Element[]
    ): Promise<void> {
        const doc = this.getRenderDocument();
        if (!doc) return;

        const els = this.getElementsFromPoint(event);

        // 找到第一个符合条件的容器元素并添加高亮类名
        for (const el of els) {
            if (
                !el.id.startsWith(GHOST_EL_ID_PREFIX) &&
				(await this.isContainer?.(el)) &&
				!excludeElList.includes(el)
            ) {
                js_utils_dom_add_class(el, this.containerHighlightClassName);
                break;
            }
        }
    }

    /**
     * 延迟标记容器
     * 鼠标拖拽着元素，在容器上方悬停，延迟一段时间后对容器进行标记
     * 如果悬停时间够长将标记成功，悬停时间短，调用方通过返回的timeoutId取消标记
     * 标记的作用：1、高亮容器，给用户一个加入容器的交互感知；2、释放鼠标后，通过标记找到要加入的容器
     * @param event 鼠标事件
     * @param excludeElList 计算鼠标所在容器时要排除的元素列表
     * @returns timeoutId，调用方在鼠标移走时要取消该timeout，阻止标记
     */
    public delayedMarkContainer(
        event: MouseEvent,
        excludeElList: Element[] = []
    ): NodeJS.Timeout | undefined {
        if (this.canAddToContainer()) {
            return globalThis.setTimeout(() => {
                this.addContainerHighlightClassName(event, excludeElList);
            }, this.containerHighlightDuration);
        }
        return undefined;
    }

    /**
     * 获取当前的拖拽状态
     * @returns 拖拽状态
     */
    public getDragStatus() {
        return this.dr.getDragStatus();
    }

    /**
     * 销毁操作管理器，清理所有事件监听和资源
     */
    public destory() {
        this.container.removeEventListener('mousedown', this.mouseDownHandler);
        this.container.removeEventListener(
            'mousemove',
            this.mouseMoveHandler as any
        );
        this.container.removeEventListener(
            'mouseleave',
            this.mouseLeaveHandler
        );
        this.container.removeEventListener('wheel', this.mouseWheelHandler);
        this.container.removeEventListener('dblclick', this.dblclickHandler);
        this.dr.destroy();
        this.multiDr?.destroy();
        this.highlightLayer.destroy();
    }

    /**
     * 创建单选拖拽调整管理器
     * @param config 配置对象
     * @returns 单选拖拽调整管理器实例
     */
    private createDr(config: IActionManagerConfig) {
        // 创建拖拽调整辅助器
        const createDrHelper = () =>
            new DragResizeHelper({
                container: config.container,
                updateDragEl: config.updateDragEl,
                designWidth: this.designWidth
            });

        const dr = new BoxDragResize({
            container: config.container,
            disabledDragStart: config.disabledDragStart,
            moveableOptions: this.changeCallback(config.moveableOptions, false),
            dragResizeHelper: createDrHelper(),
            getRootContainer: config.getRootContainer,
            getRenderDocument: config.getRenderDocument,
            markContainerEnd: this.markContainerEnd.bind(this) as GetContainer,
            delayedMarkContainer: this.delayedMarkContainer.bind(this)
        });

        // 监听更新事件
        dr.on('update', (data: IUpdateEventData) => {
            // 点击组件并立即拖动的场景，要保证select先被触发，延迟update通知
            setTimeout(() => this.emit('update', data));
        });

        // 监听排序事件
        dr.on('sort', (data: IUpdateEventData) => {
            // 点击组件并立即拖动的场景，要保证select先被触发，延迟update通知
            setTimeout(() => this.emit('sort', data));
        });

        // 监听选择父元素事件
        dr.on('select-parent', () => {
            this.emit('select-parent');
        });

        // 监听删除事件
        dr.on('remove', () => {
            const drTarget = this.dr.getTarget();
            if (!drTarget) return;
            const data: IRemoveEventData = {
                data: [{ el: drTarget }]
            };
            this.emit('remove', data);
        });

        // 监听拖拽开始事件
        dr.on('drag-start', (e: OnDragStart) => {
            this.emit('drag-start', e);
        });

        return dr;
    }

    /**
     * 创建多选拖拽调整管理器
     * @param config 配置对象
     * @returns 多选拖拽调整管理器实例
     */
    private createMultiDr(config: IActionManagerConfig) {
        // 创建拖拽调整辅助器
        const createDrHelper = () =>
            new DragResizeHelper({
                container: config.container,
                updateDragEl: config.updateDragEl,
                designWidth: this.designWidth
            });

        const multiDr = new BoxMultiDragResize({
            container: config.container,
            moveableOptions: this.changeCallback(config.moveableOptions, true),
            dragResizeHelper: createDrHelper(),
            getRootContainer: config.getRootContainer,
            getRenderDocument: config.getRenderDocument,
            markContainerEnd: this.markContainerEnd.bind(this) as GetContainer,
            delayedMarkContainer: this.delayedMarkContainer.bind(this)
        });

        // 监听多选更新事件
        multiDr?.on('update', (data: IUpdateEventData) => {
            this.emit('multi-update', data);
        });

        // 监听切换到单选事件
        multiDr?.on('change-to-select', async(id: Id, e: MouseEvent) => {
            // 如果还在多选状态，不触发切换到单选
            if (this.isMultiSelectStatus) return false;
            const el = this.getTargetElement(id);
            this.emit('change-to-select', el, e);
        });

        return multiDr;
    }

    /**
     * 包装moveable选项回调函数，注入必要的上下文信息
     * @param options moveable选项
     * @param isMulti 是否为多选模式
     * @returns 包装后的选项
     */
    private changeCallback(
        options: ICustomizeMoveableOptions,
        isMulti: boolean
    ): ICustomizeMoveableOptions {
        // 在actionManager才能获取到各种参数，在这里传好参数有比较好的扩展性
        if (typeof options === 'function') {
            return () => {
                if (typeof options === 'function') {
                    const cfg: ICustomizeMoveableOptionsCallbackConfig = {
                        targetEl: this.selectedEl,
                        targetElId: this.selectedEl?.id,
                        targetEls: this.selectedElList,
                        targetElIds: this.selectedElList?.map(
                            (item) => item.id
                        ),
                        isMulti,
                        document: this.getRenderDocument()
                    };
                    return options(cfg);
                }
                return options;
            };
        }
        return options;
    }

    /**
     * 执行多选逻辑前的准备工作
     * 准备好多选选中元素列表
     * @param event 鼠标事件
     */
    private async beforeMultiSelect(event: MouseEvent): Promise<void> {
        const el = await this.getElementFromPoint(event);
        if (!el) return;

        // 如果已有单选选中元素，不是quantum-ui-page就可以加入多选列表
        if (
            this.selectedEl &&
			!this.selectedEl.className.includes(PAGE_CLASS)
        ) {
            this.selectedElList.push(this.selectedEl as HTMLElement);
            this.setSelectedEl(undefined);
        }

        // 判断元素是否已在多选列表中
        const existIndex = this.selectedElList.findIndex(
            (selectedDom) => selectedDom.id === el.id
        );

        if (existIndex !== -1) {
            // 再次点击取消选中
            this.selectedElList.splice(existIndex, 1);
        } else {
            // 添加到多选列表
            this.selectedElList.push(el);
        }
    }

    /**
     * 判断当前状态下能否将组件加入容器
     * 默认是鼠标悬停一段时间加入，alt模式则是按住alt+鼠标悬停一段时间加入
     * @returns 能否加入容器
     */
    private canAddToContainer(): boolean {
        return (
            this.containerHighlightType === ContainerHighlightType.DEFAULT ||
			(this.containerHighlightType === ContainerHighlightType.ALT &&
				this.isAltKeydown)
        );
    }

    /**
     * 结束对容器的标记状态
     * @returns 被标记的容器元素，没有标记的容器时返回null
     */
    private markContainerEnd(): HTMLElement | null {
        const doc = this.getRenderDocument();
        if (doc && this.canAddToContainer()) {
            const el: HTMLElement | null = doc.querySelector(
                `.${this.containerHighlightClassName}`
            );
            if (el)
                js_utils_dom_remove_class(el, this.containerHighlightClassName);
            return el;
        }
        return null;
    }

    /**
     * 初始化鼠标事件监听
     */
    private initMouseEvent(): void {
        console.log('initMouseEvent', this.container);
        this.container.addEventListener('mousedown', this.mouseDownHandler);
        this.container.addEventListener('mousemove', this.mouseMoveHandler);
        this.container.addEventListener('mouseleave', this.mouseLeaveHandler);
        this.container.addEventListener('wheel', this.mouseWheelHandler);
        this.container.addEventListener('dblclick', this.dblclickHandler);
    }

    /**
     * 初始化键盘事件监听
     * 主要处理多选快捷键和alt键的监听
     */
    private initKeyEvent(): void {
        const { isMac } = new Env();
        const ctrl = isMac ? 'meta' : 'ctrl';

        // 多选启用状态监听
        KeyController.global.keydown(ctrl, (e) => {
            e.inputEvent.preventDefault();
            if (!this.disabledMultiSelect) {
                this.isMultiSelectStatus = true;
            }
        });

        // ctrl+tab切到其他窗口，需要将多选状态置为false
        KeyController.global.on('blur', () => {
            if (!this.disabledMultiSelect) {
                this.isMultiSelectStatus = false;
            }
        });

        // 释放多选键时，退出多选状态
        KeyController.global.keyup(ctrl, (e) => {
            e.inputEvent.preventDefault();
            if (!this.disabledMultiSelect) {
                this.isMultiSelectStatus = false;
            }
        });

        // alt键监听，用于启用拖拽组件加入容器状态
        KeyController.global.keydown('alt', (e) => {
            e.inputEvent.preventDefault();
            this.isAltKeydown = true;
        });

        // 释放alt键时，结束容器标记状态
        KeyController.global.keyup('alt', (e) => {
            e.inputEvent.preventDefault();
            this.markContainerEnd();
            this.isAltKeydown = false;
        });
    }

    /**
     * 鼠标按下事件处理器
     * 在down事件中集中处理画布中选中操作渲染，在up事件中再通知外部编辑器更新
     * @param event 鼠标事件
     */
    private mouseDownHandler = async(event: MouseEvent): Promise<void> => {
        console.log('mouseDownHandler');
        // 清除高亮状态
        // this.clearHighlight();
        event.stopImmediatePropagation();
        event.stopPropagation();

        // 判断是否应该停止触发选择操作
        if (this.isStopTriggerSelect(event)) return;

        // 点击状态下不触发高亮事件
        this.container.removeEventListener('mousemove', this.mouseMoveHandler);

        // 判断触发多选还是单选
        if (this.isMultiSelectStatus) {
            await this.beforeMultiSelect(event);
            if (this.selectedElList.length > 0) {
                this.emit('before-multi-select', this.selectedElList);
            }
        } else {
            const el = await this.getElementFromPoint(event);
            if (!el) return;
            this.emit('before-select', el, event);
        }

        // 添加mouseup事件监听
        getDocument().addEventListener('mouseup', this.mouseUpHandler);
    };

    /**
     * 鼠标移动事件处理器（节流处理）
     * 主要用于处理高亮效果
     * @param event 鼠标事件
     */
    private mouseMoveHandler = (event: MouseEvent) => {
        js_utils_throttle_event(
            async(event: MouseEvent): Promise<void> => {
                // 如果鼠标在moveable的控制点上，不处理高亮
                if (
                    (event.target as HTMLDivElement)?.classList?.contains(
                        'moveable-direction'
                    )
                ) {
                    return;
                }

                const el = await this.getElementFromPoint(event);
                if (!el) {
                    this.clearHighlight();
                    return;
                }

                this.emit('mousemove', event);
                this.highlight(el);
            },
            { time: throttleTime, context: this, args: [event] }
        );
    };

    /**
     * 判断是否应该停止触发选择操作
     * @param event 鼠标事件
     * @returns 是否应该停止
     */
    private isStopTriggerSelect(event: MouseEvent): boolean {
        // 只处理左键和右键
        if (
            event.button !== MouseButton.LEFT &&
			event.button !== MouseButton.RIGHT
        )
            return true;

        if (!event.target) return true;

        const targetClassList = (event.target as HTMLDivElement).classList;

        // 如果单击多选选中区域，则不需要再触发选中了，要支持此处单击后进行拖动
        if (
            !this.isMultiSelectStatus &&
			targetClassList.contains('moveable-area')
        ) {
            return true;
        }

        // 点击对象如果是边框锚点，则可能是resize; 点击对象是功能按钮
        if (
            targetClassList.contains('moveable-control') ||
			isMoveableButton(event.target as Element)
        ) {
            return true;
        }

        return false;
    }

    /**
     * 鼠标释放事件处理器
     * 在up事件中负责对外通知选中事件，通知画布之外的编辑器更新
     * @param event 鼠标事件
     */
    private mouseUpHandler = (event: MouseEvent): void => {
        // 移除mouseup事件监听
        getDocument().removeEventListener('mouseup', this.mouseUpHandler);
        // 恢复mousemove事件监听
        this.container.addEventListener('mousemove', this.mouseMoveHandler);

        // 根据当前状态触发相应的选中事件
        if (this.isMultiSelectStatus) {
            this.emit('multi-select', this.selectedElList, event);
        } else {
            this.emit('select', this.selectedEl, event);
        }
    };

    /**
     * 鼠标离开事件处理器
     * @param event 鼠标事件
     */
    private mouseLeaveHandler = (event: MouseEvent) => {
        // 延迟清除高亮，避免快速移动时的闪烁
        setTimeout(() => this.clearHighlight(), throttleTime);
        this.emit('mouseleave', event);
    };

    /**
     * 鼠标滚轮事件处理器
     * 滚轮滚动时清除高亮状态
     */
    private mouseWheelHandler = () => {
        this.clearHighlight();
    };

    /**
     * 鼠标双击事件处理器
     * @param event 鼠标事件
     */
    private dblclickHandler = (event: MouseEvent) => {
        this.emit('dblclick', event);
    };
}
