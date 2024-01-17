import { js_is_array, js_is_base, js_is_function, js_is_object, js_is_reg_exp, js_is_string, js_utils_edit_attr, js_utils_find_attr } from '@q-front-npm/utils';
import { ISchemasNode, Id } from '@qimao/quantum-schemas';

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

export function serializeToString<T>(value: T): string {
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

export function parseSchemas(schema: string | Record<string, any>) {
    let firstDeal: Record<string, any> = {};
    if (!js_is_object(schema)) {
        if (!schema.startsWith('(')) {
            schema = `(${schema}`;
        }
        if (!schema.endsWith(')')) {
            schema = `${schema})`;
        }
        // eslint-disable-next-line no-eval
        firstDeal = eval(schema);
    } else {
        firstDeal = schema;
    }

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

// 获取默认值
export function getDefaultValueFromFields(obj: Record<string, any>) {
    const data: Record<string, any> = {};

    const defaultValue: Record<string, any> = {
        string: '',
        object: {},
        array: [],
        boolean: false,
        number: 0,
        null: null,
        any: undefined,
    };

    obj.forEach((field) => {
        if (typeof field.defaultValue !== 'undefined') {
            if (field.type === 'array' && !Array.isArray(field.defaultValue)) {
                data[field.name] = defaultValue.array;
                return;
            }

            if (field.type === 'object' && !js_is_object(field.defaultValue)) {
                if (typeof field.defaultValue === 'string') {
                    try {
                        data[field.name] = JSON.parse(field.defaultValue);
                    } catch (e) {
                        data[field.name] = defaultValue.object;
                    }
                    return;
                }

                data[field.name] = defaultValue.object;
                return;
            }

            data[field.name] = field.defaultValue;
            return;
        }

        if (field.type === 'object') {
            data[field.name] = field.fields ? getDefaultValueFromFields(field.fields) : defaultValue.object;
            return;
        }

        if (field.type) {
            data[field.name] = defaultValue[field.type];
            return;
        }

        data[field.name] = undefined;
    });

    return data;
}

export const calculatePercentage = (value: number, percentageStr: string) => {
    const percentage = globalThis.parseFloat(percentageStr) / 100; // 先将百分比字符串转换为浮点数，并除以100转换为小数
    const result = value * percentage;
    return result;
};

export const isPercentage = (value: number | string) => /^(\d+)(\.\d+)?%$/.test(`${value}`);

export const convertToNumber = (value: number | string, parentValue = 0) => {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string' && isPercentage(value)) {
        return calculatePercentage(parentValue, value);
    }

    return parseFloat(value);
};

/**
 * 将新节点更新到data或者parentId对应的节点的子节点中
 * @param newNode 新节点
 * @param data 需要修改的数据
 * @param parentId 父节点 id
 */
export const replaceChildNode = (newNode: ISchemasNode, data?: ISchemasNode[], parentId?: Id) => {
    const path = get_node_path(newNode.field, data!);
    const node:ISchemasNode = path.pop();
    let parent:ISchemasNode = path.pop();

    if (parentId) {
        parent = get_node_path(parentId, data!).pop();
    }

    if (!node) throw new Error('未找到目标节点');
    if (!parent) throw new Error('未找到父节点');

    const index = parent.children?.findIndex((child: ISchemasNode) => child.field === node.field);
    parent.children.splice(index, 1, newNode);
};

export const getNeedKey = (node: ISchemasNode) => {
    const keys: string[] = [];
    function dfs(obj: Record<string, any>, path = '') {
        for (const key in obj) {
            if (js_is_object(obj[key])) {
                dfs(obj[key], `${path}${key}.`);
            } else {
                if (js_is_string(obj[key]) && obj[key].includes('${') && obj[key].includes('}')) {
                    keys.push(`${path}${key}`);
                }
            }
        }
    }
    dfs(node);
    return keys;
};

/**
 * 编译节点, 将节点编译成可用dsl
 * @param compile
 * @param node
 * @param sourceId
 */
export function compiledNode(
    node: ISchemasNode,
    compile?: (value: any) => any,
    sourceId?: Id
) {
    let keys: string[] = [];
    if (!sourceId) {
        keys = getNeedKey(node);
    } else {
        keys = [sourceId];
    }

    keys.forEach(key => {
        const value = js_utils_find_attr(node, key);
        let newValue;
        try {
            newValue = compile ? compile(value) : value;
        } catch (e) {
            console.error(e);
            newValue = '';
        }
        js_utils_edit_attr(key, newValue, node);
    });

    if (js_is_array(node.children)) {
        node.children.forEach(item => compiledNode(item as ISchemasNode, compile, sourceId));
    }
    return node;
}
