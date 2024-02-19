import Moveable, { MoveableOptions } from 'moveable';
import { MoveableManager } from './moveable-manager';
import { BoxDragStatus, Mode } from './const';
import DragResizeHelper from './box-drag-resize-helper';
import {
    DelayedMarkContainer,
    GetContainer,
    GetRenderDocument,
    IBoxDragResizeConfig
} from './types';
import { down, getMode, up } from './utils';

/**
 * 管理单选操作，响应选中操作，初始化moveableOption参数并初始化moveable，处理moveable回调事件对组件进行更新
 * @extends MoveableOptionsManager
 */
export class BoxDragResize extends MoveableManager {
    // 目标节点
    private target?: HTMLElement;
    // moveable实例
    private moveable?: Moveable;
    // 拖拽状态
    private dragState: BoxDragStatus = BoxDragStatus.END;
    private dragResizeHelper: DragResizeHelper;
    private disabledDragStart?: boolean;
    private getRenderDocument: GetRenderDocument;
    private markContainerEnd: GetContainer;
    private delayedMarkContainer: DelayedMarkContainer;

    constructor(config: IBoxDragResizeConfig) {
        super(config);

        this.getRenderDocument = config.getRenderDocument;
        this.markContainerEnd = config.markContainerEnd;
        this.delayedMarkContainer = config.delayedMarkContainer;
        this.disabledDragStart = config.disabledDragStart;

        this.dragResizeHelper = config.dragResizeHelper;

        this.on('update-moveable', () => {
            if (this.moveable) {
                this.updateMoveable();
            }
        });
    }

    public getTarget() {
        return this.target;
    }

    /**
	 * 将选中框渲染并覆盖到选中的组件Dom节点上方
	 * 当选中的节点不是absolute时，会创建一个新的节点出来作为拖拽目标
	 * @param el 选中组件的Dom节点元素
	 * @param event 鼠标事件
	 */
    public select(el: HTMLElement, event?: MouseEvent) {
        // 从不能拖动到能拖动的节点之间切换，要重新创建moveable，不然dragStart不生效
        if (!this.moveable || el !== this.target) {
            this.initMoveable(el);
        } else {
            this.updateMoveable(el);
        }

        if (event && !this.disabledDragStart) {
            this.moveable?.dragStart(event);
        }
    }

    /**
	 * 初始化选中框并渲染
	 */
    public updateMoveable(el = this.target) {
        if (!this.moveable) return;
        if (!el) throw new Error('未选中任何节点');

        const options: MoveableOptions = this.init(el);

        Object.entries(options).forEach(([key, val]) => {
            (this.moveable as any)[key] = val;
        });
    }

    public clearSelectStatus(): void {
        if (!this.moveable) return;
        this.dragResizeHelper.destroyShadowEl();
        this.moveable.target = null;
        this.moveable.updateRect();
    }

    public getDragStatus(): BoxDragStatus {
        return this.dragState;
    }

    /**
	 * 销毁实例
	 */
    public destroy(): void {
        this.moveable?.destroy();
        this.dragResizeHelper.destroy();
        this.dragState = BoxDragStatus.END;
        this.clear();
    }

    private init(el: HTMLElement): MoveableOptions {
        // 如果有滚动条会导致resize时获取到width，height不准确
        if (/(auto|scroll)/.test(el.style.overflow)) {
            el.style.overflow = 'hidden';
        }

        this.target = el;
        this.mode = getMode(el);

        this.dragResizeHelper.updateShadowEl(el);
        this.dragResizeHelper.setMode(this.mode);

        this.setElementGuidelines([this.target as HTMLElement]);

        return this.getOptions(false, {
            target: this.dragResizeHelper.getShadowEl(),
        });
    }

    /**
     * init moveable event
     * @param el
     */
    private initMoveable(el: HTMLElement) {
        const options: MoveableOptions = this.init(el);
        this.dragResizeHelper.clear();

        this.moveable?.destroy();

        this.moveable = new Moveable(this.container, {
            ...options,
        });

        this.bindResizeEvent();
        this.bindDragEvent();
        this.bindRotateEvent();
        this.bindScaleEvent();
    }

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

                if (timeout) {
                    globalThis.clearTimeout(timeout);
                    timeout = undefined;
                }
                timeout = this.delayedMarkContainer(e.inputEvent, [
                    this.target
                ]);

                this.dragState = BoxDragStatus.ING;

                this.dragResizeHelper.onDrag(e);
            })
            .on('dragEnd', () => {
                if (timeout) {
                    globalThis.clearTimeout(timeout);
                    timeout = undefined;
                }

                const parentEl = this.markContainerEnd();
                // 点击不拖动时会触发dragStart和dragEnd，但是不会有drag事件
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
                                transform: frame?.get('transform'),
                            },
                        }
                    ],
                });
            });
    }

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
                                transform: frame?.get('transform'),
                            },
                        }
                    ],
                });
            });
    }

    private sort(): void {
        if (!this.target || !this.dragResizeHelper.getGhostEl())
            throw new Error('未知错误');
        const { top, } = this.dragResizeHelper
            .getGhostEl()!
            .getBoundingClientRect();
        const { top: oriTop, } = this.target.getBoundingClientRect();
        const deltaTop = top - oriTop;
        if (Math.abs(deltaTop) >= this.target.clientHeight / 2) {
            if (deltaTop > 0) {
                this.emit('sort', down(deltaTop, this.target));
            } else {
                this.emit('sort', up(deltaTop, this.target));
            }
        } else {
            this.emit('sort', {
                src: this.target.id,
                dist: this.target.id,
            });
        }
    }

    private update(
        isResize = false,
        parentEl: HTMLElement | null = null
    ): void {
        if (!this.target) return;

        const doc = this.getRenderDocument();

        if (!doc) return;

        const rect = this.dragResizeHelper.getUpdatedElRect(
            this.target,
            parentEl,
            doc
        );

        this.emit('update', {
            data: [
                {
                    el: this.target,
                    style: isResize ? rect : { left: rect.left, top: rect.top, },
                }
            ],
            parentEl,
        });
    }
}
