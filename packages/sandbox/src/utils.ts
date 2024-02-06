import { SELECTED_CLASS, ZIndex } from './const';
import { getParents, js_utils_dom_add_class, js_utils_dom_offset, js_utils_dom_remove_class } from '@qimao/quantum-utils';
import { ITargetElement } from './types';

export function addSelectedClassName(el: Element, doc: Document) {
    js_utils_dom_add_class(el, SELECTED_CLASS);
    js_utils_dom_add_class(el.parentNode as Element, `${SELECTED_CLASS}-parent`);
    getParents(el, doc.body).forEach(item => {
        js_utils_dom_add_class(item, `${SELECTED_CLASS}-parents`);
    });
}

export function removeSelectedClassName(doc: Document) {
    const oldEl = doc.querySelector(`.${SELECTED_CLASS}`);

    if (oldEl) {
        js_utils_dom_remove_class(oldEl, SELECTED_CLASS);
        if (oldEl.parentElement) {
            js_utils_dom_remove_class(oldEl.parentElement, `${SELECTED_CLASS}-parent`);
        }
        doc.querySelectorAll(`.${SELECTED_CLASS}-parents`).forEach((item) => {
            js_utils_dom_remove_class(item, `${SELECTED_CLASS}-parents`);
        });
    }
}

// 将蒙层占位节点覆盖在原节点上方
export function getTargetElStyle(el: ITargetElement, zIndex?: ZIndex) {
    const offset = js_utils_dom_offset(el as HTMLElement);
    const { transform, border, } = getComputedStyle(el);
    return `
      position: absolute;
      transform: ${transform};
      left: ${offset.left}px;
      top: ${offset.top}px;
      width: ${el.clientWidth}px;
      height: ${el.clientHeight}px;
      border: ${border};
      opacity: 0;
      ${typeof zIndex !== 'undefined' ? `z-index: ${zIndex};` : ''}
    `;
}
