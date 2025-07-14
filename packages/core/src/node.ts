import type { ISchemasContainer, ISchemasNode, ISchemasPage } from '@quantum-lowcode/schemas';
import { LowCodeRoot } from './app';
import { LowCodePage } from './page';
import { Subscribe, isFunction, isObject, compiledNode, isArray, stringToBoolean } from '@quantum-lowcode/utils';
import {template} from 'lodash-es';
import { compliedConditions } from '@quantum-lowcode/data';

/**
 * 节点构造选项接口
 * 定义创建 LowCodeNode 实例时需要的配置参数
 */
interface INodeOptions {
    config: ISchemasNode | ISchemasContainer; // 节点配置数据
    page?: LowCodePage; // 所属页面实例
    parent?: LowCodeNode; // 父节点实例
    root: LowCodeRoot; // 根应用实例
    init?: boolean; // 是否立即初始化
}

/**
 * 低代码节点类
 *
 * 这是低代码平台中最核心的类之一，负责管理单个节点的完整生命周期。
 * 主要功能包括：
 * 1. 节点数据管理和编译
 * 2. 数据源依赖收集和追踪
 * 3. 事件绑定和处理
 * 4. 生命周期钩子管理
 * 5. 响应式数据更新
 *
 * 继承自 Subscribe 类，具备事件发布订阅能力
 */
export class LowCodeNode extends Subscribe {
    /** 节点的配置数据，包含组件类型、属性、样式等信息 */
    public data: ISchemasNode | ISchemasContainer | ISchemasPage;

    /** 所属页面实例，用于页面级别的操作和数据管理 */
    public page?: LowCodePage;

    /** 父节点实例，用于构建节点树结构 */
    public parent?: LowCodeNode;

    /** 根应用实例，提供全局能力如数据源管理、事件总线等 */
    public root: LowCodeRoot;

    /** 节点对应的组件实例，在组件挂载后由框架注入 */
    public instance?: any;

    /**
     * 构造函数
     *
     * 初始化节点实例，建立节点间的关系，并根据需要立即进行数据编译和事件绑定
     *
     * @param options 节点构造选项
     */
    constructor(options: INodeOptions) {
        super(); // 调用父类构造函数，初始化事件系统

        // 建立节点关系
        this.page = options.page;
        this.parent = options.parent;
        this.root = options.root;
        this.data = options.config;

        // 如果需要立即初始化，则进行数据编译和事件绑定
        if (options.init) {
            this.setData(options.config); // 编译节点数据并收集依赖
            this.setEvents(this.data); // 绑定事件处理器
        }

        // 设置生命周期监听器
        this.listenLifeSafe();
    }

    /**
     * 设置节点数据
     *
     * 这是节点数据更新的核心方法，负责：
     * 1. 编译节点配置中的模板表达式（如 ${dataSource.field}）
     * 2. 处理条件显示逻辑
     * 3. 收集数据源依赖关系
     * 4. 触发数据更新事件
     *
     * @param data 新的节点配置数据
     */
    public setData(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        // 编译节点数据，处理模板表达式和数据绑定
        this.data = this.compileNode(data);

        // 编译条件显示逻辑，收集条件依赖
        this.compileCond(this.data);

        // 发出数据更新事件，通知相关组件重新渲染
        this.emit('update-data');
    }

    /**
     * 编译条件显示逻辑
     *
     * 处理节点的 ifShow 属性，该属性控制节点的显示/隐藏状态。
     * 当 ifShow 中引用了数据源字段时，需要收集这些依赖关系，
     * 以便在数据源变化时能够重新计算显示状态。
     *
     * @param data 节点配置数据
     */
    public compileCond(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        // 只有在页面环境下且存在条件配置时才处理
        if (this.page && isArray(data.ifShow)) {
            // 遍历所有条件配置
            for (const cond of data.ifShow) {
                // 解析条件字段路径：[数据源ID, 字段ID, ...其他路径]
                const [sourceId, fieldId, ..._args] = cond.field;

                if (fieldId) {
                    // 向数据源管理器注册条件依赖
                    // 当对应的数据源字段变化时，会重新计算此节点的显示状态
                    this.root.dataSourceManager?.track(sourceId!, fieldId, {
                        field: this.data.field, // 当前节点ID
                        rawValue: '', // 条件依赖无需原始值
                        key: '', // 条件依赖无需属性键
                        type: 'cond' // 标记为条件依赖
                    });
                }
            }
            if (this.root.dataSourceManager?.data) {
                data.showResult = compliedConditions(data, this.root.dataSourceManager?.data);
            }
        }
    }

    /**
     * 编译节点配置
     *
     * 这是数据绑定的核心方法，负责：
     * 1. 遍历节点配置中的所有属性
     * 2. 识别和解析模板表达式（${dataSource.field} 格式）
     * 3. 收集数据源依赖关系
     * 4. 将模板表达式编译为实际值
     *
     * @param data 节点配置数据
     * @returns 编译后的节点配置
     */
    public compileNode(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        // TODO 整个数据收集部分待优化

        // 使用工具函数递归编译节点，处理所有属性中的模板表达式
        return compiledNode(data, (value, key) => {
            // 只有在页面环境下才收集依赖
            if (this.page) {
                // 提取模板表达式中的路径（去掉 ${} 包装）
                const path = value.replace(/\$\{([^}]+)\}/, '\$1');

                // 解析路径：数据源ID.字段ID.子字段...
                const [sourceId, fieldId, ..._args] = path.split('.');

                // 向数据源管理器注册数据依赖
                // 这样当数据源中对应字段变化时，就能知道需要更新哪些节点
                this.root.dataSourceManager?.track(sourceId, fieldId, {
                    field: this.data.field, // 当前节点ID
                    rawValue: value, // 原始模板表达式
                    key: key!, // 属性键路径（如 componentProps.text）
                    type: 'data' // 标记为数据依赖
                });
            }

            // 编译模板表达式为实际值
            if (typeof value === 'string') {
                // 使用 lodash template 引擎编译模板
                const data = template(value)(this.root.dataSourceManager?.data);
                // 转换字符串布尔值（如 "true" -> true）
                return stringToBoolean(data);
            }
        });
    }

    /**
     * 设置事件处理器
     *
     * 处理节点配置中的事件绑定，支持两种事件绑定方式：
     * 1. 函数式：直接传入事件处理函数
     * 2. 配置式：传入事件配置数组，支持链式事件调用
     *
     * @param config 节点配置数据
     */
    public setEvents(config: ISchemasNode | ISchemasContainer) {
        // 检查组件属性是否存在且为对象
        if (config.componentProps && isObject(config.componentProps)) {
            // 遍历所有组件属性
            for (const [key, val] of Object.entries(config.componentProps)) {
                /**
                 * 事件绑定支持两种方式：
                 *
                 * 方式1 - 函数式（适用于代码模式）：
                 * onClick: (app, e) => { app.emit('datasourceId:funcName', e) }
                 *
                 * 方式2 - 配置式（适用于可视化配置）：
                 * onClick: [
                 *   {field: 'nodeId:funcName', params: {}},
                 *   {field: 'datasourceId:funcName', params: {}}
                 * ]
                 */

                // 处理函数式事件绑定
                if (isFunction(val)) {
                    // 包装原函数，确保第一个参数始终是 root 实例
                    const fn = (...args: any[]) => {
                        val(this.root, ...args);
                    };
                    config.componentProps[key] = fn;
                }
                // 处理配置式事件绑定
                else if (isArray(val) && val[0]?.field) {
                    // 创建事件处理函数，支持链式调用多个事件
                    const fn = () => {
                        for (const item of val) {
                            const { field, params = {} } = item;
                            // 通过全局事件总线触发事件
                            this.root.emit(`${field}`, params);
                        }
                    };
                    config.componentProps[key] = fn;
                }
            }
        }
    }

    /**
     * 销毁节点
     *
     * 清理节点相关的所有资源，包括事件监听器、依赖关系等
     */
    public destroy() {
        this.clear(); // 清理所有事件监听器
    }

    /**
     * 监听生命周期事件
     *
     * 设置节点的生命周期钩子监听器，管理节点从创建到销毁的完整生命周期。
     * 主要处理 'created' 和 'mounted' 两个关键生命周期节点。
     *
     * 私有方法，在构造函数中自动调用
     */
    private listenLifeSafe() {
        // 监听 'created' 生命周期事件（组件实例创建时触发）
        this.once('created', async(instance: any) => {
            // 设置销毁监听器
            this.once('destroy', () => {
                this.instance = null;

                // 如果节点配置中定义了销毁钩子，则执行
                if (isFunction(this.data.destroy)) {
                    this.data.destroy();
                }

                // 重新设置生命周期监听器，为下次使用做准备
                this.listenLifeSafe();
            });

            // 保存组件实例引用
            this.instance = instance;

            // 执行 created 生命周期钩子
            await this.runCode('created');
        });

        // 监听 'mounted' 生命周期事件（组件挂载到DOM后触发）
        this.once('mounted', async(instance: any) => {
            // 保存组件实例引用
            this.instance = instance;

            // 将组件实例暴露的方法注册为全局事件
            // 这样其他节点就可以通过事件系统调用这些方法
            for (const [key, val] of Object.entries(instance)) {
                this.root && this.root.registerEvent(key, val, undefined, this);
            }

            // 执行 mounted 生命周期钩子
            await this.runCode('mounted');
        });
    }

    /**
     * 执行生命周期钩子代码
     *
     * 统一处理生命周期钩子的执行，支持两种钩子定义方式：
     * 1. 函数式：直接定义为函数
     * 2. 配置式：定义为包含 hookData 的配置对象
     *
     * @param hook 生命周期钩子名称（如 'created', 'mounted'）
     * 私有方法，仅在生命周期管理中使用
     */
    private async runCode(hook: string) {
        // 方式1：函数式钩子
        if (isFunction(this.data[hook])) {
            // 直接调用钩子函数，传入当前节点实例
            await this.data[hook](this);
            return;
        }

        // 方式2：配置式钩子
        if (this.data[hook]) {
            // 遍历钩子配置数据，依次执行
            for (const item of this.data[hook].hookData) {
                const { field, params = {} } = item;
                // 通过全局事件总线触发相应事件
                this.root.emit(`${field}`, params);
            }
        }
    }
}
