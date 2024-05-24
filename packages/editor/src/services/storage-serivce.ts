
import {getConfig} from '../utils';
import { serializeToString } from '@quantum-lowcode/utils';

interface Options {
    namespace?: string;
    protocol?: Protocol;
}

export enum Protocol {
    OBJECT = 'object',
    JSON = 'json',
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
}

/**
 * 数据存储服务
 */
export class WebStorage {
    private storage: Storage = globalThis.localStorage;
    private namespace = 'quantum';

    /**
	 * 获取数据存储对象，可以通过
	 */
    public getStorage(): Storage {
        return this.storage;
    }

    public getNamespace(): string {
        return this.namespace;
    }

    /**
	 * 清理，支持storageService.usePlugin
	 */
    public clear(): void {
        const storage = this.getStorage();
        storage.clear();
    }
    /**
	 * 获取存储项，支持storageService.usePlugin
	 */
    public getItem(key: string, options: Options = {}): any {
        const storage = this.getStorage();
        const namespace = this.getNamespace();
        const { protocol = options.protocol, item, } = this.getValueAndProtocol(
            storage.getItem(`${options.namespace || namespace}:${key}`)
        );

        if (item === null) return null;

        switch (protocol) {
            case Protocol.OBJECT:
                return getConfig('parseSchemas')?.(`(${item})`);
            case Protocol.JSON:
                return JSON.parse(item);
            case Protocol.NUMBER:
                return Number(item);
            case Protocol.BOOLEAN:
                return Boolean(item);
            default:
                return item;
        }
    }
    /**
	 * 获取指定索引位置的key
	 */
    public key(index: number): string | null {
        const storage = this.getStorage();
        return storage.key(index);
    }

    /**
	 * 移除存储项，支持storageService.usePlugin
	 */
    public removeItem(key: string, options: Options = {}): void {
        const storage = this.getStorage();
        const namespace = this.getNamespace();
        storage.removeItem(`${options.namespace || namespace}:${key}`);
    }

    /**
	 * 设置存储项，支持storageService.usePlugin
	 */
    public setItem(key: string, value: any, options: Options = {}): void {
        const storage = this.getStorage();
        const namespace = this.getNamespace();
        let item = value;
        const protocol = options.protocol ? `${options.protocol}:` : '';
        if (
            typeof value === Protocol.STRING ||
			typeof value === Protocol.NUMBER
        ) {
            item = `${protocol}${value}`;
        } else {
            item = `${protocol}${serializeToString(value)}`;
        }
        storage.setItem(`${options.namespace || namespace}:${key}`, item);
    }

    public destroy() {}

    private getValueAndProtocol(value: string | null) {
        let protocol = '';

        if (value === null) {
            return {
                item: value,
                protocol,
            };
        }

        const item = value.replace(
            new RegExp(`^(${Object.values(Protocol).join('|')})(:)(.+)`),
            (_$0, $1, _$2, $3) => {
                protocol = $1;
                return $3;
            }
        );

        return {
            protocol,
            item,
        };
    }
}

export type StorageService = WebStorage;
export const storageService = new WebStorage();
