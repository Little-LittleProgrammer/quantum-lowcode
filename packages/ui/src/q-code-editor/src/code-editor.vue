<!-- 代码编辑器  -->
<template>
    <div class="q-code-editor">
        <Teleport to="body" :disabled="!fullScreen">
            <div class="q-code-editor-wrapper" :class="`${fullScreen ? 'full-screen' : ''}`">
                <a-button class="code-edit-full-screen-button" type="link" @click="full_screen_handler">
                    <template #icon>
                        <ExpandOutlined />
                    </template>
                </a-button>
                <div ref="codeEditor" class="q-code-editor-content"></div>
            </div>
        </Teleport>
    </div>
</template>

<script lang='ts' setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {Button as AButton} from 'ant-design-vue';
import {ExpandOutlined} from '@ant-design/icons-vue'
import * as monaco from 'monaco-editor'
import {serialize_to_string} from '@qimao/quantum-utils'
defineOptions({
     name: 'code-editor'
})

const props = withDefaults(
    defineProps<{
        initValues?:any
        language?: string;
        autoSave?: boolean;
        options?: {
            [key: string]: any;
        },
        parse?: <T = any>(schemas: string, language:string) => T
    }>(), {
        initValues: '',
        autoSave: true,
        language: 'typescript',
    }
)
const emit = defineEmits(['initd', 'save']);

let vsEditor: monaco.editor.IStandaloneCodeEditor | null = null;
const codeEditor = ref<HTMLDivElement>()
const fullScreen = ref(false)

const values = ref('');
const loading = ref(false);

const resizeObserver = new globalThis.ResizeObserver(() => {
    setTimeout(() => {
        vsEditor?.layout();
    }, 300);
});

function full_screen_handler() {
    fullScreen.value = !fullScreen.value;
    setTimeout(() => {
        console.log(vsEditor?.layout)
        vsEditor?.focus();
        vsEditor?.layout();
    }, 200);
}

const get_editor_value = () => {
    console.log('vsval', vsEditor?.getValue())
    return vsEditor?.getValue() || ''
}

watch(
    () => props.initValues,
    (v: string | any, preV: string | any) => {
        console.log('init', v)
        if (v && v !== preV) {
            set_editor_value(props.initValues);
        }
    },
    {
        deep: true,
        immediate: true,
    },
);

async function init_editor() {
    if (!codeEditor.value) return;

    const options = {
        value:values.value,
        language: props.language,
        theme: 'vs-dark',
        ...props.options
    }

    vsEditor = monaco.editor.create(codeEditor.value, options);

    set_editor_value(props.initValues || '')

    loading.value = false;
    
    codeEditor.value.addEventListener('keydown', (e) => {
        if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            const newValue = get_editor_value();
            values.value = newValue;
            emit('save', props.parse ? props.parse(newValue, props.language) : newValue);
        }
    })

    if (props.autoSave) {
        vsEditor.onDidBlurEditorWidget(() => {
            const newValue = get_editor_value();
            if (values.value !== newValue) {
                values.value = newValue;
                emit('save', props.parse ? props.parse(newValue, props.language) : newValue);
            }
        })
    }
    resizeObserver.observe(codeEditor.value);
}

function to_string(v: string | any, language: string) {
    let value = '';
    if (typeof v !== 'string') {
        if (language === 'json') {
            value = JSON.stringify(v, null, 4);
        } else {
            value = serialize_to_string(v).replace(/"(\w+)":\s/g, '$1: ');
        }
    } else {
        value = v;
    }
    if (['javascript', 'typescript'].includes(language)  && value.startsWith('{') && value.endsWith('}')) {
        value = `(${value})`;
    }
    return value;
}


 function set_editor_value(value: string | any){
    values.value = to_string(value, props.language.toLocaleLowerCase())
    
    return vsEditor?.setValue(values.value)
}

onMounted(async () => {
    loading.value = true;
    init_editor();
});

onUnmounted(() => {
    resizeObserver.disconnect();
});

defineExpose({
  values,

  getEditor() {
    return vsEditor;
  },

  set_editor_value,
  get_editor_value,

  focus() {
    vsEditor?.focus();
  },
});

</script>
<style lang='scss' scoped>
.q-code-editor {
    width: 100%;
}
.q-code-editor-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    &.full-screen {
        position: fixed;
        z-index: 10000;
        top: 0;
        left: 0;
    }
    .code-edit-full-screen-button {
        position: absolute;
        top: 5px;
        right: 0;
        z-index: 11;
    }
    .q-code-editor-content {
        width: 100%;
        height: 100%;
    }
}

</style>