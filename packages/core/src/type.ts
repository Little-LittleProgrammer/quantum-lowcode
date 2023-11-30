// 数组节点模型
import { NodeType } from "./const";
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
}

/**
 * 数据容器 scheams
 */
export interface ISchemasContainer extends SelectPartial<ISchemasNode, 'field'>{
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
export interface ISchemasPage extends ISchemasContainer{
    type: NodeType.PAGE
}

/**
 * 根节点
 */
export interface ISchemasRoot {
    type: NodeType.ROOT;
    children: ISchemasPage[];
    name: string;
    // dataSources?: DataSourceSchema[]; // 管理数据
}

/**
 * 文件类型枚举
 */
export enum FileType {
    // js 文件
    Module = 'module',
    StoreEntryModule = 'storeEntryModule',
    RouteModule = 'routeModule',
    BlockEntryModule = 'blockEntryModule',
    ServiceModule = 'serviceModule',
    StoreModule = 'storeModule',
  
    JsxViewModule = 'jsxViewModule',
    JsonViewModule = 'jsonViewModule',
  
    // 非 js 文件
    PackageJson = 'packageJson',
    TangoConfigJson = 'tangoConfigJson',
    AppJson = 'appJson',
    File = 'file',
    Json = 'json',
    Scss = 'scss',
}

export interface IFileConfig {
    /**
     * 文件名, 支持路径
     */
    filename: string;
    /**
     * 原始代码
     */
    code: string;
    /**
     * 文件类型
     */
    type?: FileType;
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
    ifShow?: boolean | Fn;
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

/**
 * 根节点
 */
declare interface ISchemasRoot {
    type: NodeType.ROOT
    children: ISchemasPage[]
    name: string
    // dataSources?: DataSourceSchema[]; // 管理数据
}
`