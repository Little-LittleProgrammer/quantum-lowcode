import { GHOST_EL_ID_PREFIX, Mode, SELECTED_CLASS, ZIndex } from './const';
import {
    getParents,
    isFixedParent,
    isRelative,
    isStatic,
    js_utils_dom_add_class,
    js_utils_dom_offset,
    js_utils_dom_remove_class
} from '@quantum-lowcode/utils';
import type { ISortEventData, ITargetElement } from './types';
import {DEFAULT_DESIGN_WIDTH} from '@quantum-lowcode/schemas';

export function addSelectedClassName(el: Element, doc: Document) {
    js_utils_dom_add_class(el, SELECTED_CLASS);
    js_utils_dom_add_class(
        el.parentNode as Element,
        `${SELECTED_CLASS}-parent`
    );
    getParents(el, doc.body).forEach((item) => {
        js_utils_dom_add_class(item, `${SELECTED_CLASS}-parents`);
    });
}

export function removeSelectedClassName(doc: Document) {
    const oldEl = doc.querySelector(`.${SELECTED_CLASS}`);

    if (oldEl) {
        js_utils_dom_remove_class(oldEl, SELECTED_CLASS);
        if (oldEl.parentElement) {
            js_utils_dom_remove_class(
                oldEl.parentElement,
                `${SELECTED_CLASS}-parent`
            );
        }
        doc.querySelectorAll(`.${SELECTED_CLASS}-parents`).forEach((item) => {
            js_utils_dom_remove_class(item, `${SELECTED_CLASS}-parents`);
        });
    }
}

// 将蒙层占位节点覆盖在原节点上方
export function getTargetElStyle(el: ITargetElement, zIndex?: ZIndex, sub?: number) {
    sub = sub || 0;
    const offset = js_utils_dom_offset(el as HTMLElement);
    const { transform, border, } = getComputedStyle(el);
    return `
      position: absolute;
      transform: ${transform};
      left: ${offset.left - sub}px;
      top: ${offset.top}px;
      width: ${el.clientWidth}px;
      height: ${el.clientHeight}px;
      border: ${border};
      opacity: 0;
      ${typeof zIndex !== 'undefined' ? `z-index: ${zIndex};` : ''}
    `;
}

export function getMarginValue(el: Element) {
    if (!el)
        return {
            marginLeft: 0,
            marginTop: 0,
        };

    const { marginLeft, marginTop, } = getComputedStyle(el);

    const marginLeftValue = parseFloat(marginLeft) || 0;
    const marginTopValue = parseFloat(marginTop) || 0;

    return {
        marginLeft: marginLeftValue,
        marginTop: marginTopValue,
    };
}
export function getBorderWidth(el: Element) {
    if (!el)
        return {
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: 0,
        };

    const {
        borderLeftWidth,
        borderRightWidth,
        borderTopWidth,
        borderBottomWidth,
    } = getComputedStyle(el);

    return {
        borderLeftWidth: parseFloat(borderLeftWidth) || 0,
        borderRightWidth: parseFloat(borderRightWidth) || 0,
        borderTopWidth: parseFloat(borderTopWidth) || 0,
        borderBottomWidth: parseFloat(borderBottomWidth) || 0,
    };
}

export function getMode(el: Element): Mode {
    if (isFixedParent(el)) return Mode.FIXED;
    const style = getComputedStyle(el);
    if (isStatic(style) || isRelative(style)) return Mode.SORTABLE;
    return Mode.ABSOLUTE;
}

/**
 * 下移组件位置
 * @param {number} deltaTop 偏移量
 * @param {Object} target 当前选中的组件配置
 */
export const down = (
    deltaTop: number,
    target: ITargetElement
): ISortEventData | void => {
    let swapIndex = 0;
    let addUpH = target.clientHeight;
    const brothers = Array.from(target.parentNode?.children || []).filter(
        (node) => !node.id.startsWith(GHOST_EL_ID_PREFIX)
    );
    const index = brothers.indexOf(target);
    // 往下移动
    const downEls = brothers.slice(index + 1) as HTMLElement[];

    for (let i = 0; i < downEls.length; i++) {
        const ele = downEls[i];
        // 是 fixed 不做处理
        if (ele.style?.position === 'fixed') {
            continue;
        }
        addUpH += ele.clientHeight / 2;
        if (deltaTop <= addUpH) {
            break;
        }
        addUpH += ele.clientHeight / 2;
        swapIndex = i;
    }
    return {
        src: target.id,
        dist: downEls.length && swapIndex > -1 ? downEls[swapIndex].id : target.id,
    };
};

/**
 * 上移组件位置
 * @param {number} deltaTop 偏移量
 * @param {Object} target 当前选中的组件配置
 */
export const up = (
    deltaTop: number,
    target: ITargetElement
): ISortEventData | void => {
    const brothers = Array.from(target.parentNode?.children || []).filter(
        (node) => !node.id.startsWith(GHOST_EL_ID_PREFIX)
    );
    const index = brothers.indexOf(target);
    // 往上移动
    const upEls = brothers.slice(0, index) as HTMLElement[];

    let addUpH = target.clientHeight;
    let swapIndex = upEls.length - 1;

    for (let i = upEls.length - 1; i >= 0; i--) {
        const ele = upEls[i];
        if (!ele) continue;
        // 是 fixed 不做处理
        if (ele.style.position === 'fixed') continue;

        addUpH += ele.clientHeight / 2;
        if (-deltaTop <= addUpH) break;
        addUpH += ele.clientHeight / 2;

        swapIndex = i;
    }
    return {
        src: target.id,
        dist: upEls.length && swapIndex > -1 ? upEls[swapIndex].id : target.id,
    };
};

export function isMoveableButton(target: Element) {
    return target.classList.contains('moveable-button') || target.parentElement?.classList.contains('moveable-button');
}

