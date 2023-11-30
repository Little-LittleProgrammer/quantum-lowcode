import { ISchemasRoot } from '@qimao/quantum-core';

export const defaultSchemas: ISchemasRoot = {
    type: 'root',
    name: 'test',
    children: [
        {
            type: 'page',
            field: 'page1',
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
                            },
                            children: [
                                {
                                    field: 'name1',
                                    component: 'Input',
                                    label: '你好',
                                }
                            ],
                        }
                    ],
                }
            ],
        }
    ],
};
export const testSchemas: ISchemasRoot = {
    type: 'root',
    name: 'test',
    children: [
        {
            type: 'page',
            field: 'page1',
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
                            },
                            children: [
                                {
                                    field: 'a',
                                    component: 'Select',
                                    label: '选择题',
                                    componentProps: {
                                        options: [{label: 'yes', value: 1, }, {label: 'no', value: 2, }],
                                    },
                                },
                                {
                                    field: 'name1',
                                    component: 'Input',
                                    label: '你好',
                                    ifShow: ({values, }) => values.a === 1,
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
                                onClick: (e) => { alert(e); },
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
};
