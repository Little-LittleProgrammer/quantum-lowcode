import type { ISchemasNode } from '@quantum-lowcode/schemas';
import { compliedCondition, isArray, js_utils_find_attr } from '@quantum-lowcode/utils';
import type { IDataSourceManagerData } from '../types';

/**
 * 校验节点是否满足所有显示条件（ifShow），所有条件都满足才会显示
 * @param node 节点
 * @param data 所有数据源的数据
 * @returns 是否显示
 */
export function compliedConditions(node: ISchemasNode, data: IDataSourceManagerData) {
    if (!node.ifShow || !isArray(node.ifShow) || !node.ifShow.length || !data) return true;
    for (const cond of node.ifShow) {
        const { op, value, range, field } = cond;

        if (!field || !field.length) {
            return false;
        }
        const [sourceId, ...fid] = field;
        if (!sourceId) {
            return false;
        }

        const dsData = data[sourceId];

        if (!dsData) {
            return false;
        }

        const fieldValue = js_utils_find_attr(dsData, fid.join('.'));

        if (!compliedCondition(op, fieldValue, value, range)) {
            return false;
        }
    }

    return true;
}
