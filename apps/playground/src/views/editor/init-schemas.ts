import { ISchemasRoot } from '@quantum-lowcode/schemas';

export const defaultSchemas: ISchemasRoot = {
    type: 'root',
    name: 'test',
    field: 'root',
    children: [
        {
            type: 'page',
            field: 'page_abcd',
            style: {
                width: '100%',
                height: '100%',
                margin: '0 auto',
            },
            children: [
            ],
        }
    ],
};
export const testSchemasV1: ISchemasRoot = {
    type: 'root',
    name: 'test',
    field: 'root',
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
export const testSchemasV2: ISchemasRoot = {
    type: 'root',
    name: 'test2',
    field: 'root',
    children: [
        {
            type: 'page',
            field: 'page_abcd',
            style: {
                width: '720',
                height: '',
                margin: '0 auto',
                borderStyle: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                textAlign: 'left',
            },
            children: [
                {
                    field: 'container_3f9s',
                    type: 'container',
                    layout: 'absolute',
                    style: {
                        width: 720,
                        height: 1368.96,
                        position: 'relative',
                        top: 0,
                        left: 0,
                        borderStyle: 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        textAlign: 'left',
                    },
                    label: '容器',
                    children: [
                        {
                            field: 'Img_8kPm',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '720',
                                height: '',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/39d0a9861824acc8a29b388c8d43dc92_6645154952564232631.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Button_YB67',
                            type: 'node',
                            component: 'Button',
                            style: {
                                width: 149.76,
                                height: 36.48,
                                position: 'absolute',
                                top: 1286.4,
                                left: 403.2,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                color: '#ccc',
                                fontSize: '20',
                            },
                            label: '按钮',
                            componentProps: {
                                text: '用户功能及权限',
                            },
                        },
                        {
                            field: 'Img_PAJ0',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 245.76,
                                height: 71.04,
                                position: 'absolute',
                                top: 1215.36,
                                left: 57.6,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/15/f2ea95e03164527ac8c0283f5cf8d521_195973130077105600.png?x-oss-process=image/format,webp/quality,Q_90',
                                events: {
                                    onClick: [
                                        {
                                            type: 'dataSource',
                                            field: 'ds_2rp3:download_app',
                                            params: {},
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'dataSource',
                                        field: 'ds_2rp3:download_app',
                                        params: {},
                                    }
                                ],
                            },
                        },
                        {
                            field: 'Img_DGVM',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 245.76,
                                height: 71.04,
                                position: 'absolute',
                                top: 1215.36,
                                left: 422.4,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/15/375a439914070de24ee0c30bd8bd8cd0_4865807934211927852.png?x-oss-process=image/format,webp/quality,Q_90',
                                events: {
                                    onClick: [
                                        {
                                            type: 'dataSource',
                                            field: 'ds_2rp3:download_app',
                                            params: {},
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'dataSource',
                                        field: 'ds_2rp3:download_app',
                                        params: {},
                                    }
                                ],
                            },
                        },
                        {
                            field: 'Img_IrfJ',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 720,
                                height: 253.44,
                                position: 'absolute',
                                top: 961.92,
                                left: 0,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/15/fbabd2e4f063955dccb96ca8ba5ab060_3912249417591099421.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Button_X0nT',
                            type: 'node',
                            component: 'Button',
                            style: {
                                width: '119.04',
                                height: '36.48',
                                position: 'absolute',
                                top: 1286.4,
                                left: 213.12,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                color: '#ccc',
                                fontSize: '20',
                            },
                            label: '按钮',
                            componentProps: {
                                text: '隐私协议',
                                events: {
                                    onClick: [
                                        {
                                            type: 'dataSource',
                                            field: 'ds_2rp3:jump_to_c',
                                            params: {},
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'dataSource',
                                        field: 'ds_2rp3:jump_to_c',
                                        params: {},
                                    }
                                ],
                            },
                        },
                        {
                            field: 'Img_6src',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 99.84,
                                height: 113.28,
                                position: 'absolute',
                                top: 46.08,
                                left: 38.4,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/15/94768f7ce98ef1ffe8b770f5272dbb46_2093636353523830641.png?x-oss-process=image/format,webp/quality,Q_90',
                                events: {
                                    onClick: [
                                        {
                                            type: 'component',
                                            field: 'OverlayContainer_o2j1:openOverlay',
                                            params: {},
                                            comp: 'OverlayContainer&&&OverlayContainer_o2j1',
                                            event: 'openOverlay',
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'component',
                                        field: 'OverlayContainer_o2j1:openOverlay',
                                        params: {},
                                        comp: 'OverlayContainer&&&OverlayContainer_o2j1',
                                        event: 'openOverlay',
                                    }
                                ],
                            },
                        }
                    ],
                },
                {
                    field: 'container_lDAE',
                    type: 'container',
                    layout: 'absolute',
                    style: {
                        width: '720',
                        height: '5130.24',
                        position: 'relative',
                        top: '-3',
                        left: 0,
                        borderStyle: 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        textAlign: 'left',
                        backgroundImage: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/2266ddeeea905cf4f2d00ed2fac6db9d_6843942146740787760.png?x-oss-process=image/format,webp/quality,Q_90',
                    },
                    label: '容器',
                    children: [
                        {
                            field: 'Img_Y1pj',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 720,
                                height: 1242.24,
                                position: 'absolute',
                                top: 82.56,
                                left: 0,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/15/26fb4bb4dd65fb86e742b6d964597fc4_4642326700176908289.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_o9O0',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 180.48,
                                height: 389.76,
                                position: 'absolute',
                                top: 2186.88,
                                left: 539.52,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/f25b8ca4c98317f2f3171cc4cf0b29bf_4037084131550990063.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_nh6P',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '648',
                                height: '',
                                position: 'absolute',
                                top: 2259.84,
                                left: 36.48,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/19/152f1762303063d7e4192fe891a298c8_1594904799711905844.mp4?x-oss-process=video/snapshot,t_1,f_jpg,m_fast',
                            },
                        },
                        {
                            field: 'Img_9bBq',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 360.96,
                                height: 426.24,
                                position: 'absolute',
                                top: 1365.12,
                                left: 180.48,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/0b05bde566f897357edaf009e6e63668_2803810017653320915.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_75l6',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 180.48,
                                height: 389.76,
                                position: 'absolute',
                                top: 2789.76,
                                left: 520.32,
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/f25b8ca4c98317f2f3171cc4cf0b29bf_4037084131550990063.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_jlxk',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '718',
                                height: '',
                                position: 'absolute',
                                top: 2202.59,
                                left: 1.92,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/d97ae2e4c5950e0ea8e985ba94581f0a_7209508888773729311.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Video_HcuH',
                            type: 'node',
                            component: 'Video',
                            style: {
                                width: '648',
                                height: '',
                                position: 'absolute',
                                top: 2259.84,
                                left: 36.48,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '视频',
                            componentProps: {
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/19/152f1762303063d7e4192fe891a298c8_1594904799711905844.mp4',
                                vdType: '1',
                            },
                        },
                        {
                            field: 'Img_0xjI',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '648',
                                height: '378.24',
                                position: 'absolute',
                                top: 2876.88,
                                left: 36.48,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/19/dd934aa572f9817f2f93aabb1a250cd7_8021310320524304231.mp4?x-oss-process=video/snapshot,t_1,f_jpg,m_fast',
                            },
                        },
                        {
                            field: 'Img_Cf2R',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '718',
                                height: '',
                                position: 'absolute',
                                top: 2832,
                                left: 1.92,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/d97ae2e4c5950e0ea8e985ba94581f0a_7209508888773729311.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_bkQ4',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 720,
                                height: 485.76,
                                position: 'absolute',
                                top: 4356.48,
                                left: 0,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/17/5857a10c196bb7c54a21f74955a42e12_6562581757168344696.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_ylYo',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: 720,
                                height: 485.76,
                                position: 'absolute',
                                top: 3642.24,
                                left: 0,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/17/5857a10c196bb7c54a21f74955a42e12_6562581757168344696.png?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Img_byOg',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '50',
                                height: '50',
                                position: 'absolute',
                                top: 894.72,
                                left: 234.24,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                vdType: '1',
                                src: 'https://act-webstatic.mihoyo.com/puzzle/hk4e/pz_K_ZByIfMVN/resource/puzzle/2024/04/16/3f75e2f1af4df8960adaa6c5fbe704f3_8784868819281949812.png?x-oss-process=image/format,webp/quality,Q_90',
                                controls: true,
                                imgType: '1',
                                events: {
                                    onClick: [
                                        {
                                            type: 'component',
                                            field: 'OverlayContainer_kQmu:openOverlay',
                                            params: {},
                                            comp: 'OverlayContainer&&&OverlayContainer_kQmu',
                                            event: 'openOverlay',
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'component',
                                        field: 'OverlayContainer_kQmu:openOverlay',
                                        params: {},
                                        comp: 'OverlayContainer&&&OverlayContainer_kQmu',
                                        event: 'openOverlay',
                                    }
                                ],
                            },
                        }
                    ],
                },
                {
                    field: 'OverlayContainer_o2j1',
                    type: 'container',
                    layout: 'absolute',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderStyle: 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        textAlign: 'left',
                    },
                    label: '蒙层',
                    children: [
                        {
                            field: 'Img_HPas',
                            type: 'node',
                            component: 'Img',
                            style: {
                                width: '',
                                height: '',
                                position: 'absolute',
                                top: 249.6,
                                left: 0,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '图片',
                            componentProps: {
                                imgType: '1',
                                src: 'https://webstatic.mihoyo.com/upload/puzzle/2021/11/19/f5df41a0db9d7f0faf531e636bd97598_1120669910144657351.jpg?x-oss-process=image/format,webp/quality,Q_90',
                            },
                        },
                        {
                            field: 'Button_yXAb',
                            type: 'node',
                            component: 'Button',
                            style: {
                                width: 42.24,
                                height: 55.68,
                                position: 'absolute',
                                top: 261.12,
                                left: 658.56,
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                fontSize: '50',
                            },
                            label: '按钮',
                            componentProps: {
                                text: 'x',
                                events: {
                                    onClick: [
                                        {
                                            type: 'component',
                                            field: 'OverlayContainer_o2j1:closeOverlay',
                                            params: {},
                                            comp: 'OverlayContainer&&&OverlayContainer_o2j1',
                                            event: 'closeOverlay',
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'component',
                                        field: 'OverlayContainer_o2j1:closeOverlay',
                                        params: {},
                                        comp: 'OverlayContainer&&&OverlayContainer_o2j1',
                                        event: 'closeOverlay',
                                    }
                                ],
                            },
                        }
                    ],
                    component: 'OverlayContainer',
                },
                {
                    field: 'OverlayContainer_kQmu',
                    type: 'container',
                    layout: 'absolute',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderStyle: 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        textAlign: 'left',
                    },
                    label: '蒙层',
                    children: [
                        {
                            field: 'Video_Zbq8',
                            type: 'node',
                            component: 'Video',
                            style: {
                                width: '720',
                                height: '',
                                position: 'absolute',
                                top: '30%',
                                left: '',
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                            },
                            label: '视频',
                            componentProps: {
                                vdType: '1',
                                src: 'https://fastcdn.mihoyo.com/content-v2/hk4e/123401/124a3679c64c4f65c30b6a5e34bc619d_5553679192264566999.mp4',
                                controls: true,
                            },
                        },
                        {
                            field: 'Button_S4nX',
                            type: 'node',
                            component: 'Button',
                            style: {
                                width: '36.48',
                                height: '51.84',
                                position: 'absolute',
                                top: '470.4',
                                left: '683.52',
                                borderStyle: 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                fontSize: '50',
                                color: 'white',
                            },
                            label: '按钮',
                            componentProps: {
                                text: 'x',
                                events: {
                                    onClick: [
                                        {
                                            type: 'component',
                                            field: 'OverlayContainer_kQmu:closeOverlay',
                                            params: {},
                                            comp: 'OverlayContainer&&&OverlayContainer_kQmu',
                                            event: 'closeOverlay',
                                        }
                                    ],
                                },
                                onClick: [
                                    {
                                        type: 'component',
                                        field: 'OverlayContainer_kQmu:closeOverlay',
                                        params: {},
                                        comp: 'OverlayContainer&&&OverlayContainer_kQmu',
                                        event: 'closeOverlay',
                                    }
                                ],
                            },
                        }
                    ],
                    component: 'OverlayContainer',
                }
            ],
            layout: 'relative',
        },
        {
            field: 'page_XEzk',
            type: 'page',
            layout: 'relative',
            style: {
                width: '720',
                height: '100%',
                margin: '0 auto',
                position: 'relative',
                top: 0,
                left: 0,
                borderStyle: 'none',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                textAlign: 'left',
                backgroundColor: '#000',
            },
            label: 'page',
            children: [
                {
                    field: 'Text_rLRm',
                    type: 'node',
                    component: 'Text',
                    style: {
                        width: '720',
                        height: '1178.88',
                        position: 'relative',
                        top: 0,
                        left: 0,
                        borderStyle: 'none',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        textAlign: 'left',
                        color: '#fff',
                    },
                    label: '文本',
                    componentProps: {
                        isNative: '2',
                        text: '<p style="text-align: center;"><span style="font-size: 14pt;">《原神用户个人信息及隐私保护政策》</span></p>\n<p>（以下简称"《隐私政策》"）由您（以 下亦称"用户"或"您"）与上海米哈游影铁科技有限公司（下文亦称"米哈游"或 "我们"）共同缔结，本《隐私政策》具有合同效力。 欢迎您使用米哈游为您提供的服务，包括您与米哈游的交互行为及/或您注册 和使用米哈游游戏及/或注册和使用米哈游提供的产品或服务（以下统称"米哈 游服务"或"服务"）。</p>\n<p><span style="color: #e03e2d;">为保障用户在使用米哈游服务期间的隐私权，米哈游特 此制定本《隐私政策》，用以向您说明在使用米哈游服务时，我们如何收集、 使用、储存和分享您的个人信息，以及我们为您提供的访问、更新、控制和保 护这些信息的方式。 本《隐私政策》适用于我们为您提供的米哈游的服务。当您使用我们提供的服 务时，我们将按照本《隐私政策》的约定处理和保护您的个人信息。 若您是未满 18 周岁的未成年人（特别是未满十四周岁的儿童），米哈游特别 提请您注意，您需要在您的监护人的陪同下阅读本《隐私政策》，我们已使 用加粗字体标注未成年人（特别是未满十四周岁的儿童）个人信息的相关的 条款，请您和您的监护人务必仔细阅读；请您在取得您的监护人对本《隐私 政策》全部条款的同意之后，使用米哈游服务。 儿童特别说明： 我们建议：任何儿童参加网上活动都应事先取得监护人的同意。</span></p>\n<p><span style="color: #e03e2d;">如果您是不 满十四周岁的儿童，请通知您的监护人共同阅读本《隐私政策》，并在您提 交个人信息、使用米哈游服务之前，寻求并取得您的监护人的同意和指导。 您点击同意本《隐私政策》，或者您使用/继续使用米哈游服务、提交个人信 息，都表示您已获得您的监护人的许可，且您的监护人亦同意受本《隐私政 策》。 </span></p>\n<p>我们可能会适时对本《隐私政策》进行修订。当本《隐私政策》的条款发生变 更时，我们会在版本更新时以页面提示、弹窗、网站公告等适当的方式向您提</p>',
                    },
                }
            ],
        }
    ],
    dataSources: [
        {
            type: 'base',
            id: 'ds_2rp3',
            title: 'link',
            description: '下载通用',
            methods: [
                {
                    content: "({app, dataSource, }, params) => {;    window.location.href='https://ys-api.mihoyo.com/event/download_porter/link/ys_cn/official/android_adbdsem'; }",
                    name: 'download_app',
                    title: '下载应用',
                    id: 'YF2J',
                },
                {
                    content: "({app, dataSource, }, params) => { ;    app.setPage('page_c6W8'); }",
                    name: 'jump_to_b',
                    title: '跳到第二页面',
                    id: 'hflR',
                },
                {
                    content: "({app, dataSource, }, params) => { ;    app.setPage('page_XEzk'); }",
                    name: 'jump_to_c',
                    title: '跳到第三页面',
                }
            ],
            fields: [{
                type: 'boolean',
                name: 'loading',
                title: '加载',
                description: '加载',
                defaultValue: false,
            }, {
                type: 'number',
                name: 'commonNumber',
                title: '公共数字',
                description: '公共数字',
                defaultValue: 1000,
            }],
        }
    ],
    designWidth: 720,
    description: {
        keywords: [
            '原神, 原神新版本, 原神电脑版, 原神完整版,原神最新版, 原神官网, 原神PC官网, 原神PC端, 原神PC端官网, 原神下载, 原神攻略, 原神PC版, 原神PC下载, 原神手游, 原神ios, 原神官服,原神官方, 原神游戏, 原神安卓, 原神米哈游, 原神手游官网, 原神官方, 原神手游ios, 原神漫画, 原神开放世界, yuanshen官网,原神新地图,原神新区域,原神角色,原神新角色,原神新剧情,原神新武器,原神新活动,原神版本更新',
            'test3'
        ],
        description: [
            '全新4.6版本「两界为火，赤夜将熄」现已推出！《原神》是由米哈游自研的一款开放世界冒险RPG。你将在游戏中探索一个被称作「提瓦特」的幻想世界。在这广阔的世界中，你可以踏遍七国，邂逅性格各异、能力独特的同伴，与他们一同对抗强敌，踏上寻回血亲之路；也可以不带目的地漫游，沉浸在充满生机的世界里，让好奇心驱使自己发掘各个角落的奥秘……直到你与分离的血亲重聚，在终点见证一切事物的沉淀。',
            'test3'
        ],
    },
};
