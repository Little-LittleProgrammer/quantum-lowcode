import { ISchemasPage, NodeType } from '@qimao/quantum-schemas';
import { IInstallOptions } from '../types';

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

export function getCompType(type: string): NodeType {
    if (['page', 'container', 'root'].includes(type)) {
        return type as NodeType;
    }
    return 'node' as NodeType;
}
