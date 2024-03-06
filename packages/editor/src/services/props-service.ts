import {
    Subscribe,
    js_is_array,
    js_utils_get_uuid
} from '@qimao/quantum-utils';
import { IPropsState } from '../types';
import { reactive } from 'vue';
import { FormSchema } from '@q-front-npm/vue3-antd-pc-ui';
import { formatConfig, otherConfigMap } from '../utils/props';
import { cloneDeep, mergeWith } from 'lodash-es';
import { ISchemasNode, ISchemasPage, Id } from '@qimao/quantum-schemas';
import { editorService } from './editor-service';
import { getCompType } from '../utils';

class PropsService extends Subscribe {
    private state = reactive<IPropsState>({
        propsConfigMap: {},
        propsValueMap: {},
        relateIdMap: {},
        otherConfigMap: otherConfigMap, // 样式(style), 生命周期(lifeHooks), 显示条件(ifShow)
        tabList: ['props', 'style', 'ifShow', 'lifeHooks'],
    });

    public getPropsTabsList() {
        return [{
            label: '属性',
            value: 'props',
        }, {
            label: '样式',
            value: 'style',
        }, {
            label: '显示条件',
            value: 'ifShow',
        }, {
            label: '高级',
            value: 'lifeHooks',
        }];
    }

    public setPropsConfigs(configs: Record<string, FormSchema[]>) {
        Object.entries(configs).forEach(([key, val]) => {
            this.setPropsConfig(key, val);
        });

        this.emit('props-configs-change');
    }

    public setMethodsConfigs(configs: Record<string, any>) {
        Object.entries(configs).forEach(([key, val]) => {
            this.state.otherConfigMap.methods[key] = val;
        });
    }

    /**
	 * 为指定类型组件设置组件属性表单配置
	 * @param type 组件类型
	 * @param config 组件属性表单配置
	 */
    public setPropsConfig(type: string, config: FormSchema[]) {
        this.state.propsConfigMap[type] = formatConfig(config);
    }

    public getConfig(type: string) {
        if (['style', 'lifeHooks', 'ifShow', 'methods'].includes(type)) {
            return cloneDeep(this.state.otherConfigMap[type]);
        }

        const typeFin = ['page', 'container'].includes(type) ? type[0].toUpperCase() + type.slice(1) : type;

        return cloneDeep(this.state.propsConfigMap[typeFin]);
    }

    public getMethods(node?: ISchemasPage | null) {
        if (!node) {
            return [];
        }
        const methodsKey = Object.keys(this.getConfig('methods') || {}).map(item => item.toLowerCase());
        const list:any[] = [];
        function dfs(node: ISchemasNode) {
            if (methodsKey.includes((node.component || node.type).toLowerCase())) {
                list.push({
                    value: (node.component || node.type) + '&&&' + node.field,
                    label: (node.label || '') + '-' + node.field,
                });
            }
            if (node.children) {
                for (const child of node.children) {
                    dfs(child);
                }
            }
        }
        dfs(node);
        return list;
    }

    public createField(type: string) {
        return `${type}_${js_utils_get_uuid(4)}`;
    }

    public setPropsValues(values: Record<string, Partial<ISchemasNode>>) {
        Object.keys(values).forEach((type: string) => {
            this.setPropsValue(type, values[type]);
        });
    }

    /**
	 * 为指点类型组件设置组件初始值
	 * @param type 组件类型
	 * @param value 组件初始值
	 */
    public setPropsValue(type: string, value: Partial<ISchemasNode>) {
        this.state.propsValueMap[type] = value;
    }

    /**
	 * 获取指定类型的组件初始值
	 * @param type 组件类型
	 * @returns 组件初始值
	 */
    public getInitPropsValue(
        type: string,
        { inputEvent: _inputEvent, ...defaultValue }: Record<string, any> = {}
    ) {
        const field = this.createField(type);
        const defaultPropsValue = this.getDefaultPropsValue(type);
        const data = this.setNewField(
            cloneDeep({
                type: getCompType(type),
                component: !['page', 'container'].includes(type)
                    ? type
                    : undefined,
                ...defaultValue,
            } as any)
        );

        return {
            field,
            ...defaultPropsValue,
            ...mergeWith(
                {},
                cloneDeep(this.state.propsValueMap[type] || {}),
                data
            ),
        };
    }

    /**
	 * 将组件与组件的子元素配置中的id都设置成一个新的ID
	 * 如果没有相同ID并且force为false则保持不变
	 * @param {Object} config 组件配置
	 * @param {Boolean} force 是否强制设置新的ID
	 */
    public setNewField(config: ISchemasNode, force = true) {
        if (force || editorService.getNodeByField(config.field)) {
            const newField = this.createField(config.component || config.type);
            this.setRelateId(config.field, newField);
            config.field = newField;
        }

        if (config.children && js_is_array(config.children)) {
            config.children.forEach((child: ISchemasNode) => {
                this.setNewField(child);
            });
        }
        return config;
    }

    /**
	 * 获取默认属性配置
	 * @param type 组件类型
	 * @returns Object
	 */
    public getDefaultPropsValue(type: string) {
        return ['page', 'container'].includes(type)
            ? {
                type,
                layout: 'absolute',
                style: {},
                label: type,
                children: [],
            }
            : {
                type: 'node',
                component: type,
                style: {},
                label: type,
            };
    }

    public reset() {
        this.state.propsConfigMap = {};
        this.state.propsValueMap = {};
    }

    /**
	 * 替换关联ID
	 * @param originConfigs 原组件配置
	 * @param targetConfigs 待替换的组件配置
	 */
    // public replaceRelateField(originConfigs: ISchemasNode[], targetConfigs:ISchemasNode[]) {
    //     const relateIdMap = this.getRelateIdMap();
    //     if (Object.keys(relateIdMap).length === 0) return;

    // }

    /**
	 * 清除setNewItemId前后映射关系
	 */
    public clearRelateId() {
        this.state.relateIdMap = {};
    }

    public destroy() {
        this.reset();
        this.clear();
    }

    /**
	 * 获取setNewItemId前后映射关系
	 * @param oldId 原组件ID
	 * @returns 新旧ID映射
	 */
    private getRelateIdMap() {
        return this.state.relateIdMap;
    }

    /**
	 * 记录setNewItemId前后映射关系
	 * @param oldId 原组件ID
	 * @param newId 分配的新ID
	 */
    private setRelateId(oldField: Id, newField: Id) {
        this.state.relateIdMap[oldField] = newField;
    }
}
export type { PropsService };

export const propsService = new PropsService();
