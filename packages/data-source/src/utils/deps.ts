import type { FieldToDepMap, IDepData, ILowCodeRoot, ISchemasNode, ISchemasRoot, Id } from '@quantum-lowcode/schemas';
import { getNodePath, isPage, isArray, js_utils_edit_attr } from '@quantum-lowcode/utils';
import { compliedConditions } from './tools';
import type { IDataSourceManagerData } from '../types';

interface ISourceManage {
    app: ILowCodeRoot;
    data: IDataSourceManagerData;
    dataSourceDep: Map<Id, FieldToDepMap>
}

export class IDepEffect implements IDepData {
    public field: Id; // 节点id
    public key: string; // 属性路径
    public rawValue: string; // 原始值
    public type: 'data' | 'cond'; // 依赖类型
    constructor(options: IDepData) {
        this.field = options.field;
        this.key = options.key;
        this.rawValue = options.rawValue;
        this.type = options.type;
    }
}

export function createDep(deps?: IDepEffect[]) {
    const dep = new Set<IDepEffect>(deps);
    return dep;
}

// 收集依赖
export function track(dataSourceDep: Map<Id, FieldToDepMap>, dataSourceId: Id, fieldId: string, data: IDepData) {
    console.log('收集依赖', dataSourceDep, dataSourceId, fieldId, data);
    let depsMap = dataSourceDep.get(dataSourceId);
    if (!depsMap) {
        dataSourceDep.set(dataSourceId, depsMap = new Map());
    }
    let deps = depsMap.get(fieldId);
    if (!deps) {
        depsMap.set(fieldId, (deps = createDep()));
    }
    const dep = new IDepEffect(data);
    // 为了去重
    deps.add(JSON.stringify(dep));
}

// 触发依赖
export function trigger(sourceManage: ISourceManage, dataSourceId: Id, fieldId?: string): ISchemasNode[] {
    console.log('触发依赖', sourceManage, dataSourceId, fieldId);
    const {data, dataSourceDep, app } = sourceManage;
    // 依据 target 获取存储的 map 实例
    const depsMap = dataSourceDep.get(dataSourceId);
    // 如果 map 不存在，则直接 return
    if (!depsMap) {
        return [];
    }
    const nodes = [];
    // fieldId 不穿则更新全部 fieldId
    if (!fieldId) {
        const fields = depsMap.keys();
        for (const key of fields) {
            nodes.push(...trigger(sourceManage, dataSourceId, key));
        }
        return nodes;
    }
    // 依据指定的 key，获取 dep 实例
    const dep = depsMap.get(fieldId);
    if (!dep) {
        return [];
    }
    const effects = isArray(dep) ? dep : [...dep];
    for (let eff of effects) {
        eff = JSON.parse(eff);
        const {key, rawValue, field } = eff as IDepEffect;
        const paths = getNodePath(field, app.schemasRoot?.children || []);
        if (paths.length) {
            const curNode = paths.pop();
            switch (eff.type) {
                case 'data':
                    // 触发数据依赖
                    js_utils_edit_attr(key, rawValue, curNode);
                    break;
                case 'cond':
                    // 触发条件依赖 TODO123
                    curNode.showResult = compliedConditions(curNode, data);
                    break;
                default:
                    break;
            }
            if (isPage(curNode)) {
                app.page.setData(curNode);
            } else {
                const n = app.page.getNode(curNode.field);
                n.setData(curNode);
            }
            nodes.push(curNode);
        } else {
            // 说明依赖已经被删除
            dep.delete(field);
        }
    }
    return nodes;
}
