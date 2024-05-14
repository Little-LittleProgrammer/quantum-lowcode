import { DropMenu } from '@q-front-npm/vue3-antd-pc-ui';
import { reactive } from 'vue';
import { calcValueByDesignWidth, isPage, js_is_function } from '@qimao/quantum-utils';
import { editorService } from './editor-service';
import { COPY_STORAGE_KEY } from '../utils/editor';
import { storageService } from './storage-serivce';
import { ISchemasNode, NodeType } from '@qimao/quantum-schemas';
import { LayerOffset } from '../types';
import { uiService } from './ui-service';

class ContentmenuService {
    public state = reactive<Record<string, any>>({
        baseDropMenuList: [
            {
                icon: 'CopyOutlined',
                event: 'copy',
                text: '复制',
            },
            {
                icon: 'FileTextOutlined',
                event: 'paste',
                text: '粘贴',
                disabled: !!storageService?.getItem(COPY_STORAGE_KEY),
            },
            {
                icon: 'CloseOutlined',
                event: 'delete',
                text: '删除',
                divider: true,
            },
            {
                icon: 'AlignCenterOutlined',
                event: 'align',
                text: '水平居中',
            },
            {
                icon: 'ArrowUpOutlined',
                event: 'upOne',
                text: '上移一层',
            },
            {
                icon: 'ArrowDownOutlined',
                event: 'downOne',
                text: '下移一层',
            },
            {
                icon: 'ArrowUpOutlined',
                event: 'upAll',
                text: '置顶',
            },
            {
                icon: 'ArrowDownOutlined',
                event: 'downAll',
                text: '置底',
                divider: true,
            }
        ],
        extraDropMenuList: [],
        extraDropEvent: {},
    })
    public get(key: string) {
        return this.state[key];
    }
    public getDropMenuList(node: ISchemasNode) {
        const base = this.state.baseDropMenuList.map((e) => {
            if (e.event === 'paste') {
                e.disabled = !storageService?.getItem(COPY_STORAGE_KEY);
            } else if (['delete', 'align', 'upOne', 'upAll', 'downOne', 'downAll'].includes(e.event)) {
                e.disabled = isPage(node) || (node.type === NodeType.ROOT)
            }
            return e
        });
        return base.concat(this.state.extraDropMenuList)
    }
    public set(key: string, val: any) {
        this.state[key] = val;
    }
    public handleCopy() {
        const nodes = editorService.get('nodes');
        if (nodes?.length) {
            editorService.copy(nodes);
        }
    }
    public handlePaste() {
        const nodes = editorService.get('nodes');
        if (nodes?.length) {
            const $menu = globalThis.document.querySelector('.ant-dropdown');
            if ($menu) {
                const rect = $menu.getBoundingClientRect();
                const sandbox  = editorService.get('sandbox')
                const parentRect = sandbox?.container?.getBoundingClientRect();
                const translateY = sandbox?.mask.scrollTop || 0;
                // const initialLeft = (rect.left || 0) - (parentRect?.left || 0);
                // const initialTop = (rect.top || 0) - (parentRect?.top || 0) +translateY ;
                const initialLeft =
                    calcValueByDesignWidth(sandbox?.renderer.getDocument(), (rect.left || 0) - (parentRect?.left || 0)) /
                    uiService.get('zoom');
                const initialTop =
                    calcValueByDesignWidth(sandbox?.renderer.getDocument(), (rect.top || 0) - (parentRect?.top || 0)) /
                    uiService.get('zoom');
                editorService?.paste({ left: initialLeft, top: initialTop });
            } else {
                editorService.paste();
            }
            
        }
    }
    public handleDelete() {
        const nodes = editorService.get('nodes');
        if (nodes?.length) {
            editorService.delete(nodes);
        }
    }
    public handleAlign() {
        const nodes = editorService.get('nodes');
        if (!nodes) return;
        editorService?.alignCenter(nodes);
    }
    public handleUpOne() {
        editorService?.moveLayer(1);
    }
    public handleDownOne() {
        editorService?.moveLayer(-1);
    }
    public handleUpAll() {
        editorService?.moveLayer(LayerOffset.TOP);
    }
    public handleDownAll() {
        editorService?.moveLayer(LayerOffset.BOTTOM);
    }

    public handleMenuEvent(menu: DropMenu) {
        const { event, } = menu;
        switch (event) {
            case 'copy': {
                this.handleCopy();
                break;
            }
            case 'paste': {
                this.handlePaste();
                break;
            }
            case 'delete': {
                this.handleDelete();
                break;
            }
            case 'align': {
                this.handleAlign();
                break;
            }
            case 'upOne': {
                this.handleUpOne();
                break;
            }
            case 'downOne': {
                this.handleDownOne();
                break;
            }
            case 'upAll': {
                this.handleUpAll();
                break;
            }
            case 'downAll': {
                this.handleDownAll();
                break;
            }
        }
        if (js_is_function(this.state.extraDropEvent)) {
            const node = editorService.get('node')
            if (node) {
                const nodeInfo = editorService.getNodeInfo(node.field)
                this.state.extraDropEvent(menu, nodeInfo);
            }
        }
    }
}

export type {ContentmenuService};
export const contentmenuService = new ContentmenuService();
