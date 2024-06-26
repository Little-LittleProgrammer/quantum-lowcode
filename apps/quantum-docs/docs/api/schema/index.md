# 低代码schema协议

## 协议
|- 根节点  
|--|--页面节点  
|--|--|-- 容器节点|组件节点  
|--|--|--|-- 容器节点|组件节点  
            ......

## interface
```ts
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
    style?: Partial<CSSStyleDeclaration>

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
```

## 例子
```
{
    type: 'root',
    name: 'test',
    dataSources: [{
        type: 'base',
        id: 'base1',
        title: '基础方法1',
        description: '基础方法1, 快使用',
        fields: [],
        methods: [
            {
                name: 'test1',
                description: '方法1',
                params: [{name: 'a1', type: 'boolean', }],
                content: (...params) => {
                    console.log(params);
                },
            }
        ],
    }],
    children: [
        {
            type: 'page',
            field: 'page2',
            children: [
                {
                    type: 'container',
                    field: 'contaainer1',
                    children: [
                        {
                            component: 'img',
                            field: 'img1',
                            style: {
                                width: '100%',
                            },
                            componentProps: {
                                src: 'https://cn.vitejs.dev/logo-with-shadow.png',
                            },
                        },
                        {
                            component: 'button',
                            field: 'button2',
                            componentProps: {
                                onClick: (app, e) => { alert(e); app.emit('base1:test1', e);},
                            },
                        },
                        {
                            component: 'button',
                            field: 'button23333',
                        }
                    ],
                }
            ],
        }
    ],
}
```