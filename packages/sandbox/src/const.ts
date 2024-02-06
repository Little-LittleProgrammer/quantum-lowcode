/** 默认放到缩小倍数 */
export const DEFAULT_ZOOM = 1;

/** 参考线类型 */
export enum GuidesType {
    /** 水平 */
    HORIZONTAL = 'horizontal',
    /** 垂直 */
    VERTICAL = 'vertical',
}

/** 选中节点的class name */
export const SELECTED_CLASS = 'quantum-sandbox-selected-area';

/** 流式布局下拖动时需要clone一个镜像节点，镜像节点的id前缀 */
export const GHOST_EL_ID_PREFIX = 'ghost_el_';

/** 拖动的时候需要在蒙层中创建一个占位节点，该节点的id前缀 */
export const DRAG_EL_ID_PREFIX = 'drag_el_';

/** 高亮时需要在蒙层中创建一个占位节点，该节点的id前缀 */
export const HIGHLIGHT_EL_ID_PREFIX = 'highlight_el_';

export enum ZIndex {
    /** 蒙层，用于监听用户操作，需要置于顶层 */
    MASK = '99999',
    /** 选中的节点 */
    SELECTED_EL = '666',
    GHOST_EL = '700',
    DRAG_EL = '9',
    HIGHLIGHT_EL = '8',
}

/** 布局方式 */
export enum Mode {
    /** 绝对定位布局 */
    ABSOLUTE = 'absolute',
    /** 固定定位布局 */
    FIXED = 'fixed',
    /** 流式布局 */
    SORTABLE = 'sortable',
}
