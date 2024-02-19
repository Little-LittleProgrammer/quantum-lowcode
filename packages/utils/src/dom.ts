import { js_utils_dom_offset } from '@q-front-npm/utils';

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
