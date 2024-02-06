import { reactive, toRaw } from 'vue';
import {
    IEditorNodeInfo,
    ILayout,
    IStoreState,
    IStoreStateKey
} from '../types';
import {
    ISchemasContainer,
    ISchemasNode,
    ISchemasPage,
    Id,
    NodeType
} from '@qimao/quantum-schemas';
import {
    getNodePath,
    isFixed,
    js_is_array,
    js_is_object,
    Subscribe
} from '@qimao/quantum-utils';
import { BoxCore } from '@qimao/quantum-sandbox';
import { historyService } from './history-service';

class EditorService extends Subscribe {
    public state = reactive<IStoreState>({
        root: null,
        sandbox: null,
        page: null,
        node: null,
        nodes: [],
        parent: null,
        disabledMultiSelect: false,
        highlightNode: null,
        pageLength: 0,
    });

    /**
	 * 设置当前指点节点配置
	 * @param name 'root' | 'page' | 'parent' | 'node' | 'highlightNode' | 'nodes' | 'stage' | 'modifiedNodeIds' | 'pageLength'
	 * @param value IScheamsNode
	 */
    public set<K extends IStoreStateKey, V extends IStoreState[K]>(
        key: K,
        value: V
    ) {
        const preValue = this.state[key];
        this.state[key] = value;

        // set nodes时将node设置为nodes第一个元素
        if (key === 'nodes' && Array.isArray(value)) {
            this.set('node', value[0]);
        }

        if (key === 'root') {
            if (js_is_array(value)) {
                throw new Error('root 不能为数组');
            }
            if (
                value &&
				js_is_object(value) &&
				!(value instanceof BoxCore) &&
				!(value instanceof Map)
            ) {
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
    public getNodeInfo(field: Id, raw = true): IEditorNodeInfo {
        let root = this.get(NodeType.ROOT);
        if (raw) {
            root = toRaw(root);
        }

        const info: IEditorNodeInfo = {
            node: null,
            parent: null,
            page: null,
        };
        if (!root) return info;
        if (field === root.type) {
            info.node = root as any;
            return info;
        }
        const path = getNodePath(field, root.children);
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

    /**
	 * 根据ID获取指点节点配置
	 * @param id 组件ID
	 * @param {boolean} raw 是否使用toRaw
	 * @returns 组件节点配置
	 */
    public getNodeByField(id: Id, raw = true): ISchemasNode | null {
        const { node, } = this.getNodeInfo(id, raw);
        return node as ISchemasNode;
    }

    /**
	 * 根据ID获取指点节点的父节点配置
	 * @param id 组件ID
	 * @param {boolean} raw 是否使用toRaw
	 * @returns 指点组件的父节点配置
	 */
    public getParentByField(id: Id, raw = true): ISchemasContainer | null {
        const { parent, } = this.getNodeInfo(id, raw);
        return parent;
    }

    /**
	 * 只有容器拥有布局
	 */
    public async getLayout(
        parent: ISchemasNode,
        node?: ISchemasNode | null
    ): Promise<ILayout> {
        if (
            node &&
			typeof node !== 'function' &&
			node.style &&
			isFixed(node.style!)
        )
            return ILayout.FIXED;

        if (parent.layout) {
            return parent.layout;
        }

        // 如果该节点没有设置position，则认为是流式布局，例如获取root的布局时
        if (js_is_object(parent.style) && !(parent.style as any)?.position) {
            return ILayout.RELATIVE;
        }

        return ILayout.ABSOLUTE;
    }

    public async select(config: ISchemasNode | Id | ISchemasPage) {
        const { node, page, parent, } = this.selectedConfigExceptionHandler(
            config as ISchemasNode
        );
        this.set('nodes', node ? [node as ISchemasNode] : []);
        this.set('page', page);
        this.set('parent', parent);

        if (page) {
            historyService.changePage(toRaw(page));
        } else {
            historyService.resetState();
        }

        if ((node as ISchemasNode).field) {
            const app = this.get('sandbox')?.renderer?.runtime?.getApp?.();
            app?.page?.emit(
                'editor:select',
                { node, page, parent, },
                getNodePath(
                    (node as ISchemasNode).field,
                    this.get('root')?.children || []
                )
            );
        }

        this.emit('select', node);

        return node;
    }

    /**
	 * 高亮指定节点
	 * @param config 指定节点配置或者ID
	 * @returns 当前高亮的节点配置
	 */
    public highlight(config: ISchemasNode | Id): void {
        const { node, } = this.selectedConfigExceptionHandler(config);
        const currentHighlightNode = this.get('highlightNode');
        if (currentHighlightNode === node) return;
        this.set('highlightNode', node as ISchemasNode);
    }

    // 更新逻辑
    public update() {}

    public reset() {
        this.set('node', null);
        this.set('root', null);
        this.set('nodes', []);
        this.set('page', null);
        this.set('sandbox', null);
        this.set('pageLength', 0);
        this.set('parent', null);
    }
    private selectedConfigExceptionHandler(
        config: ISchemasNode | Id
    ): IEditorNodeInfo {
        let id: Id;
        if (typeof config === 'string' || typeof config === 'number') {
            id = config;
        } else {
            id = config.field;
        }
        if (!id) {
            throw new Error('没有ID，无法选中');
        }

        const { node, parent, page, } = this.getNodeInfo(id);
        if (!node) throw new Error('获取不到组件信息');

        if (node.type === 'root') {
            throw new Error('不能选根节点');
        }
        return {
            node,
            parent,
            page,
        };
    }
}
export type { EditorService };

export const editorService = new EditorService();
