import { reactive } from 'vue';
import { IEditorNodeInfo, IStoreState, IStoreStateKey } from '../types';
import { ISchemasNode, ISchemasPage, Id, NodeType } from '@qimao/quantum-core';
import { get_node_path, js_is_array, js_is_object, Subscribe } from '@qimao/quantum-utils';
import { isString } from 'lodash-es';
import { BoxCore } from '@qimao/quantum-sandbox';
import { setSchemasRoot } from '../utils';

class EditorService extends Subscribe {
    public state = reactive<IStoreState>({
        root: null,
        sandbox: null,
        page: null,
        node: null,
        nodes: [],
        parent: null,
    });

    /**
     * 设置当前指点节点配置
     * @param name 'root' | 'page' | 'parent' | 'node' | 'highlightNode' | 'nodes' | 'stage' | 'modifiedNodeIds' | 'pageLength'
     * @param value IScheamsNode
     */
    public set<K extends IStoreStateKey, V extends IStoreState[K]>(key: K, value: V) {
        const preValue = this.state[key];
        this.state[key] = value;

        // set nodes时将node设置为nodes第一个元素
        if (key === 'nodes' && Array.isArray(value)) {
            this.set('node', value[0]);
        }

        if (key === 'root') {
            // TODO delete 为了一期简化用户输入, 后续会删除;
            const _value = setSchemasRoot(value);
            if (_value) {
                value = _value as any;
            }
            if (js_is_array(value)) {
                throw new Error('root 不能为数组');
            }
            if (value && js_is_object(value) && !(value instanceof BoxCore) && !(value instanceof Map)) {
                this.state.pageLength = value.children?.length || 0;
            } else {
                this.state.pageLength = 0;
            }
            // this.root_change_handler(value, preValue);
            this.emit('root-change', value, preValue);
        }
    }
    public get<K extends IStoreStateKey>(key: K) {
        console.log('key', this.state);
        return this.state[key];
    }
    /**
     * 根据field和type获取组件、组件的父组件以及组件所属的页面节点
     * @param {number | string} id 组件id
     * @returns {EditorNodeInfo}
     */
    public getNodeInfo(field: Id): IEditorNodeInfo {
        const root = this.get(NodeType.ROOT);
        const info:IEditorNodeInfo = {
            node: null,
            parent: null,
            page: null,
        };
        if (!root) return info;
        if (field === root.type) {
            info.node = root;
            return info;
        }
        const path = get_node_path(field, root.children);
        console.log('path', path, info);
        if (!path.length) return info;
        // 插入根节点
        path.unshift(root);
        info.node = path[path.length - 1];
        info.parent = path[path.length - 2];
        for (const item of path) {
            console.log(item);
            if (item.type === NodeType.PAGE) {
                info.page = item;
                break;
            }
        }
        console.log('path', path, info);
        return info;
    }

    public async select(config:ISchemasNode | Id | ISchemasPage){
        let field = '';
        if (isString(config)) {
            field = config;
        } else {
            field = config.field;
        }
        const {node, page, parent, } = this.getNodeInfo(field);
        this.set('nodes', node ? [node as ISchemasNode] : []);
        this.set('page', page);
        this.set('parent', parent);
        // if (page) {

        // }
    }

    public reset() {
        this.set('node', null);
        this.set('root', null);
        this.set('nodes', []);
        this.set('page', null);
        this.set('sandbox', null);
        this.set('pageLength', 0);
        this.set('parent', null);
    }
}
export type {EditorService};

export const editorService = new EditorService();

