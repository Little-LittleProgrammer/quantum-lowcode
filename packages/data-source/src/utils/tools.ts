import { ISchemasNode } from '@qimao/quantum-schemas';
import { compliedCondition, js_is_array, js_utils_find_attr } from '@qimao/quantum-utils';
import { IDataSourceManagerData } from '../types';

export function compliedConditions(node: ISchemasNode, data: IDataSourceManagerData) {
    if (!node.ifShow || !js_is_array(node.ifShow) || !node.ifShow.length) return true;

    for (const cond of node.ifShow) {
        let result = true;
        const { op, value, range, field, } = cond;
        const sourceId = field[0];

        const dsData = data[sourceId];

        if (!dsData || !field.length) {
            break;
        }

        const fieldValue = js_utils_find_attr(data[sourceId], field.join('.'));

        if (!compliedCondition(op, fieldValue, value, range)) {
            result = false;
            break;
        }

        if (result) {
            return true;
        }
    }

    return false;
}
