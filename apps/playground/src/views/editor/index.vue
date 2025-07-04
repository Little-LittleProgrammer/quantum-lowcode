<!--  -->
<template>
    <div class="editor-container">
        <quantum-editor
            class="editor-container-content"
            ref="editor"
            v-model:value="schemas"
            :boxRect="sandboxRect"
            :runtime-url="runtimeUrl"
            :moveable-options="moveableOptions"
            :propsConfigs="propsConfigs"
            :methodsList="methodsList"
            :boxContextmenuConfigs="boxContextmenuConfigs"
            :containerHighlightDuration="CONTAINER_HIGHLIGHT_DELAY_TIME"
            :containerHighlightClassName="CONTAINER_HIGHLIGHT_CLASS_NAME"
            :component-group-list="componentGroupList"
        >
            <template #nav-left>
                <p class="editor-title">量子编辑器</p>
            </template>
            <template #nav-right="{ uiService, editorService }">
                <div class="editor-container-nav-right">
                    <a-button size="small" @click="openPreviewModal(editorService)">预览</a-button>
                    <a-button size="small" @click="saveProject">保存</a-button>
                    <a-button size="small" @click="publishProject">发布</a-button>
                    <a-button v-if="viewMode === 'new'" size="small" type="link" @click="handlerShowCode(uiService)">
                        <template #icon>
                            <q-antd-icon type="FileTextOutlined"></q-antd-icon>
                        </template>
                    </a-button>
                    <a-tooltip placement="right" :title="viewMode === 'classic' ? '视图模式' : '经典模式'">
                        <a-button size="small" type="link" @click="changeMode(uiService)">
                            <template #icon>
                                <q-antd-icon type="ControlOutlined"></q-antd-icon>
                            </template>
                        </a-button>
                    </a-tooltip>
                </div>
            </template>
            <template #workspace-header="{ editorService }">
                <a-radio-group v-if="viewMode === 'new'" size="small" v-model:value="sandboxDev" button-style="solid" @change="(e) => changeSandboxDev(e, editorService)">
                    <a-radio-button value="phone">Phone</a-radio-button>
                    <a-radio-button value="pad">Pad</a-radio-button>
                    <a-radio-button value="pc">折叠屏</a-radio-button>
                </a-radio-group>
            </template>
            <template v-if="viewMode === 'classic'" #nav-center>
                <div></div>
            </template>
            <template v-if="viewMode === 'classic'" #left="{ services }">
                <Sidebar :services="services"></Sidebar>
            </template>
            <template v-if="viewMode === 'classic'" #props-editor="{ editorService }">
                <div></div>
            </template>
        </quantum-editor>
        <preview :uaInfo="UA_MAP[sandboxDev as 'phone']" v-model:previewVisible="previewVisible" :previewUrl="previewUrl" :sandboxRect="sandboxRect" :designWidth="designWidth"></preview>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onUnmounted, ref, toRaw } from 'vue';
import { IComponentGroup, QuantumEditor, UiService } from '@quantum-lowcode/editor';
import { ISchemasRoot, NodeType } from '@quantum-lowcode/schemas';
import { serializeToString, parseSchemas, asyncLoadJs, isArray } from '@quantum-lowcode/utils';
import { testSchemasV1, defaultSchemas, testSchemasV2 } from './init-schemas';
import { RUNTIME_PATH } from '@/enums/runtimeEnum';
import { useRoute } from 'vue-router';
import { useMessage } from '@quantum-design/hooks/vue/use-message';
import Preview from '@/components/pagePreview/preview.vue';
import { DEV_RECT, UA_MAP, CLASSIC_WORKSPACE_WIDTH, NEW_WORKSPACE_WIDTH } from '@/enums/projectEnum';
import { EditorService } from '@quantum-lowcode/editor';
import { ICustomizeMoveableOptionsCallbackConfig, MoveableOptions } from '@quantum-lowcode/sandbox';
import Sidebar from '@/components/classic/sidebar/index.vue';
import { useGlobalStore } from '@/store/modules/global';
import { CONTAINER_HIGHLIGHT_CLASS_NAME, CONTAINER_HIGHLIGHT_DELAY_TIME } from '@quantum-lowcode/sandbox';
import '@quantum-design/vue3-pc-ui/dist/es/style/q-rich-text/rich-text.css';
defineOptions({
    name: 'Editor',
});

const route = useRoute();
const globalStore = useGlobalStore();
const viewMode = computed(() => globalStore.viewMode);
const { runtimePathType = 'vue3' } = route.query;

const runtimeUrl = ref(RUNTIME_PATH[runtimePathType as 'vue3'] + '/playground/index.html');

const editor = ref<InstanceType<typeof QuantumEditor>>();

const componentGroupList = ref<IComponentGroup[]>([
    {
        text: '容器组件',
        children: [
            {
                text: '容器',
                component: 'container',
                icon: 'FolderOpenOutlined',
            },
            {
                text: '蒙层',
                component: 'OverlayContainer',
                icon: 'FolderOpenOutlined',
                data: {
                    style: {
                        position: 'fixed',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                },
            },
        ],
    },
    {
        text: '基本组件',
        children: [
            {
                text: '按钮',
                component: 'Button',
                icon: 'SelectOutlined',
            },
            {
                text: '图片',
                component: 'Img',
                icon: 'LinkOutlined',
            },
            {
                text: '视频',
                component: 'Video',
                icon: 'PlayCircleOutlined',
            },
            {
                text: '文本',
                component: 'Text',
                icon: 'LineOutlined',
            },
            {
                text: '二维码',
                component: 'Button',
                icon: 'SelectOutlined',
            },
        ],
    },
]);

const schemas = ref<ISchemasRoot>(defaultSchemas);
schemas.value = testSchemasV2;
let preSchemasStr = '';
let schemasStr = '';
let id: string | null = null;

const previewVisible = ref(false);
const designWidth = ref(720);

const propsConfigs = ref({});
const methodsList = ref({});

const previewUrl = computed(() => `${RUNTIME_PATH[runtimePathType as 'vue3']}/page/index.html?localPreview=1&page=${editor.value?.editorService.get('page')?.field}`);

const boxContextmenuConfigs = {
    dropDownList: [
        {
            icon: 'SaveOutlined',
            event: 'save',
            text: '保存为模版',
        },
    ],
    handleMenuEvent: (menu, nodeInfo) => {
        console.log(nodeInfo);
        // 发送通讯保存模版
    },
};

function moveableOptions(config?: ICustomizeMoveableOptionsCallbackConfig) {
    const options: MoveableOptions = {};

    if (!editor.value) return options;

    const page = editor.value.editorService.get('page');

    const ids = config?.targetElIds || [];
    let isPage = page && ids.includes(`${page.field}`);

    if (!isPage) {
        const id = config?.targetElId;
        if (id) {
            const node = editor.value.editorService.getNodeByField(id);
            isPage = node?.type === NodeType.PAGE;
        }
    }

    options.draggable = !isPage;
    options.resizable = !isPage;
    options.rotatable = !isPage;

    return options;
}

const { createConfirm, createMessage } = useMessage();

const sandboxRect = ref(DEV_RECT.phone);
const sandboxDev = ref('phone');

// 更改画布大小
async function changeSandboxDev(e: ChangeEvent, editorService: EditorService) {
    sandboxRect.value = DEV_RECT[e.target.value as 'phone'];
    await nextTick();
    calcFontsize(DEV_RECT[e.target.value as 'phone'].width, editorService);
}

// 设置px => rem
function calcFontsize(width: number, editorService: EditorService) {
    const iframe = editorService.get('sandbox')?.renderer.iframe;
    if (!iframe?.contentWindow) return;

    const app = (iframe.contentWindow as any).appInstance;

    app.setEnv(UA_MAP[sandboxDev.value as 'phone']);

    app.setDesignWidth(editorService.get('root')?.designWidth || designWidth.value);
}

function openPreviewModal(editorService: EditorService) {
    save();
    if (editorService.get('root')?.designWidth) {
        designWidth.value = editorService.get('root')?.designWidth;
    }
    if (schemasStr !== preSchemasStr) {
        createConfirm({
            title: '有修改未保存，是否先保存再预览',
            onOk: () => {
                saveToNet();
                previewVisible.value = true;
            },
        });
    } else {
        previewVisible.value = true;
    }
}

function saveProject() {
    save();
    saveToNet();
}

async function publishProject() {
    if (schemasStr !== preSchemasStr) {
        createMessage.error('有修改未保存，请先保存再发布');
        return;
    }
    createMessage.success('发布成功');
}

function save() {
    schemasStr = serializeToString(toRaw(schemas.value));
    localStorage.setItem('PAGE_JSON', schemasStr);
}

function handlerShowCode(uiService: any) {
    uiService.set('showCode', !uiService.get('showCode'));
    if (uiService.get('showCode')) {
        uiService.set('workspaceLeft', 0);
    } else {
        uiService.set('workspaceLeft', NEW_WORKSPACE_WIDTH.Left);
    }
}

async function saveToNet() {
    createMessage.success('保存成功');
    preSchemasStr = schemasStr;
}

function changeMode(ui: UiService) {
    globalStore.pageLoading = true;
    setTimeout(() => {
        ui.set('showCode', false);
        globalStore.set_view_mode(viewMode.value === 'new' ? 'classic' : 'new');
        if (viewMode.value === 'new') {
            ui.set('workspaceRight', NEW_WORKSPACE_WIDTH.Right);
            ui.set('workspaceCenter', NEW_WORKSPACE_WIDTH.Center);
            ui.set('workspaceLeft', NEW_WORKSPACE_WIDTH.Left);
        } else {
            ui.set('workspaceRight', CLASSIC_WORKSPACE_WIDTH.Right);
            ui.set('workspaceCenter', CLASSIC_WORKSPACE_WIDTH.Center);
            ui.set('workspaceLeft', CLASSIC_WORKSPACE_WIDTH.Left);
        }
        globalStore.pageLoading = false;
    }, 500);
}

asyncLoadJs(`/quantum-lowcode/playground/entry/${runtimePathType}/config.umd.js`).then(() => {
    propsConfigs.value = (globalThis as any).quantumCompConfigs.formSchemas;
    methodsList.value = (globalThis as any).quantumCompConfigs.events;
});
</script>
<style lang="scss">
.editor-container {
    width: 100%;
    height: 100%;
    min-width: 1250px;
    @include bg-color(aside-bg);
    &-content {
        border: 1px solid;
        @include border-color(border-color);
        border-bottom: 0;
        .editor-title {
            padding: 0 10px;
            font-size: 16px;
            font-weight: bold;
        }
    }
    .q-editor {
        flex: 1;
        height: calc(100% - 36px);
    }
}
</style>
