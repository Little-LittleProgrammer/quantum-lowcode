// 基于iframe加载传入进来的RuntimeUrl，并支持增删改查组件

import { Subscribe, createElement, getHost, injectStyle, isSameDomain } from '@quantum-lowcode/utils';
import type { IBoxCoreConfig, IDeleteData, IPoint, IRuntime, IRuntimeWindow, IUpdateData } from './types';
import type { Id } from '@quantum-lowcode/schemas';
import { DEFAULT_ZOOM } from './const';
import { addSelectedClassName, removeSelectedClassName } from './utils';

/**
 * 画布渲染器
 * 基于iframe创建隔离的运行环境，负责组件的渲染和管理
 *
 * 主要职责：
 * 1. 创建和管理iframe运行环境
 * 2. 处理同域和跨域的页面加载
 * 3. 提供组件的增删改查接口
 * 4. 管理运行时实例的生命周期
 * 5. 处理元素选中状态和视觉反馈
 * 6. 提供坐标到元素的查找功能
 * 7. 支持缩放功能
 */
export class BoxRender extends Subscribe {
    /**
     * 组件的js、css执行的环境
     * 直接渲染为当前window，iframe渲染则为iframe.contentWindow
     */
    public contentWindow: IRuntimeWindow | null = null;
    /** 运行时实例，提供组件操作的核心API */
    public runtime: IRuntime | null = null;
    /** iframe DOM元素，作为组件渲染的容器 */
    public iframe?: HTMLIFrameElement;

    /** iframe 的 src 地址 */
    private runtimeUrl?: string;
    /** 当前缩放比例 */
    private zoom = DEFAULT_ZOOM;

    constructor({runtimeUrl, zoom}:IBoxCoreConfig) {
        super();
        this.runtimeUrl = runtimeUrl!;

        this.setZoom(zoom);

        // 创建iframe元素
        this.iframe = createElement({
            tag: 'iframe',
            cssText: `
                border: 0;
                width: 100%;
                height: 100%;
            `
        }) as HTMLIFrameElement;
        // 同源情况下直接设置src，非同源则在mount时通过srcdoc加载
        this.iframe.src = isSameDomain(this.runtimeUrl) ? runtimeUrl! : '';
        // 设置iframe样式，使其充满容器
        // 监听iframe加载完成事件
        this.iframe.addEventListener('load', this.loadHandler);
    }

    /**
     * 向画布添加组件
     * @param data 组件数据，包含组件配置信息
     */
    public async add(data: IUpdateData): Promise<void> {
        const runtime = await this.getRuntime();
        return runtime?.add?.(data);
    }

    /**
     * 从画布删除组件
     * @param data 删除数据，包含要删除的组件信息
     */
    public async delete(data: IDeleteData): Promise<void> {
        const runtime = await this.getRuntime();
        return runtime?.delete?.(data);
    }

    /**
     * 更新画布中的组件
     * @param data 更新数据，包含组件的新配置
     */
    public async update(data: IUpdateData): Promise<void> {
        const runtime = await this.getRuntime();
        // 更新画布中的组件
        runtime?.update?.(data);
    }

    /**
     * 获取运行时实例
     * 如果运行时还未就绪，会等待runtime-ready事件
     * @returns Promise<IRuntime> 运行时实例
     */
    public getRuntime(): Promise<IRuntime> {
        if (this.runtime) return Promise.resolve(this.runtime);
        return new Promise((resolve) => {
            const listener = (runtime: IRuntime) => {
                this.remove('runtime-ready');
                resolve(runtime);
            };
            this.on('runtime-ready', listener);
        });
    }

    /**
     * 获取iframe内的document对象
     * @returns Document | undefined iframe内的文档对象
     */
    public getDocument(): Document | undefined {
        return this.contentWindow?.document;
    }

    /**
     * 根据ID或元素获取目标HTML元素
     * @param idOrEl 元素ID字符串或HTML元素对象
     * @returns HTMLElement 目标元素
     * @throws Error 当指定ID的元素不存在时抛出错误
     */
    public getTargetElement(idOrEl: Id | HTMLElement): HTMLElement {
        if (typeof idOrEl === 'string') {
            const el = this.getDocument()?.getElementById(`${idOrEl}`);
            if (!el) throw new Error(`不存在ID为${idOrEl}的元素`);
            return el;
        }
        return idOrEl;
    }

    /**
     * 选中指定的元素列表
     * 会调用运行时的select方法，并为元素添加选中状态的样式
     * @param els 要选中的元素列表
     */
    public async select(els: HTMLElement[]) {
        const runtime = await this.getRuntime();
        for (const el of els) {
            // 调用运行时的选中方法
            await runtime?.select?.(el.id);
            // 如果运行时提供了beforeSelect钩子，先执行
            if (runtime?.beforeSelect) {
                await runtime.beforeSelect(el);
            }
            // 为元素添加选中状态的视觉标记
            this.flagSelectedEl(el);
        }
    }

    /**
     * 设置画布缩放比例
     * @param zoom 缩放比例，默认为DEFAULT_ZOOM
     */
    public setZoom(zoom: number = DEFAULT_ZOOM): void {
        this.zoom = zoom;
    }

    /**
     * 将iframe挂载到指定的DOM容器中
     * 处理同域和跨域两种情况的加载方式
     * @param el 要挂载到的容器元素
     */
    public async mount(el: HTMLDivElement) {
        if (!this.iframe) {
            throw Error('mount 失败');
        }

        // 处理跨域情况
        if (this.runtimeUrl && !isSameDomain(this.runtimeUrl)) {
            // 不同域，使用srcdoc发起异步请求，需要目标地址支持跨域
            let html = await fetch(this.runtimeUrl).then((res) => res.text());
            // 使用base标签解决相对路径或绝对路径的问题
            const base = `${location.protocol}//${getHost(this.runtimeUrl)}`;
            html = html.replace('<head>', `<head>\n<base href="${base}">`);
            this.iframe.srcdoc = html;
        }

        // 挂载iframe到容器
        el.appendChild<HTMLIFrameElement>(this.iframe);
        // 通知iframe内的运行时环境准备就绪
        this.postQuantumRuntimeReady();
    }

    /**
     * 获取与iframe通信的API对象
     * 提供给iframe内部调用的接口
     * @returns 通信API对象
     */
    public getQuantumApi = () => ({
        /**
         * 页面元素更新回调
         * @param el 更新的页面元素
         */
        onPageElUpdate: (el: HTMLElement) => { this.emit('page-el-update', el); },
        /**
         * 运行时就绪回调
         * @param runtime 运行时实例
         */
        onRuntimeReady: (runtime: IRuntime) => {
            this.runtime = runtime;
            // 赋值到全局，方便调试
            (globalThis as any).runtime = runtime;
            // 触发运行时ready事件
            this.emit('runtime-ready', runtime);
        }
    });

    /**
     * 销毁渲染器实例，清理所有资源
     */
    public destory() {
        // 移除事件监听器
        this.iframe?.removeEventListener('load', this.loadHandler);
        // 清空引用
        this.contentWindow = null;
        // 从DOM中移除iframe
        this.iframe?.remove();
        this.iframe = undefined;
        // 清理事件订阅
        this.clear();
    }

    /**
     * 通过坐标获得坐标下所有HTML元素数组
     * 支持缩放情况下的坐标转换
     * @param point 屏幕坐标点
     * @returns 坐标下方所有HTML元素数组，会包含父元素直至html，元素层叠时返回顺序是从上到下
     */
    public getElementsFromPoint(point: IPoint): HTMLElement[] {
        let x = point.clientX;
        let y = point.clientY;

        // 如果是iframe渲染，需要转换坐标系
        if (this.iframe) {
            const rect = this.iframe.getClientRects()[0];
            if (rect) {
                x = x - rect.left;
                y = y - rect.top;
            }
        }

        // 根据缩放比例调整坐标，然后获取元素
        return this.getDocument()?.elementsFromPoint(x / this.zoom, y / this.zoom) as HTMLElement[];
    }

    /**
     * 在runtime中对被选中的元素进行标记
     * 部分组件有对选中态进行特殊显示的需求
     * @param el 被选中的元素
     */
    private flagSelectedEl(el: HTMLElement): void {
        const doc = this.getDocument();
        if (doc) {
            // 先清除所有选中状态
            removeSelectedClassName(doc);
            // 为当前元素添加选中状态
            addSelectedClassName(el, doc);
        }
    }

    /**
     * iframe加载完成的处理函数
     */
    private loadHandler = async() => {
        // 如果 contentWindow 未初始化, 返回
        if (!this.contentWindow) return;

        // 如果 quantum API 未初始化, 进行初始化
        if (!this.contentWindow?.quantum) {
            this.postQuantumRuntimeReady();
        }

        // 触发加载完成事件
        this.emit('onload');

        // 注入必要的样式到iframe中
        // 包括容器高亮效果和最小高度设置
        injectStyle(this.contentWindow.document, `
        .quantum-sandbox-container-highlight::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background-color: #000;
            opacity: .1;
            pointer-events: none;
          }
          
          .quantum-ui-container.quantum-layout-relative {
            min-height: 50px;
          }
        `);
    };

    /**
     * 向iframe发送quantum运行时就绪消息
     * 建立与iframe内部的通信桥梁
     */
    private postQuantumRuntimeReady() {
        // 获取iframe的window对象
        this.contentWindow = this.iframe?.contentWindow as IRuntimeWindow;

        if (this.contentWindow) {
            // 注入通信API到iframe的window对象
            this.contentWindow.quantum = this.getQuantumApi();
            // 发送消息通知iframe内部quantum已就绪
            this.contentWindow.postMessage(
                {
                    quantumRuntimeReady: true
                },
                '*'
            );
        }
    }
}
