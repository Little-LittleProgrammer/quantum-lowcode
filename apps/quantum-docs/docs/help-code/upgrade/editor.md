[TOC]

# 编辑器功能介绍

> 所有的位置计算都要经过 `calcValueByDesignWidth`方法处理, 转化编辑器坐标到runtime坐标

## component

### 头部

#### nav-bar

### 左侧

#### componentList 组件

展示左侧 组件列表

##### 点击

直接触发 `edtiorService.add` 添加组件

##### 拖拽

1.  dragStart
    1.  将组件信息注入到 `e.dataTransfer` 中
    2.  然后可在 `sandbox.vue` 中的`drop`事件中获取组件信息
2.  dragComp
    1.  调用`sandbox.delayedMarkContainer`, 根据悬浮时间给容器元素标记`containerHighlightClassName`类
3.  dragEnd
    1.  还原 clientX, clientY 坐标
    2.  清掉父组件标记类

#### datasource 数据源

#### layer 层级

### 中间

#### sandbox

##### 拖拽

1.  `sandbox` 内拖拽, 由 `sandbox`模块控制逻辑[sandbox](./sandbox.md)
2.  `componentList` 拖拽到 `sandbox`
    1.  会触发`dropHandler`事件, 接收注入到 `e.dataTransfer` 中的组件
    2.  根据 `layout`计算 `position, top, left`样式
        1.  无父节点: e.client&#x20;
    3.  调用 `editorService.add(config.data, parent)` 添加

##### 更新

1.  监听 `zoom`, `root`, `page`, 来调用 `runtime` 的各种事件
2.  `new BoxCore` 生成 `sandbox` 实例, 并订阅`runtime-ready` 获取runtime

#### pageBar

管理页面, 添加复制删除

### 右侧

#### props-editor

由q-form完成

## hooks

### init-hooks

分为 初始化值`initServiceState`与初始化事件`initServiceEvent`

#### initServiceState

1.  将 props 传入的值, 赋值给相应的service
2.  注册form组件

#### initServiceEvent

1.  初始化 service 订阅事件

```js
editorService.on('root-change', rootChangeHandler);
dataSourceService.on('add', dataSourceAddHandler);
dataSourceService.on('update', dataSourceUpdateHandler);
dataSourceService.on('remove', dataSourceRemoveHandler);
```

### init-box

1.  `new BoxCore` 生成 `sandbox` 实例, 由`sandbox`调用, 并赋值给`editorService`
2.  负责订阅各种 `sandbox`事件 `select, highlight, multi-select, update, sort, remove,select-parent`, 当 在画布中操作事件时, 同步更新editor

### service

#### editor-service

1.  负责 画布 的所有操作, 包括存储, 更新, 删除, 添加, 排序, 选择, 缩放, 撤销,前进,粘贴,复制, 改变层级, 拖拽, 高亮
2.  每步操作会调用`history-service `记录步骤

##### 存储

###### 属性

`sandbox`(boxCore实例化), `root`根节点, `page`当前页面, `nodes`多选节点, `node`: 当前选择节点, `parent` 当前节点父节点, `highlightNode`: 高亮节点

###### 方法

1.  `getNodeInfo`: 获取当前组件、组件的父组件以及组件所属的页面节点, 通过回溯查找

##### 选择 select

`select(config: ISchemasNode | Id | ISchemasPage)`

1.  设置当前选择的组件, 组件父组件, 当前页面
2.  如果页面改变, 则改页面

##### 添加 add, addHelper

###### add(node, parent)

`add( addNode: ISchemasNode[] | IAddNode, parent?: ISchemasContainer | null )`

1.  标准化node(`getInitPropsValue`: 获取指定类型的组件初始值): `IAddNode => INodeSchemas`, 生成 `field, style, type, component, label`
2.  `addHelper` 主要流程处理添加逻辑
3.  `select` 选中新增点
4.  `pushHistoryState` 推入历史记录

###### addHelper(node, parent)

`addHelper( node: ISchemasNode | ISchemasPage, parent: ISchemasContainer )`

1.  确定节点加入位置, 为当前选中节点的下一个
2.  根据父节点 layout属性, 设置添加节点的`position`(`getInitPositionStyle`)
3.  调用`sandbox.add({config, parent, parentId, root})`方法
4.  调用 `fixNodePosition`, 重新计算 `top, left`
    1.  ` fixNodeLeft`: 计算`left`, 判断边界条件
        1.  如果超过边界或者没有`left`属性,返回` (left =  parentEl.offsetWidth - el.offsetWidth)`
        2.  如果没超过, 返回原值\\
    2.  `getMiddleTop`, 计算`top`, 判断是否有`top`
        1.  如果是直接点击`component`添加的, 代表没有`top`, 默认居中`getMiddleTop: top = (parentHeight - height) / 2`
        2.  如果是拖拽进来的,样式信息已由`sandbox.vue`组件计算好, 不处理
5.  调用`calcValueByDesignWidth` 格式化上步计算的`top`和`left`
6.  调用 `sandbox.update()`更新此组件

##### 更新 update, updateHelper

###### update(node)

`update( config: ISchemasNode | ISchemasNode[] )`

1.  `updateHelper(node)` 主逻辑
2.  `pushHistoryState` 推入历史记录
3.  `updateHandler`选中更新节点, 调用`sandbox.select`

###### updateHelper(config)

` updateHelper(config: ISchemasNode)`

1.  找到这个 oldNode
2.  判断是否是 `text` 组件, 因为text中的富文本里设置的样式是px的, 所以要转成rem
3.  `mergeWidth(oldNode, config)`
4.  如果更新的是容器的布局, 则要同步更改子节点的position`setChildrenLayout(newNode.children)`
5.  更新 `nodes`, 调用 `sandbox.update({config, parentId,root})`

##### 删除 delete, deleteHelper

###### delete

`delete( nodeOrNodeList: ISchemasNode | ISchemasNode[] )`

1.  `deleteHelper(node) `主逻辑
2.  `pushHistoryState` 推入历史记录

###### deleteHelper

` deleteHelper(node: ISchemasNode)`

1.  获取要删除的节点, 将其删除
2.  调用 `sandbox.delete({id, parentId,root})`
3.  `select`默认节点

##### 排序 sort

`sort(field1: Id, field2: Id)`

1.  找到node1, node2, 并交换位置
2.  调用`update( parent)`
3.  `sandbox.update({node})`

##### 缩放,撤销,前进,粘贴,复制,改变层级

1.  缩放(`setZoom`): `ui-service`
2.  撤销,前进(`undo,redo`): `history-service`
3.  改变层级(`moveLayer(offset: number | LayerOffset)`): `editor-service`
4.  粘贴,复制(`paste, copy`): `storage-service`

###### 粘贴

` paste(position: IPastePosition = {})`

1.  从 `storageService`中获取`config`
2.  `pasteHelper` => `beforePaste`: 计算偏移量, 一般无效果
3.  调用 `add`方法加入

##### 拖拽 dragTo

由 layer组件 主动触发
`dragTo(config: ISchemasNode, newParent: ISchemasContainer, newIndex: number)`

##### 高亮 highlight

存储当前高亮节点

#### component-service

负责存储左侧物料库的对象

#### contentmenu-service

负责画布上右键菜单显示, 调用editor-service实现功能

#### datasource-service

负责管理数据源, 包括存储,添加,删除,更新

#### history-service

负责 undoRedo 记录

#### props-service

负责 右侧的组件编辑功能

#### storage-service

负责 storage的处理, 目前只涉及到 copy数据的存储

#### ui-service

负责编辑器部分的展示样式, 包括, 编辑器左中右宽度, sandbox大小, 画布缩放等等



## 需要计算样式的场景

修复元素渲染到画布里的样式计算错误

## 目前, 已知, 2个场景的位置计算出现错误
> 当 页面切换到 `pad` 状态下的添加 居中 粘贴 会有问题

1. `add:` 左侧菜单栏添加(组件拖入, 组件点击)
    1. 组件拖入: 计算鼠标位置 - stage位置
    2. 组件点击: 计算stage的top的居中位置
    3. 粘贴, 需要处理初始`position`
    4. layer新增
2. `update`涉及style场景
    1. 右侧样式更改, 不需要
    2. sandbox拖拽, 已经处理, 也不需要
3. `alignCenter`场景
    1. 需要处理

## 问题解决方案
1. 如果为Node节点中获取, 默认认为已经 `calcValueByFontSize`过
2. 如果遇到通过 `offset, getBoundingClientRect`等doc api计算的样式, 如果要渲染到画布, 需要重新格式化样式
3. 

目前, 已知, 2个场景的位置计算出现错误
当 页面切换到 pad 状态下的添加 居中 粘贴 会有问题

add: 左侧菜单栏添加(组件拖入, 组件点击)
组件拖入: 计算鼠标位置 - stage位置
组件点击: 计算stage的top的居中位置
粘贴, 需要处理初始position
layer新增
update涉及style场景
右侧样式更改, 不需要
sandbox拖拽, 已经处理, 也不需要
alignCenter场景
需要处理
问题解决方案
如果为Node节点中获取, 默认认为已经 calcValueByFontSize过
如果遇到通过 offset, getBoundingClientRect等doc api计算的样式, 如果要渲染到画布, 需要重新格式化样式

# 编辑器 (Editor)

## 概述

编辑器是Quantum低代码平台的可视化搭建核心，提供拖拽式组件编辑、属性配置、实时预览等功能。采用模块化架构设计，支持插件扩展和自定义开发。

## 整体架构

### 核心模块

#### 1. 布局组件
- **Framework**: 整体布局容器，管理编辑器的整体结构
- **Workspace**: 工作区域，包含侧边栏、画布、属性面板
- **Sandbox**: 画布区域，集成`@quantum-lowcode/sandbox`

#### 2. Service Store
基于Vue3的响应式状态管理，提供全局状态和服务：

**EditorService**: 核心编辑服务
```typescript
interface IStoreState {
    root: ISchemasRoot | null;           // 根schema
    page?: ISchemasPage | null;          // 当前页面
    parent?: ISchemasContainer | null;    // 父容器
    node?: ISchemasNode | null;          // 当前选中节点
    highlightNode?: ISchemasNode | null;  // 高亮节点
    nodes?: ISchemasNode[];              // 多选节点
    sandbox: BoxCore | null;             // 沙箱实例
    modifiedNodeFields?: Map<Id, Id>;    // 修改的节点字段
    pageLength: number;                  // 页面数量
    disabledMultiSelect: boolean;        // 是否禁用多选
}

class EditorService extends Subscribe {
    // 节点操作
    public select(node: ISchemasNode): void;
    public multiSelect(nodes: ISchemasNode[]): void;
    public add(config: ISchemasNode, parent?: ISchemasContainer): void;
    public update(config: ISchemasNode): void;
    public delete(node: ISchemasNode): void;
    
    // 页面操作
    public addPage(config: ISchemasPage): void;
    public deletePage(page: ISchemasPage): void;
    public selectPage(page: ISchemasPage): void;
    
    // 工具方法
    public getNodeByField(field: Id): ISchemasNode | undefined;
    public getNodePath(node: ISchemasNode): ISchemasNode[];
}
```

**UiService**: 界面状态管理
```typescript
interface IUiState {
    uiSelectMode: boolean;              // 选择模式
    canvasAutoScrollIntoView: boolean;  // 自动滚动
    canvasContentMenu: ICanvasContentMenu; // 右键菜单
    copyData: ICopyData | null;         // 复制数据
    isContainer: boolean;               // 是否为容器
    containerHighlightType: ContainerHighlightType; // 容器高亮类型
    zoom: number;                       // 缩放比例
    designWidth: number;                // 设计稿宽度
}
```

**ComponentService**: 组件管理
```typescript
interface IComponentState {
    // 组件列表
    components: IComponentListItem[];
    // 组件配置
    componentConfigs: Record<string, IComponentConfig>;
    // 组件分组
    componentGroups: IComponentGroup[];
}

class ComponentService extends Subscribe {
    public registerComponent(config: IComponentConfig): void;
    public unregisterComponent(name: string): void;
    public getComponent(name: string): IComponentConfig | undefined;
    public getComponentList(): IComponentListItem[];
}
```

**DataSourceService**: 数据源管理
```typescript
interface IDataSourceState {
    datasourceTypeList: IDatasourceTypeOption[];
    dataSources: IDataSourceSchema[];
    editable: boolean;
    configs: Record<string, FormConfig>;
    values: Record<string, Partial<IDataSourceSchema>>;
    methods: Record<string, EventOption[]>;
}

class DataSourceService extends Subscribe {
    public add(config: IDataSourceSchema): IDataSourceSchema;
    public update(config: IDataSourceSchema): IDataSourceSchema;
    public delete(id: string): void;
    public get(id: string): IDataSourceSchema | undefined;
}
```

### 布局结构

```vue
<template>
  <div class="quantum-editor">
    <!-- 头部工具栏 -->
    <div class="editor-header">
      <div class="breadcrumb">面包屑导航</div>
      <div class="toolbar">工具按钮</div>
    </div>
    
    <!-- 主体区域 -->
    <div class="editor-body">
      <!-- 左侧边栏 -->
      <div class="sidebar-left">
        <ComponentList />      <!-- 组件列表 -->
        <LayerTree />         <!-- 图层树 -->
        <DataSourcePanel />   <!-- 数据源面板 -->
      </div>
      
      <!-- 中央画布 -->
      <div class="canvas-area">
        <div class="canvas-toolbar">画布工具栏</div>
        <Sandbox />           <!-- 沙箱画布 -->
        <div class="page-tabs">页面标签</div>
      </div>
      
      <!-- 右侧属性面板 -->
      <div class="sidebar-right">
        <PropsEditor />       <!-- 属性编辑器 -->
        <StyleEditor />       <!-- 样式编辑器 -->
        <EventEditor />       <!-- 事件编辑器 -->
      </div>
    </div>
  </div>
</template>
```

## 主要功能

### 1. 组件管理

#### 组件注册
```typescript
// 注册组件
componentService.registerComponent({
    name: 'Button',
    label: '按钮',
    group: 'basic',
    component: ButtonComponent,
    props: {
        text: {
            type: 'string',
            default: '按钮',
            title: '按钮文本'
        },
        type: {
            type: 'select',
            default: 'primary',
            options: ['primary', 'secondary', 'danger'],
            title: '按钮类型'
        }
    },
    events: {
        onClick: {
            label: '点击事件',
            params: ['event']
        }
    }
});
```

#### 组件列表
- 分组显示注册的组件
- 支持拖拽添加到画布
- 搜索和过滤功能

### 2. 画布操作

#### 节点选择
```typescript
// 单选
editorService.select(node);

// 多选
editorService.multiSelect([node1, node2, node3]);

// 取消选择
editorService.select(null);
```

#### 节点操作
```typescript
// 添加节点
editorService.add({
    field: 'button1',
    component: 'Button',
    componentProps: {
        text: '新按钮'
    }
}, parentContainer);

// 更新节点
editorService.update({
    field: 'button1',
    componentProps: {
        text: '更新的按钮'
    }
});

// 删除节点
editorService.delete(node);
```

#### 拖拽功能
- 从组件库拖拽添加组件
- 画布内组件拖拽移动
- 图层树拖拽调整层级

### 3. 属性编辑

#### 动态表单生成
```typescript
// 基于组件配置生成表单
const formSchema = generateFormSchema(componentConfig);

// 表单配置示例
const formConfig = [
    {
        field: 'text',
        label: '按钮文本',
        component: 'Input',
        componentProps: {
            placeholder: '请输入按钮文本'
        }
    },
    {
        field: 'type',
        label: '按钮类型',
        component: 'Select',
        componentProps: {
            options: [
                { label: '主要按钮', value: 'primary' },
                { label: '次要按钮', value: 'secondary' },
                { label: '危险按钮', value: 'danger' }
            ]
        }
    }
];
```

#### 联动配置
```typescript
// 条件显示
{
    field: 'url',
    label: '跳转链接',
    component: 'Input',
    ifShow: {
        field: 'type',
        op: '=',
        value: 'link'
    }
}
```

### 4. 事件管理

#### 事件绑定
```typescript
// 组件事件配置
{
    field: 'onClick',
    label: '点击事件',
    component: 'EventSelect',
    componentProps: {
        options: [
            { label: '跳转页面', value: 'navigate' },
            { label: '调用方法', value: 'method' },
            { label: '发送请求', value: 'request' }
        ]
    }
}
```

#### 事件处理
```typescript
// 事件处理器
const eventHandlers = {
    navigate: (params) => {
        // 页面跳转逻辑
        router.push(params.url);
    },
    method: (params) => {
        // 调用数据源方法
        app.emit(`${params.dataSourceId}:${params.methodName}`, params.args);
    },
    request: async (params) => {
        // 发送HTTP请求
        const response = await app.request(params.config);
        return response;
    }
};
```

### 5. 数据源集成

#### 数据源配置
```typescript
// 添加数据源
dataSourceService.add({
    id: 'userApi',
    type: 'http',
    title: '用户API',
    description: '获取用户信息',
    config: {
        url: '/api/users',
        method: 'GET'
    },
    fields: [
        {
            name: 'userList',
            type: 'array',
            description: '用户列表'
        }
    ],
    methods: [
        {
            name: 'fetchUsers',
            description: '获取用户列表',
            params: [],
            timing: 'manual'
        }
    ]
});
```

#### 数据绑定
```typescript
// 组件属性绑定数据源
{
    field: 'dataSource',
    label: '数据源',
    component: 'DataSourceSelect',
    componentProps: {
        dataSourceId: 'userApi',
        field: 'userList'
    }
}
```

## 使用示例

### 基本使用
```vue
<template>
  <QuantumEditor
    v-model:value="schema"
    :components="components"
    :runtime-url="runtimeUrl"
    @save="handleSave"
  />
</template>

<script setup>
import { QuantumEditor } from '@quantum-lowcode/editor';
import { ref } from 'vue';

const schema = ref({
    type: 'root',
    name: 'demo',
    children: []
});

const components = [
    {
        name: 'Button',
        label: '按钮',
        component: () => import('./components/Button.vue')
    }
];

const runtimeUrl = 'http://localhost:3000/runtime';

const handleSave = (data) => {
    console.log('保存数据:', data);
    // 发送到服务器
    saveToServer(data);
};
</script>
```

### 自定义组件
```typescript
// 注册自定义组件
editorService.registerComponent({
    name: 'CustomChart',
    label: '自定义图表',
    group: 'chart',
    component: CustomChartComponent,
    props: {
        chartType: {
            type: 'select',
            options: ['line', 'bar', 'pie'],
            default: 'line',
            title: '图表类型'
        },
        data: {
            type: 'dataSource',
            title: '数据源'
        }
    },
    events: {
        onDataChange: {
            label: '数据变化',
            params: ['newData', 'oldData']
        }
    }
});
```

## 插件开发

### 插件接口
```typescript
interface IEditorPlugin {
    name: string;
    version: string;
    install(editor: IEditor): void;
    uninstall?(editor: IEditor): void;
}

// 示例插件
class MyPlugin implements IEditorPlugin {
    name = 'MyPlugin';
    version = '1.0.0';
    
    install(editor: IEditor) {
        // 添加自定义菜单
        editor.addMenuItem({
            label: '我的功能',
            icon: 'my-icon',
            onClick: () => {
                console.log('自定义功能被点击');
            }
        });
        
        // 注册自定义组件
        editor.registerComponent(myCustomComponent);
    }
    
    uninstall(editor: IEditor) {
        // 清理插件资源
        editor.removeMenuItem('我的功能');
    }
}
```

### 插件使用
```typescript
import { QuantumEditor } from '@quantum-lowcode/editor';
import MyPlugin from './plugins/MyPlugin';

const editor = new QuantumEditor();
editor.use(MyPlugin);
```

## 最佳实践

### 1. 性能优化
- 使用虚拟滚动处理大量组件
- 懒加载组件定义
- 防抖处理频繁操作

### 2. 错误处理
```typescript
// 全局错误处理
editor.on('error', (error) => {
    console.error('编辑器错误:', error);
    // 显示错误提示
    notification.error({
        title: '操作失败',
        message: error.message
    });
});
```

### 3. 数据持久化
```typescript
// 自动保存
let autoSaveTimer;
const autoSave = () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveToLocal(editor.getValue());
    }, 5000);
};

editor.on('change', autoSave);
```

### 4. 快捷键支持
```typescript
// 注册快捷键
editor.registerShortcut('ctrl+s', () => {
    handleSave();
});

editor.registerShortcut('ctrl+z', () => {
    editor.undo();
});

editor.registerShortcut('ctrl+y', () => {
    editor.redo();
});
```
