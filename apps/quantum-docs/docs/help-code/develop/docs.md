# 组件库文档开发手册

:::danger 注意
重要重要重要
组件库包括 `all@1.0.x` 和 ` master` 两个分支
1. `all@1.0.x` 开发版本基于 `vue3.2.47` 、 `vite@3.2.5`、`rollup2.79.1`，以及其他一些依赖与前三者的插件
2. `master` 版本基于 `vue3.3.4` 、 `vite@4.4.7`、`rollup3.28.1`，以及其他一些依赖与前三者的插件

开发时，请先确定好需要开发哪个版本，拉去对应的分支作为基本分支
1. 如开发的是基于 `master`， 结束时请按照规范合并到 master
2. 如开发的是基于 `all@1.0.x`， 结束时请按照规范合并到 `all@1.0.x`(千万不要和到 master 上, 此分支会慢慢废除)

主分支默认 为最新版本
::: 

## 配置
1. 在 `docs/project-docs/docs/.vitepress/config.ts` 配置文档路径

## 文档开发

1. 为了增加代码查看与复制按钮, 变成类似` antd` 官网的格式, 必须使用 `code-view` 进行包装
2. 为了使代码高亮, 请使用 `highlight-code` 组件
3. 对于具体项目, 请在 `project/xxxx` 建立项目目录(xxx为项目名称), 在里面书写 业务组件代码

**举例**
> 具体可以参考[loading](/packages/vue3-pc-ui/q-loading)

```vue

<script setup>
    import {QButtonGroup} from 'ad.qmniu.com/q-buttom'
</script>

<code-view title="基本用法" description="基本按钮用法">
    <QButtonGroup xxx> </QButtonGroup>
    <div #codeText>
        <highlight-code code="let a= 1">
    </div>
</code-view>

```



<code-view title="基本用法" description="基本按钮用法">
    <div xxx>123123 </div>
    <template #codeText>
        <highlight-code code="let a= 1"/>
    </template>
</code-view>

## 公共组件库文档开发手册

::: danger 注意
*** 重要重要重要, 开发时请遵守下列规则， 以便自动导入插件识别，否则会报错
1. 请将组件样式文件命名和组件文件命名一致
2. 根组件命名为 去掉`q-`或者`q-antd`的名称， 例如 `q-loading`组件命名为`loading.vue`
3. 文件夹命名必须以`q-`开头命名
:::

### 新建公共项目
1. 如果是 方法, 请参考 utils 配置
2. 如果是 组件库, 请参考 vue3-pc-ui进行配置
3. 然后在 docs/project-docs/packages.json中引入

### 组件引入方式
1. `docs/project-docs/docs/.vitepress/theme/index.ts`引入
```js
if (!import.meta.env.SSR) { // ssr不支持浏览器的API
    import("ant-design-vue").then(module => {
        ctx.app.use(module.Input)
        ctx.app.use(module.Button)
        ctx.app.use(module.Card)
    })
    import("@q-front-npm/vue3-pc-ui").then(module => {
        ctx.app.use(module.QLoading)
        ctx.app.use(module.QTreeTable)
    })
    XXX // 此处加入 // [!code focus]
}
```
2. 在文档中引入
```vue
<template>
    <ClientOnly> <!-- [!code focus] -->
        <xxx></xxx>
    </ClientOnly>
</template>
<script setup>
    import xxx from 'xxx' // [!code focus]
</script>
```

### 书写文档
1. md中 可以引入 组件文档使用

## 项目组件库文档开发手册
### 步骤
1. 在项目的 `components` 下, 新建 `index.ts` 文件, 将所有 组件导出
2. 执行 `pnpm build:lib --filter xxx`打包组件库
3. 在项目的`package.json`中, 按照以下代码配置
```json
{
    ...,
    "main": "./dist-components/components-lib.umd.js",
    "module": "./dist-components/components-lib.mjs",
    "files": ["dist-components"],
    ...
}
```
4. 在 文档项目的`package.json`中, 按照以下代码配置(以`ad.qmniu.com`举例)
```json
{
    ...,
    "dependencies": {
        ...,
        "ad.qmniu.com": "workspace:*",
        ...
    },
    ...
}
```
5. 在 `.vitepress/theme/index.ts`中 引入 打包好的 样式文件
```js
import 'ad.qmniu.com/dist-components/style.css';
```
5. 在md文件中引入组件库
```vue
<script setup>
    import {QButtonGroup} from 'ad.qmniu.com‘
</script>

<QButtonGroup> </QButtonGroup>

```

6. 对于经常用组件, 在`vue3-project-docs/docs/.vitepress/theme/index.ts` 中 使用 `enhanceApp` 注册
