# 二次开发指南

## 概述

Quantum低代码平台提供了强大的扩展能力，支持插件开发、自定义组件、自定义运行时等多种二次开发方式。本指南将详细介绍如何进行平台扩展开发。

## 扩展架构

### 扩展点分析
Quantum平台提供以下主要扩展点：

1. **组件扩展**: 开发自定义业务组件
2. **编辑器插件**: 扩展编辑器功能
3. **数据源扩展**: 支持新的数据源类型
4. **运行时扩展**: 支持新的前端框架
5. **服务扩展**: 扩展后端服务能力

### 扩展机制
```typescript
// 插件接口定义
interface IQuantumPlugin {
    name: string;
    version: string;
    description?: string;
    dependencies?: string[];
    
    // 插件生命周期
    install?(app: IQuantumApp): void;
    activate?(app: IQuantumApp): void;
    deactivate?(app: IQuantumApp): void;
    uninstall?(app: IQuantumApp): void;
}

// 扩展点注册
interface IExtensionRegistry {
    registerComponent(config: IComponentConfig): void;
    registerDataSource(config: IDataSourceConfig): void;
    registerEditor(config: IEditorConfig): void;
    registerRuntime(config: IRuntimeConfig): void;
}
```

## 组件扩展开发

### 1. 基础组件开发

#### 目录结构
```
custom-components/
├── src/
│   ├── components/
│   │   ├── my-chart/
│   │   │   ├── index.ts
│   │   │   ├── src/
│   │   │   │   ├── chart.vue
│   │   │   │   ├── formSchema.ts
│   │   │   │   └── event.ts
│   │   └── my-table/
│   │       └── ...
│   ├── config.ts
│   └── index.ts
├── package.json
└── README.md
```

#### 组件开发示例
```vue
<!-- src/components/my-chart/src/chart.vue -->
<template>
    <div class="custom-chart" :style="computedStyle">
        <div ref="chartContainer" class="chart-container"></div>
        <div v-if="loading" class="loading">加载中...</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useApp } from '@quantum-lowcode/ui';
import * as echarts from 'echarts';

interface Props {
    config: ISchemasNode;
    chartType?: 'line' | 'bar' | 'pie';
    dataSource?: string;
    title?: string;
    width?: number;
    height?: number;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    chartType: 'line',
    width: 400,
    height: 300,
    loading: false
});

const emit = defineEmits(['dataChange', 'chartClick']);

const chartContainer = ref<HTMLDivElement>();
const chartInstance = ref<echarts.ECharts>();

// 使用useApp获取应用实例
const { app } = useApp({ 
    config: props.config,
    methods: { refresh, exportChart }
});

const computedStyle = computed(() => ({
    width: `${props.width}px`,
    height: `${props.height}px`
}));

// 初始化图表
onMounted(() => {
    initChart();
    loadData();
});

// 监听数据变化
watch(() => props.dataSource, (newVal) => {
    if (newVal) {
        loadData();
    }
});

function initChart() {
    if (chartContainer.value) {
        chartInstance.value = echarts.init(chartContainer.value);
        
        // 监听图表点击事件
        chartInstance.value.on('click', (params) => {
            emit('chartClick', params);
        });
    }
}

async function loadData() {
    if (!props.dataSource || !app) return;
    
    try {
        // 从数据源获取数据
        const data = await app.getData(props.dataSource);
        updateChart(data);
        emit('dataChange', data);
    } catch (error) {
        console.error('加载图表数据失败:', error);
    }
}

function updateChart(data: any[]) {
    if (!chartInstance.value) return;
    
    const option = generateChartOption(data);
    chartInstance.value.setOption(option);
}

function generateChartOption(data: any[]) {
    // 根据图表类型生成配置
    const baseOption = {
        title: { text: props.title },
        tooltip: { trigger: 'axis' },
        legend: { data: [] },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: []
    };
    
    // 根据chartType和data生成具体配置
    switch (props.chartType) {
        case 'line':
            return generateLineChart(baseOption, data);
        case 'bar':
            return generateBarChart(baseOption, data);
        case 'pie':
            return generatePieChart(baseOption, data);
        default:
            return baseOption;
    }
}

// 暴露给外部的方法
function refresh() {
    loadData();
}

function exportChart() {
    if (chartInstance.value) {
        const url = chartInstance.value.getDataURL({
            type: 'png',
            pixelRatio: 2
        });
        
        // 下载图片
        const link = document.createElement('a');
        link.download = `chart-${Date.now()}.png`;
        link.href = url;
        link.click();
    }
}

// 清理资源
onUnmounted(() => {
    if (chartInstance.value) {
        chartInstance.value.dispose();
    }
});
</script>

<style scoped>
.custom-chart {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.chart-container {
    width: 100%;
    height: 100%;
}

.loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
}
</style>
```

#### 表单配置
```typescript
// src/components/my-chart/src/formSchema.ts
export default [
    {
        field: 'title',
        label: '图表标题',
        component: 'Input',
        componentProps: {
            placeholder: '请输入图表标题'
        }
    },
    {
        field: 'chartType',
        label: '图表类型',
        component: 'Select',
        componentProps: {
            options: [
                { label: '折线图', value: 'line' },
                { label: '柱状图', value: 'bar' },
                { label: '饼图', value: 'pie' }
            ]
        }
    },
    {
        field: 'dataSource',
        label: '数据源',
        component: 'DataSourceSelect',
        componentProps: {
            placeholder: '选择数据源'
        }
    },
    {
        field: 'width',
        label: '宽度',
        component: 'InputNumber',
        componentProps: {
            min: 200,
            max: 1200,
            step: 10
        }
    },
    {
        field: 'height',
        label: '高度',
        component: 'InputNumber',
        componentProps: {
            min: 200,
            max: 800,
            step: 10
        }
    },
    {
        field: 'events',
        label: '事件',
        component: 'EventSelect',
        componentProps: {
            options: [
                { label: '图表点击', value: 'onChartClick' },
                { label: '数据变化', value: 'onDataChange' }
            ]
        }
    }
];
```

#### 事件配置
```typescript
// src/components/my-chart/src/event.ts
export default {
    methods: [
        {
            label: '刷新图表',
            value: 'refresh'
        },
        {
            label: '导出图表',
            value: 'exportChart'
        }
    ]
};
```

### 2. 组件注册与发布

#### 组件导出
```typescript
// src/components/my-chart/index.ts
import Chart from './src/chart.vue';
export default Chart;

// src/index.ts
export { default as MyChart } from './components/my-chart';
export { default as MyTable } from './components/my-table';

// 配置导出
export { formSchemas, events } from './config';
```

#### 组件配置
```typescript
// src/config.ts
import myChartSchema from './components/my-chart/src/formSchema';
import myChartEvents from './components/my-chart/src/event';

export const formSchemas = {
    'MyChart': myChartSchema,
    'MyTable': myTableSchema
};

export const events = {
    'MyChart': myChartEvents,
    'MyTable': myTableEvents
};

export const componentGroups = [
    {
        name: 'custom',
        label: '自定义组件',
        components: ['MyChart', 'MyTable']
    }
];
```

## 编辑器插件开发

### 1. 插件结构

#### 插件入口
```typescript
// plugins/custom-toolbar/index.ts
import { IEditorPlugin } from '@quantum-lowcode/editor';

export default class CustomToolbarPlugin implements IEditorPlugin {
    name = 'CustomToolbarPlugin';
    version = '1.0.0';
    description = '自定义工具栏插件';
    
    private toolbar?: HTMLElement;
    
    install(editor: IEditor) {
        this.createToolbar(editor);
        this.registerShortcuts(editor);
        this.addMenuItems(editor);
    }
    
    uninstall(editor: IEditor) {
        this.removeToolbar();
        this.unregisterShortcuts(editor);
        this.removeMenuItems(editor);
    }
    
    private createToolbar(editor: IEditor) {
        // 创建自定义工具栏
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'custom-toolbar';
        this.toolbar.innerHTML = `
            <button data-action="preview">预览</button>
            <button data-action="export">导出</button>
            <button data-action="import">导入</button>
        `;
        
        // 绑定事件
        this.toolbar.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const action = target.dataset.action;
            
            switch (action) {
                case 'preview':
                    this.handlePreview(editor);
                    break;
                case 'export':
                    this.handleExport(editor);
                    break;
                case 'import':
                    this.handleImport(editor);
                    break;
            }
        });
        
        // 插入到编辑器
        const editorContainer = editor.getContainer();
        editorContainer.appendChild(this.toolbar);
    }
    
    private handlePreview(editor: IEditor) {
        const schema = editor.getValue();
        const previewUrl = `/preview?schema=${encodeURIComponent(JSON.stringify(schema))}`;
        window.open(previewUrl, '_blank');
    }
    
    private handleExport(editor: IEditor) {
        const schema = editor.getValue();
        const blob = new Blob([JSON.stringify(schema, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `schema-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    private async handleImport(editor: IEditor) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const text = await file.text();
                try {
                    const schema = JSON.parse(text);
                    editor.setValue(schema);
                } catch (error) {
                    alert('文件格式错误');
                }
            }
        };
        
        input.click();
    }
    
    private registerShortcuts(editor: IEditor) {
        editor.registerShortcut('ctrl+p', () => this.handlePreview(editor));
        editor.registerShortcut('ctrl+e', () => this.handleExport(editor));
        editor.registerShortcut('ctrl+i', () => this.handleImport(editor));
    }
    
    private unregisterShortcuts(editor: IEditor) {
        editor.unregisterShortcut('ctrl+p');
        editor.unregisterShortcut('ctrl+e');
        editor.unregisterShortcut('ctrl+i');
    }
    
    private addMenuItems(editor: IEditor) {
        editor.addMenuItem({
            label: '自定义功能',
            submenu: [
                {
                    label: '预览页面',
                    accelerator: 'Ctrl+P',
                    click: () => this.handlePreview(editor)
                },
                {
                    label: '导出Schema',
                    accelerator: 'Ctrl+E',
                    click: () => this.handleExport(editor)
                }
            ]
        });
    }
    
    private removeMenuItems(editor: IEditor) {
        editor.removeMenuItem('自定义功能');
    }
    
    private removeToolbar() {
        if (this.toolbar && this.toolbar.parentNode) {
            this.toolbar.parentNode.removeChild(this.toolbar);
        }
    }
}
```

### 2. 属性面板扩展

```typescript
// plugins/property-panel-extension/index.ts
export default class PropertyPanelExtension implements IEditorPlugin {
    name = 'PropertyPanelExtension';
    version = '1.0.0';
    
    install(editor: IEditor) {
        // 注册自定义属性编辑器
        editor.registerPropertyEditor('color-picker', ColorPickerEditor);
        editor.registerPropertyEditor('icon-selector', IconSelectorEditor);
        editor.registerPropertyEditor('animation-config', AnimationConfigEditor);
        
        // 扩展现有组件的属性配置
        this.extendComponentProperties(editor);
    }
    
    private extendComponentProperties(editor: IEditor) {
        // 为按钮组件添加动画配置
        editor.extendComponentConfig('Button', {
            properties: {
                animation: {
                    type: 'animation-config',
                    label: '动画配置',
                    group: 'advanced'
                },
                iconColor: {
                    type: 'color-picker',
                    label: '图标颜色',
                    group: 'style'
                }
            }
        });
    }
}

// 自定义颜色选择器
class ColorPickerEditor extends PropertyEditor {
    render() {
        return (
            <div className="color-picker-editor">
                <input 
                    type="color" 
                    value={this.value}
                    onChange={this.handleColorChange}
                />
                <input 
                    type="text" 
                    value={this.value}
                    onChange={this.handleTextChange}
                    placeholder="#000000"
                />
            </div>
        );
    }
    
    handleColorChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        this.setValue(value);
    }
    
    handleTextChange = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.setValue(value);
        }
    }
}
```

## 数据源扩展

### 1. 自定义数据源类型

```typescript
// data-sources/websocket-source/index.ts
import { DataSource } from '@quantum-lowcode/data-source';

export class WebSocketDataSource extends DataSource {
    private socket?: WebSocket;
    private reconnectTimer?: number;
    private reconnectCount = 0;
    private maxReconnectCount = 5;
    
    constructor(config: IWebSocketDataSourceConfig) {
        super(config);
        this.connect();
    }
    
    private connect() {
        try {
            this.socket = new WebSocket(this.config.url);
            
            this.socket.onopen = () => {
                console.log('WebSocket连接已建立');
                this.reconnectCount = 0;
                this.emit('connected');
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket连接已关闭');
                this.handleReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket错误:', error);
                this.emit('error', error);
            };
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleReconnect();
        }
    }
    
    private handleMessage(data: any) {
        // 根据消息类型处理数据
        switch (data.type) {
            case 'update':
                this.setData(data.path, data.value);
                break;
            case 'push':
                this.pushData(data.path, data.value);
                break;
            case 'delete':
                this.deleteData(data.path);
                break;
            default:
                this.emit('message', data);
        }
    }
    
    private handleReconnect() {
        if (this.reconnectCount < this.maxReconnectCount) {
            this.reconnectTimer = window.setTimeout(() => {
                this.reconnectCount++;
                console.log(`尝试重连 (${this.reconnectCount}/${this.maxReconnectCount})`);
                this.connect();
            }, 1000 * Math.pow(2, this.reconnectCount));
        } else {
            console.error('WebSocket重连次数已达上限');
            this.emit('reconnect-failed');
        }
    }
    
    public send(data: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket未连接，无法发送数据');
        }
    }
    
    public destroy() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        
        if (this.socket) {
            this.socket.close();
        }
        
        super.destroy();
    }
}

// 注册数据源类型
DataSourceManager.registerType('websocket', WebSocketDataSource);
```

### 2. 数据源配置界面

```typescript
// data-sources/websocket-source/config.ts
export const websocketDataSourceConfig = {
    type: 'websocket',
    label: 'WebSocket数据源',
    icon: 'websocket-icon',
    formSchema: [
        {
            field: 'url',
            label: 'WebSocket地址',
            component: 'Input',
            rules: [
                { required: true, message: '请输入WebSocket地址' },
                { pattern: /^wss?:\/\//, message: '请输入有效的WebSocket地址' }
            ]
        },
        {
            field: 'protocols',
            label: '子协议',
            component: 'Select',
            componentProps: {
                mode: 'tags',
                placeholder: '可选的子协议'
            }
        },
        {
            field: 'heartbeat',
            label: '心跳检测',
            component: 'Switch',
            componentProps: {
                checkedChildren: '开启',
                unCheckedChildren: '关闭'
            }
        },
        {
            field: 'heartbeatInterval',
            label: '心跳间隔(秒)',
            component: 'InputNumber',
            componentProps: {
                min: 10,
                max: 300,
                step: 10
            },
            ifShow: {
                field: 'heartbeat',
                op: '=',
                value: true
            }
        }
    ],
    methods: [
        {
            name: 'send',
            label: '发送消息',
            params: [
                { name: 'message', type: 'object', description: '要发送的消息' }
            ]
        },
        {
            name: 'subscribe',
            label: '订阅频道',
            params: [
                { name: 'channel', type: 'string', description: '频道名称' }
            ]
        }
    ]
};
```

## 运行时扩展

### 1. React运行时适配

```typescript
// runtime/react-runtime/src/app.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { App as QuantumApp } from '@quantum-lowcode/core';
import { ComponentRenderer } from './component-renderer';

interface ReactRuntimeConfig {
    container: HTMLElement;
    schema: ISchemasRoot;
    components: Record<string, React.ComponentType>;
}

export class ReactRuntime {
    private app: QuantumApp;
    private container: HTMLElement;
    private components: Record<string, React.ComponentType>;
    
    constructor(config: ReactRuntimeConfig) {
        this.container = config.container;
        this.components = config.components;
        
        // 创建应用实例
        this.app = new QuantumApp({
            schemasRoot: config.schema,
            request: this.request.bind(this)
        });
        
        // 注册组件
        Object.entries(config.components).forEach(([name, component]) => {
            this.app.registerComponent(name, component);
        });
        
        // 渲染应用
        this.render();
    }
    
    private render() {
        const schema = this.app.schemasRoot;
        if (!schema) return;
        
        ReactDOM.render(
            <ComponentRenderer 
                schema={schema} 
                app={this.app}
                components={this.components}
            />,
            this.container
        );
    }
    
    private async request(options: IHttpOptions) {
        // 实现请求逻辑
        const response = await fetch(options.url, {
            method: options.method || 'GET',
            headers: options.headers,
            body: options.data ? JSON.stringify(options.data) : undefined
        });
        
        return response.json();
    }
    
    public getApp() {
        return this.app;
    }
    
    public updateSchema(schema: ISchemasRoot) {
        this.app.setConfig(schema);
        this.render();
    }
    
    public destroy() {
        ReactDOM.unmountComponentAtNode(this.container);
        this.app.destroy();
    }
}

// 组件渲染器
export const ComponentRenderer: React.FC<{
    schema: ISchemasNode;
    app: QuantumApp;
    components: Record<string, React.ComponentType>;
}> = ({ schema, app, components }) => {
    const [data, setData] = useState(schema.componentProps || {});
    
    useEffect(() => {
        // 监听数据变化
        const unsubscribe = app.on(`node:${schema.field}:update`, (newData) => {
            setData(newData);
        });
        
        return unsubscribe;
    }, [schema.field, app]);
    
    // 解析组件
    const Component = components[schema.component];
    if (!Component) {
        console.warn(`组件 ${schema.component} 未注册`);
        return <div>未知组件: {schema.component}</div>;
    }
    
    // 渲染子组件
    const renderChildren = () => {
        if (!schema.children) return null;
        
        return schema.children.map((child) => (
            <ComponentRenderer 
                key={child.field}
                schema={child}
                app={app}
                components={components}
            />
        ));
    };
    
    return (
        <Component {...data} style={schema.style}>
            {renderChildren()}
        </Component>
    );
};
```

### 2. 小程序运行时适配

```typescript
// runtime/miniprogram-runtime/src/app.ts
export class MiniprogramRuntime {
    private app: QuantumApp;
    private pageContext: any;
    private componentMap: Map<string, any> = new Map();
    
    constructor(pageContext: any, schema: ISchemasRoot) {
        this.pageContext = pageContext;
        
        this.app = new QuantumApp({
            schemasRoot: schema,
            request: this.request.bind(this)
        });
        
        this.initPage();
    }
    
    private initPage() {
        const pageSchema = this.app.schemasRoot?.children[0];
        if (!pageSchema) return;
        
        // 生成页面数据
        const pageData = this.generatePageData(pageSchema);
        
        // 设置页面数据
        this.pageContext.setData(pageData);
        
        // 绑定页面方法
        this.bindPageMethods(pageSchema);
    }
    
    private generatePageData(schema: ISchemasNode): any {
        const data: any = {};
        
        // 递归处理节点
        const processNode = (node: ISchemasNode, prefix = '') => {
            const nodeKey = prefix ? `${prefix}.${node.field}` : node.field;
            
            // 设置节点数据
            data[nodeKey] = {
                ...node.componentProps,
                _component: node.component,
                _style: node.style,
                _ifShow: this.evaluateIfShow(node.ifShow)
            };
            
            // 处理子节点
            if (node.children) {
                node.children.forEach(child => {
                    processNode(child, nodeKey);
                });
            }
        };
        
        processNode(schema);
        return data;
    }
    
    private bindPageMethods(schema: ISchemasNode) {
        // 递归绑定事件方法
        const bindEvents = (node: ISchemasNode) => {
            if (node.componentProps) {
                Object.entries(node.componentProps).forEach(([key, value]) => {
                    if (key.startsWith('on') && typeof value === 'function') {
                        const methodName = `${node.field}_${key}`;
                        this.pageContext[methodName] = value;
                    }
                });
            }
            
            if (node.children) {
                node.children.forEach(bindEvents);
            }
        };
        
        bindEvents(schema);
    }
    
    private evaluateIfShow(ifShow: any): boolean {
        if (typeof ifShow === 'boolean') return ifShow;
        if (typeof ifShow === 'function') return ifShow();
        if (Array.isArray(ifShow)) {
            // 处理条件数组
            return ifShow.every(condition => this.evaluateCondition(condition));
        }
        return true;
    }
    
    private evaluateCondition(condition: any): boolean {
        // 实现条件评估逻辑
        const { field, op, value } = condition;
        const actualValue = this.app.getData(field);
        
        switch (op) {
            case '=':
                return actualValue === value;
            case '!=':
                return actualValue !== value;
            case '>':
                return actualValue > value;
            case '<':
                return actualValue < value;
            default:
                return true;
        }
    }
    
    private async request(options: IHttpOptions) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: options.url,
                method: options.method as any,
                data: options.data,
                header: options.headers,
                success: (res) => resolve(res.data),
                fail: reject
            });
        });
    }
}

// 在小程序页面中使用
// pages/index/index.ts
Page({
    data: {},
    
    onLoad(options: any) {
        const schema = options.schema ? JSON.parse(options.schema) : defaultSchema;
        this.runtime = new MiniprogramRuntime(this, schema);
    },
    
    onUnload() {
        if (this.runtime) {
            this.runtime.destroy();
        }
    }
});
```

## 服务端扩展

### 1. API扩展

```typescript
// server/plugins/schema-validation/index.ts
export class SchemaValidationPlugin {
    name = 'SchemaValidationPlugin';
    version = '1.0.0';
    
    install(app: IServerApp) {
        // 注册中间件
        app.use('/api/schema/*', this.validateSchema.bind(this));
        
        // 注册API路由
        app.post('/api/schema/validate', this.handleValidate.bind(this));
        app.post('/api/schema/optimize', this.handleOptimize.bind(this));
    }
    
    private async validateSchema(ctx: any, next: any) {
        if (ctx.request.body && ctx.request.body.schema) {
            const errors = await this.validate(ctx.request.body.schema);
            if (errors.length > 0) {
                ctx.status = 400;
                ctx.body = { errors };
                return;
            }
        }
        await next();
    }
    
    private async validate(schema: ISchemasRoot): Promise<string[]> {
        const errors: string[] = [];
        
        // 验证根节点
        if (!schema.type || schema.type !== 'root') {
            errors.push('根节点type必须为root');
        }
        
        if (!schema.name) {
            errors.push('根节点必须有name属性');
        }
        
        // 验证页面节点
        if (!schema.children || schema.children.length === 0) {
            errors.push('至少需要一个页面');
        }
        
        // 递归验证子节点
        if (schema.children) {
            for (const child of schema.children) {
                errors.push(...await this.validateNode(child));
            }
        }
        
        return errors;
    }
    
    private async validateNode(node: ISchemasNode): Promise<string[]> {
        const errors: string[] = [];
        
        // 验证必填字段
        if (!node.field) {
            errors.push('节点必须有field属性');
        }
        
        // 验证组件存在性
        if (node.component && !this.isComponentRegistered(node.component)) {
            errors.push(`组件 ${node.component} 未注册`);
        }
        
        // 验证子节点
        if (node.children) {
            for (const child of node.children) {
                errors.push(...await this.validateNode(child));
            }
        }
        
        return errors;
    }
    
    private handleValidate = async (ctx: any) => {
        const { schema } = ctx.request.body;
        const errors = await this.validate(schema);
        
        ctx.body = {
            valid: errors.length === 0,
            errors
        };
    }
    
    private handleOptimize = async (ctx: any) => {
        const { schema } = ctx.request.body;
        const optimizedSchema = await this.optimize(schema);
        
        ctx.body = {
            optimized: optimizedSchema
        };
    }
    
    private async optimize(schema: ISchemasRoot): Promise<ISchemasRoot> {
        // 实现schema优化逻辑
        // 如：移除未使用的数据源、合并重复的样式等
        return schema;
    }
    
    private isComponentRegistered(componentName: string): boolean {
        // 检查组件是否已注册
        return ComponentRegistry.has(componentName);
    }
}
```

## 部署与发布

### 1. 插件打包配置

```typescript
// webpack.plugin.config.js
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'QuantumPlugin',
        libraryTarget: 'umd'
    },
    externals: {
        '@quantum-lowcode/core': '@quantum-lowcode/core',
        '@quantum-lowcode/editor': '@quantum-lowcode/editor',
        'vue': 'vue',
        'react': 'react'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.vue']
    }
};
```

### 2. 插件包配置

```json
{
  "name": "@my-company/quantum-plugin-charts",
  "version": "1.0.0",
  "description": "图表组件插件",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "@quantum-lowcode/core": "^1.0.0",
    "@quantum-lowcode/editor": "^1.0.0",
    "vue": "^3.0.0"
  },
  "quantum": {
    "type": "plugin",
    "category": "component",
    "components": ["MyChart", "MyTable"],
    "dependencies": ["echarts", "ant-design-vue"]
  }
}
```

### 3. 插件注册

```typescript
// 在主应用中注册插件
import { QuantumEditor } from '@quantum-lowcode/editor';
import ChartsPlugin from '@my-company/quantum-plugin-charts';

const editor = new QuantumEditor({
    container: document.getElementById('editor'),
    plugins: [ChartsPlugin]
});

// 或者动态加载
editor.loadPlugin('@my-company/quantum-plugin-charts').then(() => {
    console.log('插件加载成功');
});
```

## 最佳实践

### 1. 开发规范
- 遵循统一的代码风格
- 编写完整的TypeScript类型定义
- 提供详细的文档和示例
- 编写单元测试和集成测试

### 2. 性能优化
- 组件懒加载
- 插件按需加载
- 资源缓存策略
- 代码分割优化

### 3. 兼容性考虑
- 版本向后兼容
- 多框架支持
- 渐进式增强
- 优雅降级处理

### 4. 安全考虑
- 插件权限控制
- 代码安全审查
- XSS防护
- CSP策略配置
