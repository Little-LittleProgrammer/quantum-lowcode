# 编辑器服务 API

本文档提供 @quantum-lowcode/editor 编辑器服务的完整 API 参考。

## 服务标识

编辑器包含 8 个服务，每个服务都有唯一标识：

```typescript
import {
  EDITOR_SERVICE,
  UI_SERVICE,
  HISTORY_SERVICE,
  PROPS_SERVICE,
  COMPONENT_SERVICE,
  DATASOURCE_SERVICE,
  CONTENTMENU_SERVICE,
  STORAGE_SERVICE
} from '@quantum-lowcode/editor';
```

## 获取服务

```typescript
const editorRef = ref();

// 获取服务
const editorService = editorRef.value?.getService(EDITOR_SERVICE);
const uiService = editorRef.value?.getService(UI_SERVICE);
```

---

## EditorService

编辑器核心服务。

### 标识

```typescript
const EDITOR_SERVICE = 'editor';
```

### 方法

#### get

获取节点信息。

```typescript
get(field: string): {
  node: LowCodeNode;
  parent: LowCodeNode;
  page: LowCodePage;
}
```

#### select

选中节点。

```typescript
select(node: LowCodeNode): void
```

#### highlight

高亮节点。

```typescript
highlight(node: LowCodeNode): void
```

#### add

添加组件。

```typescript
add(data: {
  parentId: string;
  index: number;
  data: ISchemasNode;
}): void
```

#### update

更新组件。

```typescript
update(data: {
  id: string;
  data: Partial<ISchemasNode>;
}): void
```

#### delete

删除组件。

```typescript
delete(field: string): void
```

#### copy

复制选中组件。

```typescript
copy(): void
```

#### paste

粘贴组件。

```typescript
paste(): void
```

#### sort

排序组件。

```typescript
sort(data: {
  fromIndex: number;
  toIndex: number;
  parentId: string;
}): void
```

#### moveLayer

调整层级。

```typescript
moveLayer(type: 'up' | 'down' | 'top' | 'bottom'): void
```

#### alignCenter

居中对齐。

```typescript
alignCenter(): void
```

#### undo

撤销。

```typescript
undo(): void
```

#### redo

重做。

```typescript
redo(): void
```

---

## UiService

UI 状态管理服务。

### 标识

```typescript
const UI_SERVICE = 'ui';
```

### 方法

#### set

设置 UI 状态。

```typescript
set(key: string, value: any): void
```

#### get

获取 UI 状态。

```typescript
get(key: string): any
```

#### zoom

设置缩放。

```typescript
zoom(level: number): void
```

#### calcZoom

自动计算缩放。

```typescript
calcZoom(): void
```

### 状态属性

```typescript
{
  zoom: number;           // 缩放级别
  showCode: boolean;     // 显示代码
  showGuides: boolean;   // 显示辅助线
  sandboxRect: DOMRect;  // 画布区域
}
```

---

## HistoryService

撤销/重做服务。

### 标识

```typescript
const HISTORY_SERVICE = 'history';
```

### 方法

#### push

添加历史记录。

```typescript
push(state: any): void
```

#### undo

撤销。

```typescript
undo(): void
```

#### redo

重做。

```typescript
redo(): void
```

#### canUndo

是否可以撤销。

```typescript
canUndo(): boolean
```

#### canRedo

是否可以重做。

```typescript
canRedo(): boolean
```

#### changePage

切换页面。

```typescript
changePage(pageId: string): void
```

---

## PropsService

属性配置管理服务。

### 标识

```typescript
const PROPS_SERVICE = 'props';
```

### 方法

#### setPropsConfigs

设置属性配置。

```typescript
setPropsConfigs(configs: Record<string, FormSchema[]>): void
```

#### setPropsValues

设置属性值。

```typescript
setPropsValues(values: Record<string, any>): void
```

#### getInitPropsValue

获取初始属性值。

```typescript
getInitPropsValue(type: string): any
```

#### setNewField

设置新字段 ID。

```typescript
setNewField(id: string): void
```

---

## ComponentService

组件列表管理服务。

### 标识

```typescript
const COMPONENT_SERVICE = 'component';
```

### 方法

#### setList

设置组件列表。

```typescript
setList(list: IComponentGroup[]): void
```

#### getList

获取组件列表。

```typescript
getList(): IComponentGroup[]
```

---

## DataSourceService

数据源管理服务。

### 标识

```typescript
const DATASOURCE_SERVICE = 'datasource';
```

### 方法

#### add

添加数据源。

```typescript
add(config: IDataSourceSchema): void
```

#### update

更新数据源。

```typescript
update(id: string, config: Partial<IDataSourceSchema>): void
```

#### delete

删除数据源。

```typescript
delete(id: string): void
```

#### getDataSourceById

获取数据源。

```typescript
getDataSourceById(id: string): IDataSourceSchema
```

#### setFormConfig

设置表单配置。

```typescript
setFormConfig(config: FormSchema[]): void
```

#### setFormValue

设置表单值。

```typescript
setFormValue(value: any): void
```

---

## ContentmenuService

右键菜单服务。

### 标识

```typescript
const CONTENTMENU_SERVICE = 'contentmenu';
```

### 方法

#### getDropMenuList

获取菜单列表。

```typescript
getDropMenuList(): IMenuItem[]
```

#### handleCopy

复制。

```typescript
handleCopy(): void
```

#### handlePaste

粘贴。

```typescript
handlePaste(): void
```

#### handleDelete

删除。

```typescript
handleDelete(): void
```

#### handleUpOne

上移一层。

```typescript
handleUpOne(): void
```

#### handleDownOne

下移一层。

```typescript
handleDownOne(): void
```

#### handleUpAll

置于顶层。

```typescript
handleUpAll(): void
```

#### handleDownAll

置于底层。

```typescript
handleDownAll(): void
```

#### handleAlignCenter

居中对齐。

```typescript
handleAlignCenter(): void
```

---

## StorageService

本地存储服务。

### 标识

```typescript
const STORAGE_SERVICE = 'storage';
```

### 方法

#### getItem

获取存储项。

```typescript
getItem(key: string, protocol?: Protocol): any
```

#### setItem

设置存储项。

```typescript
setItem(key: string, value: any, protocol?: Protocol): void
```

### Protocol 类型

```typescript
enum Protocol {
  OBJECT = 'OBJECT',
  JSON = 'JSON',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN'
}
```

---

## 使用示例

```vue
<template>
  <Editor ref="editorRef" v-model="schema" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Editor } from '@quantum-lowcode/editor';
import {
  EDITOR_SERVICE,
  UI_SERVICE,
  HISTORY_SERVICE
} from '@quantum-lowcode/editor';

const editorRef = ref();
const schema = ref({ type: 'root', children: [] });

// 获取编辑器服务
const editorService = editorRef.value?.getService(EDITOR_SERVICE);

// 选中节点
editorService?.select(node);

// 获取 UI 服务
const uiService = editorRef.value?.getService(UI_SERVICE);

// 缩放画布
uiService?.zoom(0.8);

// 获取历史服务
const historyService = editorRef.value?.getService(HISTORY_SERVICE);

// 撤销
historyService?.undo();

// 重做
historyService?.redo();
</script>
```
