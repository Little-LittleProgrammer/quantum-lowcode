// 数组节点模型
import { ActionType, NodeType } from './const';
import { FieldToDepMap, IDataSourceSchema, IDepData } from './event';
export type Id = string
export interface Fn<T = any, R = T> {
    (...arg: T[]): R;
}

export interface IfShow {
    field: string[];
    op: 'is' | 'not' | '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not in' | 'between' | 'not between';
    value: any;
    range?: number[];
}

export enum HookType {
    /** 代码块钩子标识 */
    CODE = 'code',
}

export interface HookData {
    field: Id;
    type?: ActionType;
    params: any;
    [key: string]: any
}

export interface Hooks {
    hookType?: HookType.CODE;
    hookData?: HookData[];
}

export type Method = 'get' | 'GET' | 'delete' | 'DELETE' | 'post' | 'POST' | 'put' | 'PUT';
export interface IHttpOptions {
    /** 请求链接 */
    url: string;
    /** query参数 */
    params?: Record<string, string>;
    /** body数据 */
    data?: Record<string, any>;
    /** 请求头 */
    headers?: Record<string, string>;
    /** 请求方法 GET/POST */
    method?: Method;
    [key: string]: any;
}
export type IRequestFunction = (options: IHttpOptions) => Promise<any>;

export interface ILowCodeRoot {
    schemasRoot?: ISchemasRoot;
    request?: IRequestFunction;
    registerEvent?: Fn;
    dataSourceDep: Map<Id, FieldToDepMap>
    [key: string]: any;
}

type NumberProperties<T> = {
    [P in keyof T]: T[P] | number;
};

/**
 * 数据组件 scheams
 */
export interface ISchemasNode{
    type: NodeType.NODE | string
    /**
     * 组件字段, 也为数据节点唯一值id
     */
    field: Id
    /**
     * 组件名
     */
    component?: string;
    /**
     * 组件的属性集合
     */
    componentProps?: Record<string, any> ;
    label?: string;
    /**
     * 样式
     */
    // style?: Partial<CSSStyleDeclaration> | ((el: HTMLElement) => CSSStyleDeclaration)
    style?: NumberProperties<Partial<CSSStyleDeclaration>>

    /**
     * 是否展示
     */
    ifShow?: IfShow[] | boolean | Fn
    /**
     * 子节点
     */
    children?: (ISchemasNode | ISchemasContainer)[]
    created?: Hooks;
    mounted?: Hooks
    [key: string]: any;
}

/**
 * 数据容器 scheams
 */
export interface ISchemasContainer extends ISchemasNode{
    type: NodeType.CONTAINER | string;
    children: (ISchemasNode | ISchemasContainer)[]
}

/**
 * 数据页面 scheams
 */
export interface ISchemasPage extends ISchemasContainer{
    type: NodeType.PAGE
}

export interface IMetaDes {
    keywords: string[];
    description: string[];
}

/**
 * 根节点
 */
export interface ISchemasRoot extends ISchemasNode {
    type: NodeType.ROOT;
    children: ISchemasPage[];
    name: string;
    description?: IMetaDes;
    dataSources?: IDataSourceSchema[]; // 管理数据;
    designWidth?: number
}

/**
 * 数据源
 */

export const schemasRootType = `
declare interface IDataSourceSchema {
    /** 数据源类型，根据类型来实例化；例如http则使用new HttpDataSource */
    type: 'base' | 'http';
    /** 实体ID */
    id: string
    /** 实体名称，用于关联时展示 */
    title?: string;
    /** 实体描述，鼠标hover时展示 */
    description?: string;
    /** 字段列表 */
    fields: IDataSchema[];
    /** 方法列表 */
    methods: ICodeBlockContent[];
    /** mock数据 */
    mocks?: IMockSchema;
    options?: IHttpOptions;
    responseOptions?: {
        dataPath?: string
    };
    autoFetch?: boolean
}

declare interface IDepData {
    /** 组件Field */
    field: Id; // nodeField
    key: string; // path
    rawValue: string 
    type: 'data' | 'cond'
}

declare interface IDataSchema {
    type?: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'any';
    /** 键名 */
    name: string;
    /** 展示名称 */
    title?: string;
    /** 实体描述，鼠标hover时展示 */
    description?: string;
    /** 默认值 */
    defaultValue?: any;
    /** type === 'object' || type === 'array' */
    fields?: IDataSchema[];
}

declare interface ICodeBlockContent {
    title?: string;
    /** 代码块名称 */
    name: string;
    /** 代码块内容 */
    content: ((...args: any[]) => any) | string;
    /** 参数定义 */
    params?: ICodeParam[] | [];
    /** 注释 */
    description?: string;
    timing?: 'beforeInit' | 'afterInit' | 'beforeRequest' | 'afterRequest'
    /** 扩展字段 */
    [propName: string]: any;
}

declare interface ICodeParam {
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: string;
    /** 参数描述 */
    description?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 扩展字段 */
    [propName: string]: any;
}

declare interface IMockSchema {
    /** 名称 */
    title: string;
    /** 详细描述 */
    description?: string;
    /** mock数据 */
    data: Record<string | number, any>;
}

declare type Id = string
type SelectPartial<T, V extends keyof T> = Partial<Omit<T, V>> & Required<Pick<T, V>>
declare interface Fn<T = any, R = T> {
    (...arg: T[]): R;
}

declare interface IfShow {
    field: string[];
    op: 'is' | 'not' | '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not in' | 'between' | 'not between';
    value: any;
    range?: number[];
}

declare enum HookType {
    /** 代码块钩子标识 */
    CODE = 'code',
}

declare interface HookData {
    field: Id;
    type?: ActionType;
    params: any;
    [key: string]: any
}

declare interface Hooks {
    hookType?: HookType.CODE;
    hookData?: HookData[];
}
type NumberProperties<T> = {
    [P in keyof T]: T[P] | number;
};
declare interface ISchemasNode{
    type: NodeType.NODE | string
    /**
     * 组件字段, 也为数据节点唯一值id
     */
    field: Id
    /**
     * 组件名
     */
    component?: string;
    /**
     * 组件的属性集合
     */
    componentProps?: Record<string, any> ;
    label?: string;
    /**
     * 样式
     */
    style?: NumberProperties<Partial<CSSStyleDeclaration>> | ((el: HTMLElement) => CSSStyleDeclaration)

    /**
     * 是否展示
     */
    ifShow?: IfShow[] | boolean | Fn
    /**
     * 子节点
     */
    children?: (ISchemasNode | ISchemasContainer)[]
    created?: Hooks;
    mounted?: Hooks
    [key: string]: any;
}

/**
 * 数据容器 scheams
 */
declare interface ISchemasContainer extends ISchemasNode{
    type: NodeType.CONTAINER | string;
    children: (ISchemasNode | ISchemasContainer)[]
}

/**
 * 数据页面 scheams
 */
declare interface ISchemasPage extends ISchemasContainer{
    type: NodeType.PAGE
}

declare interface IMetaDes {
    keywords: string[];
    description: string[];
}

/**
 * 根节点
 */
declare interface ISchemasRoot extends ISchemasNode {
    type: NodeType.ROOT;
    children: ISchemasPage[];
    name: string;
    description?: IMetaDes;
    dataSources?: IDataSourceSchema[]; // 管理数据
    designWidth?: number
}
`;
