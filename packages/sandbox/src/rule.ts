import { Subscribe } from '@quantum-lowcode/utils';
import type { IRuleOptions } from './types';
import { GuidesType } from './const';
import Guides, { type GuidesEvents, type GuidesOptions } from '@scena/guides';

const guidesClass = 'quantum-sandbox-guides';

// 辅助线,移动线规则
export class Rule extends Subscribe {
    public hGuides?: Guides;
    public vGuides?: Guides;
    public horizontalGuidelines: number[] = [];
    public verticalGuidelines: number[] = [];

    private container?: HTMLDivElement;
    private containerResizeObserver?: ResizeObserver;
    private isShowGuides = true;
    private guidesOptions?: Partial<GuidesOptions>;

    constructor(container: HTMLDivElement, options?: IRuleOptions) {
        super();

        if (options?.disabledRule) {
            return;
        }

        this.guidesOptions = options?.guidesOptions || {};

        this.container = container;
        this.hGuides = this.createGuides(GuidesType.HORIZONTAL, this.horizontalGuidelines);
        this.vGuides = this.createGuides(GuidesType.VERTICAL, this.verticalGuidelines);

        this.containerResizeObserver = new ResizeObserver(() => {
            this.vGuides?.resize();
            this.hGuides?.resize();
        });

        this.containerResizeObserver.observe(this.container);
    }

    public setGuides([hLines, vLines]: [number[], number[]]) {
        // TODO, 辅助线和移动线 change-guides
        this.emit('change-mask', {
            type: GuidesType.HORIZONTAL,
            guides: hLines
        });

        this.emit('change-mask', {
            type: GuidesType.VERTICAL,
            guides: vLines
        });
    }

    /**
   * 清空所有参考线
   */
    public clearGuides() {
        this.setGuides([[], []]);
    }

    /**
   * 是否显示标尺
   * @param show 是否显示
   */
    public showRule(show = true) {
    // 当尺子隐藏时发生大小变化，显示后会变形，所以这里做重新初始化处理
        if (show) {
            this.destroyGuides();

            this.hGuides = this.createGuides(GuidesType.HORIZONTAL, this.horizontalGuidelines);
            this.vGuides = this.createGuides(GuidesType.VERTICAL, this.verticalGuidelines);
        } else {
            this.hGuides?.setState({
                rulerStyle: {
                    visibility: 'hidden'
                }
            });

            this.vGuides?.setState({
                rulerStyle: {
                    visibility: 'hidden'
                }
            });
        }
    }

    public scrollRule(scrollTop: number) {
        this.hGuides?.scrollGuides(scrollTop);
        this.hGuides?.scroll(0);

        this.vGuides?.scrollGuides(0);
        this.vGuides?.scroll(scrollTop);
    }

    public destroy(): void {
        this.destroyGuides();
        this.hGuides?.off('changeGuides', this.hGuidesChangeGuidesHandler);
        this.vGuides?.off('changeGuides', this.vGuidesChangeGuidesHandler);
        this.containerResizeObserver?.disconnect();
        this.clear();
    }

    public destroyGuides(): void {
        this.hGuides?.destroy();
        this.vGuides?.destroy();

        this.container?.querySelectorAll(`.${guidesClass}`).forEach((el) => {
            el.remove();
        });

        this.hGuides = undefined;
        this.vGuides = undefined;
        this.container = undefined;
    }

    private createGuides = (type: GuidesType, defaultGuides: number[] = []): Guides | undefined => {
        if (!this.container) {
            return;
        }

        const guides = new Guides(this.container, {
            type,
            defaultGuides,
            displayDragPos: true,
            className: guidesClass,
            backgroundColor: '#fff',
            lineColor: '#000',
            textColor: '#000',
            style: this.getGuidesStyle(type),
            showGuides: this.isShowGuides,
            ...this.guidesOptions
        });

        const changEventHandler = {
            [GuidesType.HORIZONTAL]: this.hGuidesChangeGuidesHandler,
            [GuidesType.VERTICAL]: this.vGuidesChangeGuidesHandler
        }[type];

        if (changEventHandler) {
            guides.on('changeGuides', changEventHandler);
        }

        return guides;
    };

    private getGuidesStyle = (type: GuidesType) => ({
        position: 'fixed',
        zIndex: 1,
        left: type === GuidesType.HORIZONTAL ? 0 : '-30px',
        top: type === GuidesType.HORIZONTAL ? '-30px' : 0,
        width: type === GuidesType.HORIZONTAL ? '100%' : '30px',
        height: type === GuidesType.HORIZONTAL ? '30px' : '100%'
    });

    private hGuidesChangeGuidesHandler = (e: GuidesEvents['changeGuides']) => {
        this.horizontalGuidelines = e.guides;
        this.emit('change-guides', {
            type: GuidesType.HORIZONTAL,
            guides: this.horizontalGuidelines
        });
    };

    private vGuidesChangeGuidesHandler = (e: GuidesEvents['changeGuides']) => {
        this.verticalGuidelines = e.guides;
        this.emit('change-guides', {
            type: GuidesType.VERTICAL,
            guides: this.verticalGuidelines
        });
    };
}
