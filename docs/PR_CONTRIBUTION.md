# Little-LittleProgrammer PR 贡献汇总

## 概述

本文档汇总了 Little-LittleProgrammer (Evan Wu) 向 tmagic-editor 项目提交的 PR 内容、实施过程和原理。

---

## PR 列表

| PR # | 标题 | 日期 |
|------|------|------|
| #612 | 修复Pad大屏模式下粘贴位置计算错误偏移问题 | 2024-05-29 |
| #598 | 修复iPad等大屏场景下编辑画布中元素位置计算偏差问题 | 2024-04-25 |
| #581 | Fix issue #503, setPage实现跳转页面 | 2024-03-19 |
| #575 | 修复moveable中custom able旋转中心错误问题 | 2024-03-08 |

---

## PR 详细内容

### PR #612: 修复Pad大屏模式下粘贴位置计算错误偏移问题

**日期**: 2024年5月29日

**修改文件**:
- `packages/editor/src/services/editor.ts`
- `packages/editor/src/utils/operator.ts`

**问题描述**: 在 Pad 等大屏设备上，粘贴元素时位置计算存在偏移错误。

**解决方案**: 修正了粘贴位置计算的逻辑，确保在大屏设备上粘贴元素时位置准确。

---

### PR #598: 修复iPad等大屏场景下编辑画布中元素位置计算偏差问题

**日期**: 2024年4月25日

**修改文件** (7个文件):
- `packages/editor/src/layouts/workspace/viewer/Stage.vue`
- `packages/editor/src/services/editor.ts`
- `packages/editor/src/utils/content-menu.ts`
- `packages/editor/src/utils/editor.ts`
- `packages/stage/src/DragResizeHelper.ts`
- `packages/stage/src/util.ts`
- `packages/utils/src/dom.ts`

#### 问题背景

在 iPad 等大屏设备上，浏览器使用了 CSS 缩放功能（如 `font-size: 125%`），这导致基于 `clientWidth` / `clientHeight` 计算的像素值与实际渲染像素不一致，从而造成元素位置计算偏差。

#### 问题原理

```
实际像素 = 计算像素 / 缩放比例
```

例如：当 `font-size: 125%` 时，缩放比例为 1.25。如果通过 `clientWidth` 计算得到 100px，实际渲染只有 80px。

#### 解决方案

新增 `calcValueByFontsize` 工具函数，根据 `document.documentElement.style.fontSize` 计算缩放比例，对计算值进行反向修正：

```typescript
// packages/utils/src/dom.ts

export const calcValueByFontsize = (doc: Document | undefined, value: number) => {
  if (!doc) return value;
  const { fontSize } = doc.documentElement.style;

  if (fontSize) {
    const times = globalThis.parseFloat(fontSize) / 100;
    return Number((value / times).toFixed(2));
  }

  return value;
};
```

#### 应用场景

该函数被应用到以下场景：
- 元素居中定位 (`editor.ts`)
- 拖拽Resize (`DragResizeHelper.ts`)
- 右键菜单定位 (`content-menu.ts`)
- Stage 视口计算 (`Stage.vue`)

---

### PR #581: Fix issue #503, setPage实现跳转页面

**日期**: 2024年3月19日

**修改文件**:
- `packages/utils/src/index.ts`
- `runtime/vue2/page/App.vue`
- `runtime/vue3/page/App.vue`

#### 功能实现

1. **新增 `addParamsToUrl` 公共方法**
   - 用于向 URL 添加查询参数
   - 支持参数编码和去重

2. **增加 `page-change` 回调**
   - 页面切换时触发回调
   - 支持页面不存在时调用报错

3. **优化页面跳转逻辑**
   - 提取公共方法到 utils 包
   - 增强错误处理

---

### PR #575: 修复moveable中custom able旋转中心错误问题

**日期**: 2024年3月8日

**修改文件**:
- `packages/stage/src/MoveableActionsAble.ts`

#### 问题描述

在使用 Moveable 组件的自定义能力（custom able）时，旋转中心点计算错误，导致元素旋转定位不准确。

#### 解决方案

修正了旋转中心点的计算逻辑，确保自定义 able 的旋转中心与预期一致。

---

## 技术总结

### 涉及的技术领域

1. **大屏设备适配**
   - CSS 缩放（font-size）导致的像素计算偏差
   - 跨设备兼容性处理

2. **编辑器核心**
   - 元素拖拽/缩放位置计算
   - 右键菜单定位
   - 粘贴功能实现

3. **运行时**
   - 页面路由跳转
   - 回调事件处理

### 修改的包

| 包名 | 描述 |
|------|------|
| `@tmagic/utils` | 工具函数 |
| `@tmagic/editor` | 编辑器核心 |
| `@tmagic/stage` | 舞台组件 |
| `@tmagic/runtime` | 运行时 |

---

## 贡献者信息

- **GitHub**: [Little-LittleProgrammer](https://github.com/Little-LittleProgrammer)
- **邮箱**: 56573480+Little-LittleProgrammer@users.noreply.github.com

---

*本文档基于 Git 提交历史自动整理*
