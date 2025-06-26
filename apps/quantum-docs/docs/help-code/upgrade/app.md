# 核心库 (Core)

## 概述

Core是Quantum低代码平台的核心库，负责数据模型管理、组件跨框架管理、事件系统和数据绑定等核心功能。它为整个低代码平台提供了统一的底层支撑。

## 核心功能

### 1. 数据模型管理

Core库定义了完整的Schema数据模型，支持组件树的构建和管理。

#### 数据模型结构
```typescript
// 根节点
interface ISchemasRoot extends ISchemasNode {
    type: NodeType.ROOT;
    children: ISchemasPage[];
    name: string;
    description?: IMetaDes;
    dataSources?: IDataSourceSchema[];
    designWidth?: number;
}

// 页面节点
interface ISchemasPage extends ISchemasContainer {
    type: NodeType.PAGE;
}

// 容器节点
interface ISchemasContainer extends ISchemasNode {
    type: NodeType.CONTAINER | string;
    children: (ISchemasNode | ISchemasContainer)[];
}

// 基础节点
interface ISchemasNode {
    type: NodeType.NODE | string;
    field: Id;                          // 唯一标识
    component?: string;                 // 组件名
    componentProps?: Record<string, any>; // 组件属性
    label?: string;                     // 标签
    style?: Partial<CSSStyleDeclaration>; // 样式
    ifShow?: IfShow[] | boolean | Fn;   // 显示条件
    children?: (ISchemasNode | ISchemasContainer)[];
    created?: Hooks;                    // 创建钩子
    mounted?: Hooks;                    // 挂载钩子
    [key: string]: any;
}
```

### 2. 应用实例管理

#### App类核心方法
```typescript
class App extends Subscribe {
    public dataSourceManager: DataSourceManager;
    public schemasRoot?: ISchemasRoot;
    
    // 页面管理
    public setPages(pages: ISchemasPage[]): void;
    public getPage(field: Id): ISchemasPage | undefined;
    public setPage(page: ISchemasPage): void;
    public deletePage(field: Id): void;
    
    // 组件管理
    public registerComponent(name: string, component: any): void;
    public unregisterComponent(name: string): void;
    public resolveComponent(name: string): any;
    
    // 请求管理
    public request(options: IHttpOptions): Promise<any>;
    
    // 事件系统
    public emit(event: string, ...args: any[]): void;
    public on(event: string, handler: Function): void;
    public off(event: string, handler?: Function): void;
    
    // 数据管理
    public setData(path: string, data: any): void;
    public getData(path: string): any;
}
```

### 3. 组件注册与管理

#### 组件注册机制
```typescript
// 注册组件
app.registerComponent('Button', {
    component: ButtonComponent,
    props: {
        text: {
            type: 'string',
            default: '按钮',
            description: '按钮文本'
        },
        type: {
            type: 'select',
            options: ['primary', 'default', 'danger'],
            default: 'default',
            description: '按钮类型'
        }
    },
    events: {
        onClick: {
            description: '点击事件',
            params: ['event']
        }
    }
});

// 解析组件
const ButtonComponent = app.resolveComponent('Button');
```

#### 跨框架支持
Core库提供了跨框架的组件适配机制：

```typescript
// Vue3适配器
class Vue3Adapter implements IComponentAdapter {
    createComponent(config: IComponentConfig): any {
        return defineComponent({
            props: config.props,
            setup(props, { emit }) {
                return () => h(config.component, props);
            }
        });
    }
}

// Vue2适配器
class Vue2Adapter implements IComponentAdapter {
    createComponent(config: IComponentConfig): any {
        return Vue.extend({
            props: config.props,
            render(h) {
                return h(config.component, {
                    props: this.$props,
                    on: this.$listeners
                });
            }
        });
    }
}
```

### 4. 事件系统

#### 事件类型定义
```typescript
// 组件事件
interface IComponentEvent {
    type: 'component';
    target: Id;         // 目标组件ID
    method: string;     // 方法名
    params?: any[];     // 参数
}

// 数据源事件
interface IDataSourceEvent {
    type: 'dataSource';
    target: Id;         // 数据源ID
    method: string;     // 方法名
    params?: any[];     // 参数
}

// 路由事件
interface INavigationEvent {
    type: 'navigation';
    url: string;        // 跳转URL
    params?: Record<string, any>; // 参数
}
```

#### 事件处理器
```typescript
// 事件绑定
{
    component: 'Button',
    componentProps: {
        onClick: {
            type: 'component',
            target: 'modal1',
            method: 'show'
        }
    }
}

// 事件处理
app.on('component:button1:click', (event) => {
    // 处理按钮点击事件
    console.log('按钮被点击', event);
});
```

### 5. 数据绑定系统

#### 数据绑定语法
```typescript
// 基础数据绑定
{
    component: 'Text',
    componentProps: {
        value: '${dataSource.userInfo.name}' // 绑定用户名
    }
}

// 条件绑定
{
    component: 'Button',
    ifShow: {
        field: ['dataSource', 'user', 'isLogin'],
        op: '=',
        value: true
    }
}

// 计算属性绑定
{
    component: 'Text',
    componentProps: {
        value: '${computed.fullName}' // 绑定计算属性
    }
}
```

#### 数据响应式更新
```typescript
// 数据变化监听
app.on('data:change', (path, newValue, oldValue) => {
    console.log(`数据 ${path} 从 ${oldValue} 变更为 ${newValue}`);
    
    // 触发相关组件更新
    updateRelatedComponents(path);
});

// 设置数据
app.setData('user.name', '新用户名');
app.setData('user.age', 25);
```

### 6. 钩子系统

#### 生命周期钩子
```typescript
interface Hooks {
    hookType?: HookType.CODE;
    hookData?: HookData[];
}

interface HookData {
    field: Id;
    type?: ActionType;
    params: any;
    [key: string]: any;
}

// 使用示例
{
    component: 'UserProfile',
    created: {
        hookType: HookType.CODE,
        hookData: [{
            field: 'fetchUserData',
            type: 'method',
            params: { userId: '${route.params.id}' }
        }]
    },
    mounted: {
        hookType: HookType.CODE,
        hookData: [{
            field: 'initChart',
            type: 'method',
            params: {}
        }]
    }
}
```

## 使用示例

### 基本使用
```typescript
import { App } from '@quantum-lowcode/core';

// 创建应用实例
const app = new App({
    schemasRoot: {
        type: 'root',
        name: 'myApp',
        children: []
    },
    request: async (options) => {
        return await fetch(options.url, {
            method: options.method,
            headers: options.headers,
            body: JSON.stringify(options.data)
        }).then(res => res.json());
    }
});

// 注册组件
app.registerComponent('CustomButton', CustomButtonComponent);

// 设置页面
app.setPage({
    type: 'page',
    field: 'homePage',
    children: [
        {
            field: 'button1',
            component: 'CustomButton',
            componentProps: {
                text: '点击我',
                onClick: {
                    type: 'dataSource',
                    target: 'userApi',
                    method: 'fetchUsers'
                }
            }
        }
    ]
});
```

### 数据源集成
```typescript
// 添加数据源
app.dataSourceManager.addDataSource({
    id: 'userApi',
    type: 'http',
    title: '用户API',
    config: {
        baseURL: 'https://api.example.com'
    },
    methods: [
        {
            name: 'fetchUsers',
            description: '获取用户列表',
            params: [],
            content: async ({ app }) => {
                const response = await app.request({
                    url: '/users',
                    method: 'GET'
                });
                
                // 更新数据
                app.setData('users', response.data);
                return response;
            }
        }
    ]
});
```

### 自定义事件处理
```typescript
// 注册全局事件处理器
app.registerEvent('showModal', (modalId, config) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // 应用配置
        Object.assign(modal, config);
    }
});

// 在组件中触发事件
{
    component: 'Button',
    componentProps: {
        onClick: {
            type: 'event',
            name: 'showModal',
            params: ['userModal', { title: '用户信息' }]
        }
    }
}
```

## 高级功能

### 1. 插件系统
```typescript
interface ICorePlugin {
    name: string;
    version: string;
    install(app: App): void;
    uninstall?(app: App): void;
}

// 示例插件
class ValidationPlugin implements ICorePlugin {
    name = 'ValidationPlugin';
    version = '1.0.0';
    
    install(app: App) {
        // 扩展验证功能
        app.addValidator = (name, validator) => {
            this.validators[name] = validator;
        };
        
        // 验证组件属性
        app.on('component:validate', (component) => {
            this.validateComponent(component);
        });
    }
    
    private validateComponent(component: ISchemasNode) {
        // 验证逻辑
    }
}

// 使用插件
app.use(ValidationPlugin);
```

### 2. 性能优化

#### 虚拟化支持
```typescript
// 大列表虚拟化
{
    component: 'VirtualList',
    componentProps: {
        dataSource: '${dataSource.largeList}',
        itemHeight: 50,
        renderItem: {
            component: 'ListItem',
            componentProps: {
                title: '${item.title}',
                description: '${item.description}'
            }
        }
    }
}
```

#### 懒加载机制
```typescript
// 组件懒加载
app.registerComponent('LazyChart', {
    component: () => import('./components/Chart.vue'),
    loading: LoadingComponent,
    error: ErrorComponent,
    delay: 200,
    timeout: 3000
});
```

### 3. 错误处理

#### 全局错误捕获
```typescript
app.on('error', (error, errorInfo) => {
    console.error('应用错误:', error);
    
    // 错误上报
    reportError(error, errorInfo);
    
    // 显示错误边界
    showErrorBoundary(error.message);
});

// 组件错误边界
{
    component: 'ErrorBoundary',
    componentProps: {
        fallback: {
            component: 'ErrorMessage',
            componentProps: {
                message: '组件加载失败'
            }
        }
    },
    children: [
        // 可能出错的组件
    ]
}
```

## 最佳实践

### 1. 数据流设计
- 单向数据流原则
- 避免循环依赖
- 合理使用计算属性

### 2. 性能优化
- 组件懒加载
- 数据虚拟化
- 事件防抖处理

### 3. 错误处理
- 全局错误捕获
- 组件错误边界
- 优雅降级策略

### 4. 内存管理
```typescript
// 组件销毁时清理资源
onUnmounted(() => {
    app.cleanup();
});

// 手动清理
app.cleanup = () => {
    // 清理事件监听器
    app.off();
    
    // 清理数据源
    app.dataSourceManager.destroy();
    
    // 清理其他资源
    clearInterval(timers);
};
```
