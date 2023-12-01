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
    // dataSources?: DataSourceSchema[]; // 管理数据
}
```

## 例子
```
{
    type: "root",
    name: "test",
    children: [
        {
            type: "page",
            field: "page1",
            style: {
                padding: "10px"
            },
            children: [
                {
                    type: "container",
                    field: "contaainer1",
                    children: [
                        {
                            component: "form",
                            field: "form1",
                            componentProps: {
                                actionColOptions: {
                                    span: 24
                                },
                                baseColProps: {
                                    span: 24
                                }
                            },
                            children: [
                                {
                                    component: "Divider",
                                    label: "标题1",
                                    field: "Divider"
                                },
                                {
                                    field: "a",
                                    component: "Select",
                                    label: "选择题",
                                    componentProps: {
                                        options: [
                                            {
                                                label: "yes",
                                                value: 1
                                            },
                                            {
                                                label: "no",
                                                value: 2
                                            }
                                        ]
                                    }
                                },
                                {
                                    field: "name1",
                                    component: "Input",
                                    label: "你好",
                                    ifShow: "({values})=>values.a===1"
                                },
                                {
                                    component: "Divider",
                                    label: "标题2",
                                    field: "Divider"
                                },
                                {
                                    field: "a2",
                                    component: "Select",
                                    label: "选择题2",
                                    componentProps: {
                                        options: [
                                            {
                                                label: "yes",
                                                value: 1
                                            },
                                            {
                                                label: "no",
                                                value: 2
                                            }
                                        ]
                                    }
                                },
                                {
                                    field: "name2",
                                    component: "Input",
                                    label: "你好2",
                                    ifShow: "({values})=>values.a2===1"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: "page",
            field: "page2",
            children: [
                {
                    type: "container",
                    field: "contaainer1",
                    children: [
                        {
                            component: "img",
                            field: "img1",
                            style: {
                                width: "100%"
                            },
                            componentProps: {
                                src: "https://cn.vitejs.dev/logo-with-shadow.png"
                            }
                        },
                        {
                            component: "button",
                            field: "button2",
                            componentProps: {
                                onClick: "(e)=>{;alert(e);;}"
                            }
                        },
                        {
                            component: "button",
                            field: "button23333"
                        }
                    ]
                }
            ]
        }
    ]
}
```