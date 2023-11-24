import { IInstallOptions } from '../types';

let Options: IInstallOptions = {} as any;
export function get_config<K extends keyof IInstallOptions>(key: K) {
    return Options[key];
}

export function set_config(options: IInstallOptions) {
    Options = options;
}
