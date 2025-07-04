import Moveable, { type MoveableOptions } from 'moveable';
import { MoveableManager } from './moveable-manager';
import { BoxDragStatus, Mode } from './const';
import DragResizeHelper from './box-drag-resize-helper';
import type {
    DelayedMarkContainer,
    GetContainer,
    GetRenderDocument,
    IBoxDragResizeConfig
} from './types';
import { down, getMode, up } from './utils';

/**
 * 盒子拖拽缩放管理器
 * 管理单选操作，响应选中操作，初始化 MoveableOptions 参数并初始化 Moveable 实例，处理 Moveable 回调事件对组件进行更新
 * @extends MoveableManager
 */
export class BoxDragResize extends MoveableManager {
    /** 当前选中的目标节点 */
    private target?: HTMLElement;
    /** Moveable 实例，用于处理拖拽、缩放、旋转等操作 */
    private moveable?: Moveable;
    /** 拖拽状态，用于跟踪当前拖拽操作的状态 */
    private dragState: BoxDragStatus = BoxDragStatus.END;
    /** 拖拽缩放辅助器，用于处理具体的拖拽缩放逻辑 */
    private dragResizeHelper: DragResizeHelper;
    /** 是否禁用拖拽开始事件 */
    private disabledDragStart?: boolean;
    /** 获取渲染文档的函数 */
    private getRenderDocument: GetRenderDocument;
    /** 标记容器结束的函数 */
    private markContainerEnd: GetContainer;
    /** 延迟标记容器的函数 */
    private delayedMarkContainer: DelayedMarkContainer;

    /**
     * 构造函数
     * @param config 盒子拖拽缩放配置参数
     */
    constructor(config: IBoxDragResizeConfig) {
        super(config);

        this.getRenderDocument = config.getRenderDocument;
        this.markContainerEnd = config.markContainerEnd;
        this.delayedMarkContainer = config.delayedMarkContainer;
        this.disabledDragStart = config.disabledDragStart;

        this.dragResizeHelper = config.dragResizeHelper;

        // 监听更新 Moveable 事件
        this.on('update-moveable', () => {
            if (this.moveable) {
                this.updateMoveable();
            }
        });
    }

    /**
     * 获取当前选中的目标元素
     * @returns 当前选中的目标元素
     */
    public getTarget() {
        return this.target;
    }

    /**
     * 选中指定元素并渲染选中框
     * 将选中框渲染并覆盖到选中的组件 DOM 节点上方
     * 当选中的节点不是 absolute 定位时，会创建一个新的节点出来作为拖拽目标
     * @param el 选中组件的 DOM 节点元素
     * @param event 鼠标事件，用于启动拖拽
     */
    public select(el: HTMLElement, event?: MouseEvent) {
        // 从不能拖动到能拖动的节点之间切换，要重新创建 Moveable，不然 dragStart 不生效
        if (!this.moveable || el !== this.target) {
            this.initMoveable(el);
        } else {
            this.updateMoveable(el);
        }

        // 如果提供了鼠标事件且未禁用拖拽开始，则启动拖拽
        if (event && !this.disabledDragStart) {
            this.moveable?.dragStart(event);
        }
    }

    /**
     * 更新 Moveable 实例的配置和状态
     * 初始化选中框并渲染
     * @param el 目标元素，默认为当前选中的目标元素
     */
    public updateMoveable(el = this.target) {
        if (!this.moveable) return;
        if (!el) throw new Error('未选中任何节点');

        const options: MoveableOptions = this.init(el);

        // 将配置选项应用到 Moveable 实例
        Object.entries(options).forEach(([key, val]) => {
            (this.moveable as any)[key] = val;
        });
        this.moveable.updateRect();
    }

    /**
     * 清除选中状态
     * 销毁阴影元素并清空 Moveable 目标
     */
    public clearSelectStatus(): void {
        if (!this.moveable) return;
        this.dragResizeHelper.destroyShadowEl();
        this.moveable.target = null;
        this.moveable.updateRect();
    }

    /**
     * 获取当前拖拽状态
     * @returns 当前拖拽状态
     */
    public getDragStatus(): BoxDragStatus {
        return this.dragState;
    }

    /**
     * 销毁实例
     * 清理 Moveable 实例、拖拽辅助器并重置状态
     */
    public destroy(): void {
        this.moveable?.destroy();
        this.dragResizeHelper.destroy();
        this.dragState = BoxDragStatus.END;
        this.clear();
    }

    /**
     * 初始化目标元素并生成 Moveable 配置选项
     * @param el 目标元素
     * @returns Moveable 配置选项
     */
    private init(el: HTMLElement): MoveableOptions {
        // 如果有滚动条会导致 resize 时获取到 width、height 不准确，设置为 hidden
        if (/(auto|scroll)/.test(el.style.overflow)) {
            el.style.overflow = 'hidden';
        }

        this.target = el;
        this.mode = getMode(el);

        // 生成元素 Shadow（阴影元素）
        this.dragResizeHelper.updateShadowEl(el);
        this.dragResizeHelper.setMode(this.mode);

        // 设置元素辅助线
        this.setElementGuidelines([this.target as HTMLElement]);

        return this.getOptions(false, {
            target: this.dragResizeHelper.getShadowEl()
        });
    }

    /**
     * 初始化 Moveable 实例和事件绑定
     * @param el 目标元素
     */
    private initMoveable(el: HTMLElement) {
        const options: MoveableOptions = this.init(el);
        this.dragResizeHelper.clear();

        // 销毁已存在的 Moveable 实例
        this.moveable?.destroy();

        // 创建新的 Moveable 实例
        this.moveable = new Moveable(this.container, {
            ...options
        });

        // 绑定各种事件
        this.bindResizeEvent();
        this.bindDragEvent();
        this.bindRotateEvent();
        this.bindScaleEvent();
    }

    /**
     * 绑定缩放事件
     * 处理元素的缩放开始、缩放中、缩放结束事件
     */
    private bindResizeEvent(): void {
        if (!this.moveable) throw new Error('moveable 未初始化');

        this.moveable
            .on('resizeStart', (e) => {
                if (!this.target) return;

                this.dragState = BoxDragStatus.START;
                this.dragResizeHelper.onResizeStart(e);
            })
            .on('resize', (e) => {
                if (
                    !this.moveable ||
                    !this.target ||
                    !this.dragResizeHelper.getShadowEl()
                )
                    return;

                this.dragState = BoxDragStatus.ING;

                this.dragResizeHelper.onResize(e);
            })
            .on('resizeEnd', () => {
                this.dragState = BoxDragStatus.END;
                this.update(true);
            });
    }

    /**
     * 绑定拖拽事件
     * 处理元素的拖拽开始、拖拽中、拖拽结束事件
     */
    private bindDragEvent(): void {
        if (!this.moveable) throw new Error('moveable 未初始化');

        let timeout: NodeJS.Timeout | undefined;

        this.moveable
            .on('dragStart', (e) => {
                if (!this.target) throw new Error('未选中组件');

                this.dragState = BoxDragStatus.START;

                this.dragResizeHelper.onDragStart(e);
                this.emit('drag-start', e);
            })
            .on('drag', (e) => {
                if (!this.target || !this.dragResizeHelper.getShadowEl())
                    return;

                // 清除之前的定时器
                if (timeout) {
                    globalThis.clearTimeout(timeout);
                    timeout = undefined;
                }
                // 延迟标记容器
                timeout = this.delayedMarkContainer(e.inputEvent, [
                    this.target
                ]);

                this.dragState = BoxDragStatus.ING;

                this.dragResizeHelper.onDrag(e);
            })
            .on('dragEnd', () => {
                // 清除定时器
                if (timeout) {
                    globalThis.clearTimeout(timeout);
                    timeout = undefined;
                }

                const parentEl = this.markContainerEnd();
                // 点击不拖动时会触发 dragStart 和 dragEnd，但是不会有 drag 事件
                if (this.dragState === BoxDragStatus.ING) {
                    if (parentEl) {
                        this.update(false, parentEl);
                    } else {
                        switch (this.mode) {
                            case Mode.SORTABLE:
                                this.sort();
                                break;
                            default:
                                this.update();
                        }
                    }
                }

                this.dragState = BoxDragStatus.END;
                this.dragResizeHelper.destroyGhostEl();
            });
    }

    /**
     * 绑定旋转事件
     * 处理元素的旋转开始、旋转中、旋转结束事件
     */
    private bindRotateEvent(): void {
        if (!this.moveable) throw new Error('moveable 未初始化');

        this.moveable
            .on('rotateStart', (e) => {
                this.dragState = BoxDragStatus.START;
                this.dragResizeHelper.onRotateStart(e);
            })
            .on('rotate', (e) => {
                if (!this.target || !this.dragResizeHelper.getShadowEl())
                    return;
                this.dragState = BoxDragStatus.ING;
                this.dragResizeHelper.onRotate(e);
            })
            .on('rotateEnd', (e) => {
                this.dragState = BoxDragStatus.END;
                const frame = this.dragResizeHelper?.getFrame(e.target);
                this.emit('update', {
                    data: [
                        {
                            el: this.target,
                            style: {
                                transform: frame?.get('transform')
                            }
                        }
                    ]
                });
            });
    }

    /**
     * 绑定缩放事件
     * 处理元素的缩放开始、缩放中、缩放结束事件
     */
    private bindScaleEvent(): void {
        if (!this.moveable) throw new Error('moveable 未初始化');

        this.moveable
            .on('scaleStart', (e) => {
                this.dragState = BoxDragStatus.START;
                this.dragResizeHelper.onScaleStart(e);
            })
            .on('scale', (e) => {
                if (!this.target || !this.dragResizeHelper.getShadowEl())
                    return;
                this.dragState = BoxDragStatus.ING;
                this.dragResizeHelper.onScale(e);
            })
            .on('scaleEnd', (e) => {
                this.dragState = BoxDragStatus.END;
                const frame = this.dragResizeHelper.getFrame(e.target);
                this.emit('update', {
                    data: [
                        {
                            el: this.target,
                            style: {
                                transform: frame?.get('transform')
                            }
                        }
                    ]
                });
            });
    }

    /**
     * 处理排序逻辑
     * 根据拖拽距离判断是否需要进行排序操作
     */
    private sort(): void {
        if (!this.target || !this.dragResizeHelper.getGhostEl())
            throw new Error('未知错误');

        // 获取幽灵元素和目标元素的位置信息
        const { top } = this.dragResizeHelper
            .getGhostEl()!
            .getBoundingClientRect();
        const { top: oriTop } = this.target.getBoundingClientRect();
        const deltaTop = top - oriTop;

        // 判断是否需要排序：移动距离超过元素高度的一半
        if (Math.abs(deltaTop) >= this.target.clientHeight / 2) {
            if (deltaTop > 0) {
                // 向下移动
                this.emit('sort', down(deltaTop, this.target));
            } else {
                // 向上移动
                this.emit('sort', up(deltaTop, this.target));
            }
        } else {
            // 移动距离不够，保持原位
            this.emit('sort', {
                src: this.target.id,
                dist: this.target.id
            });
        }
    }

    /**
     * 更新元素位置和尺寸
     * @param isResize 是否为缩放操作
     * @param parentEl 父元素，用于重新定位
     */
    private update(
        isResize = false,
        parentEl: HTMLElement | null = null
    ): void {
        if (!this.target) return;

        const doc = this.getRenderDocument();

        if (!doc) return;

        // 获取更新后的元素矩形信息
        const rect = this.dragResizeHelper.getUpdatedElRect(
            this.target,
            parentEl,
            doc
        );

        // 发送更新事件
        this.emit('update', {
            data: [
                {
                    el: this.target,
                    style: isResize ? rect : { left: rect.left, top: rect.top }
                }
            ],
            parentEl
        });
    }
}
