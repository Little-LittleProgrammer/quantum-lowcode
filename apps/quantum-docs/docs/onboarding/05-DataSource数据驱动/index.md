# 05-DataSource数据驱动

## 数据源不是附属功能，而是第二条主链路

这个项目的第一条主链路是：

`Schema -> Core -> Runtime -> 页面`

第二条主链路是：

`DataSource -> 依赖触发 -> Node 重编译 -> 页面局部更新`

如果你只理解第一条，就只能做静态拖拽页面；理解第二条，才真正理解“低代码页面为什么是活的”。

## `DataSourceManager` 管什么

`packages/data-source/src/data-source-manager.ts` 负责：

- 实例化所有数据源
- 注册数据源方法为全局事件
- 接收数据源 change 事件
- 维护依赖表 `dataSourceDep`
- 在数据变化时触发受影响节点更新

## 依赖表长什么样

依赖表本质上是：

```text
Map<
  dataSourceId,
  Map<
    fieldId,
    Set<depEffect>
  >
>
```

每个依赖记录至少包含：

- 哪个节点 `field`
- 依赖的是哪个属性路径 `key`
- 原始表达式 `rawValue`
- 是普通数据依赖还是条件依赖 `type`

## 依赖是在哪收集的

不是在数据源里收集，而是在 `LowCodeNode` 编译节点时收集。

### 普通数据依赖

`compileNode` 遇到 `${source.field}` 时：

- 先调用 `track`
- 再把表达式编译成当前值

### 条件依赖

`compileCond` 遍历 `ifShow` 数组时：

- 找出条件引用的数据字段
- 以 `cond` 类型注册依赖

这说明依赖收集发生在“节点解释阶段”，不是“数据变化阶段”。

## 数据变化时具体发生了什么

以 `DataSource.setData` 为例：

1. 数据源内部更新 `data`
2. 发出 `change` 事件
3. `createDataSourceManager` 监听到 change
4. 调 `trigger(sourceId, fieldId)`
5. 找到所有受影响节点
6. 对每个节点重新写回表达式或重新计算条件
7. 调 `LowCodeNode.setData`
8. runtime 页面配置被替换，Vue 重新渲染

## 为什么这里能做到“相对精确更新”

因为依赖不是按页面整体重算，而是按：

- 数据源 id
- 字段 id
- 节点 field

三层信息做映射。

虽然现在实现还比较原始，但方向是正确的：它在试图从“整页重渲染”走向“按依赖定点更新”。

## 数据源方法为什么能当事件调用

在 `DataSourceManager.init` 里，数据源里的方法会被注册成全局事件：

```text
${ds.id}:${method.name}
```

这样组件事件、生命周期钩子、其他逻辑都可以通过 `app.emit(...)` 去调用数据源方法。

这让数据源不仅是“数据容器”，还是“可配置方法容器”。

## `base` 和 `http` 的差异

### `base`

更像内存态状态容器：

- 根据字段配置生成默认值
- 支持自定义方法
- 手动 `setData`

### `http`

在 `base` 之上再加：

- 请求配置
- `beforeRequest / afterRequest`
- `beforeInit / afterInit`
- `autoFetch`
- `responseOptions.dataPath`

所以 `http` 数据源本质是“带生命周期的请求型状态源”。

## 当前实现里要知道的几个现实问题

### 1. 依赖触发仍偏工程化，离完整响应式还有距离

当前实现是手动 track / trigger，不是 Proxy 式自动依赖系统。

### 2. 触发后会回写节点配置

这意味着你调试数据问题时，不只是看数据源本身，还要看节点配置是否被重写。

### 3. 部分代码里还有调试日志

例如 `track`、`trigger` 里直接 `console.log`，说明这一层仍处于比较原始的工程阶段。

## 新人理解这一层最重要的一个公式

不是：

`数据源变化 -> 组件直接更新`

而是：

`数据源变化 -> 找到依赖节点 -> 重编译节点配置 -> 组件根据新配置渲染`

只要记住这一点，很多“为什么组件没直接监听数据源”的疑问就会消失。
