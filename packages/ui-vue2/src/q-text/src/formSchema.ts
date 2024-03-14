export default [{
    field: 'isNative',
    label: '文本格式',
    component: 'Select',
    componentProps: ({ formActionType, }) => {
        return {
            options: [{
                label: '普通文本',
                value: '1',
            }, {
                label: '富文本',
                value: '2',
            }],
            onChange: (e) => {
                if (e === '1') {
                    formActionType.updateSchema({
                        field: 'componentProps.text',
                        label: '文本',
                        component: 'Input',
                    });
                } else {
                    formActionType.updateSchema({
                        field: 'componentProps.text',
                        label: '内容',
                        component: 'RichText',
                        colProps: {
                            span: 24,
                        },
                    });
                }
            },
        };
    },
}, {
    field: 'text',
    label: '内容',
    component: 'Input',
}, {
    field: 'multiple',
    label: '多行文本',
    component: 'Switch',
    ifShow: ({values, }) => values['componentProps.isNative'] === '1',
}];
