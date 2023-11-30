import { js_is_base, js_is_function, js_is_reg_exp, js_is_string } from '@q-front-npm/utils';

export function get_host(url: string) {
    return url.match(/\/\/([^/]+)/)?.[1];
}

export function is_same_domain(tu: string, su: string = globalThis.location.host) {
    const _isHttpUrl = /^(http[s]?:)?\/\//.test(tu);

    if (!_isHttpUrl) return true;

    return get_host(tu) === su;
}

/**
 *  通过type获取组件在应用的子孙路径
 * @param field 唯一值
 * @param data root.children
 */
export function get_node_path(field: string, data: any[]) {
    const path: any[] = [];
    const track: any[] = [];
    function back_track(field: string, data: any[]) {
        if (track.length > 0 && field === track[track.length - 1].field) {
            path.push(...track);
            return;
        }
        if (!Array.isArray(data)) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            track.push(item);
            back_track(field, item.children);
            track.pop();
        }
    }
    back_track(field, data);
    return path;
}

export const filter_xss = (str: string) =>
    str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const get_url_param = (param: string, url?: string) => {
    const u = url || location.href;
    const reg = new RegExp(`[?&#]${param}=([^&#]+)`, 'gi');

    const matches = u.match(reg);
    let strArr;
    if (matches && matches.length > 0) {
        strArr = matches[matches.length - 1].split('=');
        if (strArr && strArr.length > 1) {
            // 过滤XSS字符
            return filter_xss(strArr[1]);
        }
        return '';
    }
    return '';
};

export function serialize_to_string<T>(value: T): string {
    if (js_is_string(value)) {
        return value;
    }
    function deal_special(val: any): string {
        // 压缩方法
        return val.toString().replace(/\n/g, ';').replace(/\s/g, '');
    }
    // 判断引用类型的temp
    function check_temp(target:any) {
        const _c = target.constructor;
        return new _c();
    }
    let serializeObj: Record<string, any> = {};
    function dfs(target: any, map = new Map()) {
        if (js_is_base(target)) {
            return target;
        }
        if (js_is_function(target)) {
            return deal_special(target);
        }
        if (js_is_reg_exp(target)) return deal_special(target);

        const _temp = check_temp(target);
        // 防止循环引用
        if (map.get(target)) {
            return map.get(target);
        }
        map.set(target, _temp);
        // 处理数组和对象
        for (const key in target) {
        // 递归
            _temp[key] = dfs(target[key], map);
        }
        return _temp;
    }
    serializeObj = dfs(value);
    return JSON.stringify(serializeObj, null, 4);
}

export function parseSchemas(schema: string) {
    if (!schema.startsWith('(')) {
        schema = `(${schema}`;
    }
    if (!schema.endsWith(')')) {
        schema = `${schema})`;
    }
    // eslint-disable-next-line no-eval
    const firstDeal = eval(schema);

    // 判断引用类型的temp
    function check_temp(target:any) {
        const _c = target.constructor;
        return new _c();
    }
    function dfs(target: any, map = new Map()) {
        if (js_is_string(target) && (target.includes('function') || target.includes('=>'))) {
            // eslint-disable-next-line no-eval
            return eval(`(${target})`); // 字符串转方法
            // return new Function(`return ${target}`)(); // 字符串转方法
        }
        if (js_is_base(target) || js_is_reg_exp(target) || js_is_function(target)) {
            return target;
        }
        const _temp = check_temp(target);
        // 防止循环引用
        if (map.get(target)) {
            return map.get(target);
        }
        map.set(target, _temp);
        // 处理数组和对象
        for (const key in target) {
        // 递归
            _temp[key] = dfs(target[key], map);
        }
        return _temp;
    }
    const result = dfs(firstDeal);
    return result;
}
