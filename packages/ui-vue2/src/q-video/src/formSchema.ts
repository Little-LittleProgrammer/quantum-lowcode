export default [{
    field: 'vdType',
    label: '视频格式',
    component: 'Select',
    defaultValue: '1',
    componentProps: ({ formActionType, }) => {
        return {
            options: [{
                label: '填写视频链接',
                value: '1',
            }, {
                label: '上传视频',
                value: '2',
            }],
            onChange: (e) => {
                if (e === '1') {
                    formActionType.updateSchema({
                        field: 'componentProps.src',
                        label: '视频链接',
                        component: 'Input',
                    });
                } else {
                    formActionType.updateSchema({
                        field: 'src',
                        label: '视频',
                        component: 'CardUpload',
                    });
                }
            },
        };
    },
}, {
    field: 'src',
    label: '视频链接',
    component: 'Input',
}, {
    field: 'controls',
    label: '控制',
    component: 'Switch',
    defaultValue: true,
}, {
    // 此组件支持的事件, 需要在组件中emit出来,目的为配置化界面配置事件时可以选择一下事件
    field: 'events',
    label: '事件',
    component: 'EventSelect', // 事件必须填这个组件
    componentProps: {
        options: [{
            label: '点击',
            value: 'onClick',
        }],
    },
}];
