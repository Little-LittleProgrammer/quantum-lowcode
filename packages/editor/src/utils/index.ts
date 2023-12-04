import { js_is_array, js_is_object } from '@qimao/quantum-utils';
import { IInstallOptions } from '../types';
import { ISchemasRoot, NodeType } from '@qimao/quantum-core';

let Options: IInstallOptions = {} as any;
export function getConfig<K extends keyof IInstallOptions>(key: K) {
    return Options[key];
}

export function setConfig(options: IInstallOptions) {
    Options = options;
}

// TODO delete 为了一期简化用户输入, 后续会删除
export function setSchemasRoot(scheams: any): ISchemasRoot | undefined {
    if (js_is_object(scheams) && scheams.type === 'root') {
        return scheams as ISchemasRoot;
    }
    if (js_is_array(scheams)) {
        if (scheams.length > 0 && scheams[0].type === 'page') {
            return {
                name: 'active',
                type: NodeType.ROOT,
                children: scheams,
            };
        }
        return {
            name: 'active',
            type: NodeType.ROOT,
            children: [{
                type: NodeType.PAGE,
                field: 'page1',
                children: scheams,
            }],
        };
    }
}

// TODO delete 为了一期简化用户输入, 后续会删除
export function getSchemasRootToNeed(scheams:ISchemasRoot) {
    if (scheams.children?.[0]?.children) {
        return scheams.children?.[0]?.children;
    }
    return [];
}
