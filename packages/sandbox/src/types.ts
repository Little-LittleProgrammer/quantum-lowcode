import type { LowCodeRoot } from '@quantum-lowcode/core';
import type {
    ISchemasContainer,
    ISchemasNode,
    ISchemasRoot,
    Id
} from '@quantum-lowcode/schemas';
import type { MoveableOptions as GlobalMoveableOptions } from 'moveable';
import { ContainerHighlightType, GuidesType, ZIndex } from './const';
import DragResizeHelper from './box-drag-resize-helper';

export type MoveableOptions = GlobalMoveableOptions;

/** 编辑器所需的runtime方法 */
export interface IRuntime {
    getApp?: () => LowCodeRoot | undefined;
    beforeSelect?: (el: HTMLElement) => Promise<boolean> | boolean;
    updateRootConfig?: (config: ISchemasRoot) => void;
    updatePageField?: (id: Id) => void;
    select?: (id: Id) => Promise<HTMLElement> | HTMLElement;
    add?: (data: IUpdateData) => void;
    update?: (data: IUpdateData) => void;
    sortNode?: (data: ISortEventData) => void;
    delete?: (data: IDeleteData) => void;
}

/** 传给 runtime 的回调 */
export interface IQuantum {
    /** 当前页面的根节点变化时调用该方法，编辑器会同步该el和stage的大小
	 * 同步mask和el的大小
	 * 该方法由stage注入到iframe.contentWindow中 */
    onPageElUpdate: (el: HTMLElement) => void;

    onRuntimeReady: (runtime: IRuntime) => void;
}

/**画布大小 */
export type IRect = {
    width: number;
    height: number;
} & IOffset;

/**offset */
export interface IOffset {
    left: number;
    top: number;
}

/** 鼠标指针 */
export interface IPoint {
    clientX: number;
    clientY: number;
}

/** 画布 辅助线 */
export interface IGuidesEventData {
    type: GuidesType;
    guides: number[];
}

/** 画布 windowcontent 对象 */
export interface IRuntimeWindow extends Window {
    quantum: IQuantum;
}

export type ITargetElement = HTMLElement | SVGElement;

/** 业务方自定义的moveableOptions，可以是配置，也可以是回调函数 */
export type ICustomizeMoveableOptions =
	| ((config?: ICustomizeMoveableOptionsCallbackConfig) => MoveableOptions)
	| MoveableOptions
	| undefined;

export type ICanSelect = (
    el: HTMLElement,
    event: MouseEvent,
    stop: () => boolean
) => boolean | Promise<boolean>;
export type IsContainer = (el: HTMLElement) => boolean | Promise<boolean>;
export type GetContainer = () => HTMLDivElement | undefined;
export type GetRenderDocument = () => Document | undefined;
/** render提供的接口，通过坐标获得坐标下所有HTML元素数组 */
export type GetElementsFromPoint = (point: IPoint) => HTMLElement[];
export type DelayedMarkContainer = (event: MouseEvent, exclude: Element[]) => NodeJS.Timeout | undefined;
export type GetTargetElement = (idOrEl: Id | HTMLElement) => HTMLElement;
export type IUpdateDragEl = (
    el: ITargetElement,
    target: ITargetElement,
    container: HTMLElement
) => void;

export interface IBoxCoreConfig {
    /** 需要对齐的dom节点的CSS选择器字符串 */
    snapElementQuerySelector?: string;
    // HTML地址，可以是一个HTTP地址，如果和编辑器不同域，需要设置跨域，也可以是一个相对或绝对路径
    runtimeUrl?: string;
    // 画布缩放
    zoom?: number;
    autoScrollIntoView?: boolean;
    containerHighlightClassName?: string;
    containerHighlightDuration?: number;
    containerHighlightType?: ContainerHighlightType;
    disabledDragStart?: boolean;
    moveableOptions?: ICustomizeMoveableOptions;
    canSelect?: ICanSelect;
    isContainer?: IsContainer;
    updateDragEl?: IUpdateDragEl;
    guidesOptions?: Partial<IGuidesOptions>;
    disabledMultiSelect?: boolean;
    designWidth?: number
}

export interface ICustomizeMoveableOptionsCallbackConfig {
    targetEl?: HTMLElement;
    targetElId?: string;
    targetEls?: HTMLElement[];
    targetElIds?: string[];
    isMulti: boolean;
    document?: Document;
}

export interface IUpdateData {
    config: ISchemasNode;
    parent?: ISchemasContainer;
    parentId?: Id;
    root: ISchemasRoot;
}

export interface IDeleteData {
    id: Id;
    parentId: Id;
    root: ISchemasRoot;
}

export interface ISortEventData {
    src: Id;
    dist: Id;
    root?: ISchemasRoot;
}
export interface IGuidesOptions {
    [key: string]: any;
}

export interface IRuleOptions {
    guidesOptions?: Partial<IGuidesOptions>;
}

export interface ITargetShadowConfig {
    container: HTMLElement;
    zIndex?: ZIndex;
    updateDragEl?: IUpdateDragEl;
    idPrefix?: string;
}

export interface IBoxDragResizeConfig {
    container: HTMLElement;
    dragResizeHelper: DragResizeHelper;
    moveableOptions?: ICustomizeMoveableOptions;
    disabledDragStart?: boolean;
    getRootContainer: GetContainer;
    getRenderDocument: GetRenderDocument;
    markContainerEnd: GetContainer;
    delayedMarkContainer: DelayedMarkContainer;
}
export interface IBoxMultiDragResizeConfig {
    container: HTMLElement;
    dragResizeHelper: DragResizeHelper;
    moveableOptions?: ICustomizeMoveableOptions;
    getRootContainer: GetContainer;
    getRenderDocument: GetRenderDocument;
    markContainerEnd: GetContainer;
    delayedMarkContainer: DelayedMarkContainer;
}

export interface IActionManagerConfig {
    container: HTMLElement;
    containerHighlightClassName?: string;
    containerHighlightDuration?: number;
    containerHighlightType?: ContainerHighlightType;
    moveableOptions?: ICustomizeMoveableOptions;
    disabledDragStart?: boolean;
    disabledMultiSelect?: boolean;
    canSelect?: ICanSelect;
    isContainer?: IsContainer;
    getRootContainer: GetContainer;
    getRenderDocument: GetRenderDocument;
    updateDragEl?: IUpdateDragEl;
    getTargetElement: GetTargetElement;
    getElementsFromPoint: GetElementsFromPoint;
    designWidth: number
}

export interface IUpdateEventData {
    data: {
        el: HTMLElement;
        style: {
            width?: number;
            height?: number;
            left?: number;
            top?: number;
            transform?: {
                rotate?: string;
                scale?: string;
            };
        };
        ghostEl?: HTMLElement;
    }[];
    parentEl: HTMLElement | null;
}

export interface IRemoveEventData {
    data: {
        el: HTMLElement;
    }[];
}

export interface IBoxHighlightConfig {
    container: HTMLElement;
    updateDragEl?: IUpdateDragEl;
    getRootContainer: GetContainer;
}

export interface IDragResizeHelperConfig {
    container: HTMLElement;
    updateDragEl?: IUpdateDragEl;
    designWidth: number;
}

export interface IMoveableManagerConfig {
    container: HTMLElement;
    moveableOptions?: ICustomizeMoveableOptions;
    getRootContainer: GetContainer;
}
