export default {
    // 需要暴露出去的事件, 例如给其他组件调用
    methods: [
        {
            label: '某个要暴露出去的事件',
            value: 'handlerExpose',
        }
    ],
    // 此组件支持的事件, 目的为配置化界面配置事件时可以选择一下事件, 不设置默认为click事件
    events: [{
        label: '点击', // 支持的事件类型, 需要在组件中emit出来
        value: 'click',
    }, {
        label: 'change', // 支持的事件类型, 需要在组件中emit出来
        value: 'change',
    }],
};

