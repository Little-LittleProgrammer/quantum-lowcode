import { js_utils_dom_offset } from '@q-front-npm/utils';
import { DEFAULT_DESIGN_WIDTH, DEFAULT_PAGE_MAX_WIDTH } from '@qimao/quantum-schemas';

export function injectStyle(doc: Document, style: string) {
    const styleEl = doc.createElement('style');
    styleEl.innerHTML = style;
    doc.head.appendChild(styleEl);
    return styleEl;
}

export function getParents(el: Element, relative: Element) {
    let cur = el.parentElement;
    const parents: Element[] = [];
    while (cur && cur !== relative) {
        parents.push(cur);
        cur = cur.parentElement;
    }
    return parents;
}

export function createElement({tag, cssText, className, }: { className: string; cssText: string, tag?: string }) {
    const el = globalThis.document.createElement(tag || 'div');
    el.className = className;
    el.style.cssText = cssText;
    return el;
}

export function getAbsolutePosition(el: HTMLElement, {top, left, }: Record<string, number>) {
    const { offsetParent, } = el;

    // 在 Webkit 中，如果元素为隐藏的（该元素或其祖先元素的 style.display 为 "none"），或者该元素的 style.position 被设为 "fixed"，则该属性返回 null。
    // 在 IE 9 中，如果该元素的 style.position 被设置为 "fixed"，则该属性返回 null。（display:none 无影响。）
    // body offsetParent 为 null
    if (offsetParent) {
        const parentOffset = js_utils_dom_offset(offsetParent as HTMLElement);
        return {
            left: left - parentOffset.left,
            top: top - parentOffset.top,
        };
    }

    return { left, top, };
}

export const isAbsolute = (style: CSSStyleDeclaration): boolean => style.position === 'absolute';

export const isRelative = (style: CSSStyleDeclaration): boolean => style.position === 'relative';

export const isStatic = (style: CSSStyleDeclaration): boolean => style.position === 'static';

export const isFixed = (style: CSSStyleDeclaration): boolean => style.position === 'fixed';

export function isFixedParent(el: Element) {
    let fixed = false;
    let dom = el;
    while (dom) {
        fixed = isFixed(getComputedStyle(el));
        if (fixed) {
            break;
        }
        const {parentElement, } = dom;
        if (!parentElement || parentElement.tagName === 'BODY') {
            break;
        }
        dom = parentElement;
    }
    return fixed;
}

/**
 * 返回最近的可滚动祖先元素
 * @param el
 * @param includeHidden
 */
export function getScrollParent(el: HTMLElement, includeHidden = false): HTMLElement | null {
    let style = getComputedStyle(el);
    const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

    if (isFixed(style)) return null;

    for (let parent = el; parent.parentElement;) {
        parent = el.parentElement as HTMLElement;
        if (parent.tagName === 'HTML') return parent;

        style = getComputedStyle(parent);

        if (isAbsolute(style) && isStatic(style)) continue;

        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
            return parent;
        }
    }
    return null;
}

export const getDocument = () => globalThis.document;

export const asyncLoadJs = (() => {
    // 正在加载或加载成功的存入此Map中
    const documentMap = new Map();

    return (url: string, crossOrigin?: string, document = getDocument()) => {
        let loaded = documentMap.get(document);
        if (!loaded) {
            loaded = new Map();
            documentMap.set(document, loaded);
        }

        // 正在加载或已经加载成功的，直接返回
        if (loaded.get(url)) return loaded.get(url);

        const load = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            if (crossOrigin) {
                script.crossOrigin = crossOrigin;
            }
            script.src = url;
            document.body.appendChild(script);
            script.onload = () => {
                resolve();
            };
            script.onerror = () => {
                reject(new Error('加载失败'));
            };
            setTimeout(() => {
                reject(new Error('timeout'));
            }, 60 * 1000);
        }).catch((err) => {
            // 加载失败的，从map中移除，第二次加载时，可以再次执行加载
            loaded.delete(url);
            throw err;
        });

        loaded.set(url, load);
        return loaded.get(url);
    };
})();

export function calcValueByDesignWidth(doc: Document | undefined, value: number, designWidth = DEFAULT_DESIGN_WIDTH) {
    // const { fontSize, } = doc.documentElement.style;
    if (!doc) { return value; }

    const maxWidth = globalThis.getComputedStyle(doc.documentElement).width;
    if (maxWidth) {
        const times = Math.min(globalThis.parseFloat(maxWidth), DEFAULT_PAGE_MAX_WIDTH);
        return Number((value * designWidth / times).toFixed(2));
    }

    // if (fontSize) {
    //     const times = globalThis.parseFloat(fontSize);
    //     return Number((value / times).toFixed(2));
    // }

    return value;
}
