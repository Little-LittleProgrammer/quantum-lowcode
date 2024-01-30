export function inject_style(doc: Document, style: string) {
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
