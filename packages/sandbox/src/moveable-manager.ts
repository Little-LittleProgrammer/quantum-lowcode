import {
    Subscribe,
    createElement,
    isFunction,
    isString,
    js_utils_deep_merge,
    js_utils_dom_offset
} from '@quantum-lowcode/utils';
import { AbleActionEventType, GuidesType, Mode } from './const';
import {
    ElementGuidelineValueOption,
    MoveableOptions,
    MoveableRefType
} from 'moveable';
import { GetContainer, IMoveableManagerConfig } from './types';
import { Fn } from '@quantum-lowcode/schemas';
import { moveableMenu } from './moveable-menu';

export class MoveableManager extends Subscribe {
    /** 布局方式：流式布局、绝对定位、固定定位 */
    public mode: Mode = Mode.ABSOLUTE;

    /** 布局容器 */
    protected container: HTMLElement;
    protected options: MoveableOptions = {};

    /** 水平参考线 */
    private horizontalGuidelines: number[] = [];
    /** 垂直参考线 */
    private verticalGuidelines: number[] = [];
    /** 对齐元素集合 */
    private elementGuidelines: HTMLElement[] = [];
    /** 由外部调用方（编辑器）传入进来的moveable默认参数，可以为空，也可以是一个回调函数 */
    private customizedOptions?: (() => MoveableOptions) | MoveableOptions;
    /** 获取整个画布的根元素（mount函数中挂载的container） */
    private getRootContainer: GetContainer;

    constructor(config: IMoveableManagerConfig) {
        super();
        this.customizedOptions = config.moveableOptions;
        this.container = config.container;
        this.getRootContainer = config.getRootContainer;
    }

    public getOption<K extends keyof MoveableOptions>(
        key: K
    ): MoveableOptions[K] {
        return this.options[key];
    }

    /**
	 * 设置水平/垂直参考线
	 * @param type 参考线类型
	 * @param guidelines 参考线坐标数组
	 */
    public setGuidelines(type: GuidesType, guidelines: number[]): void {
        console.log('参考线', type, guidelines);
        if (type === GuidesType.HORIZONTAL) {
            this.horizontalGuidelines = guidelines;
        } else if (type === GuidesType.VERTICAL) {
            this.verticalGuidelines = guidelines;
        }
        this.emit('update-moveable');
    }

    /**
	 * 清除横向和纵向的参考线
	 */
    public clearGuides(): void {
        this.horizontalGuidelines = [];
        this.verticalGuidelines = [];

        this.emit('update-moveable');
    }

    /**
	 * 设置对齐元素集合
	 * @param elements 对齐元素集合
	 */
    protected setElementGuidelines(elements: HTMLElement[]): void {
        this.elementGuidelines.forEach((node) => {
            node.remove();
        });
        this.elementGuidelines = [];

        //设置选中元素的周围元素，用于选中元素跟周围元素对齐辅助
        const elementGuidelines: Array<
        ElementGuidelineValueOption | MoveableRefType<Element>
        > =
			this.getCustomizeOptions()?.elementGuidelines ||
			Array.from(elements[0]?.parentElement?.children || []);

        if (this.mode === Mode.ABSOLUTE) {
            this.container.append(
                this.createGuidelineElements(elements, elementGuidelines)
            );
        }
    }

    /**
     * 获取moveable参数
     * @param isMultiSelect 是否多选模式
     * @param runtimeOptions 调用时实时传进来的的moveable参数
     * @returns moveable所需参数
     */
    protected getOptions(isMultiSelect: boolean, runtimeOptions: MoveableOptions = {}): MoveableOptions {
        const defaultOptions = this.getDefaultOptions(isMultiSelect);
        const customizedOptions = this.getCustomizeOptions();

        this.options = js_utils_deep_merge(js_utils_deep_merge(defaultOptions, customizedOptions), runtimeOptions);
        return this.options;
    }

    /**
	 * 获取单选和多选的moveable公共参数
	 * @returns moveable公共参数
	 */
    private getDefaultOptions(isMultiSelect: boolean): MoveableOptions {
        const isSortable = this.mode === Mode.SORTABLE;

        const commonOptions = {
            draggable: true,
            resizable: true,
            rootContainer: this.getRootContainer(),
            zoom: 1,
            throttleDrag: 0,
            snappable: true,
            horizontalGuidelines: this.horizontalGuidelines,
            verticalGuidelines: this.verticalGuidelines,
            elementGuidelines: this.elementGuidelines,
            bounds: {
                top: 0,
                left: 0,
                right: this.container.clientWidth,
                bottom: isSortable ? undefined : this.container.clientHeight
            }
        };
        const differenceOptions = isMultiSelect
            ? this.getMultiOptions()
            : this.getSingleOptions();

        return js_utils_deep_merge(commonOptions, differenceOptions);
    }

    /**
	 * 获取单选下的差异化参数
	 * @returns {MoveableOptions} moveable options参数
	 */
    private getSingleOptions(): MoveableOptions {
        const isAbsolute = this.mode === Mode.ABSOLUTE;
        const isFixed = this.mode === Mode.FIXED;

        return {
            origin: false,
            dragArea: false,
            scalable: false,
            rotatable: false,
            snapGap: isAbsolute || isFixed,
            snapThreshold: 5,
            snapDigit: 0,
            isDisplaySnapDigit: isAbsolute,
            snapDirections: {
                top: isAbsolute,
                right: isAbsolute,
                bottom: isAbsolute,
                left: isAbsolute,
                center: isAbsolute,
                middle: isAbsolute
            },
            elementSnapDirections: {
                top: isAbsolute,
                right: isAbsolute,
                bottom: isAbsolute,
                left: isAbsolute
            },
            isDisplayInnerSnapDigit: true,
            dragTarget: '.moveable-drag-area-button',
            dragTargetSelf: true,
            props: {
                actions: true
            },
            ables: [moveableMenu(this.actionHandler.bind(this))]
        };
    }

    /**
	 * 获取多选下的差异化参数
	 * @returns {MoveableOptions} moveable options参数
	 */
    private getMultiOptions(): MoveableOptions {
        return {
            defaultGroupRotate: 0,
            defaultGroupOrigin: '50% 50%',
            startDragRotate: 0,
            throttleDragRotate: 0,
            origin: true,
            padding: { left: 0, top: 0, right: 0, bottom: 0 }
        };
    }

    /**
     * 这是给selectParentAbles的回调函数，用于触发选中父元素事件
     */
    private actionHandler(type: AbleActionEventType): void {
        this.emit(type);
    }

    /**
	 * 获取业务方自定义的moveable参数
	 */
    private getCustomizeOptions(): MoveableOptions | undefined {
        if (typeof this.customizedOptions === 'function') {
            return this.customizedOptions();
        }
        return this.customizedOptions;
    }

    /**
	 * 为需要辅助对齐的元素创建div
	 * @param selectedElList 选中的元素列表，需要排除在对齐元素之外
	 * @param allElList 全部元素列表
	 * @returns frame 辅助对齐元素集合的页面片
	 */
    private createGuidelineElements(
        selectedElList: HTMLElement[],
        allElList: Array<ElementGuidelineValueOption | MoveableRefType<Element>>
    ): DocumentFragment {
        const frame = globalThis.document.createDocumentFragment();

        for (const element of allElList) {
            let node =
				(element as ElementGuidelineValueOption).element ||
				(element as MoveableRefType<Element>);

            if (!node || isString(node)) continue;

            if (isFunction(node)) {
                node = (node as Fn)();
            }

            if (this.isInElementList(node as Element, selectedElList)) continue;

            const { width, height } = (node as Element).getBoundingClientRect();

            if (!width || !height) continue;

            const { left, top } = js_utils_dom_offset(node as HTMLElement);

            const elementGuideline = createElement({
                cssText: `position: absolute;width: ${width}px;height: ${height}px;top: ${top}px;left: ${left}px`,
                className: ''
            });
            this.elementGuidelines.push(elementGuideline);
            frame.append(elementGuideline);
        }
        return frame;
    }

    /**
	 * 判断一个元素是否在元素列表里面
	 * @param ele 元素
	 * @param eleList 元素列表
	 * @returns 是否在元素列表里面
	 */
    private isInElementList(ele: Element, eleList: Element[]): boolean {
        for (const eleItem of eleList) {
            if (ele === eleItem) return true;
        }
        return false;
    }
}
