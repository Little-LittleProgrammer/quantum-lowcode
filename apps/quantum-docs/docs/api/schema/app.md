# App 实例

`LowCodeRoot` 是 Quantum 运行时的应用实例。它接收根 Schema，创建当前页面实例，维护组件注册表、数据源管理器和全局事件系统。

## 创建实例

```ts
import { LowCodeRoot } from '@quantum-lowcode/core';

const app = new LowCodeRoot({
  config: schema,
  curPage: 'home',
  platform: 'mobile',
  designWidth: 375,
  request: async (options) => fetch(options.url, options),
  useMock: false
});
```

## 构造参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `config` | `ISchemasRoot` | - | 根 Schema。传入后会立即调用 `setConfig` |
| `curPage` | `string` | 第一页 | 初始页面 `field` |
| `platform` | `'mobile' \| 'pc' \| 'editor'` | `'mobile'` | 运行平台 |
| `designWidth` | `number` | - | 移动端设计稿宽度 |
| `ua` | `string` | 当前环境 UA | 用于环境判断 |
| `disabledFlexible` | `boolean` | `false` | 是否禁用移动端适配 |
| `transformStyle` | `(style) => style` | 内置转换 | 样式转换函数 |
| `request` | `IRequestFunction` | `fetch` 包装 | HTTP 数据源请求函数 |
| `useMock` | `boolean` | `false` | 数据源是否使用 mock 数据 |

## 常用属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `schemasRoot` | `ISchemasRoot` | 当前根 Schema |
| `page` | `LowCodePage` | 当前页面实例 |
| `components` | `Map<string, any>` | 组件注册表 |
| `dataSourceManager` | `DataSourceManager` | 数据源管理器 |
| `request` | `IRequestFunction` | HTTP 请求函数 |

## 页面 API

### setConfig

设置根 Schema，并重建数据源、事件和当前页面。

```ts
app.setConfig(schema, 'home');
```

### setPage

切换当前页面。传入的 `field` 必须存在于 `schemasRoot.children`。

```ts
app.setPage('detail');
```

### getPage

获取当前页面实例。传入 `field` 时，只会在它等于当前页面时返回实例。

```ts
const currentPage = app.getPage();
```

### deletePage

清空当前页面实例。

```ts
app.deletePage();
```

## 组件 API

### registerComponent

注册运行时组件。Schema 节点里的 `component` 字段需要与这里的 key 一致。

```ts
app.registerComponent('Button', Button);
app.registerComponent('Text', Text);
```

### unregisterComponent

移除组件注册。

```ts
app.unregisterComponent('Button');
```

### resolveComponent

按组件名获取已注册组件。运行时渲染节点时会使用这个方法。

```ts
const Button = app.resolveComponent('Button');
```

## 事件 API

### registerEvent

注册全局事件或节点事件。数据源方法初始化后也会注册到同一个事件系统。

```ts
app.registerEvent('refresh', ({ app }) => {
  app.setPage('home');
});
```

### emit

触发事件。数据源方法一般使用 `数据源ID:方法名` 调用，节点方法可以使用 `节点field:方法名` 调用。

```ts
app.emit('base1:submit', { id: 1 });
app.emit('button1:click');
```

当 `emit` 的第一个参数是 `LowCodeNode` 实例时，内部会额外派发带节点前缀的事件，方便同名组件事件隔离。

## 数据源入口

`dataSourceManager` 负责维护数据源实例、依赖收集和数据更新。

```ts
const ds = app.dataSourceManager?.get('base1');
ds?.setData({ title: 'New Title' });
```

更多数据源字段请看 [全局数据](./datasource.md)。
