# 组件开发标准

## 组件规范
1. 组件的基础形式，需要有四个文件
    - index 入口文件, 引入到处以下文件
    > 以下是为了后续实现真·可视化用的
    - formConfig: 表单配置描述, 组件需要的值, 
    - initValue: 表单初始值, 组件的初始值以及样式初始值等等
    - event: 定义联动事件
2. 使用useApp可以获取 app 实例 `const {app} = useApp({config: props.config})`

## 目录结构
| 目录 | 说明 |
| --- | --- |
| index.ts| 入口文件 |
| src/index.vue | 组件文件 |
| src/formConfig.ts | 表单配置描述 |
| src/initValue.ts | 表单初始值 |
| src/event.ts | 定义联动事件 |

## 示例

**1. 创建一个组件**
创建一个名为 test-component 的组件目录

```ts
// index.js
// vue
import Test from './Test.vue';
// react 
import Test from './Test.tsx';

export { default as config } from './formConfig';
export { default as value } from './initValue';

export default Test;
```

```ts
// formConfig.js
/**
 * 具体参考 QAntdForm 组件的 props
 * https://project-docs.qmniu.com/packages/vue3-antd-pc-ui/form.html#formschema
 */
export default [
    {
        conponent: 'Select',
        label: '字体颜色',
        field: 'color',
        componentProps: {
            options: [
                { label: '红色字体', value: 'red',  },
                { label: '蓝色字体', value: 'blue', },
            ],
        }
    },
    {
        conponent: 'Input',
        field: 'value'
        label: '配置文案',
    },
];
```

```ts
// initValue.js
export default {
    color: 'red',
    value: '一段文字',
};
```

```vue
<!-- Test.vue -->
<template>
    <div>
        <span>this is a Test component:</span>
        <span :style="{ color: config.color }">{{ config.text }}</span>
    </div>
</template>

<script>
export default {
    name: 'QTest',

    props: {
        value: String,
        color: String
    },

    setup() {},
};
</script>
```