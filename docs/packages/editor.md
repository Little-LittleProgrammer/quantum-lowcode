# @quantum-lowcode/editor 编辑器

编辑器模块提供完整的可视化拖拽编辑功能。

## 安装

```bash
pnpm add @quantum-lowcode/editor
```

## 概述

编辑器是基于 Vue 3 的可视化低代码编辑器，提供所见即所得的编辑体验。

## 核心组件

### Editor

编辑器主组件。

```vue
<template>
  <Editor
    v-model="schema"
    :runtime-url="runtimeUrl"
    :component-group-list="componentList"
    :props-configs="propsConfigs"
    :datasource-list="datasourceList"
  >
    <template #header>
      <!-- 自定义头部 -->
    </template>
  </Editor>
</template>
```

### Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| v-model | ISchemasRoot | 是 | Schema 配置 |
| runtimeUrl | string | 是 | 运行时 URL |
| componentGroupList | IComponentGroup[] | 否 | 组件列表 |
| propsConfigs | Record<string, FormSchema[]> | 否 | 属性配置 |
| datasourceList | IDataSourceSchema[] | 否 | 数据源列表 |

## 服务层

编辑器提供 8 个核心服务：

### 1. EditorService

编辑器核心服务，管理整体状态。

```typescript
// 获取服务
const editorService = editorRef.value?.getService(EDITOR_SERVICE);

// 方法
editorService.get(field: string): any           // 获取节点信息
editorService.select(node: LowCodeNode): void    // 选中节点
editorService.highlight(node: LowCodeNode): void // 高亮节点
editorService.add(data: ISchemasNode): void      // 添加组件
editorService.update(data: Partial<ISchemasNode>): void // 更新组件
editorService.delete(field: string): void        // 删除组件
editorService.copy(): void                       // 复制
editorService.paste(): void                      // 粘贴
editorService.undo(): void                       // 撤销
editorService.redo(): void                       // 重做
```

### 2. UiService

UI 状态管理服务。

```typescript
const uiService = editorRef.value?.getService(UI_SERVICE);

// 方法
uiService.set(key: string, value: any): void   // 设置状态
uiService.get(key: string): any                 // 获取状态
uiService.zoom(level: number): void             // 缩放画布
uiService.calcZoom(): void                      // 自动计算缩放
```

### 3. HistoryService

撤销/重做服务。

```typescript
const historyService = editorRef.value?.getService(HISTORY_SERVICE);

// 方法
historyService.push(state: any): void            // 添加历史记录
historyService.undo(): void                      // 撤销
historyService.redo(): void                      // 重做
historyService.canUndo(): boolean                // 是否可撤销
historyService.canRedo(): boolean               // 是否可重做
historyService.changePage(pageId: string): void // 切换页面
```

### 4. PropsService

属性配置管理服务。

```typescript
const propsService = editorRef.value?.getService(PROPS_SERVICE);

// 方法
propsService.setPropsConfigs(configs: Record<string, FormSchema[]>): void
propsService.setPropsValues(values: Record<string, any>): void
propsService.getInitPropsValue(type: string): any
propsService.setNewField(id: string): void
```

### 5. ComponentService

组件列表管理服务。

```typescript
const componentService = editorRef.value?.getService(COMPONENT_SERVICE);

// 方法
componentService.setList(list: IComponentGroup[]): void
componentService.getList(): IComponentGroup[]
```

### 6. DataSourceService

数据源管理服务。

```typescript
const dataSourceService = editorRef.value?.getService(DATASOURCE_SERVICE);

// 方法
dataSourceService.add(config: IDataSourceSchema): void
dataSourceService.update(id: string, config: Partial<IDataSourceSchema>): void
dataSourceService.delete(id: string): void
dataSourceService.getDataSourceById(id: string): IDataSourceSchema
```

### 7. ContentmenuService

右键菜单服务。

```typescript
const contentmenuService = editorRef.value?.getService(CONTENTMENU_SERVICE);

// 方法
contentmenuService.getDropMenuList(): IMenuItem[]
contentmenuService.handleCopy(): void
contentmenuService.handlePaste(): void
contentmenuService.handleDelete(): void
contentmenuService.handleUpOne(): void
contentmenuService.handleDownOne(): void
contentmenuService.handleAlignCenter(): void
```

### 8. StorageService

本地存储服务。

```typescript
const storageService = editorRef.value?.getService(STORAGE_SERVICE);

// 方法
storageService.getItem(key: string): any
storageService.setItem(key: string, value: any): void
```

## 使用示例

```vue
<template>
  <Editor
    ref="editorRef"
    v-model="schema"
    :runtime-url="runtimeUrl"
    :component-group-list="componentList"
    :props-configs="propsConfigs"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Editor } from '@quantum-lowcode/editor';
import { EDITOR_SERVICE } from '@quantum-lowcode/editor';

const editorRef = ref();
const schema = ref({
  type: 'root',
  designWidth: 750,
  children: []
});
const runtimeUrl = 'http://localhost:5173/runtime.html';
const componentList = ref([
  {
    label: '基础组件',
    list: [
      { component: 'q-button', label: '按钮', icon: '' },
      { component: 'q-text', label: '文本', icon: '' }
    ]
  }
]);
const propsConfigs = {
  'q-button': [
    { field: 'text', label: '文本', component: 'Input' },
    { field: 'type', label: '类型', component: 'Select' }
  ]
};

// 访问服务
const handleClick = () => {
  const editorService = editorRef.value?.getService(EDITOR_SERVICE);
  editorService?.select(node);
};
</script>
```

## 布局组件

编辑器包含以下布局组件：

- `Framework` - 整体布局框架
- `Workspace` - 工作区
- `Sidebar` - 左侧边栏（组件列表/图层）
- `Sandbox` - 画布
- `PropsEditor` - 右侧属性面板
- `NavMenu` - 顶部导航

## 相关文档

- [编辑器使用指南](../guides/editor-usage.md)
- [编辑器服务 API](../api/editor-services.md)
- [系统架构](../architecture.md)
