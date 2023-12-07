import { IInstallOptions } from '../types';

let Options: IInstallOptions = {} as any;
export function getConfig<K extends keyof IInstallOptions>(key: K) {
    return Options[key];
}

export function setConfig(options: IInstallOptions) {
    Options = options;
}

