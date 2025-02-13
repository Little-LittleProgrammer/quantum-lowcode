import type { ISchemasNode } from '@quantum-lowcode/schemas';
import { compliedCondition, isArray, js_utils_find_attr } from '@quantum-lowcode/utils';
import type { IDataSourceManagerData } from '../types';

export function compliedConditions(node: ISchemasNode, data: IDataSourceManagerData) {
    if (!node.ifShow || !isArray(node.ifShow) || !node.ifShow.length) return true;

    for (const cond of node.ifShow) {
        let result = true;
        const { op, value, range, field, } = cond;
        const [sourceId, ...fid] = field;

        const dsData = data[sourceId];

        if (!dsData || !field.length) {
            break;
        }

        const fieldValue = js_utils_find_attr(dsData, fid.join('.'));

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
