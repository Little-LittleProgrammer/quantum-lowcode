import { ActionType } from './const';
import { IHttpOptions, Id } from './type';

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
    mocks?: IMockSchema;
    options?: IHttpOptions
}
export interface IDepData {
    /** 组件Field */
    field: Id; // nodeField
    key: string; // path
    rawValue: string // ${base1.a1}
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
    title?: string;
    /** 代码块名称 */
    name: string;
    /** 代码块内容 */
    content: ((...args: any[]) => any) | string;
    /** 参数定义 */
    params: ICodeParam[] | [];
    /** 注释 */
    description?: string;
    timing?: 'beforeInit' | 'afterInit' | 'beforeRequest' | 'afterRequest'
    /** 扩展字段 */
    [propName: string]: any;
}

export interface ICodeParam {
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

export interface IMockSchema {
    /** 名称 */
    title: string;
    /** 详细描述 */
    description?: string;
    /** mock数据 */
    data: Record<string | number, any>;
}

export interface IEventConfig {
    /** 待触发的事件名称 */
    name: string;
    /** 动作响应配置 */
    actions: IEventActionItem[];
}

export interface ICompItemConfig {
    /** 动作类型 */
    actionType: ActionType;
    /** 被选中组件ID */
    to: Id;
    /** 触发事件后执行被选中组件的方法 */
    method: string;
}

export interface IDataSourceItemConfig {
    /** 动作类型 */
    actionType: ActionType;
    /** [数据源id, 方法] */
    dataSourceMethod: [string, string];
    /** 代码参数 */
    params?: object;
}

export type IEventActionItem = ICompItemConfig | IDataSourceItemConfig
