// 核心实例对象, 接收配置, 文件以及node信息\
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

interface IAppOptionsConfig {
    config?: ISchemasRoot;
    designWidth?: number;
    ua?: string;
    curPage?: Id;
    platform?: 'mobile' | 'pc';
    disabledFlexible?: boolean;
    transformStyle?: (style: Record<string, any>) => Record<string, any>;
    request?: IRequestFunction;
    useMock?: boolean;
}

export class LowCodeRoot extends Subscribe implements ILowCodeRoot {
    public env: Env = new Env();
    public schemasRoot?: ISchemasRoot; // dsl
    public page?: LowCodePage;
    public platform = 'mobile';
    public components = new Map();
    public request?: IRequestFunction;
    public dataSourceManager?: DataSourceManager;
    public useMock = false;
    private flexible?: Flexible;
    public transformStyle: (style: Record<string, any>) => Record<string, any>;

    private eventMap = new Map();

    constructor(options: IAppOptionsConfig) {
        super();

        this.setEnv(options.ua);
        options.platform && (this.platform = options.platform);
        this.flexible = new Flexible({ designWidth: options.designWidth, });
        if (options.config) {
            this.setConfig(options.config, options.curPage);
        }
        if (options.request) {
            this.request = options.request;
        } else if (typeof globalThis.fetch === 'function') {
            this.request = webRequest;
        }
        this.transformStyle = options.transformStyle || ((style: Record<string, any>) => defaultTransformStyle(style, this.flexible?.designWidth));
    }

    public setEnv(ua?: string) {
        this.env = new Env(ua);
    }

    /**
	 * 设置schemas
	 * @param config ISchemasRoot
	 * @param curPage 当前页面id
	 */
    public setConfig(config: ISchemasRoot, curPage?: Id) {
        this.schemasRoot = config;

        if (!curPage && config.children.length) {
            curPage = config.children[0].field;
        }

        if (this.dataSourceManager) {
            this.dataSourceManager.destroy();
        }

        this.removeEvents();

        this.dataSourceManager = createDataSourceManager(this, this.useMock);

        this.setPage(curPage || this.page?.data?.field);

        this.dealDescribe(config);
    }

    private dealDescribe(config: ISchemasRoot) {
        if (globalThis && globalThis.document) {
            globalThis.document.title = config.name;
            const metaTags = globalThis.document.getElementsByTagName('meta');
            while (metaTags.length > 0) {
                metaTags[0].parentNode!.removeChild(metaTags[0]);
            }
            if (config.description) {
                config.description.keywords &&
					this.setDescribe(config.description, 'keywords');
                config.description.description &&
					this.setDescribe(config.description, 'description');
            }
        }
    }

    private setDescribe(describe: IMetaDes, key: 'keywords' | 'description') {
        const header = globalThis.document.getElementsByTagName('head')[0];
        if (describe && describe[key].length > 0) {
            for (const str of describe[key]) {
                const metaTags = globalThis.document.createElement('meta');
                metaTags.name = key;
                metaTags.content = str;
                header.insertBefore(metaTags, header.firstChild);
            }
        }
    }

    /**
	 * 设置当前展示页
	 */
    public setPage(field?: Id) {
        const pageConfig = this.schemasRoot?.children.find(
            (page) => page.field === field
        );
        if (!pageConfig) {
            if (this.page) {
                this.page.destroy();
                this.page = undefined;
            }
            super.emit('page-change', field);
            return;
        }

        if (pageConfig === this.page?.data) return;

        if (this.page) {
            this.page.destroy();
        }

        this.page = new LowCodePage({ config: pageConfig, root: this, });
        super.emit('page-change', this.page);
        // this.bindEvents();
    }

    /**
	 * 查询页面
	 * @param id 节点id
	 * @returns Page | void
	 */
    public getPage(field?: Id) {
        if (!field) return this.page;
        if (this.page?.data?.field === field) {
            return this.page;
        }
    }

    public deletePage() {
        this.page = undefined;
    }

    public setDesignWidth(width: number) {
        this.flexible?.setDesignWidth(width);
    }

    // TODO 增加设备判断
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

    // 设置body字体大小

    public override emit(name: string, ...args: any[]) {
        const [node, ...otherArgs] = args;
        // 由于组件可能有很多个, 所以组件事件需要加入id来区分
        if (node && node instanceof LowCodeNode && node?.data?.field) {
            super.emit(`${node.data.field}:${name}`, node, ...otherArgs);
        }
        super.emit(name, ...args);
    }

    // 将事件注册为全局事件
    // TODO: 目前是将所有的事件(未使用, 已使用)全部注册, 后续会优化此部分逻辑, 只注册已使用到的, 优化性能
    public registerEvent(
        key: string,
        fn: Fn,
        ds?: DataSource,
        node?: LowCodeNode
    ) {
        const eventHanlder = (...args: any[]) => {
            fn({ app: this, dataSource: ds || {}, }, ...args);
        };
        // 先清空
        if (this.cache.has(key)) {
            this.remove(key);
        }
        if (node) {
            // 组件事件
            key = `${node.data.field}:${key}`;
        }
        this.eventMap.set(key, eventHanlder);
        this.on(key, eventHanlder);
    }

    // public async dataSourceActionHandler() {
    // }

    /**
	 * 移除所有事件
	 */
    public removeEvents() {
        // 先移除所有事件
        Array.from(this.eventMap.keys()).forEach((key) => {
            const events = this.eventMap.get(key);
            events && this.remove(key);
        });
        this.eventMap.clear();

        if (!this.page) return;
    }
    /**
	 * 事件联动处理函数
	 */
    // private async eventHandler() {

    // }

    /**
	 * 注册组件
	 */
    public registerComponent(type: string, comp: any) {
        this.components.set(type, comp);
    }

    /**
	 * 删除组件
	 */
    public unregisterComponent(type: string) {
        this.components.delete(type);
    }

    public resolveComponent(type: string) {
        return this.components.get(type);
    }

    public destroy() {
        this.clear();
        this.page = undefined;
        this.flexible?.destroy();
        this.flexible = undefined;
        // if (this.isH5()) {
        // }
    }
}
