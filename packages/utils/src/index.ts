import { isBase, isFunction, isBoolean, isObject, isRegExp, isString, isUnDef, js_utils_edit_attr, js_utils_find_attr, serializeToString } from '@quantum-design/utils';
import { type Fn, type ISchemasContainer, type ISchemasNode, type ISchemasPage, type Id, NodeType } from '@quantum-lowcode/schemas';

export function getHost(url: string) {
    return url.match(/\/\/([^/]+)/)?.[1];
}

export function isSameDomain(tu: string, su: string = globalThis.location.host) {
    const _isHttpUrl = /^(http[s]?:)?\/\//.test(tu);

    if (!_isHttpUrl) return true;

    return getHost(tu) === su;
}

/**
 *  通过type获取组件在应用的子孙路径
 * @param field 唯一值
 * @param data root.children
 */
export function getNodePath(field: string, data: any[]) {
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

export const filterXss = (str: string) =>
    str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const getUrlParam = (param: string, url?: string) => {
    const u = url || location.href;
    const reg = new RegExp(`[?&#]${param}=([^&#]+)`, 'gi');

    const matches = u.match(reg);
    let strArr;
    if (matches && matches.length > 0) {
        strArr = matches[matches.length - 1].split('=');
        if (strArr && strArr.length > 1) {
            // 过滤XSS字符
            return filterXss(strArr[1]);
        }
        return '';
    }
    return '';
};

export function stringToBoolean(val: string) {
    if (isBoolean(val)) {
        return val === 'true';
    }
    return val;
}

export function parseSchemas(schema: string | Record<string, any>) {
    let firstDeal: Record<string, any> = {};
    if (!isObject(schema)) {
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
        if (isString(target)) {
            if ((target.includes('function') || target.includes('=>'))) {
                target = target.replace(/;/g, '\n');
                // eslint-disable-next-line no-eval
                return eval(`(${target})`); // 字符串转方法
            // return new Function(`return ${target}`)(); // 字符串转方法
            } else if (isBoolean(target)) {
                return stringToBoolean(target);
            }
            // else if (/^[-]?[0-9]*[.]?[0-9]*$/.test(target)) {
            //     return +target;
            // }
        }
        if (isBase(target) || isRegExp(target) || isFunction(target)) {
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

export function parseFunction(func: string | Fn, ...agrs: string[]) {
    let _fn = '';
    if (isFunction(func)) {
        _fn = serializeToString(func);
    }
    const _lastIndex = _fn.lastIndexOf('}');
    if (_lastIndex > 0) {
        _fn = _fn.slice(0, _lastIndex);
    }
    agrs.forEach(item => {
        _fn += `;${item}`;
    });
    return parseSchemas(_fn + '};');
}

// 获取默认值
export function getDefaultValueFromFields(obj: Record<string, any>[]) {
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

    obj.forEach((field: any) => {
        if (typeof field.defaultValue !== 'undefined') {
            if (field.type === 'array' && !Array.isArray(field.defaultValue)) {
                data[field.name] = defaultValue.array;
                return;
            }

            if (field.type === 'object' && !isObject(field.defaultValue)) {
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
            data[field.name] = field.fields ? getDefaultValueFromFields(field.fields || []) : defaultValue.object;
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
    const path = getNodePath(newNode.field, data!);
    const node:ISchemasNode = path.pop();
    let parent:ISchemasNode = path.pop();

    if (parentId) {
        parent = getNodePath(parentId, data!).pop();
    }

    if (!node) throw new Error('未找到目标节点');
    if (!parent) throw new Error('未找到父节点');

    const index = parent.children?.findIndex((child: ISchemasNode) => child.field === node.field);
    parent.children?.splice(index, 1, newNode);
};

export const getNeedKey = (node: ISchemasNode) => {
    const keys: string[] = [];
    function dfs(obj: Record<string, any>, path = '') {
        for (const key in obj) {
            if (isObject(obj[key])) {
                dfs(obj[key], `${path}${key}.`);
            } else {
                const finKey = key;
                if (isString(obj[key]) && obj[finKey].includes('${') && obj[finKey].includes('}')) {
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
    compile?: (value: any, keyPath?: string) => any,
    sourceId?: Id
) {
    // TODO 整个数据收集部分待优化
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
            newValue = compile ? compile(value, key) : value;
        } catch (e) {
            console.error(e);
            newValue = '';
        }
        js_utils_edit_attr(key, newValue, node);
    });

    // if (isArray(node.children)) {
    //     node.children.forEach(item => compiledNode(item, compile, sourceId));
    // }
    return node;
}

/**
 * 添加参数到URL
 * @param obj 参数对象
 * @param global window对象
 * @param needReload 是否需要刷新
 */
export const addParamToUrl = (obj: Record<string, any>, global = globalThis, needReload = true) => {
    const url = new URL(global.location.href);
    const { searchParams, } = url;
    for (const [k, v] of Object.entries(obj)) {
        searchParams.set(k, v);
    }
    const newUrl = url.toString();
    if (needReload) {
        global.location.href = newUrl;
    } else {
        global.history.pushState({}, '', url);
    }
};

export function compliedCondition(op: string, fieldValue: any, inputValue: any, range: number[] = []): boolean {
    if (isString(fieldValue) && isUnDef(fieldValue)) {
        inputValue = '';
    }
    switch (op) {
        case 'is':
            return fieldValue === inputValue;
        case 'not':
            return fieldValue !== inputValue;
        case '=':
            return fieldValue === inputValue;
        case '!=':
            return fieldValue !== inputValue;
        case '>':
            return fieldValue > inputValue;
        case '>=':
            return fieldValue >= inputValue;
        case '<':
            return fieldValue < inputValue;
        case '<=':
            return fieldValue <= inputValue;
        case 'between':
            return range.length > 1 && fieldValue >= range[0] && fieldValue <= range[1];
        case 'not_between':
            return range.length < 2 || fieldValue < range[0] || fieldValue > range[1];
        case 'include':
            return fieldValue?.includes?.(inputValue);
        case 'not_include':
            return typeof fieldValue === 'undefined' || !fieldValue.includes?.(inputValue);
        default:
            break;
    }
    return false;
}

export function isPage(node?: ISchemasPage | null): boolean {
    if (!node) return false;
    return Boolean(node.type === NodeType.PAGE);
}

export function isContainerNode(node?: ISchemasContainer | null | string): boolean {
    if (!node) return false;
    if (isString(node)) {
        return node.toLowerCase().includes('container');
    }
    return Boolean(node.type === NodeType.CONTAINER);
}
