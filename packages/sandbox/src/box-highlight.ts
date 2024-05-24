import { Subscribe } from '@quantum-lowcode/utils';
import Moveable from 'moveable';
import { TargetShadow } from './target-shadow';
import { GetContainer, IBoxHighlightConfig } from './types';
import { HIGHLIGHT_EL_ID_PREFIX, ZIndex } from './const';

export class BoxHighlight extends Subscribe {
    public container:HTMLElement;
    public target?: HTMLElement;
    public moveable?: Moveable
    public targetShadow?: TargetShadow;
    private getRootContainer: GetContainer;

    constructor(config: IBoxHighlightConfig) {
        super();
        this.container = config.container;
        this.getRootContainer = config.getRootContainer;

        this.targetShadow = new TargetShadow({
            container: this.container,
            updateDragEl: config.updateDragEl,
            idPrefix: HIGHLIGHT_EL_ID_PREFIX,
            zIndex: ZIndex.HIGHLIGHT_EL,
        });
    }

    /**
     * 高亮鼠标悬停组件
     * @param el 选中组件的Dom节点元素
     */
    public highlight(el: HTMLElement) {
        if (!el || el === this.target) return;
        this.target = el;
        this.targetShadow?.update(el);
        if (this.moveable) {
            this.moveable.zoom = 2;
            this.moveable.updateRect();
        } else {
            this.moveable = new Moveable(this.container, {
                target: this.targetShadow?.el,
                origin: false,
                rootContainer: this.getRootContainer(),
                zoom: 2,
            });
        }
    }

    /**
     * 清空高亮
     */
    public clearHighlight() {
        if (!this.moveable || !this.target) return;
        this.moveable.zoom = 0;
        this.moveable.updateRect();
        this.target = undefined;
    }

    /**
   * 销毁实例
   */
    public destroy(): void {
        this.moveable?.destroy();
        this.targetShadow?.destroy();
        this.moveable = undefined;
        this.targetShadow = undefined;
    }
}
