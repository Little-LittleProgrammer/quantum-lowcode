import { NodeType } from '@qimao/quantum-schemas';
import { IInstallOptions } from '../types';
import { isContainerNode } from '@qimao/quantum-utils';

let Options: IInstallOptions = {} as any;
export function getConfig<K extends keyof IInstallOptions>(key: K) {
    return Options[key];
}

export function setConfig(options: IInstallOptions) {
    Options = options;
}

export function getCompType(type: string): NodeType {
    if (['page', 'container', 'root'].includes(type)) {
        return type as NodeType;
    }
    if (isContainerNode(type)) {
        return 'container' as NodeType;
    }
    return 'node' as NodeType;
}
