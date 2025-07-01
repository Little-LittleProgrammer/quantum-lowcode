// 核心实例对象, 接收配置, 文件以及node信息
import {
    Subscribe,
    webRequest
} from '@quantum-lowcode/utils';
import type {
    Fn,
    IRequestFunction,
    ISchemasRoot,
    Id,
    IMetaDes,
    ILowCodeRoot
} from '@quantum-lowcode/schemas';
import { LowCodePage } from './page';
import { Env } from './env';
import {
    DataSource,
    DataSourceManager,
    createDataSourceManager
} from '@quantum-lowcode/data';
import { LowCodeNode } from './node';
import Flexible from './flexible';
import { defaultTransformStyle } from './utils';

/**
 * 应用配置选项接口
 */
interface IAppOptionsConfig {
    config?: ISchemasRoot; // DSL配置数据
    designWidth?: number; // 设计稿宽度
    ua?: string; // 用户代理字符串
    curPage?: Id; // 当前页面ID
    platform?: 'mobile' | 'pc'; // 平台类型
    disabledFlexible?: boolean; // 是否禁用移动端适配
    transformStyle?: (style: Record<string, any>) => Record<string, any>; // 样式转换函数
    request?: IRequestFunction; // 自定义请求函数
    useMock?: boolean; // 是否使用Mock数据
}

/**
 * 低代码应用核心类
 * 负责管理整个低代码应用的生命周期、页面切换、组件注册、事件处理等核心功能
 */
export class LowCodeRoot extends Subscribe implements ILowCodeRoot {
    /** 环境信息对象，包含设备、浏览器等信息 */
    public env: Env = new Env();

    /** DSL配置根对象 */
    public schemasRoot?: ISchemasRoot;

    /** 当前页面实例 */
    public page?: LowCodePage;

    /** 平台类型，默认为移动端 */
    public platform = 'mobile';

    /** 组件注册表，存储所有注册的组件 */
    public components = new Map();

    /** 网络请求函数 */
    public request?: IRequestFunction;

    /** 数据源管理器 */
    public dataSourceManager?: DataSourceManager;

    /** 是否使用Mock数据 */
    public useMock = false;

    /** 移动端适配实例 */
    private flexible?: Flexible;

    /** 样式转换函数 */
    public transformStyle: (style: Record<string, any>) => Record<string, any>;

    /** 事件映射表，存储所有注册的事件处理函数 */
    private eventMap = new Map();

    /**
     * 构造函数
     * @param options 应用配置选项
     */
    constructor(options: IAppOptionsConfig) {
        super();

        // 设置环境信息
        this.setEnv(options.ua);

        // 设置平台类型
        options.platform && (this.platform = options.platform);

        // 初始化移动端适配
        this.flexible = new Flexible({ designWidth: options.designWidth });

        // 设置DSL配置
        if (options.config) {
            this.setConfig(options.config, options.curPage);
        }

        // 设置网络请求函数
        if (options.request) {
            this.request = options.request;
        } else if (typeof globalThis.fetch === 'function') {
            // 如果浏览器支持fetch，使用默认的webRequest
            this.request = webRequest;
        }

        // 设置样式转换函数
        this.transformStyle = options.transformStyle || ((style: Record<string, any>) => defaultTransformStyle(style, this.flexible?.designWidth));
    }

    /**
     * 设置环境信息
     * @param ua 用户代理字符串
     */
    public setEnv(ua?: string) {
        this.env = new Env(ua);
    }

    /**
	 * 设置DSL配置
	 * @param config ISchemasRoot DSL根配置对象
	 * @param curPage 当前页面id
	 */
    public setConfig(config: ISchemasRoot, curPage?: Id) {
        this.schemasRoot = config;

        // 如果没有指定当前页面，默认使用第一个页面
        if (!curPage && config.children.length) {
            curPage = config.children[0]!.field;
        }

        // 销毁之前的数据源管理器
        if (this.dataSourceManager) {
            this.dataSourceManager.destroy();
        }

        // 清除之前注册的事件
        this.removeEvents();

        // 创建新的数据源管理器
        this.dataSourceManager = createDataSourceManager(this, this.useMock);

        // 设置当前页面
        this.setPage(curPage || this.page?.data?.field);

        // 处理页面描述信息（标题、关键词、描述等）
        this.dealDescribe(config);
    }

    /**
     * 处理页面描述信息，设置页面标题和meta标签
     * @param config DSL根配置对象
     */
    private dealDescribe(config: ISchemasRoot) {
        // 确保在浏览器环境中才执行DOM操作
        if (globalThis && globalThis.document) {
            // 设置页面标题
            globalThis.document.title = config.name;

            // 清除现有的meta标签
            const metaTags = globalThis.document.getElementsByTagName('meta');
            while (metaTags.length > 0) {
                metaTags[0]?.parentNode?.removeChild(metaTags[0]);
            }

            // 设置新的meta标签
            if (config.description) {
                config.description.keywords &&
					this.setDescribe(config.description, 'keywords');
                config.description.description &&
					this.setDescribe(config.description, 'description');
            }
        }
    }

    /**
     * 设置页面meta描述信息
     * @param describe 描述对象
     * @param key 描述类型（keywords 或 description）
     */
    private setDescribe(describe: IMetaDes, key: 'keywords' | 'description') {
        const header = globalThis.document.getElementsByTagName('head')[0];
        if (describe && describe[key].length > 0) {
            // 为每个描述项创建meta标签
            for (const str of describe[key]) {
                const metaTags = globalThis.document.createElement('meta');
                metaTags.name = key;
                metaTags.content = str;
                header?.insertBefore(metaTags, header.firstChild);
            }
        }
    }

    /**
	 * 设置当前展示页面
	 * @param field 页面标识符
	 */
    public setPage(field?: Id) {
        // 查找指定的页面配置
        const pageConfig = this.schemasRoot?.children.find(
            (page) => page.field === field
        );

        // 如果找不到页面配置，清空当前页面
        if (!pageConfig) {
            if (this.page) {
                this.page.destroy();
                this.page = undefined;
            }
            super.emit('page-change', field);
            return;
        }

        // 如果是同一个页面，不需要重新创建
        if (pageConfig === this.page?.data) return;

        // 销毁旧页面
        if (this.page) {
            this.page.destroy();
        }

        // 创建新页面实例
        this.page = new LowCodePage({ config: pageConfig, root: this });

        // 触发页面切换事件
        super.emit('page-change', this.page);
    }

    /**
	 * 查询页面实例
	 * @param field 页面标识符，不传则返回当前页面
	 * @returns Page实例或undefined
	 */
    public getPage(field?: Id) {
        if (!field) return this.page;
        if (this.page?.data?.field === field) {
            return this.page;
        }
    }

    /**
     * 删除当前页面
     */
    public deletePage() {
        this.page = undefined;
    }

    /**
     * 设置设计稿宽度
     * @param width 设计稿宽度
     */
    public setDesignWidth(width: number) {
        this.flexible?.setDesignWidth(width);
    }

    /**
     * 判断是否为移动端设备
     * @returns boolean
     */
    public isH5() {
        return (
            this.env.isAndroid ||
			this.env.isAndroidPad ||
			this.env.isIos ||
			this.env.isIpad ||
			this.env.isIphone ||
			this.env.isWechat
        );
    }

    /**
     * 发送事件
     * 重写父类的emit方法，支持组件级别的事件命名空间
     * @param name 事件名称
     * @param args 事件参数
     */
    public override emit(name: string, ...args: any[]) {
        const [node, ...otherArgs] = args;
        // 如果第一个参数是节点实例，为事件名添加节点ID前缀以区分不同组件的同名事件
        if (node && node instanceof LowCodeNode && node?.data?.field) {
            super.emit(`${node.data.field}:${name}`, node, ...otherArgs);
        }
        super.emit(name, ...args);
    }

    /**
     * 注册全局事件
     * 将事件函数包装后注册到事件系统中
     * @param key 事件键名
     * @param fn 事件处理函数
     * @param ds 数据源实例
     * @param node 节点实例（可选，用于组件事件）
     */
    public registerEvent(
        key: string,
        fn: Fn,
        ds?: DataSource,
        node?: LowCodeNode
    ) {
        // 包装事件处理函数，注入app和dataSource参数
        const eventHanlder = (...args: any[]) => {
            fn({ app: this, dataSource: ds || {} }, ...args);
        };

        // 如果事件已存在，先移除旧的
        if (this.cache.has(key)) {
            this.remove(key);
        }

        // 如果是组件事件，添加组件ID前缀
        if (node) {
            key = `${node.data.field}:${key}`;
        }

        // 存储事件处理函数并注册
        this.eventMap.set(key, eventHanlder);
        this.on(key, eventHanlder);
    }

    /**
	 * 移除所有注册的事件
	 */
    public removeEvents() {
        // 遍历所有注册的事件并移除
        Array.from(this.eventMap.keys()).forEach((key) => {
            const events = this.eventMap.get(key);
            events && this.remove(key);
        });

        // 清空事件映射表
        this.eventMap.clear();

        if (!this.page) return;
    }

    /**
	 * 注册组件
	 * @param type 组件类型名称
	 * @param comp 组件实例或组件类
	 */
    public registerComponent(type: string, comp: any) {
        this.components.set(type, comp);
    }

    /**
	 * 注销组件
	 * @param type 组件类型名称
	 */
    public unregisterComponent(type: string) {
        this.components.delete(type);
    }

    /**
     * 解析获取组件
     * @param type 组件类型名称
     * @returns 组件实例或组件类
     */
    public resolveComponent(type: string) {
        return this.components.get(type);
    }

    /**
     * 销毁应用实例
     * 清理所有资源，包括事件、页面、适配器等
     */
    public destroy() {
        // 清理事件订阅
        this.clear();

        // 清理页面实例
        this.page = undefined;

        // 销毁移动端适配器
        this.flexible?.destroy();
        this.flexible = undefined;
    }
}
