# 低代码schema协议

## 协议
|- 根节点  
|--|--页面节点  
|--|--|-- 容器节点|组件节点  
|--|--|--|-- 容器节点|组件节点  
            ......
```ts
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
 * 容器节点
 */
export interface ISchemasContainer extends SelectPartial<ISchemasNode, 'field'>{
    // 默认container
    type?: NodeType.CONTAINER | string;
}

/**
 * 页面节点
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
    description?: IMetaDes;
    dataSources?: IDataSourceSchema[]; // 管理数据
}

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