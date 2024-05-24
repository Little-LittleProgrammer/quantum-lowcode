import { reactive, toRaw } from 'vue';
import {
    IEditorNodeInfo,
    Layout,
    IStoreState,
    IStoreStateKey,
    StepValue,
    IAddNode,
    IPastePosition,
    LayerOffset
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
    isPage,
    js_is_array,
    js_is_empty,
    js_is_number,
    js_is_object,
    Subscribe
} from '@qimao/quantum-utils';
import { BoxCore } from '@qimao/quantum-sandbox';
import { calcValueByDesignWidth } from '@qimao/quantum-utils';
import { historyService } from './history-service';
import { cloneDeep, mergeWith, uniq } from 'lodash-es';
import {
    COPY_STORAGE_KEY,
    change2Fixed,
    fixNodePosition,
    fixed2Other,
    getInitPositionStyle,
    getNodeIndex,
    setChildrenLayout,
    setLayout
} from '../utils/editor';
import { propsService } from './props-service';
import { Protocol, storageService } from './storage-serivce';

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
    public getLayout(
        parent: ISchemasNode,
        node?: ISchemasNode | null
    ): Layout {
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
        if ((!(parent.style as any)?.position) || parent.style?.position === 'relative') {
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

        const layout = this.getLayout(toRaw(parent) as any, node);
        node.style = getInitPositionStyle(node.style, layout);

        await sandbox?.add({
            config: cloneDeep(node),
            parent: cloneDeep(parent),
            parentId: parent.field,
            root: cloneDeep(root),
        });

        let newStyle = fixNodePosition(node, parent, sandbox) || {} as Partial<CSSStyleDeclaration>

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

        config = this.dealText(config)

        let newConfig = await this.toggleFixedPosition(
            toRaw(config),
            node,
            root as ISchemasRoot
        );

        newConfig = mergeWith(cloneDeep(node), newConfig, (objVal, srcVal) => {
            if (srcVal?.events || srcVal?.backgroundSize) {
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

        const newLayout = this.getLayout(newConfig);
        const layout = this.getLayout(node);
        console.log('layout', newLayout, layout);
        console.log('newConfig', newConfig);
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
        console.log('editorService.update')
        const nodes = js_is_array(config) ? config : [config];
        const newNodes = await Promise.all(
            nodes.map((node) => this.updateHelper(node))
        );

        if (newNodes[0]?.type !== NodeType.ROOT) {
            this.pushHistoryState();
        }

        // this.updateHandler();
        this.emit('update', newNodes);
        return js_is_array(config) ? newNodes : newNodes[0];
    }

    public async deleteHelper(node: ISchemasNode) {
        const root = this.get('root');
        if (!root) throw new Error('root为空');

        const {parent, node: curNode, } = this.getNodeInfo(node.field, false);

        if (!parent || !curNode) throw new Error('找不要删除的节点');

        const index = getNodeIndex(curNode.field, parent);

        if (!js_is_number(index) || index < 0) throw new Error('找不要删除的节点');

        parent.children?.splice(index, 1);

        const sandbox = this.get('sandbox');
        sandbox?.delete({id: node.field, parentId: parent.field, root: cloneDeep(root), });

        const selectDefault = async(pages: ISchemasNode[]) => {
            if (pages[0]) {
                await this.select(pages[0]);
                sandbox?.select(pages[0].field);
            } else {
                this.selectRoot();

                historyService.resetPage();
            }
        };

        const rootChild = root.children;

        if (isPage(node)) {
            this.set('pageLength', this.get('pageLength') - 1);

            await selectDefault(rootChild);
        } else {
            await this.select(parent);
            sandbox?.select(parent.field);

            this.addModifiedNodeField(parent.field);
        }

        if (!rootChild.length) {
            this.resetModifiedNodeFields();
            historyService.reset();
        }
    }

    public async delete(
        nodeOrNodeList: ISchemasNode | ISchemasNode[]
    ): Promise<void> {
        const nodes = js_is_array(nodeOrNodeList)
            ? nodeOrNodeList
            : [nodeOrNodeList];

        await Promise.all(nodes.map((node) => this.deleteHelper(node)));

        if (!isPage(nodes[0] as ISchemasPage)) {
            // 更新历史记录
            this.pushHistoryState();
        }
        this.emit('remove', nodes);
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

    /**
     * 将组件节点配置存储到localStorage中
     * @param config 组件节点配置
     */
    public copy(config: ISchemasNode | ISchemasNode[]) {
        storageService.setItem(COPY_STORAGE_KEY, js_is_array(config) ? config : [config], {
            protocol: Protocol.OBJECT,
        });
    }

    public pasteHelper(config: ISchemasNode[], position: IPastePosition = {}) {
        propsService.clearRelateId();
        const pasteConfigs = this.beforePaste(position, cloneDeep(config));
        return pasteConfigs;
    }

    /**
     * 从localStorage中获取节点，然后添加到当前容器中
     * @param position 粘贴的坐标
     * @returns 添加后的组件节点配置
     */
    public paste(position: IPastePosition = {}) {
        const config = storageService.getItem(COPY_STORAGE_KEY);
        if (!js_is_array(config)) return;

        const node = this.get('node');

        let parent:ISchemasContainer|null = null;
        // 粘贴的组件为当前选中组件的副本时，则添加到当前选中组件的父组件中
        if (config.length === 1 && config[0].field === node?.field) {
            parent = this.get('parent')!;
            if (parent?.type === NodeType.ROOT) {
                parent = this.get('page')!;
            }
        }

        const pasteConfigs = this.pasteHelper(config, position);
        return this.add(pasteConfigs, parent);
    }

    public resetModifiedNodeFields() {
        this.get('modifiedNodeFields')?.clear();
    }

    /**
     * 移动当前选中节点位置
     * @param offset 偏移量
     */
    public moveLayer(offset: number | LayerOffset) {
        const root = this.get('root');
        if (!root) throw new Error('root为空');

        const parent = this.get('parent');
        if (!parent) throw new Error('父节点为空');

        const node = this.get('node');
        if (!node) throw new Error('当前节点为空');

        const brothers: ISchemasNode[] = parent.children || [];
        const index = brothers.findIndex((item) => `${item.field}` === `${node?.field}`);

        // 流式布局与绝对定位布局操作的相反的
        const layout = this.getLayout(parent, node);
        const isRelative = layout === Layout.RELATIVE;

        let offsetIndex: number;
        if (offset === LayerOffset.TOP) {
            offsetIndex = isRelative ? 0 : brothers.length;
        } else if (offset === LayerOffset.BOTTOM) {
            offsetIndex = isRelative ? brothers.length : 0;
        } else {
            offsetIndex = index + (isRelative ? -offset : offset);
        }

        if ((offsetIndex > 0 && offsetIndex > brothers.length) || offsetIndex < 0) {
            return;
        }
        brothers.splice(index, 1);
        brothers.splice(offsetIndex, 0, node);

        const grandparent = this.getParentByField(parent.field);

        this.get('sandbox')?.update({
            config: cloneDeep(toRaw(parent)),
            parentId: grandparent?.field,
            root: cloneDeep(root),
        });

        this.addModifiedNodeField(parent.field);
        this.pushHistoryState();

        this.emit('move-layer', offset);
    }

    /**
     * 移到指定容器, sandbox触发
     * @param config 节点信息
     * @param targetField 目标容器
     * @returns void
     */
    public async moveToContainer(config: ISchemasNode, targetField: Id) {
        const root = this.get('root');
        const {node, parent} = this.getNodeInfo(config.field, false);
        const targetContainer = this.getNodeByField(targetField) as ISchemasNode;

        const sandbox = this.get('sandbox');
        if (root && node && parent &&sandbox) {
            const index = getNodeIndex(node.field, parent);
            parent.children.splice(index, 1);

            await sandbox.delete({id: node.field, parentId: parent.field, root:cloneDeep(root)});
            const layout = this.getLayout(targetContainer);

            const newConfig = mergeWith(cloneDeep(node), config, (o,n) => {
                if (js_is_array(n)) {
                    return n
                }
            })

            newConfig.style = getInitPositionStyle(newConfig.style, layout) as any;
            targetContainer.children?.push(newConfig);

            await sandbox.select(targetField);

            const targetParent = this.getParentByField(targetContainer.field);

            await sandbox.update({
                config: cloneDeep(toRaw(targetContainer)),
                parentId: targetParent?.field,
                root: cloneDeep(root),
            });

            await this.select(newConfig);
            sandbox.select(newConfig.field);

            this.addModifiedNodeField(targetContainer.field);
            this.addModifiedNodeField(parent.field);
            this.pushHistoryState();
      
            return newConfig;
        }
    }

    public alignCenterHelper(config: ISchemasNode) {
        const parent = this.getNodeByField(config.field);

        if (!parent) throw new Error('找不到父节点');

        const node = cloneDeep(toRaw(config));
        const layout = this.getLayout(parent, node);
        if (layout === Layout.RELATIVE) {
            return config;
        }
        if (!node.style) return config;

        const sandbox = this.get('sandbox');
        const doc = sandbox?.renderer.contentWindow?.document;

        if (doc) {
            const el = doc.getElementById(node.field);
            const parentEl = layout === Layout.FIXED ? doc.body : el?.offsetParent;
            if (parentEl && el) {
                node.style.left = calcValueByDesignWidth(doc, (parentEl.clientWidth - el.clientWidth) / 2, editorService.get('root')?.designWidth);
                node.style.right = '';
            } else if (parent.style && js_is_number(parent.style?.width) && js_is_number(node.style?.width)) {
                node.style.left = (parent.style.width - node.style.width) / 2
                node.style.right = '';
            }
        }
        return node;
    }

    /**
     * 将指点节点设置居中
     * @param config 组件节点配置
     * @returns 当前组件节点配置
     */
    public async alignCenter(config:ISchemasNode | ISchemasNode[]) {
        const nodes = js_is_array(config) ? config : [config];
        const sandbox = this.get('sandbox');

        const newNodes = nodes.map((node) => {
            return this.alignCenterHelper(node);
        });

        const newNode = await this.update(newNodes);

        if (newNodes.length > 1) {
            await sandbox?.multiSelect(newNodes.map((node) => node.id));
        } else {
            await sandbox?.select(newNodes[0].id);
        }

        return newNode;
    }

    public dragTo(config: ISchemasNode, newParent: ISchemasContainer, newIndex: number) {
        if (!newParent ) {
            return;
        }
        if (!js_is_array(newParent.children)) {
            newParent.children = []
        };
        const { parent, node: curNode } = this.getNodeInfo(config.field, false);
        if (!parent || !curNode) throw new Error('找不要删除的节点');
    
        const index = getNodeIndex(curNode.field, parent);

        if (typeof index !== 'number' || index === -1) throw new Error('找不要删除的节点');

        if (parent.field === newParent.field) {
            if (index === newIndex) return;
            if (index < newIndex) {
                newIndex -=1;
            }
        }

        const layout = this.getLayout(parent);
        const newLayout = this.getLayout(newParent);

        if (layout !== newLayout) {
            setLayout(config, newLayout);
        }

        parent.children?.splice?.(index, 1);

        newParent.children.splice(newIndex, 0, config);

        const page = this.get('page');
        const root = this.get('root');
        const sandbox = this.get('sandbox');
        if (sandbox && page && root) {
            sandbox.update({
                config: cloneDeep(page),
                parentId: root.field,
                root: cloneDeep(root)
            })
        }

        this.addModifiedNodeField(config.field);
        this.addModifiedNodeField(parent.field);
        this.pushHistoryState();

    }

    private dealText(config: ISchemasNode) {
        if (config.component?.toLowerCase() === 'text') {
            if (config.componentProps?.text) {
                let text = config.componentProps?.text;
                const sandbox = this.get('sandbox');
                const doc = sandbox?.renderer.contentWindow?.document;
                if (doc) {
                    const baseFontSize = parseFloat(doc.documentElement.style.fontSize);
                    config.componentProps.text = text.replace(/font-size: (\d+)px/g, (_match: any, p1:string) => {
                        let pxValue = parseFloat(p1); // 将匹配到的字符串数字转换为整数
                        let remValue = pxValue / baseFontSize; // 假设根元素的字体大小为16px，进行转换
                        return `font-size: ${remValue}rem`; // 返回转换后的字符串
                    });
                }
            }
        }
        return config
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
            console.log(historyService)
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

    private beforePaste(position: IPastePosition, config: ISchemasNode[]) {
        if (!config[0]?.style) return config;
        const curNode = this.get('node');
        // 将数组中第一个元素的坐标作为参照点
        const { left: referenceLeft, top: referenceTop, } = config[0].style;
        // 校准坐标
        const finConfigs = config.map((item) => {
            const { offsetX = 0, offsetY = 0, ...positionClone } = position;
            let pastePosition = positionClone;
            if (!js_is_empty(pastePosition) && curNode?.children) {
                // 如果没有传入粘贴坐标则可能为键盘操作，不再转换
                // 如果粘贴时选中了容器，则将元素粘贴到容器内，坐标需要转换为相对于容器的坐标
                pastePosition = this.getPositionInContainer(pastePosition, curNode.field);
            }
            // 将所有待粘贴元素坐标相对于多选第一个元素坐标重新计算，以保证多选粘贴后元素间距不变
            if (pastePosition.left && item.style?.left) {
                pastePosition.left = Number(item.style.left) - Number(referenceLeft) + pastePosition.left;
            }
            if (pastePosition.top && item.style?.top) {
                pastePosition.top = Number(item.style.top) - Number(referenceTop) + pastePosition.top;
            }
            const pasteConfig = propsService.setNewField(item, false);

            if (pasteConfig.style) {
                const { left, top, } = pasteConfig.style;
                // 判断能转换为数字时，做粘贴偏移量计算
                if (typeof left === 'number' || (!!left && !isNaN(Number(left)))) {
                    pasteConfig.style.left = Number(left) + offsetX;
                }
                if (typeof top === 'number' || (!!top && !isNaN(Number(top)))) {
                    pasteConfig.style.top = Number(top) + offsetY;
                }

                pasteConfig.style = {
                    ...pasteConfig.style,
                    ...pastePosition,
                };
            }
            return pasteConfig;
        });
        return finConfigs;
    }
    private getPositionInContainer(position: { left?: number | undefined; top?: number | undefined; }, field: string): { left?: number | undefined; top?: number | undefined; } {
        let { left = 0, top = 0, } = position;
        const parentEl = this.get('sandbox')?.renderer?.contentWindow?.document.getElementById(`${field}`);
        const parentElRect = parentEl?.getBoundingClientRect();
        const doc = this.get('sandbox')?.renderer.contentWindow?.document;
        left = left - calcValueByDesignWidth(doc ,(parentElRect?.left || 0), editorService.get('root')?.designWidth);
        top = top - calcValueByDesignWidth(doc ,(parentElRect?.top || 0), editorService.get('root')?.designWidth);
        return {
            left,
            top,
        };
    }

    /**更新画框 */
    private updateHandler() {
        setTimeout(() => {
            // this.updateMask();

            this.updateSelectStatus();
        });
    }

    private updateSelectStatus() {
        const sandbox = this.get('sandbox');
        const nodes = this.get('nodes');
        if (nodes) {
            if (nodes.length > 1) {
                sandbox?.multiSelect(nodes.map((n) => n.field));
            } else {
                sandbox?.select(nodes[0].field);
            }
        }
    }
}
export type { EditorService };

export const editorService = new EditorService();
