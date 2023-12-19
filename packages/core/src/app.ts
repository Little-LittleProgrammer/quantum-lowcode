// 核心实例对象, 接收配置, 文件以及node信息\
import { Subscribe, fillBackgroundImage, js_is_array, js_is_function, js_is_number, js_is_string, style2Obj } from '@qimao/quantum-utils';
import { Fn, IRequestFunction, ISchemasRoot, Id, IMetaDes, ILowCodeRoot } from '@qimao/quantum-schemas';
import {LowCodePage} from './page';
import {Env} from './env';
import { DataSource, DataSourceManager, createDataSourceManager } from '@qimao/quantum-data';

interface IAppOptionsConfig {
    config?: ISchemasRoot;
    designWidth?: number;
    ua?: string;
    curPage?: Id;
    platform?: 'mobile' | 'pc';
    transformStyle?: (style: Record<string, any>) => Record<string, any>;
    request?: IRequestFunction;
    useMock?: boolean
}

export class LowCodeRoot extends Subscribe implements ILowCodeRoot {
    public env: Env = new Env();;
    public schemasRoot?: ISchemasRoot;
    public page?: LowCodePage;
    public designWidth = 750;
    public platform = 'mobile';
    public components = new Map();
    public request?: IRequestFunction;
    public dataSourceManager?: DataSourceManager
    public useMock = false

    private eventMap = new Map();

    constructor(options: IAppOptionsConfig) {
        super();

        this.setEnv(options.ua);
        options.platform && (this.platform = options.platform);
        if (typeof options.designWidth !== 'undefined') {
            this.setDesignWidth(options.designWidth);
        }
        if (options.config) {
            this.setConfig(options.config, options.curPage);
        }
        if (options.request) {
            this.request = options.request;
        }
        if (options.transformStyle) {
            this.transformStyle = options.transformStyle;
        }
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
                config.description.keywords && this.setDescribe(config.description, 'keywords');
                config.description.description && this.setDescribe(config.description, 'description');
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
        const pageConfig = this.schemasRoot?.children.find((page) => page.field === field);
        if (!pageConfig) {
            if (this.page) {
                this.page.destroy();
                this.page = undefined;
            }
            this.emit('page-change');
            return;
        }

        if (pageConfig === this.page?.data) return;

        if (this.page) {
            this.page.destroy();
        }

        this.page = new LowCodePage({config: pageConfig, root: this, });
        this.emit('page-change', this.page);
        // this.bindEvents();
    }

    /**
     * 查询页面
     * @param id 节点id
     * @returns Page | void
     */
    public getPage(field?: Id) {
        if (!field) return this.page;
        if (this.page?.data.field === field) {
            return this.page;
        }
    }

    public deletePage() {
        this.page = undefined;
    }

    public setDesignWidth(width: number) {
        this.designWidth = width;
        // 根据屏幕大小计算出跟节点的font-size，用于rem样式的适配
        if (this.isH5()) {
            this.calcFontsize();
            globalThis.removeEventListener('resize', this.calcFontsize.bind(this));
            globalThis.addEventListener('resize', this.calcFontsize.bind(this));
        }
    }

    /**
     * 将schemas中的style配置转换成css，主要是将数值转成rem为单位的样式值，例如100将被转换成1rem
     * @param style Object
     * @returns Object
     */
    public transformStyle(style: Record<string, any> | string | Fn) {
        if (!style) return {};

        let styleObj: Record<string, any> = {};
        const results: Record<string, any> = {};

        if (js_is_string(style)) {
            styleObj = style2Obj(style);
        } else {
            styleObj = {...style, };
        }

        const isHippy = this.isH5();
        console.log('style', isHippy);
        const whiteList = ['zIndex', 'opacity', 'fontWeight'];
        Object.entries(styleObj).forEach(([key, value]) => {
            if (key === 'scale' && !results.transform && isHippy) {
                results.transform = [{ scale: value, }];
            } else if (key === 'backgroundImage' && !isHippy) {
                value && (results[key] = fillBackgroundImage(value));
            } else if (key === 'transform' && typeof value !== 'string') {
                results[key] = this.getTransform(value);
            } else if (!whiteList.includes(key) && value && /^[-]?[0-9]*[.]?[0-9]*$/.test(value)) {
                results[key] = !isHippy ? value : `${parseInt(value) / this.designWidth * 10}rem`;
            } else {
                results[key] = value;
            }
        });

        return results;
    }

    public isH5() {
        return this.env.isAndroid || this.env.isAndroidPad || this.env.isIos || this.env.isIpad || this.env.isIphone || this.env.isWechat;
    }

    private getTransform(value: Record<string, string>) {
        if (!value) return [];

        const isH5 = this.isH5();

        const transform = Object.entries(value).map(([transformKey, transformValue]) => {
            if (!transformValue.trim()) return '';
            if (transformKey === 'rotate' && js_is_number(transformValue)) {
                transformValue = `${transformValue}deg`;
            }

            return !isH5 ? `${transformKey}(${transformValue})` : { [transformKey]: transformValue, };
        });

        if (isH5) {
            return transform;
        }
        const values = transform.join(' ');
        return !values.trim() ? 'none' : values;
    }

    private calcFontsize() {
        console.log('resize');
        const { width, } = document.documentElement.getBoundingClientRect();
        const dpr = globalThis?.devicePixelRatio || 1;
        this.setBodyFontSize(dpr);
        const fontSize = width / 10;
        document.documentElement.style.fontSize = `${fontSize}px`;
    }

    // 设置body字体大小
    private setBodyFontSize(dpr = 1) {
        if (document.body) {
            document.body.style.fontSize = (12 * dpr) + 'px';
        } else {
            document.addEventListener('DOMContentLoaded', () => this.setBodyFontSize(dpr));
        }
    }



    // 将事件注册为全局事件
    public registerMethods(key: string, fn: Fn, ds: DataSource) {
        const eventHanlder = (...args: any[]) => {
            fn({ app: this, dataSource:ds }, ...args)
        }
        // 先清空
        if(this.cache.has(key)) {
            this.remove(key)
        }
        this.on(key, eventHanlder )
    }

    // public async dataSourceActionHandler() {
    // }

    /**
     * 事件绑定
     */
    public bindEvents() {
        // 先移除所有事件
        Array.from(this.eventMap.keys()).forEach((key) => {
            const events = this.eventMap.get(key);
            events && this.remove(key)
        });
        this.eventMap.clear();

        if (!this.page) return

        // 再绑定事件

    }
    /**
     * 事件联动处理函数
     */
    private async eventHandler() {
        
    }

    /**
     * 注册组件
     */
    public registerComponent(type: string, Component: any) {
        this.components.set(type, Component);
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
        if (this.isH5()) {
            globalThis.removeEventListener('resize', this.calcFontsize.bind(this));
        }
    }
}
