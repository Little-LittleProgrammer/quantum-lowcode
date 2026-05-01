# 开发流水线

本文档记录 Quantum 当前推荐的本地开发、构建和发布检查流程。仓库采用 pnpm workspace + Turbo 管理，多数命令应在仓库根目录执行。

## 环境要求

| 工具 | 版本 |
| --- | --- |
| Node.js | `18.18.2` |
| pnpm | `9.15.7` |

版本来源以根目录 `package.json` 的 `volta` 和 `packageManager` 字段为准。

## 本地开发流程

```bash
pnpm install
pnpm build
pnpm dev
```

常见任务：

| 任务 | 命令 |
| --- | --- |
| 启动全部开发任务 | `pnpm dev` |
| 启动 playground | `pnpm playground` |
| 构建全部包 | `pnpm build` |
| 代码检查 | `pnpm lint` |
| 格式化 | `pnpm format` |
| 更新 changelog | `pnpm changelog` |

文档站点在 `apps/quantum-docs` 下：

```bash
pnpm --filter quantum-docs dev
pnpm --filter quantum-docs build
pnpm --filter quantum-docs preview
```

## 提交流程

1. 从主干拉出功能分支。
2. 完成代码和文档改动。
3. 在本地执行相关包的构建或检查。
4. 确认 `git diff` 只包含本次任务相关内容。
5. 使用 Conventional Commits 提交。

提交信息示例：

```text
docs: 完善 schema 协议文档
feat(editor): 支持自定义容器拖拽识别
fix(sandbox): 修复滚动画布后的选框偏移
```

## 构建顺序

Turbo 会根据包依赖关系调度构建。概念上推荐按下面顺序理解：

```text
schemas/utils
  -> data-source
  -> core
  -> ui/ui-vue2
  -> runtime
  -> sandbox
  -> editor
  -> apps
```

当只修改文档时，通常只需要构建文档站点。当修改 `schemas`、`core`、`data-source` 这类底层包时，应至少执行根目录 `pnpm build`。

## 发布前检查

| 检查项 | 说明 |
| --- | --- |
| 构建通过 | `pnpm build` 无错误 |
| 文档链接可达 | VitePress 构建不出现缺页或死链 |
| 类型兼容 | 公共类型变更同步更新文档和下游引用 |
| 示例可运行 | 文档里的核心示例与当前 API 一致 |
| 变更记录 | 面向用户的功能变更同步写入 changelog |

## 常见问题

### 文档构建时找不到样式包

文档配置会读取 `node_modules/@quantum-design/styles/base/base.scss`，因此需要先执行 `pnpm install`。

### 修改 Schema 类型后页面不更新

确认同时更新了：

- `packages/schemas` 类型定义。
- `packages/core` 编译节点逻辑。
- `packages/editor` 属性表单和默认值。
- `apps/quantum-docs/docs/api/schema` 文档。

### 运行时和编辑器表现不一致

优先检查 iframe runtime 是否加载了同一份 Schema，以及 Sandbox 更新事件是否成功传递到 runtime。
