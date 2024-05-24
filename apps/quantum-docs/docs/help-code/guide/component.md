# 组件开发标准

## 组件规范
1. 组件的基础形式，需要有四个文件
    - index.ts 入口文件, 引入导出以下文件
    - src/formSchema.ts: 表单配置描述, 组件需要的值, 
    - src/event.ts: 定义暴露的事件
    - src/xxx.vue: 组件
2. 使用useApp可以获取 app 实例 `const {app} = useApp({config: props.config})` app实例请看 [app](../../api/schema/app.md)
3. 如果此组件为容器组件, 请在最外层元素增加class名 `quantum-ui-container`, 且导出组件命名以 `Container` 开头, 以便让编辑器识别
4. 开发完成后, 请在`component.ts`将组件导出, 在`config.ts`中将配置导出, 具体导出以及命名方式请参考其他组件

## 目录结构
```
q-xxx    // 组件         
├─ src               
│  ├─ event.ts       // 事件配置, 暴露出来实现组件联动
│  ├─ formSchema.ts  // 属性配置schema. 暴露给编辑器使用
│  └─ xxx.vue       
└─ index.ts          
component.ts // 将文件导出
config.ts // 将配置文件导出
```

## 案例 q-demo
```js
// q-demo
// src/event.ts
export default {
    // 需要暴露出去的事件, 例如给其他组件调用
    methods: [
        {
            label: '某个要暴露出去的事件',
            value: 'handlerExpose',
        }
    ],
};

```
```js
// src/formSchema.ts
export default [{
    field: 'api',
    label: '请求接口',
    component: 'Input', 
}, {
    // 此组件支持的事件, 需要在组件中emit出来,目的为配置化界面配置事件时可以选择一下事件
    field: 'events',
    label: '事件',
    component: 'EventSelect', // 事件必须填这个组件
    componentProps: {
        options: [{
            label: '点击',
            value: 'onClick',
        }, {
            label: 'change',
            value: 'onChange',
        }],
    },
}];
```

```vue
// src/demo.vue
<template>
    <div @click="handlerClick" @change="handlerChange" >
        <p>hello world</p> 
        <p>{{ api }}  </p> 
        <p>count: {{ number }}  </p> 
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { ISchemasNode} from '@quantum-lowcode/schemas';

import {useApp} from '../../hooks/use-app';
import { emit } from 'process';

export default defineComponent({
    props: { // 配置要传入的props, 与formSchema.ts配置对应
        config: { // 必须拥有, 用来接收 输入的schemaDsl
            type: Object as PropType<ISchemasNode>,
            default: () => ({}), 
        },
        api: {
            type: String,
            default: ''
        }
    },
    emits: ['click', 'change'],
    setup(props,{emit}) {
        const number = ref(0)
        /**
         * 将配置和需要暴露的方法传入
         * @return {app} 为root实例, 包含 请求(request), 全局数据与方法(dataSource), 其他组件信息与暴露数据等等
         */
        const {app, } = useApp({ 
            config: props.config,
            methods: {handlerExpose}
        });

        function handlerExpose() {
            console.log('handlerExpose');
            number.value++
            handlerApi()
        }

        /**
         * params?: Record<string, string>;
            data?: Record<string, any>;
            headers?: Record<string, string>;
            method?: Method;
         */
        async function handlerApi() {
            if (app && app.request) {
                const _res = await app.request({
                    url: props.api,
                    params: {
                        name: 'quantum',
                    },
                    data: {
                        name: 'quantum',
                    },
                    method: 'get',
                    headers: {}
                })
            }
            
        }

        function handlerClick(e) {
            emit('click', e)
        }
        function handlerChange(e) {
            emit('change', e)
        }
        return {
            number,
            handlerClick,
            handlerChange
        }
    },
});
</script>
```

```js
// index.ts
import Demo from './src/page.vue';
export default Demo;
```
```js
// components.ts
....
export {default as Demo} from './q-demo';

```
```js
// config.ts
// schemas
import demo from './q-demo/src/formSchema';
// events
import demoEvents from './q-demo/src/event';

const formSchemas = {
    ...,
    'Demo': demo,// 和组件导出名保持一致
};

const events = {
    ...,
    'Demo': demoEvents, // 和组件导出名保持一致
};

export {formSchemas, events};


```