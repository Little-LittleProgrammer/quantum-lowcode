import { ISchemasRoot } from '@qimao/quantum-schemas';

export const defaultSchemas: ISchemasRoot = {
    type: 'root',
    name: 'test',
    children: [
        {
            type: 'page',
            field: 'page_abcd',
            style: {
                width: '100%',
                height: '100%',
            },
            children: [
            ],
        }
    ],
};
export const testSchemas: ISchemasRoot = {
    type: 'root',
    name: 'test',
    dataSources: [
        {
            type: 'base',
            id: 'base1',
            title: '基础方法1',
            description: '基础方法1, 快使用',
            fields: [
                {
                    name: 'a1',
                    type: 'string',
                    title: 'a1',
                    description: 'a1',
                    defaultValue: '标题1',
                }
            ],
            methods: [
                {
                    name: 'test1',
                    description: '方法1',
                    params: [
                        {
                            name: 'a1',
                            type: 'boolean',
                        }
                    ],
                    content: (...params) => { console.log(params); },
                },
                {
                    name: 'test2',
                    description: '方法2',
                    params: [],
                    content: ({app, dataSource, }, params) => { dataSource.data.a1 = params; },
                }
            ],
        }
    ],
    children: [
        {
            type: 'page',
            field: 'page1',
            style: {
                padding: '10px',
            },
            children: [
                {
                    type: 'container',
                    field: 'contaainer1',
                    children: [
                        {
                            component: 'form',
                            field: 'form1',
                            componentProps: {
                                actionColOptions: {
                                    span: 24,
                                },
                                baseColProps: {
                                    span: 24,
                                },
                            },
                            created: {
                                hookType: 'code',
                                hookData: [
                                    {
                                        field: 'base1:test1',
                                        params: {
                                            a: 123123,
                                        },
                                    }
                                ],
                            },
                            children: [
                                {
                                    type: 'node',
                                    component: 'Divider',
                                    label: '${base1.a1}',
                                    field: 'Divider',
                                },
                                {
                                    type: 'node',
                                    field: 'a',
                                    component: 'Select',
                                    label: '选择题',
                                    componentProps: {
                                        options: [
                                            {
                                                label: 'yes',
                                                value: 1,
                                            },
                                            {
                                                label: 'no',
                                                value: 2,
                                            }
                                        ],
                                        onChange: (app, e) => { console.log(app); app.emit('base1:test1', e); app.emit('page1:refresh'); },
                                    },
                                },
                                {
                                    type: 'node',
                                    field: 'name1',
                                    component: 'Input',
                                    label: '你好',
                                    ifShow: ({values, }) => values.a === 1,
                                    componentProps: {
                                        onChange: (app, e) => { app.emit('base1:test2', e.target.value); },
                                    },
                                },
                                {
                                    type: 'node',
                                    component: 'Divider',
                                    label: '标题2',
                                    field: 'Divider',
                                },
                                {
                                    type: 'node',
                                    field: 'a2',
                                    component: 'Select',
                                    label: '选择题2',
                                    componentProps: {
                                        options: [
                                            {
                                                label: 'yes',
                                                value: 1,
                                            },
                                            {
                                                label: 'no',
                                                value: 2,
                                            }
                                        ],
                                    },
                                },
                                {
                                    type: 'node',
                                    field: 'name2',
                                    component: 'Input',
                                    label: '你好2',
                                    ifShow: ({values, }) => values.a2 === 1,
                                }
                            ],
                        }
                    ],
                }
            ],
        },
        {
            type: 'page',
            field: 'page2',
            children: [
                {
                    type: 'container',
                    field: 'contaainer1',
                    children: [
                        {
                            type: 'node',
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
                            type: 'node',
                            component: 'button',
                            field: 'button2',
                            componentProps: {
                                onClick: '(e)=>{;alert(e);;}',
                            },
                        },
                        {
                            type: 'node',
                            component: 'button',
                            field: 'button23333',
                        }
                    ],
                }
            ],
        }
    ],
};
