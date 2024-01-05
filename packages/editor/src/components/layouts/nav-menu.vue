<!-- 画布小工具 -->
<template>
    <div class="q-editor-nav-menu">
        <template v-for="item of buttons" :key="item.type">
            <template v-if="item.type === 'divider'">
                <Divider type="vertical"></Divider>
            </template>
            <template v-if="item.type === 'button'">
                <Tooltip v-if="item.tooltip" :title="item.tooltip">
                    <Button size="small" type="text" @click="item.onClick">
                        <template #icon >
                            <q-antd-icon :type="item.icon"></q-antd-icon>
                        </template>
                        {{ item.text }}
                    </Button>
                </Tooltip>
                <Button size="small" v-else type="text" @click="item.onClick">
                    <template #icon >
                        <q-antd-icon :type="item.icon"></q-antd-icon>
                    </template>
                    {{ item.text }}
                </Button>
            </template>
            <template v-if="item.type === 'text'">
                <span>{{ item.text }}</span>
            </template>
        </template>
    </div>
</template>

<script lang='ts' setup>
import { IMenuButton, IMenuItem, IServices } from '../../types';
import { computed, inject } from 'vue';
import { NodeType } from '@qimao/quantum-schemas';
import { Divider, Button, Tooltip } from 'ant-design-vue';
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

const isMac = /mac os x/.test(navigator.userAgent.toLowerCase());
const ctrl = isMac ? 'Command' : 'Ctrl';

function get_config(item: IMenuItem) {
    if (typeof item !== 'string') {
        return [item];
    }
    console.log(item);
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
                    node && services?.editorService.remove(node);
                },
            });
            break;
        case 'undo':
            // TODO
            break;
        case 'redo':
            // TODO
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
    :deep(.ant-btn.ant-btn-text) {
        margin-left: 0;
        font-size: 10px
    }
}
</style>