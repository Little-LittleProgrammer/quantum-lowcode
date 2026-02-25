# @quantum-lowcode/sandbox 沙箱

沙箱模块负责编辑器与运行时的通信，提供隔离的编辑环境。

## 安装

```bash
pnpm add @quantum-lowcode/sandbox
```

## 概述

沙箱通过 iframe 创建隔离的运行环境，实现编辑器与组件的交互。

## 核心类

### BoxCore

沙箱核心类，管理所有沙箱操作。

```typescript
import { BoxCore } from '@quantum-lowcode/sandbox';
```

#### 构造函数

```typescript
interface IBoxCoreOptions {
  /** 容器元素 */
  container: HTMLElement;
  /** 设计宽度 */
  designWidth?: number;
  /** 缩放级别 */
  zoom?: number;
}
```

#### 方法

##### mount

挂载画布：

```typescript
boxCore.mount(el: HTMLElement): void
```

##### select

选中节点：

```typescript
boxCore.select(idOrEl: string | HTMLElement, event?: MouseEvent): void
```

##### multiSelect

多选节点：

```typescript
boxCore.multiSelect(idOrElList: (string | HTMLElement)[]): void
```

##### highlight

高亮节点：

```typescript
boxCore.highlight(idOrEl: string | HTMLElement): void
```

##### clearHighlight

清除高亮：

```typescript
boxCore.clearHighlight(): void
```

##### update

更新节点：

```typescript
boxCore.update(data: {
  id: string;
  data: Partial<ISchemasNode>;
}): void
```

##### add

添加节点：

```typescript
boxCore.add(data: {
  parentId: string;
  index: number;
  data: ISchemasNode;
}): void
```

##### delete

删除节点：

```typescript
boxCore.delete(data: {
  id: string;
}): void
```

##### setZoom

设置缩放：

```typescript
boxCore.setZoom(zoom: number): void
```

##### destroy

销毁实例：

```typescript
boxCore.destroy(): void
```

### BoxRender

iframe 渲染器。

```typescript
import { BoxRender } from '@quantum-lowcode/sandbox';
```

#### 方法

##### mount

挂载 iframe：

```typescript
boxRender.mount(el: HTMLElement): void
```

##### add

添加组件：

```typescript
boxRender.add(data: ISchemasNode): void
```

##### update

更新组件：

```typescript
boxRender.update(data: {
  id: string;
  data: Partial<ISchemasNode>;
}): void
```

##### delete

删除组件：

```typescript
boxRender.delete(data: { id: string }): void
```

##### setZoom

设置缩放：

```typescript
boxRender.setZoom(zoom: number): void


获取 iframe ```

##### getDocument文档：

```typescript
boxRender.getDocument(): Document
```

### BoxMask

蒙层组件，处理选择和高亮。

```typescript
import { BoxMask } from '@quantum-lowcode/sandbox';
```

#### 方法

##### observe

初始化视口监听：

```typescript
boxMask.observe(page: HTMLElement): void
```

##### scrollIntoView

滚动到可见区域：

```typescript
boxMask.scrollIntoView(el: HTMLElement): void
```

##### setLayout

设置布局：

```typescript
boxMask.setLayout(el: HTMLElement): void
```

### ActionManager

交互管理器。

```typescript
import { ActionManager } from '@quantum-lowcode/sandbox';
```

#### 方法

##### select

选中元素：

```typescript
actionManager.select(el: HTMLElement, event: MouseEvent): void
```

##### multiSelect

多选：

```typescript
actionManager.multiSelect(els: HTMLElement[]): void
```

##### highlight

高亮：

```typescript
actionManager.highlight(el: HTMLElement): void
```

##### clearHighlight

清除高亮：

```typescript
actionManager.clearHighlight(): void
```

## 使用示例

```typescript
import { BoxCore } from '@quantum-lowcode/sandbox';

const container = document.getElementById('sandbox');

// 创建沙箱实例
const boxCore = new BoxCore({
  container,
  designWidth: 750,
  zoom: 1
});

// 挂载到容器
boxCore.mount(container);

// 选中节点
boxCore.select('node-1');

// 更新节点
boxCore.update({
  id: 'node-1',
  data: {
    style: {
      backgroundColor: '#ff0000'
    }
  }
});

// 销毁
boxCore.destroy();
```

## 事件

沙箱会触发以下事件：

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 选中节点 | `{ node, event }` |
| multi-select | 多选 | `{ nodes }` |
| update | 更新节点 | `{ id, data }` |
| add | 添加节点 | `{ parentId, index, data }` |
| delete | 删除节点 | `{ id }` |
| highlight | 高亮 | `{ node }` |
| mousemove | 鼠标移动 | `{ event }` |

## 通信机制

编辑器与沙箱通过以下方式通信：

1. **postMessage**: 用于跨域场景
2. **window.quantum**: 同域场景直接调用

```typescript
// 运行时接收消息
window.quantum = {
  select: (id) => { /* 处理选中 */ },
  update: (data) => { /* 处理更新 */ },
  add: (data) => { /* 处理添加 */ },
  delete: (id) => { /* 处理删除 */ }
};
```

## 相关文档

- [系统架构](../architecture.md)
- [编辑器使用指南](../guides/editor-usage.md)
