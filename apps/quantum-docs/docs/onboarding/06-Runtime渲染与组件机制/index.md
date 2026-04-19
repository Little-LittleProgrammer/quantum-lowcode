# 06-Runtime渲染与组件机制

## Runtime 的定位

runtime 是“把当前低代码页面执行出来”的地方。

它不是编辑器的一部分，而是被 sandbox 托管在 iframe 里的独立运行环境。当前仓库里有两套：

- `runtime/vue3-active`
- `runtime/vue2-active`

两套 runtime 提供的接口几乎一致，只是底层框架不同。

## Runtime 启动时做了什么

以 `runtime/vue3-active/page/main.ts` 为例：

1. 读取本地或注入的页面配置
2. 创建 `LowCodeRoot`
3. 注册组件库里的组件到 `app`
4. 将 `app` 注入 Vue 应用
5. 由 `App.vue` 渲染当前页面

这里最重要的是第三步：runtime 先有 `LowCodeRoot`，再有 Vue 页面壳。

## 为什么组件库要注册到 `LowCodeRoot`

因为真正渲染动态组件的是：

`packages/ui/src/q-component/src/component.vue`

它不是写死组件名，而是：

```ts
app.resolveComponent(props.config.component || props.config.type)
```

也就是说，runtime 组件解析权不在 Vue 模板里，而在 `LowCodeRoot.components` 这个注册表里。

这也是项目具备扩展性的关键点之一。

## UI 组件层到底做了什么

`packages/ui` 里的组件可以分成两类：

### 1. 运行时渲染组件

例如：

- `Page`
- `Container`
- `Button`
- `Text`
- `Img`
- `Video`

这类组件负责真的渲染页面。

### 2. 编辑器元数据

例如：

- `formSchema.ts`
- `event.ts`

这类文件告诉编辑器：

- 该组件有哪些可配置项
- 哪些事件可以被可视化配置

这两个层面共同组成了“组件协议”。

## `useApp` 是连接 Core 和 Vue 的关键钩子

`packages/ui/src/hooks/use-app.ts` 做了三件事：

1. 注入 `app`
2. 通过 `field` 拿到对应 `LowCodeNode`
3. 在 created/mounted/unmounted 时触发节点生命周期

所以一个 runtime 组件挂载时，同时完成了两件事：

- Vue 组件自己完成挂载
- LowCode 节点完成生命周期执行

这就是为什么 `Core` 和 Vue 运行时能被接起来。

## 页面为什么能“按当前页切换”

runtime playground App 会暴露：

- `updateRootConfig`
- `updatePageField`

其中：

- `updateRootConfig` 更新整棵 root，并同步 `app.setConfig(...)`
- `updatePageField` 切换当前页，并同步 `app.setPage(...)`

所以切页不是在编辑器里直接切 DOM，而是切 runtime 当前激活的 page 节点。

## 编辑态 runtime 和预览 runtime 的区别

仓库里你会看到两个场景：

### `playground`

这是编辑态 runtime，提供 `select / add / update / delete` 等接口给 sandbox 使用。

### `page`

这是面向预览或真实页面渲染的 runtime，更接近最终运行态。

这两者共用同一套 `Core + UI` 能力，但一个偏编辑，一个偏展示。

## 组件系统为什么可扩展

因为一个组件要接入这套系统，通常只需要补齐三类东西：

1. 真正的运行时 Vue 组件
2. 对应的 `formSchema.ts`
3. 可选的 `event.ts`

然后把它注册进组件导出和配置映射里。

这意味着：

- 组件渲染能力
- 编辑器属性面板
- 事件可视化配置

三件事是配套扩展的。

## 这一层的关键认知

项目不是“编辑器调用一堆业务组件”，而是“runtime 在执行一份组件协议”。

这份协议至少包括：

- 节点类型和字段
- 组件解析名
- 组件属性
- 生命周期
- 事件清单
- 属性面板元数据

理解成协议层后，你再看跨框架、跨项目复用，就会自然很多。
