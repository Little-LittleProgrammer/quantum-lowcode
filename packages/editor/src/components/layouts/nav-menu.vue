<!-- 画布小工具 -->
<template>
    <div class="q-editor-nav-menu">
        <div class="q-editor-nav-menu-left" v-if="workspaceLeft > 0" :style="{width: workspaceLeft+ 'px'}">
            <slot name=left></slot>
        </div>
        <div class="q-editor-nav-menu-center">
            <slot name="center">
                <div class="q-editor-nav-menu-center-btnlist">
                    <template v-for="item of buttons" :key="item.type">
                        <template v-if="item.type === 'divider'">
                            <Divider type="vertical"></Divider>
                        </template>
                        <template v-if="item.type === 'button'">
                            <Tooltip :title="item.tooltip">
                                <Button :disabled="js_is_function(item.disabled) ? (item.disabled as Function)?.() : item.disabled" size="small" type="text" @click="item.onClick">
                                    <template #icon >
                                        <q-antd-icon :type="item.icon"></q-antd-icon>
                                    </template>
                                    {{ item.text }}
                                </Button>
                            </Tooltip>
                        </template>
                        <template v-if="item.type === 'text'">
                            <span>{{ item.text }}</span>
                        </template>
                    </template>
                </div>
            </slot>
            
        </div>
        <div class="q-editor-nav-menu-right">
            <slot name=right></slot>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { IMenuButton, IMenuItem, IServices } from '../../types';
import { computed, inject } from 'vue';
import { NodeType } from '@qimao/quantum-schemas';
import { Divider, Button, Tooltip } from 'ant-design-vue';
import { js_is_function } from '@qimao/quantum-utils';
defineOptions({
    name: 'QEditorNavMenu',
});

const props = withDefaults(
    defineProps<{
        btnList?: IMenuItem[];
    }>(),
    {
        btnList: () => [],
    }
);

const services = inject<IServices>('services');
const uiService = services?.uiService;

const zoom = computed((): number => uiService?.get('zoom') ?? 1);
const workspaceLeft = computed((): number => uiService?.get('workspaceLeft') ?? 0);

const isMac = /mac os x/.test(navigator.userAgent.toLowerCase());
const ctrl = isMac ? 'Command' : 'Ctrl';

function get_config(item: IMenuItem) {
    if (typeof item !== 'string') {
        return [item];
    }
    const config:IMenuButton[] = [];
    switch (item) {
        case '/':
            config.push({type: 'divider', });
            break;
        case 'zoom':
            config.push(
                ...get_config('zoom-out'),
                ...get_config(`${parseInt(`${zoom.value * 100}`, 10)}%`),
                ...get_config('zoom-in'),
                ...get_config('scale-to-original'),
                ...get_config('scale-to-fit')
            );
            break;
        case 'delete':
            config.push({
                type: 'button',
                icon: 'DeleteOutlined',
                tooltip: '删除(Delete)',
                disabled: () => services?.editorService.get('node')?.type === NodeType.PAGE,
                onClick: () => {
                    const node = services?.editorService.get('node');
                    node && services?.editorService.delete(node);
                },
            });
            break;
        case 'undo':
            config.push({
                type: 'button',
                icon: 'ArrowLeftOutlined',
                tooltip: `后退(${ctrl}+z)`,
                disabled: () => !services?.historyService.state.canUndo,
                onClick: () => services?.editorService.undo(),
            });
            break;
        case 'redo':
            config.push({
                type: 'button',
                className: 'redo',
                icon: 'ArrowRightOutlined',
                tooltip: `前进(${ctrl}+Shift+z)`,
                disabled: () => !services?.historyService.state.canRedo,
                onClick: () => services?.editorService.redo(),
            });
            break;
        case 'zoom-in':
            config.push({
                type: 'button',
                icon: 'ZoomInOutlined',
                tooltip: `放大(${ctrl}+=)`,
                onClick: () => uiService?.zoom(0.1),
            });
            break;
        case 'zoom-out':
            config.push({
                type: 'button',
                icon: 'ZoomOutOutlined',
                tooltip: `縮小(${ctrl}+-)`,
                onClick: () => uiService?.zoom(-0.1),
            });
            break;
        case 'scale-to-fit':
            config.push({
                type: 'button',
                icon: 'BorderInnerOutlined',
                tooltip: `缩放以适应(${ctrl}+0)`,
                onClick: async() => uiService?.set('zoom', await uiService.calcZoom()),
            });
            break;
        case 'scale-to-original':
            config.push({
                type: 'button',
                icon: 'BorderOuterOutlined',
                tooltip: `缩放到实际大小(${ctrl}+1)`,
                onClick: () => uiService?.set('zoom', 1),
            });
            break;
        default:
            config.push({
                type: 'text',
                text: item,
            });
            break;
    }
    return config;
}

const buttons = computed(() => {
    const data = [];
    for (const item of props.btnList) {
        data.push(...get_config(item));
    }
    return data;
});

</script>
<style lang='scss' scoped>
.q-editor-nav-menu {
    border-bottom: 1px solid #e8e8e8;
    padding: 4px 0px;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-box-align: center;
    align-items: center;
    &-center{
        width: 600px;
        display: flex;
        justify-content: center;
    }
    &-right {
        flex: 1;
        text-align: right;
    }
    :deep(.ant-btn.ant-btn-text) {
        margin-left: 0;
        font-size: 10px
    }
}
[data-theme='dark'] {
    .q-editor-nav-menu {
        border-bottom: 1px solid #303030;
    }
}
</style>
