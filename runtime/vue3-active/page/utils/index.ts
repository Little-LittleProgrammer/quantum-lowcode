import type { ISchemasRoot } from '@quantum-lowcode/schemas';
import { parseSchemas } from '@quantum-lowcode/utils';

export const getLocalConfig = (): ISchemasRoot[] => {
    const configStr = localStorage.getItem('PAGE_JSON');
    if (!configStr) return [];
    try {
        return [parseSchemas(`(${configStr})`)];
    } catch (err) {
        return [];
    }
};
