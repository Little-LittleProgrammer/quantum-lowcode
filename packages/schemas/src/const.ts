export enum NodeType {
    CONTAINER = 'container',
    PAGE = 'page',
    ROOT = 'root',
    NODE = 'node'
}

export enum EventType {
    CLICK = 'click',
    CHANGE = 'change',
    TOUCH = 'touch',
}

export enum ActionType {
    COMP = 'component',
    /** 数据源 */
    DATA_SOURCE = 'dataSource',
}

export const DEFAULT_DESIGN_WIDTH = 720;

export const DEFAULT_PAGE_MAX_WIDTH = 540;
