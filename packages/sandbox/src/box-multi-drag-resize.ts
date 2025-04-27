import Moveable from 'moveable';
import { BoxDragStatus, DRAG_EL_ID_PREFIX, Mode } from './const';
import DragResizeHelper from './box-drag-resize-helper';
import type {
    DelayedMarkContainer,
    GetContainer,
    GetRenderDocument,
    IBoxMultiDragResizeConfig,
    IMoveableManagerConfig
} from './types';
import { MoveableManager } from './moveable-manager';
import { getMode } from './utils';

// TODO 用于多选组,以实现同时拖拽
export class BoxMultiDragResize extends MoveableManager {
    /** 画布容器 */
    public container: HTMLElement;
    /** 多选: 目标节点组 */
    public targetList: HTMLElement[] = [];
    /**Moveable实例 */
    public moveableMulti?: Moveable;
    public dragState: BoxDragStatus = BoxDragStatus.END;
    private dragResizeHelper: DragResizeHelper;
    private getRenderDocument: GetRenderDocument;
    private markContainerEnd: GetContainer;
    private delayedMarkContainer: DelayedMarkContainer;

    constructor(config: IBoxMultiDragResizeConfig) {
        const moveableOptionsManagerConfig: IMoveableManagerConfig = {
            container: config.container,
            moveableOptions: config.moveableOptions,
            getRootContainer: config.getRootContainer,
        };
        super(moveableOptionsManagerConfig);

        this.container = config.container;
        this.getRenderDocument = config.getRenderDocument;
        this.markContainerEnd = config.markContainerEnd;
        this.delayedMarkContainer = config.delayedMarkContainer;

        this.dragResizeHelper = config.dragResizeHelper;

        this.on('update-moveable', () => {
            if (this.moveableMulti) {
                this.updateMoveable();
            }
        });
    }

    /**
	 * 多选
	 */
    public multiSelect(els: HTMLElement[]) {
        if (!els || els.length === 0) {
            return;
        }
        this.mode = getMode(els[0]);
        this.targetList = els;

        this.dragResizeHelper.updateGroup(els);

        this.setElementGuidelines(this.targetList);

        this.moveableMulti?.destroy();
        this.dragResizeHelper.clear();

        this.moveableMulti = new Moveable(
            this.container,
            this.getOptions(true, {
                target: this.dragResizeHelper.getShadowEls(),
            })
        );

        let timeout: NodeJS.Timeout | undefined;

        this.moveableMulti
            .on('resizeGroupStart', (e) => {
                this.dragResizeHelper.onResizeGroupStart(e);
                this.dragState = BoxDragStatus.START;
            })
            .on('resizeGroup', (e) => {
                this.dragResizeHelper.onResizeGroup(e);
                this.dragState = BoxDragStatus.ING;
            })
            .on('resizeGroupEnd', () => {
                this.update(true);
                this.dragState = BoxDragStatus.END;
            })
            .on('dragGroupStart', (e) => {
                this.dragResizeHelper.onDragGroupStart(e);
                this.dragState = BoxDragStatus.START;
            })
            .on('dragGroup', (e) => {
                if (timeout) {
                    globalThis.clearTimeout(timeout);
                    timeout = undefined;
                }
                timeout = this.delayedMarkContainer(
                    e.inputEvent,
                    this.targetList
                );

                this.dragResizeHelper.onDragGroup(e);
                this.dragState = BoxDragStatus.ING;
            })
            .on('dragGroupEnd', () => {
                const parentEl = this.markContainerEnd();
                this.update(false, parentEl);
                this.dragState = BoxDragStatus.END;
            })
            .on('clickGroup', (e) => {
                const { inputTarget, targets, } = e;
                // 如果有多个元素被选中，同时点击的元素在选中元素中的其中一项，可能是多选态切换为该元素的单选态，抛事件给上一层继续判断是否切换
                if (targets.length > 1 && targets.includes(inputTarget)) {
                    this.emit(
                        'change-to-select',
                        inputTarget.id.replace(DRAG_EL_ID_PREFIX, ''),
                        e.inputEvent
                    );
                }
            });
    }

    public canSelect(
        el: HTMLElement,
        selectedEl: HTMLElement | undefined
    ): boolean {
        const curMode = getMode(el);
        let selectedElMode = '';

        // 流式布局不支持多选
        if (curMode === Mode.SORTABLE) {
            return false;
        }

        if (this.targetList.length === 0 && selectedEl) {
            // 单选后切换为多选
            selectedElMode = getMode(selectedEl);
        } else if (this.targetList.length > 0) {
            // 已加入多选列表的布局模式是一样的，取第一个判断
            selectedElMode = getMode(this.targetList[0]);
        }

        // 定位模式不同，不可混选
        if (curMode !== selectedElMode) {
            return false;
        }
        return true;
    }

    public updateMoveable(eleList = this.targetList) {
        if (!this.moveableMulti) return;
        if (!eleList) throw new Error('未选中任何节点');

        this.targetList = eleList;
        this.dragResizeHelper.setTargetList(eleList);

        const options = this.getOptions(true, {
            target: this.dragResizeHelper.getShadowEls(),
        });

        Object.entries(options).forEach(([key, value]) => {
            (this.moveableMulti as any)[key] = value;
        });
        this.moveableMulti.updateRect();
    }

    /**
	 * 清除多选状态
	 */
    public clearSelectStatus(): void {
        if (!this.moveableMulti) return;
        this.dragResizeHelper.clearMultiSelectStatus();
        this.moveableMulti.target = null;
        this.moveableMulti.updateTarget();
        this.targetList = [];
    }

    /**
	 * 销毁实例
	 */
    public destroy(): void {
        this.moveableMulti?.destroy();
        this.dragResizeHelper.destroy();
    }

    /**
	 * 拖拽完成后将更新的位置信息暴露给上层业务方，业务方可以接收事件进行保存
	 * @param isResize 是否进行大小缩放
	 */
    private update(
        isResize = false,
        parentEl: HTMLElement | null = null
    ): void {
        if (this.targetList.length === 0) return;

        const doc = this.getRenderDocument();
        if (!doc) return;

        const data = this.targetList.map((targetItem) => {
            const rect = this.dragResizeHelper.getUpdatedElRect(
                targetItem,
                parentEl,
                doc
            );
            return {
                el: targetItem,
                style: isResize ? rect : { left: rect.left, top: rect.top, },
            };
        });
        this.emit('update', { data, parentEl, });
    }
}
