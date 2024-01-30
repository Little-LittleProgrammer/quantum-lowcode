import { SELECTED_CLASS } from './const';
import { getParents, js_utils_dom_add_class, js_utils_dom_remove_class } from '@qimao/quantum-utils';

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
