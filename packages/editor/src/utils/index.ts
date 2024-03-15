import { ISchemasContainer, ISchemasPage, NodeType } from '@qimao/quantum-schemas';
import { IInstallOptions } from '../types';
import { js_is_string } from '@qimao/quantum-utils';

let Options: IInstallOptions = {} as any;
export function getConfig<K extends keyof IInstallOptions>(key: K) {
    return Options[key];
}

export function setConfig(options: IInstallOptions) {
    Options = options;
}

export function isPage(node?: ISchemasPage | null): boolean {
    if (!node) return false;
    return Boolean(node.type === NodeType.PAGE);
}

export function isContainerNode(node?: ISchemasContainer | null | string): boolean {
    if (!node) return false;
    if (js_is_string(node)) {
        return node.includes('container')
    }
    return Boolean(node.type === NodeType.CONTAINER);
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
