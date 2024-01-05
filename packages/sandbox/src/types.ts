import type {LowCodeRoot} from '@qimao/quantum-core';
import type {ISchemasRoot, Id} from '@qimao/quantum-schemas';

export interface IRuntime {
    getApp?: () => LowCodeRoot | undefined;
    beforeSelect?: (el: HTMLElement) => Promise<boolean> | boolean;
    updateRootConfig?: (config: ISchemasRoot) => void;
    updatePageId?: (id: Id) => void;
    select?: (id: Id) => Promise<HTMLElement> | HTMLElement;
    // add?: (data: UpdateData) => void;
    // update?: (data: UpdateData) => void;
    // sortNode?: (data: SortEventData) => void;
    // remove?: (data: RemoveData) => void;
}

export interface IQuantum {
    /** 当前页面的根节点变化时调用该方法，编辑器会同步该el和stage的大小
     * 同步mask和el的大小
     * 该方法由stage注入到iframe.contentWindow中 */
    onPageElUpdate: (el: HTMLElement) => void;

    onRuntimeReady: (runtime: IRuntime) => void;
}

export interface IRuntimeWindow extends Window {
    quantum: IQuantum;
}

export interface IBoxCoreConfig {
    // HTML地址，可以是一个HTTP地址，如果和编辑器不同域，需要设置跨域，也可以是一个相对或绝对路径
    runtimeUrl?: string;
    // 画布缩放
    zoom?: number;
}
