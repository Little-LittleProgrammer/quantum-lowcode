// 数组节点模型
import { NodeType } from './const';
type SelectPartial<T, V extends keyof T> = Partial<Omit<T, V>> & Required<Pick<T, V>>
export type Id = string
export interface Fn<T = any, R = T> {
    (...arg: T[]): R;
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
    [key: string]: any;
}

/**
 * 数据组件 scheams
 */
export interface ISchemasNode{
    /**
     * 组件字段, 也为数据节点唯一值id
     */
    field: Id
    /**
     * 组件名
     */
    component: string;
    /**
     * 组件的属性集合
     */
    componentProps?: Record<string, any> ;
    label?: string;
    /**
     * 样式
     */
    style?: Partial<CSSStyleDeclaration> | ((el: HTMLElement) => CSSStyleDeclaration)

    /**
     * 是否展示
     */
    ifShow?: boolean | Fn;
    /**
     * 子节点
     */
    children: (ISchemasNode | ISchemasContainer)[]
}

/**
 * 数据容器 scheams
 */
export interface ISchemasContainer extends SelectPartial<ISchemasNode, 'field'>{
    // 默认container
    type?: NodeType.CONTAINER | string;
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
export interface ISchemasRoot {
    type: NodeType.ROOT;
    children: ISchemasPage[];
    name: string;
    description?: IMetaDes;
    dataSources?: IDataSourceSchema[]; // 管理数据
}

/**
 * 数据源
 */
export interface IDataSourceSchema {
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
    mocks?: IMockSchema[];
}

export interface IDataSchema {
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

export interface ICodeBlockContent {
    /** 代码块名称 */
    name: string;
    /** 代码块内容 */
    content: ((...args: any[]) => any) | string;
    /** 参数定义 */
    params: ICodeParam[] | [];
    /** 注释 */
    desc?: string;
    /** 扩展字段 */
    [propName: string]: any;
}

export interface ICodeParam {
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: string;
    /** 参数描述 */
    desc?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 扩展字段 */
    [propName: string]: any;
}

export interface IMockSchema {
    /** 名称 */
    title: string;
    /** 详细描述 */
    description?: string;
    /** mock数据 */
    data: Record<string | number, any>;
}

export const schemasRootType = `
declare type Id = string
type SelectPartial<T, V extends keyof T> = Partial<Omit<T, V>> & Required<Pick<T, V>>
declare interface Fn<T = any, R = T> {
    (...arg: T[]): R;
}
/**
 * 数据组件 scheams
 */
declare interface ISchemasNode{
    /**
     * 组件字段, 也为数据节点唯一值id
     */
    field: Id
    /**
     * 组件名
     */
    component: string;
    /**
     * 组件的属性集合
     */
    componentProps?: Record<string, any> ;
    label?: string;
    /**
     * 样式
     */
    style?: Partial<CSSStyleDeclaration> | ((el: HTMLElement) => CSSStyleDeclaration)

    /**
     * 是否展示
     */
    ifShow?: boolean | Fn | string;
}

/**
 * 数据容器 scheams
 */
declare interface ISchemasContainer extends SelectPartial<ISchemasNode, 'field'>{
    // 默认container
    type?: NodeType.CONTAINER | string;
    /**
     * 子节点
     */
    children: (ISchemasNode | ISchemasContainer)[]
}

/**
 * 数据页面 scheams
 */
declare interface ISchemasPage extends ISchemasContainer{
    type: NodeType.PAGE
}

export interface IMetaDes {
    keywords: string[];
    description: string[];
}

/**
 * 根节点
 */
export interface ISchemasRoot {
    type: NodeType.ROOT;
    children: ISchemasPage[];
    name: string;
    description?: IMetaDes;
    // dataSources?: DataSourceSchema[]; // 管理数据
}
`;
