import {parseSchemas, isFunction, isObject, isString, isUnDef, js_utils_edit_attr, js_utils_find_attr, serializeToString } from '@quantum-design/utils';
import { type Fn, type ISchemasContainer, type ISchemasNode, type ISchemasPage, type Id, NodeType } from '@quantum-lowcode/schemas';

/**
 * 从URL中提取主机名
 *
 * 解析URL字符串，提取其中的主机部分（域名+端口）
 * 主要用于跨域检查和域名识别
 *
 * @param url 完整的URL字符串
 * @returns 返回主机名，如果无法解析则返回undefined
 *
 * @example
 * getHost('https://example.com:8080/path') // 返回: 'example.com:8080'
 * getHost('//cdn.example.com/resource') // 返回: 'cdn.example.com'
 */
export function getHost(url: string) {
    return url.match(/\/\/([^/]+)/)?.[1];
}

/**
 * 判断两个URL是否属于同一域名
 *
 * 用于安全检查，判断目标URL是否与当前域名相同
 * 对于相对路径URL，默认认为是同域的
 *
 * @param tu 目标URL
 * @param su 源URL主机名，默认为当前页面的主机名
 * @returns 如果是同域返回true，否则返回false
 *
 * @example
 * isSameDomain('/api/data') // true（相对路径）
 * isSameDomain('https://example.com/api', 'example.com') // true
 * isSameDomain('https://other.com/api', 'example.com') // false
 */
export function isSameDomain(tu: string, su: string = globalThis.location.host) {
    // 检查是否为HTTP/HTTPS协议的绝对URL
    const _isHttpUrl = /^(http[s]?:)?\/\//.test(tu);

    // 如果不是HTTP URL（相对路径），则认为是同域
    if (!_isHttpUrl) return true;

    // 比较两个URL的主机名
    return getHost(tu) === su;
}

/**
 * 通过节点ID获取节点在树结构中的完整路径
 *
 * 使用回溯算法在树形结构中查找指定节点，返回从根节点到目标节点的完整路径。
 * 这是实现节点定位和更新的核心函数，广泛用于节点操作和数据绑定中。
 *
 * 算法原理：
 * 1. 使用深度优先搜索遍历树结构
 * 2. 使用回溯算法记录搜索路径
 * 3. 找到目标节点时，将当前路径复制到结果数组
 *
 * @param field 目标节点的唯一标识符
 * @param data 树结构的根节点数组
 * @returns 返回从根到目标节点的路径数组，如果未找到则返回空数组
 *
 * @example
 * const tree = [
 *   { field: 'root', children: [
 *     { field: 'child1', children: [
 *       { field: 'target' }
 *     ]}
 *   ]}
 * ];
 * getNodePath('target', tree) // 返回: [root节点, child1节点, target节点]
 */
export function getNodePath(field: string, data: any[]) {
    const path: any[] = []; // 存储最终找到的路径
    const track: any[] = []; // 临时路径，用于回溯

    /**
     * 回溯搜索函数
     * @param field 目标字段ID
     * @param data 当前搜索的数据数组
     */
    function back_track(field: string, data: any[]) {
        // 如果找到目标节点（当前路径的最后一个节点的field匹配）
        if (track.length > 0 && field === track[track.length - 1].field) {
            path.push(...track); // 将当前路径复制到结果中
            return;
        }

        // 确保当前数据是数组格式
        if (!Array.isArray(data)) {
            return;
        }

        // 遍历当前层级的所有节点
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            track.push(item); // 将当前节点加入路径
            back_track(field, item.children); // 递归搜索子节点
            track.pop(); // 回溯，移除当前节点
        }
    }

    back_track(field, data);
    return path;
}

/**
 * XSS防护函数
 *
 * 对字符串中的危险字符进行HTML实体编码，防止XSS攻击
 * 主要处理尖括号、引号等可能被用于注入的字符
 *
 * @param str 需要过滤的字符串
 * @returns 经过HTML实体编码的安全字符串
 *
 * @example
 * filterXss('<script>alert("xss")</script>')
 * // 返回: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export const filterXss = (str: string) =>
    str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * 从URL中获取指定参数的值
 *
 * 解析URL查询字符串或hash参数，提取指定参数的值
 * 支持多种URL格式，包括查询参数和hash参数
 * 内置XSS防护，确保返回值的安全性
 *
 * @param param 参数名称
 * @param url 目标URL，默认为当前页面URL
 * @returns 参数值（经过XSS过滤），未找到则返回空字符串
 *
 * @example
 * // URL: https://example.com?name=john&age=25
 * getUrlParam('name') // 返回: 'john'
 * getUrlParam('age') // 返回: '25'
 * getUrlParam('notexist') // 返回: ''
 */
export const getUrlParam = (param: string, url?: string) => {
    const u = url || location.href;
    // 正则匹配参数：支持?、&、#后的参数格式
    const reg = new RegExp(`[?&#]${param}=([^&#]+)`, 'gi');

    const matches = u.match(reg);
    let strArr: string[] | undefined;

    if (matches && matches.length > 0) {
        // 取最后一个匹配项（处理参数重复的情况）
        strArr = matches[matches.length - 1].split('=');
        if (strArr && strArr.length > 1) {
            // 过滤XSS字符，确保安全性
            return filterXss(strArr[1] || '');
        }
        return '';
    }
    return '';
};

/**
 * 解析函数字符串并添加额外参数
 *
 * 将函数对象序列化为字符串，然后在函数体末尾添加额外的代码
 * 主要用于动态代码生成和函数增强场景
 *
 * @param func 源函数（函数对象或字符串）
 * @param agrs 需要添加的代码片段数组
 * @returns 解析后的函数对象
 *
 * @example
 * const fn = (x) => { return x * 2; };
 * parseFunction(fn, 'console.log("executed")')
 * // 返回增强后的函数，执行时会额外打印日志
 */
export function parseFunction(func: string | Fn, ...agrs: string[]) {
    let _fn = '';

    // 如果传入的是函数对象，先序列化为字符串
    if (isFunction(func)) {
        _fn = serializeToString(func);
    }

    // 找到函数体的最后一个大括号位置
    const _lastIndex = _fn.lastIndexOf('}');
    if (_lastIndex > 0) {
        // 移除最后的大括号，为添加新代码做准备
        _fn = _fn.slice(0, _lastIndex);
    }

    // 将额外的代码片段添加到函数体中
    agrs.forEach(item => {
        _fn += `;${item}`;
    });

    // 重新解析为函数对象
    return parseSchemas(_fn + '};');
}

/**
 * 根据字段配置数组生成默认值对象
 *
 * 该方法主要用于表单初始化或组件属性默认值设置
 * 支持嵌套对象和多种数据类型的默认值生成
 *
 * 处理逻辑：
 * 1. 优先使用字段显式定义的defaultValue
 * 2. 对于对象类型，支持递归生成子字段默认值
 * 3. 根据字段类型提供合适的默认值
 * 4. 特殊处理JSON字符串解析
 *
 * @param obj 字段配置对象数组，每个对象包含字段的元信息（name、type、defaultValue等）
 * @returns 返回包含所有字段默认值的对象
 *
 * @example
 * const fields = [
 *   { name: 'title', type: 'string', defaultValue: 'Hello' },
 *   { name: 'count', type: 'number' },
 *   { name: 'config', type: 'object', fields: [
 *     { name: 'enabled', type: 'boolean', defaultValue: true }
 *   ]}
 * ];
 * const result = getDefaultValueFromFields(fields);
 * // result: { title: 'Hello', count: 0, config: { enabled: true } }
 */
export function getDefaultValueFromFields(obj: Record<string, any>[]) {
    // 存储最终生成的默认值对象
    const data: Record<string, any> = {};

    // 定义各种数据类型对应的默认值映射
    const defaultValue: Record<string, any> = {
        string: '', // 字符串默认为空字符串
        object: {}, // 对象默认为空对象
        array: [], // 数组默认为空数组
        boolean: false, // 布尔值默认为false
        number: 0, // 数字默认为0
        null: null, // null类型默认为null
        any: undefined // any类型默认为undefined
    };

    // 遍历每个字段配置
    obj.forEach((field: any) => {
        // 情况1：字段显式定义了默认值
        if (typeof field.defaultValue !== 'undefined') {
            // 对于数组类型，如果defaultValue不是数组，则使用空数组
            if (field.type === 'array' && !Array.isArray(field.defaultValue)) {
                data[field.name] = defaultValue.array;
                return;
            }

            // 对于对象类型，如果defaultValue不是对象，需要特殊处理
            if (field.type === 'object' && !isObject(field.defaultValue)) {
                // 如果defaultValue是字符串，尝试JSON解析
                if (typeof field.defaultValue === 'string') {
                    try {
                        data[field.name] = JSON.parse(field.defaultValue);
                    } catch {
                        // JSON解析失败，使用空对象
                        data[field.name] = defaultValue.object;
                    }
                    return;
                }

                // 其他情况使用空对象
                data[field.name] = defaultValue.object;
                return;
            }

            // 直接使用字段定义的默认值
            data[field.name] = field.defaultValue;
            return;
        }

        // 情况2：对象类型但没有显式默认值
        if (field.type === 'object') {
            // 如果有子字段配置，递归生成子对象的默认值；否则使用空对象
            data[field.name] = field.fields ? getDefaultValueFromFields(field.fields || []) : defaultValue.object;
            return;
        }

        // 情况3：有字段类型定义，使用对应类型的默认值
        if (field.type) {
            data[field.name] = defaultValue[field.type];
            return;
        }

        // 情况4：没有类型定义和默认值，设为undefined
        data[field.name] = undefined;
    });

    return data;
}

/**
 * 计算百分比数值
 *
 * 将百分比字符串应用到基础数值上，计算出实际的数值结果
 * 主要用于响应式布局和动态尺寸计算
 *
 * @param value 基础数值
 * @param percentageStr 百分比字符串（如 "50%"）
 * @returns 计算后的数值结果
 *
 * @example
 * calculatePercentage(100, "50%") // 返回: 50
 * calculatePercentage(200, "25%") // 返回: 50
 */
export const calculatePercentage = (value: number, percentageStr: string) => {
    const percentage = globalThis.parseFloat(percentageStr) / 100; // 先将百分比字符串转换为浮点数，并除以100转换为小数
    const result = value * percentage;
    return result;
};

/**
 * 判断值是否为百分比格式
 *
 * 使用正则表达式检查字符串是否符合百分比格式（数字+%）
 * 支持整数和小数格式的百分比
 *
 * @param value 需要检查的值
 * @returns 如果是百分比格式返回true，否则返回false
 *
 * @example
 * isPercentage("50%") // true
 * isPercentage("25.5%") // true
 * isPercentage("50px") // false
 * isPercentage(50) // false
 */
export const isPercentage = (value: number | string) => /^(\d+)(\.\d+)?%$/.test(`${value}`);

/**
 * 将值转换为数字
 *
 * 智能转换各种格式的值为数字：
 * 1. 数字类型直接返回
 * 2. 百分比字符串根据父值计算
 * 3. 其他字符串使用parseFloat转换
 *
 * @param value 需要转换的值
 * @param parentValue 父容器的值，用于百分比计算
 * @returns 转换后的数字
 *
 * @example
 * convertToNumber(100) // 100
 * convertToNumber("50%", 200) // 100
 * convertToNumber("50px") // 50
 */
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
 * 替换或更新节点树中的指定节点
 *
 * 在树形结构中找到指定节点并用新节点替换，支持指定父节点范围
 * 这是节点更新操作的核心函数，用于实现节点的动态更新和替换
 *
 * 工作流程：
 * 1. 通过getNodePath找到目标节点的完整路径
 * 2. 确定目标节点和其父节点
 * 3. 在父节点的children数组中找到目标节点的位置
 * 4. 使用新节点替换原节点
 *
 * @param newNode 新的节点对象
 * @param data 树结构数据数组
 * @param parentId 可选的父节点ID，用于限制搜索范围
 * @throws 如果未找到目标节点或父节点则抛出异常
 *
 * @example
 * const newNode = { field: 'node1', componentName: 'NewComponent' };
 * replaceChildNode(newNode, treeData);
 * // 在treeData中找到field为'node1'的节点并替换
 */
export const replaceChildNode = (newNode: ISchemasNode, data?: ISchemasNode[], parentId?: Id) => {
    // 获取新节点在树中的路径
    const path = getNodePath(newNode.field, data!);
    const node: ISchemasNode = path.pop(); // 目标节点（路径的最后一个）
    let parent: ISchemasNode = path.pop(); // 父节点（路径的倒数第二个）

    // 如果指定了父节点ID，则使用指定的父节点
    if (parentId) {
        parent = getNodePath(parentId, data!).pop();
    }

    // 错误检查
    if (!node) throw new Error('未找到目标节点');
    if (!parent) throw new Error('未找到父节点');

    // 在父节点的children数组中找到目标节点的索引
    const index = parent.children?.findIndex((child: ISchemasNode) => child.field === node.field);

    // 使用新节点替换原节点
    if (index !== undefined && index >= 0) {
        parent.children?.splice(index, 1, newNode);
    }
};

/**
 * 获取节点中需要编译的属性键列表
 *
 * 深度遍历节点对象，找出所有包含模板表达式（${...}格式）的属性
 * 这些属性需要在数据绑定时进行模板编译和依赖收集
 *
 * 使用深度优先搜索算法遍历对象的所有属性：
 * 1. 递归遍历对象的每个属性
 * 2. 对于对象类型的属性值，继续深度遍历
 * 3. 对于字符串类型的属性值，检查是否包含模板语法
 * 4. 记录包含模板语法的属性的完整路径
 *
 * @param node 需要分析的节点对象
 * @returns 返回包含模板表达式的属性键路径数组
 *
 * @example
 * const node = {
 *   componentProps: {
 *     text: '${user.name}',
 *     style: { color: '${theme.color}' }
 *   }
 * };
 * getNeedKey(node) // 返回: ['componentProps.text', 'componentProps.style.color']
 */
export const getNeedKey = (node: ISchemasNode) => {
    const keys: string[] = [];

    /**
     * 深度优先搜索函数
     * @param obj 当前遍历的对象
     * @param path 当前属性路径
     */
    function dfs(obj: Record<string, any>, path = '') {
        for (const key in obj) {
            if (isObject(obj[key])) {
                // 如果属性值是对象，递归遍历
                dfs(obj[key], `${path}${key}.`);
            } else {
                // 如果属性值是基本类型，检查是否包含模板语法
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
 * 编译节点配置
 *
 * 这是数据绑定和模板编译的核心函数，负责：
 * 1. 识别节点中需要编译的属性（包含模板表达式的属性）
 * 2. 对每个需要编译的属性调用编译函数
 * 3. 将编译结果更新回节点对象
 * 4. 处理编译过程中的异常情况
 *
 * 编译过程：
 * - 如果未指定sourceId，则扫描整个节点找出所有模板表达式
 * - 如果指定了sourceId，则只编译指定的属性
 * - 对于每个需要编译的属性，调用compile函数进行转换
 * - 将编译结果写回节点的对应属性位置
 *
 * @param node 需要编译的节点对象
 * @param compile 编译函数，接收属性值和键路径，返回编译后的值
 * @param sourceId 可选的指定属性路径，仅编译该属性
 * @returns 返回编译后的节点对象
 *
 * @example
 * const node = { componentProps: { text: '${user.name}' } };
 * const compiled = compiledNode(node, (value, key) => {
 *   if (value.includes('${')) {
 *     return template(value)({ user: { name: 'John' } });
 *   }
 *   return value;
 * });
 * // compiled.componentProps.text 现在是 'John'
 */
export function compiledNode(
    node: ISchemasNode,
    compile?: (value: any, keyPath?: string) => any,
    sourceId?: Id
) {
    // TODO 整个数据收集部分待优化
    let keys: string[] = [];

    if (!sourceId) {
        // 扫描节点，获取所有需要编译的属性键
        keys = getNeedKey(node);
    } else {
        // 只编译指定的属性
        keys = [sourceId];
    }

    // 逐个编译需要处理的属性
    keys.forEach(key => {
        // 获取属性的当前值
        const value = js_utils_find_attr(node, key);
        let newValue;

        try {
            // 调用编译函数进行转换
            newValue = compile ? compile(value, key) : value;
        } catch (e) {
            // 编译出错时记录错误并使用空字符串
            console.error(e);
            newValue = '';
        }

        // 将编译后的值写回节点对象
        js_utils_edit_attr(key, newValue, node);
    });

    // 注意：暂时注释了子节点的递归编译，避免性能问题
    // if (isArray(node.children)) {
    //     node.children.forEach(item => compiledNode(item, compile, sourceId));
    // }

    return node;
}

/**
 * 向URL添加查询参数
 *
 * 将参数对象添加到当前或指定URL的查询字符串中
 * 支持更新浏览器地址栏和历史记录
 *
 * 功能特性：
 * 1. 自动处理URL解析和参数序列化
 * 2. 支持参数覆盖（同名参数会被新值替换）
 * 3. 可选择是否刷新页面或仅更新历史记录
 * 4. 保持URL的其他部分不变
 *
 * @param obj 要添加的参数对象
 * @param global 全局对象（通常是window），默认为globalThis
 * @param needReload 是否需要刷新页面，默认为true
 *
 * @example
 * // 添加参数并刷新页面
 * addParamToUrl({ page: 1, size: 10 });
 *
 * // 添加参数但不刷新页面（仅更新历史记录）
 * addParamToUrl({ filter: 'active' }, globalThis, false);
 */
export const addParamToUrl = (obj: Record<string, any>, global = globalThis, needReload = true) => {
    // 基于当前URL创建URL对象
    const url = new URL(global.location.href);
    const { searchParams } = url;

    // 将参数对象中的每个键值对添加到URL参数中
    for (const [k, v] of Object.entries(obj)) {
        searchParams.set(k, v);
    }

    // 生成新的URL字符串
    const newUrl = url.toString();

    if (needReload) {
        // 刷新页面到新URL
        global.location.href = newUrl;
    } else {
        // 仅更新浏览器历史记录，不刷新页面
        global.history.pushState({}, '', url);
    }
};

/**
 * 编译条件表达式
 *
 * 根据操作符比较字段值和输入值，返回布尔结果
 * 这是条件渲染和数据过滤的核心函数，支持多种比较操作
 *
 * 支持的操作符：
 * - 相等比较：is, =, not, !=
 * - 数值比较：>, >=, <, <=
 * - 范围比较：between, not_between
 * - 包含关系：include, not_include
 *
 * 特殊处理：
 * - 字符串类型的undefined值会被转换为空字符串进行比较
 * - between操作需要range数组提供范围边界
 * - include操作会检查方法是否存在，避免调用错误
 *
 * @param op 操作符字符串
 * @param fieldValue 字段值（来自数据源）
 * @param inputValue 比较值（来自条件配置）
 * @param range 范围数组，用于between操作
 * @returns 条件比较的布尔结果
 *
 * @example
 * compliedCondition('>', 10, 5) // true
 * compliedCondition('between', 15, null, [10, 20]) // true
 * compliedCondition('include', 'hello world', 'world') // true
 */
export function compliedCondition(op: string, fieldValue: any, inputValue: any, range: number[] = []): boolean {
    // 特殊处理：字符串类型的undefined转为空字符串
    if (isString(fieldValue) && isUnDef(fieldValue)) {
        inputValue = '';
    }

    switch (op) {
        case 'is':
        case '=':
            return fieldValue === inputValue;
        case 'not':
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
            // 检查值是否在指定范围内
            return range.length > 1 && fieldValue >= (range[0] ?? 0) && fieldValue <= (range[1] ?? 0);
        case 'not_between':
            // 检查值是否不在指定范围内
            return range.length < 2 || fieldValue < (range[0] ?? 0) || fieldValue > (range[1] ?? 0);
        case 'include':
            // 检查字段值是否包含输入值
            return fieldValue?.includes?.(inputValue);
        case 'not_include':
            // 检查字段值是否不包含输入值
            return typeof fieldValue === 'undefined' || !fieldValue.includes?.(inputValue);
        default:
            break;
    }
    return false;
}

/**
 * 判断节点是否为页面类型
 *
 * 检查节点对象是否为页面类型的节点
 * 页面节点是树结构的根节点，具有特殊的渲染和管理逻辑
 *
 * @param node 需要检查的节点对象
 * @returns 如果是页面节点返回true，否则返回false
 *
 * @example
 * isPage({ type: NodeType.PAGE, field: 'page1' }) // true
 * isPage({ type: NodeType.CONTAINER, field: 'container1' }) // false
 * isPage(null) // false
 */
export function isPage(node?: ISchemasPage | null): boolean {
    if (!node) return false;
    return Boolean(node.type === NodeType.PAGE);
}

/**
 * 判断节点是否为容器类型
 *
 * 检查节点是否为容器类型，容器节点可以包含其他子节点
 * 支持两种检查方式：
 * 1. 通过节点对象的type属性检查
 * 2. 通过字符串名称检查（名称包含'container'）
 *
 * @param node 需要检查的节点对象或字符串
 * @returns 如果是容器节点返回true，否则返回false
 *
 * @example
 * isContainerNode({ type: NodeType.CONTAINER }) // true
 * isContainerNode('MyContainer') // true
 * isContainerNode('Button') // false
 * isContainerNode(null) // false
 */
export function isContainerNode(node?: ISchemasContainer | null | string): boolean {
    if (!node) return false;

    // 字符串检查：名称包含'container'
    if (isString(node)) {
        return node.toLowerCase().includes('container');
    }

    // 对象检查：type属性为CONTAINER
    return Boolean(node.type === NodeType.CONTAINER);
}
