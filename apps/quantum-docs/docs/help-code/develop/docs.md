# 开发文档

## 项目结构说明

Quantum低代码平台采用Monorepo架构，使用pnpm workspace管理多个子包。

### 目录说明

```
quantum-lowcode/
├── apps/                           # 应用目录
│   ├── playground/                 # 演示和测试应用
│   └── quantum-docs/              # 文档站点
├── packages/                      # 核心包目录
│   ├── cli/                       # 命令行工具
│   ├── core/                      # 核心库
│   ├── data-source/               # 数据源管理
│   ├── editor/                    # 可视化编辑器
│   ├── sandbox/                   # 沙箱画布
│   ├── schemas/                   # 协议定义
│   ├── ui/                        # Vue3组件库
│   ├── ui-vue2/                   # Vue2组件库
│   └── utils/                     # 工具函数
├── runtime/                       # 运行时目录
│   ├── vue2-active/               # Vue2运行时
│   └── vue3-active/               # Vue3运行时
├── pnpm-workspace.yaml           # pnpm工作空间配置
├── turbo.json                     # Turbo构建配置
└── package.json                   # 根包配置
```

## 开发环境搭建

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0
- Git >= 2.0.0

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/quantum-lowcode.git
cd quantum-lowcode

# 2. 安装依赖
pnpm install

# 3. 构建所有包
pnpm build

# 4. 启动开发服务器
pnpm dev
```

### 开发命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发模式
pnpm dev

# 启动特定应用
pnpm dev:playground    # 启动playground
pnpm dev:docs         # 启动文档站点

# 构建特定包
pnpm build:core       # 构建core包
pnpm build:editor     # 构建editor包

# 运行测试
pnpm test            # 运行所有测试
pnpm test:unit       # 运行单元测试
pnpm test:e2e        # 运行端到端测试

# 代码检查
pnpm lint            # 检查所有代码
pnpm lint:fix        # 自动修复代码问题

# 发布
pnpm changeset       # 创建变更集
pnpm release         # 发布新版本
```

## 开发规范

### 1. 代码规范

#### TypeScript规范
- 所有代码必须使用TypeScript编写
- 严格模式，不允许any类型
- 导出的公共API必须有完整的类型定义

```typescript
// 良好示例
interface IComponentConfig {
    name: string;
    label: string;
    component: any;
    props?: Record<string, any>;
    events?: Record<string, IEventConfig>;
}

export function registerComponent(config: IComponentConfig): void {
    // 实现
}

// 避免的写法
export function registerComponent(config: any): any {
    // 实现
}
```

#### 命名规范
- 文件名使用kebab-case: `component-service.ts`
- 类名使用PascalCase: `ComponentService`
- 变量和函数使用camelCase: `componentList`
- 常量使用UPPER_SNAKE_CASE: `DEFAULT_DESIGN_WIDTH`

#### 注释规范
```typescript
/**
 * 组件服务类
 * 负责管理组件的注册、卸载和解析
 */
export class ComponentService {
    /**
     * 注册组件
     * @param name 组件名称
     * @param config 组件配置
     * @returns 是否注册成功
     */
    public registerComponent(name: string, config: IComponentConfig): boolean {
        // 实现
        return true;
    }
}
```

### 2. Git规范

#### 分支策略
- `main`: 主分支，用于发布
- `develop`: 开发分支，功能集成
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支
- `hotfix/*`: 热修复分支

#### 提交信息规范
使用Conventional Commits规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

类型说明：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具相关

示例：
```
feat(editor): 添加拖拽排序功能

- 实现组件列表拖拽排序
- 添加拖拽视觉反馈
- 更新相关测试用例

Closes #123
```

### 3. 测试规范

#### 测试文件组织
```
src/
├── components/
│   ├── button/
│   │   ├── index.ts
│   │   ├── button.vue
│   │   └── __tests__/
│   │       ├── button.test.ts
│   │       └── button.spec.ts
```

#### 测试覆盖率要求
- 单元测试覆盖率 >= 80%
- 核心模块覆盖率 >= 90%
- 新增功能必须包含测试用例

#### 测试示例
```typescript
// button.test.ts
import { mount } from '@vue/test-utils';
import Button from '../button.vue';

describe('Button', () => {
    it('should render correctly', () => {
        const wrapper = mount(Button, {
            props: {
                text: 'Click me'
            }
        });
        
        expect(wrapper.text()).toBe('Click me');
        expect(wrapper.classes()).toContain('quantum-button');
    });
    
    it('should emit click event', async () => {
        const wrapper = mount(Button);
        
        await wrapper.trigger('click');
        
        expect(wrapper.emitted('click')).toBeTruthy();
        expect(wrapper.emitted('click')).toHaveLength(1);
    });
});
```

## 包管理

### 1. 新增包

```bash
# 创建新包目录
mkdir packages/new-package
cd packages/new-package

# 初始化package.json
pnpm init

# 添加到workspace
# 在根目录的pnpm-workspace.yaml中确保包含packages/*
```

### 2. 包依赖管理

```bash
# 为特定包添加依赖
pnpm add lodash --filter @quantum-lowcode/core

# 添加开发依赖
pnpm add -D typescript --filter @quantum-lowcode/core

# 添加workspace内部依赖
pnpm add @quantum-lowcode/utils --filter @quantum-lowcode/core
```

### 3. 包发布

```bash
# 1. 创建变更集
pnpm changeset

# 2. 确认变更
pnpm changeset status

# 3. 生成版本和更新日志
pnpm changeset version

# 4. 发布到npm
pnpm changeset publish
```

## 调试指南

### 1. 编辑器调试

#### 启动调试模式
```bash
# 启动playground并开启调试
pnpm dev:playground --debug
```

#### 调试配置
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Playground",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/apps/playground/main.ts",
            "console": "integratedTerminal",
            "env": {
                "NODE_ENV": "development",
                "DEBUG": "quantum:*"
            }
        }
    ]
}
```

### 2. 运行时调试

#### iframe通信调试
```typescript
// 在编辑器中开启调试
const editor = new QuantumEditor({
    debug: true,
    onMessage: (message) => {
        console.log('Runtime message:', message);
    }
});

// 在运行时中开启调试
window.quantum = {
    debug: true,
    onMessage: (message) => {
        console.log('Editor message:', message);
    }
};
```

### 3. 常见问题调试

#### 组件未渲染
1. 检查组件是否正确注册
2. 检查schema格式是否正确
3. 检查控制台错误信息

#### 数据绑定失效
1. 检查数据源配置
2. 检查绑定语法是否正确
3. 检查数据源是否已初始化

#### 拖拽功能异常
1. 检查Moveable配置
2. 检查蒙层是否正确设置
3. 检查事件监听是否正常

## 性能优化

### 1. 构建优化

#### Webpack优化配置
```javascript
// webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    }
};
```

#### 代码分割
```typescript
// 组件懒加载
const LazyComponent = defineAsyncComponent({
    loader: () => import('./LazyComponent.vue'),
    loading: LoadingComponent,
    error: ErrorComponent,
    delay: 200,
    timeout: 3000
});
```

### 2. 运行时优化

#### 虚拟滚动
```vue
<template>
    <VirtualList
        :items="largeList"
        :item-height="50"
        :visible-count="10"
    >
        <template #item="{ item }">
            <ListItem :data="item" />
        </template>
    </VirtualList>
</template>
```

#### 防抖处理
```typescript
import { debounce } from 'lodash-es';

const handleSearch = debounce((keyword: string) => {
    // 搜索逻辑
}, 300);
```

## 文档维护

### 1. API文档

使用TypeDoc生成API文档：

```bash
# 生成API文档
pnpm docs:api

# 启动文档服务器
pnpm docs:serve
```

### 2. 组件文档

组件文档使用VitePress编写：

```markdown
# Button组件

## 基本用法

\`\`\`vue
<template>
    <Button type="primary" @click="handleClick">
        点击我
    </Button>
</template>
\`\`\`

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | 'primary' \| 'default' \| 'danger' | 'default' |
| disabled | 是否禁用 | boolean | false |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | event: MouseEvent |
```

### 3. 更新日志

使用Changeset自动生成：

```bash
# 添加变更记录
pnpm changeset

# 生成CHANGELOG
pnpm changeset version
```

## 部署流程

### 1. CI/CD配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build packages
        run: pnpm build
```

### 2. 发布流程

1. 创建Pull Request
2. 代码审查
3. 合并到develop分支
4. 运行测试和构建
5. 合并到main分支
6. 自动发布新版本

### 3. 环境配置

```bash
# 开发环境
NODE_ENV=development
DEBUG=quantum:*

# 生产环境
NODE_ENV=production
PUBLIC_PATH=/quantum-lowcode/

# 测试环境
NODE_ENV=test
COVERAGE=true
``` 
