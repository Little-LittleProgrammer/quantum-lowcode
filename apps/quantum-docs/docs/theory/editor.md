# Editor 编辑器原理

`@quantum-lowcode/editor` 是可视化搭建的入口包。它不直接渲染业务组件，而是维护编辑器状态、节点树、属性面板、数据源面板和 Sandbox 画布之间的协作。

## 关键职责

| 职责 | 说明 |
| --- | --- |
| Schema 编辑 | 维护根 Schema、当前页面、当前选中节点 |
| 节点操作 | 提供新增、更新、删除、复制、粘贴、排序、拖拽等能力 |
| 画布协作 | 接收 Sandbox 的选择、拖拽、删除、参考线等事件 |
| 面板配置 | 根据节点类型展示属性表单和事件配置 |
| 历史记录 | 将关键节点操作写入历史栈，支持撤销和重做 |
| 数据源配置 | 管理根 Schema 上的 `dataSources` |

## 服务结构

编辑器内部将能力拆成多个 service：

| Service | 主要职责 |
| --- | --- |
| `EditorService` | 节点树增删改查、选中、高亮、复制粘贴、拖拽排序 |
| `UiService` | 画布尺寸、缩放、布局类 UI 状态 |
| `PropsService` | 属性面板值、属性表单配置和字段名变更 |
| `DataSourceService` | 数据源列表的新增、更新、删除和读取 |
| `HistoryService` | 操作历史、撤销、重做 |
| `ComponentService` | 左侧组件物料分组和组件默认配置 |
| `ContentmenuService` | 右键菜单和扩展操作 |

这些服务通过 `use-service` 初始化，并在编辑器组件树中共享。

## 节点更新链路

```text
属性面板修改
  -> PropsService 产出局部配置
  -> EditorService.update/updateHelper 合并节点
  -> root Schema 被更新
  -> Sandbox 接收更新并同步 iframe
  -> Runtime 重新渲染对应节点
```

新增节点时，`EditorService.add` 会先确定父节点和插入位置，再修正节点 `field`，最后同步画布。删除、复制、粘贴和排序也都围绕根 Schema 的树操作完成。

## 画布事件协作

Sandbox 负责真实 DOM 的选择和拖拽，编辑器负责把交互结果落回 Schema。

| Sandbox 事件 | Editor 处理 |
| --- | --- |
| 选中节点 | `EditorService.select` |
| hover 高亮 | `EditorService.highlight` |
| 拖拽更新 | `EditorService.update` 写入 `style` |
| 删除节点 | `EditorService.delete` |
| 拖到容器 | `EditorService.dragTo` 或 `moveToContainer` |

## 属性面板如何动态生成

组件的属性表单配置来自 `propsConfigs`，默认值来自 `propsValues`。编辑器根据当前节点的 `component` 或 `type` 找到对应配置，然后把表单结果转成节点上的 `componentProps`、`style` 等字段。

这也是扩展组件时最常见的接入点：注册组件、补充物料信息、补充属性面板配置。

## 容易踩坑的点

- 只更新 iframe DOM，不更新 Schema：刷新或切页后会丢失。
- 只更新 Schema，不通知 Sandbox：画布选框和实际 DOM 会短暂不一致。
- 复制节点时没有重写 `field`：节点表会被覆盖，选中和更新都会异常。
- 自定义容器没有被 `isContainer` 识别：节点无法拖入该容器。

## 调试入口

- 节点结构问题：先看 `EditorService.getNodeInfo(field)`。
- 属性不生效：检查节点最终的 `componentProps` 和 `style`。
- 画布错位：检查 Sandbox 返回的拖拽数据和节点 `style`。
- 数据源不更新：检查根 Schema 的 `dataSources` 和表达式依赖。
