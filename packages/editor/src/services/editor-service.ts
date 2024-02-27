import { reactive, toRaw } from 'vue';
import {
    IEditorNodeInfo,
    Layout,
    IStoreState,
    IStoreStateKey,
    StepValue,
    IAddNode
} from '../types';
import {
    ISchemasContainer,
    ISchemasNode,
    ISchemasPage,
    ISchemasRoot,
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
import { cloneDeep, mergeWith, uniq } from 'lodash-es';
import { isPage } from '../utils';
import {
    change2Fixed,
    fixNodePosition,
    fixed2Other,
    getInitPositionStyle,
    getNodeIndex,
    setChildrenLayout
} from '../utils/editor';
import { propsService } from './props-service';

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
    private isHistoryStateChange = false;

    /**
	 * 设置当前指点节点配置
	 * @param name 'root' | 'page' | 'parent' | 'node' | 'highlightNode' | 'nodes' | 'sandbox' | 'modifiedNodeFields' | 'pageLength'
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
            // this.rootChangeHandler(value, preValue);
            this.emit('root-change', value, preValue);
        }
    }
    public get<K extends IStoreStateKey>(key: K): IStoreState[K] {
        return this.state[key] as IStoreState[K];
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
        if (field === root.type || field === 'app') {
            info.node = root as any;
            return info;
        }
        const path = getNodePath(field, root.children);
        if (!path.length) return info;
        // 插入根节点
        path.unshift(root);
        info.node = path[path.length - 1];
        info.parent = path[path.length - 2];
        for (const item of path) {
            if (item.type === NodeType.PAGE) {
                info.page = item;
                break;
            }
        }
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
        return node;
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
    ): Promise<Layout> {
        if (
            node &&
			typeof node !== 'function' &&
			node.style &&
			isFixed(node.style as CSSStyleDeclaration)
        )
            return Layout.FIXED;

        if (parent.layout) {
            return parent.layout;
        }

        // 如果该节点没有设置position，则认为是流式布局，例如获取root的布局时
        if (js_is_object(parent.style) && !(parent.style as any)?.position) {
            return Layout.RELATIVE;
        }

        return Layout.ABSOLUTE;
    }

    /**
	 * 选中指定节点（将指定节点设置成当前选中状态）
	 * @param config 指定节点配置或者ID
	 * @returns 当前选中的节点配置
	 */
    public async select(config: ISchemasNode | Id | ISchemasPage) {
        const { node, page, parent, } = this.selectedConfigExceptionHandler(config);
        this.set('nodes', node ? [node] : []);
        this.set('page', page);
        this.set('parent', parent);

        if (page) {
            historyService.changePage(toRaw(page));
        } else {
            historyService.reset();
        }

        if (node?.field) {
            const app = this.get('sandbox')?.renderer?.runtime?.getApp?.();
            app?.page?.emit(
                'editor:select',
                { node, page, parent, },
                getNodePath(
                    (node).field,
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
        this.set('highlightNode', node);
    }

    /**
	 * 多选
	 * @param ids 指定节点ID
	 * @returns 加入多选的节点配置
	 */
    public multiSelect(ids: Id[]): void {
        const nodes: ISchemasNode[] = [];
        const idsUnique = uniq(ids);
        idsUnique.forEach((id) => {
            const { node, } = this.getNodeInfo(id);
            if (!node) return;
            nodes.push(node);
        });
        this.set('nodes', nodes);
    }

    public selectRoot() {
        const root = this.get('root');
        if (!root) return;

        this.set('nodes', [root]);
        this.set('parent', null);
        this.set('page', null);
        this.set('sandbox', null);
        this.set('highlightNode', null);
    }

    public async addHelper(
        node: ISchemasNode | ISchemasPage,
        parent: ISchemasContainer
    ): Promise<ISchemasNode> {
        const root = this.get('root');
        if (!root) throw new Error('root为空');

        const curNode = this.get('node');
        const sandbox = this.get('sandbox');

        if (!curNode) throw new Error('当前选中节点为空');

        if ((parent.type === NodeType.ROOT || curNode?.type === NodeType.ROOT) && !isPage(node as ISchemasPage)) {
            throw new Error('app下不能添加组件');
        }

        if (parent.field !== curNode.field && !isPage(node as ISchemasPage)) {
            const index = parent.children.indexOf(curNode);
            parent.children?.splice(index + 1, 0, node);
        } else {
            // 新增节点添加到配置中
            parent.children?.push(node);
        }

        const layout = await this.getLayout(toRaw(parent) as any, node);
        node.style = getInitPositionStyle(node.style, layout);

        await sandbox?.add({
            config: cloneDeep(node),
            parent: cloneDeep(parent),
            parentId: parent.field,
            root: cloneDeep(root),
        });

        const newStyle = fixNodePosition(node, parent, sandbox);

        if (newStyle && (newStyle.top !== node.style?.top || newStyle.left !== node.style?.left)) {
            node.style = newStyle;
            await sandbox?.update({ config: cloneDeep(node), parentId: parent.field, root: cloneDeep(root), });
        }

        this.addModifiedNodeField(node.field);

        return node;
    }

    public async add(
        addNode: ISchemasNode[] | IAddNode,
        parent?: ISchemasContainer | null
    ) {
        const sandbox = this.get('sandbox');

        // 新增多个组件只存在于粘贴多个组件,粘贴的是一个完整的config,所以不再需要getPropsValue
        const addNodes = [];
        if (js_is_array(addNode)) {
            addNodes.push(...addNode);
        } else {
            const { type, inputEvent: _inputEvent, ...config } = addNode;
            if (!type) throw new Error('组件类型不能为空');
            addNodes.push({
                ...toRaw(await propsService.getInitPropsValue(type, config)),
            });
        }

        const newNodes = await Promise.all(
            addNodes.map((node) => {
                const root = this.get('root');
                if (isPage(node) && root) {
                    return this.addHelper(node, root);
                }
                const parentNode =
					parent && typeof parent !== 'function' ? parent : this.getAddParent(node);
                if (!parentNode) throw new Error('未找到父元素');
                return this.addHelper(node, parentNode);
            })
        );

        if (newNodes.length > 1) {
            const newNodeFields = newNodes.map((node) => node.field);
            // 触发选中样式
            sandbox?.multiSelect(newNodeFields);
            await this.multiSelect(newNodeFields);
        } else {
            await this.select(newNodes[0]);

            if (isPage(newNodes[0] as ISchemasPage)) {
                this.state.pageLength += 1;
            } else {
                // 新增页面，这个时候页面还有渲染出来，此时select会出错，在runtime-ready的时候回去select
                sandbox?.select(newNodes[0].field);
            }
        }

        if (!isPage(newNodes[0] as ISchemasPage)) {
            this.pushHistoryState();
        }

        this.emit('add', newNodes);

        return Array.isArray(addNode) ? newNodes : newNodes[0];
    }

    public async updateHelper(config: ISchemasNode) {
        const root = this.get('root');
        if (!root) throw new Error('root为空');
        if (!config.field) throw new Error('field 为空');

        const info = this.getNodeInfo(config.field, false);

        if (!info.node) throw new Error(`获取不到field为${config.field}的节点`);

        const node = cloneDeep(toRaw(info.node));

        let newConfig = await this.toggleFixedPosition(
            toRaw(config),
            node,
            root as ISchemasRoot
        );

        newConfig = mergeWith(cloneDeep(node), newConfig, (objVal, srcVal) => {
            if (srcVal?.events) {
                return srcVal;
            }
            if (js_is_object(srcVal) && js_is_array(objVal)) {
                // 原来的配置是数组，新的配置是对象，则直接使用新的值
                return srcVal;
            }
            if (js_is_array(srcVal)) {
                return srcVal;
            }
        });

        if (!(newConfig.type || newConfig.component))
            throw new Error('配置缺少type值 或 component');

        if (newConfig.type === NodeType.ROOT) {
            this.set('root', newConfig as ISchemasRoot);
            return newConfig;
        }

        const { parent, } = info;
        if (!parent) throw new Error('获取不到父级节点');

        const parentNodeChildren = parent.children;
        const index = getNodeIndex(newConfig.field, parent);

        if (!parentNodeChildren || typeof index === 'undefined' || index === -1)
            throw new Error('更新的节点未找到');

        const newLayout = await this.getLayout(newConfig);
        const layout = await this.getLayout(node);
        if (js_is_array(newConfig.children) && newLayout !== layout) {
            newConfig = setChildrenLayout(newConfig, newLayout);
        }

        parentNodeChildren[index] = newConfig;

        // 将update后的配置更新到nodes
        const nodes = this.get('nodes') || [];
        const targetIndex = nodes?.findIndex(
            (nodeItem: ISchemasNode) =>
                `${nodeItem.field}` === `${newConfig.field}`
        );
        nodes?.splice(targetIndex, 1, newConfig);
        this.set('nodes', [...(nodes as any)]);

        this.get('sandbox')?.update({
            config: cloneDeep(newConfig),
            parentId: parent.field,
            root: cloneDeep(root),
        });

        if (isPage(newConfig as ISchemasPage)) {
            this.set('page', newConfig as ISchemasPage);
        }

        this.addModifiedNodeField(newConfig.field);

        return newConfig;
    }

    /**
	 * 更新节点
	 * @param config 新的节点配置，配置中需要有 field信息
	 * @returns 更新后的节点配置
	 */
    public async update(
        config: ISchemasNode | ISchemasNode[]
    ): Promise<ISchemasNode | ISchemasNode[]> {
        const nodes = js_is_array(config) ? config : [config];

        const newNodes = await Promise.all(
            nodes.map((node) => this.updateHelper(node))
        );

        if (newNodes[0]?.type !== NodeType.ROOT) {
            this.pushHistoryState();
        }

        this.emit('update', newNodes);
        return js_is_array(config) ? newNodes : newNodes[0];
    }

    // TODO
    public async deleteHelper() {}

    public async delete(
        nodeOrNodeList: ISchemasNode | ISchemasNode[]
    ): Promise<void> {
        const nodes = js_is_array(nodeOrNodeList)
            ? nodeOrNodeList
            : [nodeOrNodeList];

        await Promise.all(nodes.map((node) => this.deleteHelper));

        if (!isPage(nodes[0] as ISchemasPage)) {
            // 更新历史记录
            this.pushHistoryState();
        }
    }

    public async sort(field1: Id, field2: Id) {
        const root = this.get('root');
        if (!root) throw new Error('root为空');

        const node = this.get('node');
        if (!node) throw new Error('未获取到节点');

        const parent = cloneDeep(toRaw(this.get('parent')));
        if (!parent) throw new Error('未找到页面');

        const index2 = parent.children.findIndex((node) => node.field === field2);

        if (index2 < 0) return;
        const index1 = parent.children.findIndex(node => node.field === field1);

        parent.children.splice(index2, 0, ...parent.children.splice(index1, 1));

        await this.update(parent);
        await this.select(node);

        this.get('sandbox')?.update({
            config: cloneDeep(node),
            parentId: parent.field,
            root: cloneDeep(root),
        });

        this.addModifiedNodeField(parent.field);
        this.pushHistoryState();
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

    public async undo() {
        const val = historyService.undo();
        await this.changeHistoryState(val);
        return val;
    }

    public async redo() {
        const val = historyService.redo();
        await this.changeHistoryState(val);
        return val;
    }

    private async pushHistoryState() {
        const curNode = cloneDeep(toRaw(this.get('node')));
        const page = this.get('page');
        if (!this.isHistoryStateChange && curNode && page) {
            historyService.push({
                data: cloneDeep(toRaw(page)),
                modifiedNodeFields: this.get('modifiedNodeFields')!,
                nodeField: curNode.field,
            });
        }
        this.isHistoryStateChange = false;
    }

    private async changeHistoryState(val: StepValue | null): Promise<void> {
        if (!val) return;

        this.isHistoryStateChange = true;

        await this.update(val.data);

        this.set('modifiedNodeFields', val.modifiedNodeFields);

        setTimeout(async() => {
            if (!val.nodeField) return;
            await this.select(val.nodeField);
            this.get('sandbox')?.select(val.nodeField);
        }, 0);
        this.emit('history-change', val.data);
    }

    private async toggleFixedPosition(
        dist: ISchemasNode,
        src: ISchemasNode,
        root: ISchemasRoot
    ) {
        const newConfig = cloneDeep(dist);

        if (newConfig.style?.position) {
            if (
                isFixed(newConfig.style as CSSStyleDeclaration) &&
				!isFixed(src.style as CSSStyleDeclaration)
            ) {
                newConfig.style = change2Fixed(newConfig, root) as any;
            } else if (
                !isFixed(newConfig.style as CSSStyleDeclaration) &&
				isFixed(src.style as CSSStyleDeclaration)
            ) {
                newConfig.style = (await fixed2Other(
                    newConfig,
                    root,
                    this.getLayout
                )) as any;
            }
        }

        return newConfig;
    }

    private addModifiedNodeField(field: Id) {
        if (!this.isHistoryStateChange) {
            this.get('modifiedNodeFields')?.set(field, field);
        }
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

    private getAddParent(node: ISchemasNode | ISchemasPage) {
        const curNode = this.get('node');
        let parentNode;

        if (isPage(node as ISchemasPage)) {
            parentNode = this.get('root');
        } else if (curNode?.children) {
            parentNode = curNode as ISchemasContainer;
        } else if (curNode?.field) {
            parentNode = this.getParentByField(curNode.field, false);
        }

        return parentNode;
    }
}
export type { EditorService };

export const editorService = new EditorService();
