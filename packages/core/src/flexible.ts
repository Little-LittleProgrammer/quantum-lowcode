import {
    DEFAULT_DESIGN_WIDTH,
    DEFAULT_PAGE_MAX_WIDTH
} from '@quantum-lowcode/schemas';

/**
 * 移动端适配方案
 */
export default class Flexible {
    public designWidth = DEFAULT_DESIGN_WIDTH;
    public dpr = 1;
    private tid: NodeJS.Timeout | undefined;
    constructor(options: { designWidth?: number }) {
        if (globalThis.document.readyState === 'complete') {
            this.setBodyFontSize();
        } else {
            globalThis.document.addEventListener(
                'DOMContentLoaded',
                this.setBodyFontSizeMate.bind(this),
                false
            );
        }
        globalThis.addEventListener('resize', this.resizeHandler, false);
        globalThis.addEventListener('pageshow', this.pageshowHandler, false);
        this.setDesignWidth(options.designWidth || DEFAULT_DESIGN_WIDTH);
        globalThis.addEventListener('resize', this.calcFontsize.bind(this));
    }

    public setDesignWidth(width: number) {
        this.designWidth = width;
        // 根据屏幕大小计算出跟节点的font-size，用于rem样式的适配
        // if (this.isH5()) {
        this.calcFontsize();
        // }
    }

    public destroy() {
        globalThis.document.removeEventListener(
            'DOMContentLoaded',
            this.setBodyFontSizeMate.bind(this),
            false
        );
        globalThis.removeEventListener('resize', this.resizeHandler, false);
        globalThis.removeEventListener('pageshow', this.pageshowHandler, false);
    }
    private resizeHandler() {
        clearTimeout(this.tid);
        this.tid = setTimeout(() => {
            this.calcFontsize();
            this.tid = undefined;
        }, 300);
    }
    // 设置body字体大小
    private setBodyFontSize(dpr = 1) {
        this.dpr = dpr;
        if (document.body) {
            document.body.style.fontSize = 12 * dpr + 'px';
        }
    }
    private setBodyFontSizeMate() {
        this.setBodyFontSize(this.dpr);
    }
    private calcFontsize() {
        const { width, } = document.documentElement.getBoundingClientRect();
        const dpr = 1;
        // const dpr = globalThis?.devicePixelRatio || 1;
        this.setBodyFontSize(dpr);
        const fontSize = Math.min(DEFAULT_PAGE_MAX_WIDTH, width) / 10;
        document.documentElement.style.fontSize = `${fontSize}px`;
    }
    private pageshowHandler = (e: PageTransitionEvent) => {
        if (e.persisted) {
            this.resizeHandler();
        }
    };
}
