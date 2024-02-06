// 基于iframe加载传入进来的RuntimeUrl，并支持增删改查组件

import { Subscribe, getHost, isSameDomain } from '@qimao/quantum-utils';
import { IBoxCoreConfig, IDeleteData, IPoint, IRuntime, IRuntimeWindow, IUpdateData } from './types';
import { Id } from '@qimao/quantum-schemas';
import { DEFAULT_ZOOM } from './const';
import { addSelectedClassName, removeSelectedClassName } from './utils';

/**
 * 画布渲染器, 生成iframe, 并提供暴露出去的发布器(主要用于更新IRuntime schemas)供外部调用
 */
export class BoxRender extends Subscribe {
    /** 组件的js、css执行的环境，直接渲染为当前window，i
     * frame渲染则为iframe.contentWindow */
    public contentWindow: IRuntimeWindow | null = null;
    public runtime: IRuntime | null = null; // 运行时实例
    public iframe?: HTMLIFrameElement; // iframe

    private runtimeUrl?: string // iframe 的 src
    private zoom = DEFAULT_ZOOM;
    constructor({runtimeUrl, zoom, }:IBoxCoreConfig) {
        super();
        this.runtimeUrl = runtimeUrl!;

        this.setZoom(zoom);

        this.iframe = globalThis.document.createElement('iframe');
        // 同源, 直接加载
        this.iframe.src = isSameDomain(this.runtimeUrl) ? runtimeUrl! : '';
        this.iframe.style.cssText = `
            border: 0;
            width: 100%;
            height: 100%;
        `;
        this.iframe.addEventListener('load', this.loadHandler);
    }

    public async add(data: IUpdateData): Promise<void> {
        const runtime = await this.getRuntime();
        return runtime?.add?.(data);
    }
    public async delete(data: IDeleteData): Promise<void> {
        const runtime = await this.getRuntime();
        return runtime?.delete?.(data);
    }
    public async update(data: IUpdateData): Promise<void> {
        const runtime = await this.getRuntime();
        // 更新画布中的组件
        runtime?.update?.(data);
    }

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

    public getDocument(): Document | undefined {
        return this.contentWindow?.document;
    }

    public getTargetElement(idOrEl: Id | HTMLElement): HTMLElement {
        if (typeof idOrEl === 'string') {
            const el = this.getDocument()?.getElementById(`${idOrEl}`);
            if (!el) throw new Error(`不存在ID为${idOrEl}的元素`);
            return el;
        }
        return idOrEl;
    }

    /**
     * 获取选中的节点或页面
     */
    public async select(els: HTMLElement[]) {
        const runtime = await this.getRuntime();
        for (const el of els) {
            await runtime?.select?.(el.id);
            if (runtime?.beforeSelect) {
                await runtime.beforeSelect(el);
            }
            this.flagSelectedEl(el);
        }
    }

    public setZoom(zoom: number = DEFAULT_ZOOM): void {
        this.zoom = zoom;
    }

    /**
     * 将iframe挂载到dom上
     *
     */
    public async mount(el: HTMLDivElement) {
        if (!this.iframe) {
            throw Error('mount 失败');
        }

        if (this.runtimeUrl && !isSameDomain(this.runtimeUrl)) {
            // 不同域，使用srcdoc发起异步请求，需要目标地址支持跨域
            let html = await fetch(this.runtimeUrl).then((res) => res.text());
            // 使用base, 解决相对路径或绝对路径的问题
            const base = `${location.protocol}//${getHost(this.runtimeUrl)}`;
            html = html.replace('<head>', `<head>\n<base href="${base}">`);
            this.iframe.srcdoc = html;
        }
        // 挂载
        el.appendChild<HTMLIFrameElement>(this.iframe);
        // 报告挂载完成
        this.postQuantumRuntimeReady();
    }

    public getQuantumApi = () => ({
        onPageElUpdate: (el: HTMLElement) => { this.emit('page-el-update', el); },
        onRuntimeReady: (runtime: IRuntime) => {
            this.runtime = runtime;
            // 赋值 runtime
            (globalThis as any).runtime = runtime;
            // 触发 运行时ready 事件
            this.emit('runtime-ready', runtime);
        },
    });

    public destory() {
        this.iframe?.removeEventListener('load', this.loadHandler);
        this.contentWindow = null;
        this.iframe?.remove();
        this.iframe = undefined;
        this.clear();
    }

    /**
   * 通过坐标获得坐标下所有HTML元素数组
   * @param point 坐标
   * @returns 坐标下方所有HTML元素数组，会包含父元素直至html，元素层叠时返回顺序是从上到下
   */
    public getElementsFromPoint(point: IPoint): HTMLElement[] {
        let x = point.clientX;
        let y = point.clientY;
        if (this.iframe) {
            const rect = this.iframe.getClientRects()[0];
            if (rect) {
                x = x - rect.left;
                y = y - rect.top;
            }
        }
        return this.getDocument()?.elementsFromPoint(x / this.zoom, y / this.zoom) as HTMLElement[];
    }

    /**
   * 在runtime中对被选中的元素进行标记，部分组件有对选中态进行特殊显示的需求
   * @param el 被选中的元素
   */
    private flagSelectedEl(el: HTMLElement): void {
        const doc = this.getDocument();
        if (doc) {
            removeSelectedClassName(doc);
            addSelectedClassName(el, doc);
        }
    }

    private loadHandler= async() => {
        // 如果 contentWindow 未初始化, 返回
        if (!this.contentWindow) return;

        // 如果 quantum 未初始化, 初始化
        if (!this.contentWindow?.quantum) {
            this.postQuantumRuntimeReady();
        }
        // this.emit('onload');
    }

    private postQuantumRuntimeReady() {
        this.contentWindow = this.iframe?.contentWindow as IRuntimeWindow;

        this.contentWindow.quantum = this.getQuantumApi();

        this.contentWindow.postMessage(
            {
                quantumRuntimeReady: true,
            },
            '*'
        );
    }
}
