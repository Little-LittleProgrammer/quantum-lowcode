import { IHttpOptions } from '@quantum-lowcode/schemas';

/**
 * 将json对象转换为urlencoded字符串
 * @param data json对象
 * @returns string
 */
function urlencoded(data: Record<string, string | number | boolean | null | undefined>) {
    return Object.entries(data).reduce((prev, [key, value]) => {
        let v = value;
        if (typeof value === 'object') {
            v = JSON.stringify(value);
        }
        if (typeof value !== 'undefined') {
            return `${prev}${prev ? '&' : ''}${globalThis.encodeURIComponent(key)}=${globalThis.encodeURIComponent(`${v}`)}`;
        }
        return prev;
    }, '');
}

/**
 * 浏览器端请求
 * 如果未有自定义的request方法，则使用浏览器的fetch方法
 * @param options 请求参数
 */
export async function webRequest(options: IHttpOptions) {
    const { url, method = 'GET', headers = {}, params = {}, data = {}, ...config } = options;
    const query = urlencoded(params);
    let body: string = JSON.stringify(data);
    if (headers['Content-Type']?.includes('application/x-www-form-urlencoded')) {
        body = urlencoded(data);
    }

    const response = await globalThis.fetch(query ? `${url}?${query}` : url, {
        method,
        headers,
        body: method === 'GET' ? undefined : body,
        ...config,
    });

    return response.json();
}
