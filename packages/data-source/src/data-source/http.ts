import { IHttpOptions, IRequestFunction } from '@quantum-lowcode/schemas';
import { IHttpDataSourceOption, IHttpDataSourceSchema } from '../types';
import { DataSource } from './base';
import { isFunction, js_utils_find_attr, webRequest } from '@quantum-lowcode/utils';

/**
 * HTTP 数据源
 * @description 通过 http 请求获取数据源, 支持 mock 数据
 */
export class HttpDataSource extends DataSource {
    /** 是否正在发起请求 */
    public isLoading = false;
    public error?: {
        msg?: string;
        code?: string | number;
    };
    public schema: IHttpDataSourceSchema;
    /** 请求配置 */
    public httpOptions: IHttpOptions;

    /** 请求函数 */
    #fetch?: IRequestFunction;
    /** 请求前需要执行的函数队列 */
    #beforeRequest: ((...args: any[]) => any)[] = [];
    /** 请求后需要执行的函数队列 */
    #afterRequest: ((...args: any[]) => any)[] = [];

    #type = 'http';
    constructor(options: IHttpDataSourceOption) {
        const { options: httpOptions } = options.schema;
        super(options);

        this.schema = options.schema;
        this.httpOptions = httpOptions;

        if (isFunction(options.request)) {
            this.#fetch = options.request;
        } else if (typeof globalThis.fetch === 'function') {
            this.#fetch = webRequest;
        }

        this.methods.forEach((method) => {
            if (!isFunction(method.content)) return;
            switch (method.timing) {
                case 'beforeRequest':
                    this.#beforeRequest.push(method.content as (...args: any[]) => any);
                    break;
                case 'afterRequest':
                    this.#afterRequest.push(method.content as (...args: any[]) => any);
                    break;
                default:
                    break;
            }
        });
    }

    public get type() {
        return this.#type;
    }

    public async init() {
        if (this.schema.autoFetch) {
            await this.request(this.httpOptions);
        }

        super.init();
    }

    public async request(options: Partial<IHttpOptions> = {}) {
        this.isLoading = true;

        let reqOptions = {...this.httpOptions, ...options };
        try {
            for (const method of this.#beforeRequest) {
                await method({ options: reqOptions, params: {}, dataSource: this, app: this.app });
            }

            if (typeof this.schema.beforeRequest === 'function') {
                reqOptions = this.schema.beforeRequest(reqOptions, { app: this.app, dataSource: this });
            }

            let res = this.mockData ? this.mockData : await this.#fetch?.(reqOptions);

            for (const method of this.#afterRequest) {
                await method({ res, options: reqOptions, dataSource: this, app: this.app });
            }

            if (typeof this.schema.afterResponse === 'function') {
                res = this.schema.afterResponse(res, { app: this.app, dataSource: this });
            }

            if (this.schema.responseOptions?.dataPath) {
                const data = js_utils_find_attr(this.schema.responseOptions.dataPath, res);
                this.setData(data);
            } else {
                this.setData(res.data);
            }
            this.error = undefined;
        } catch (error: any) {
            this.error = {
                msg: error.message
            };
            this.emit('error', error);
        } finally {
            this.isLoading = false;
        }
    }
    public get(options: Partial<IHttpOptions> & { url: string }) {
        return this.request({
            ...options,
            method: 'GET'
        });
    }

    public post(options: Partial<IHttpOptions> & { url: string }) {
        return this.request({
            ...options,
            method: 'POST'
        });
    }
}
