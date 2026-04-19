# 07-扩展点与新人落地建议

## 新人第一次接需求，建议先判断改动属于哪一层

### 1. 组件显示不对

优先看：

- `packages/ui`
- `runtime/*`
- `packages/core/src/utils.ts`

### 2. 属性面板要新增配置项

优先看：

- `packages/ui/src/**/formSchema.ts`
- `packages/ui/src/config.ts`
- `packages/editor/src/services/props-service.ts`

### 3. 拖拽、选中、缩放有问题

优先看：

- `packages/sandbox`
- `packages/editor/src/components/layouts/sandbox/index.vue`

### 4. 数据联动、模板表达式、条件显示有问题

优先看：

- `packages/core/src/node.ts`
- `packages/data-source/src/utils/deps.ts`
- `packages/data-source/src/data-source-manager.ts`

### 5. 页面结构增删改有问题

优先看：

- `packages/editor/src/services/editor-service.ts`
- `runtime/vue3-active/playground/App.vue`

## 最值得先做的 3 个熟悉动作

### 1. 跑通一次新增组件

建议从最简单的组件入手，例如 Button 或 Text，完整经历：

- 左侧拖入
- 在 `root` 中出现新节点
- sandbox 内渲染
- 属性面板修改
- runtime 更新

这是理解编辑器主链路最快的方法。

### 2. 跑通一次数据源更新

建议手动让某个 `base` 数据源字段变化，观察：

- 依赖有没有被 track
- `trigger` 后哪些节点被命中
- 节点配置有没有重编译

这是理解动态页面最重要的一步。

### 3. 跑通一次组件扩展

最小闭环通常是：

1. 新增运行时组件
2. 新增 `formSchema`
3. 注册到组件导出和配置映射
4. 在 playground 组件列表里露出

这样你会真正知道“扩展点”在哪里，而不是只知道改哪一层 UI。

## 当前工程里可以继续优化的点

这部分不是挑毛病，而是帮助新人快速识别工程成熟度边界。

### 1. 文档和代码存在一定偏差

仓库里已有部分文档更偏概念介绍，和当前源码并不完全一一对应。以后继续补文档时，建议优先以代码为准。

### 2. 数据依赖系统还比较原始

当前实现可用，但离“声明式响应式引擎”还有距离，后续如果做复杂联动，这里会是重点演进点。

### 3. 编辑器状态和 runtime 状态存在双端同步成本

这套设计是必要的，但也意味着：

- 某些 bug 会出现在两边状态不一致
- 调试时必须同时看编辑器和 iframe 内状态

### 4. 组件协议还可以进一步标准化

目前 `formSchema.ts`、`event.ts`、组件实现已经形成模式，但还没有完全收敛成统一规范文档。

## 新人排障 checklist

遇到问题时，建议固定按这个顺序排查：

1. Schema 是否正确
2. `EditorService` 是否正确回写 root
3. sandbox 是否把变更同步给 runtime
4. runtime 是否正确更新 `LowCodeRoot / LowCodeNode`
5. UI 组件是否消费到了最终 config

只要顺序不乱，绝大多数问题都能较快定位。

## 推荐的第一周上手目标

### 第一天

看完 `00`、`01`、`02`，能说清项目分层。

### 第二天

读 `03`、`04`，能跟着代码找到一次新增组件链路。

### 第三天

读 `05`、`06`，能解释一次数据更新如何驱动页面变化。

### 第四到第五天

自己完成一个小改动，例如：

- 给现有组件加一个属性项
- 给现有数据源方法补一段逻辑
- 调整一个拖拽/选中体验问题

## 收尾建议

新人不要一开始试图把所有包都读完。

先抓主链路：

`Playground -> EditorService -> Sandbox -> Runtime -> Core -> UI`

再抓动态链路：

`DataSource -> track/trigger -> LowCodeNode -> 页面更新`

能把这两条线串起来，项目就算真正入门了。
