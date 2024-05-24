<!--  -->
<template>
    <div class="q-editor-input-select">
        <template v-if="!showDs">
            <a-input :value="value" @change="changeValue" @blur="blurValue"></a-input>
        </template>
        <template v-else>
            <a-cascader placeholder="请选择" :value="getSelectValue" :options="getDsFieldsSelect" @change="changeCasValue" @blur="blurCasValue"></a-cascader>
        </template>
        <a-button class="q-editor-input-select-button" :class="showDs ? 'select-active' : ''" @click="changeComp">
            <template #icon>
                <q-antd-icon type="DatabaseOutlined"></q-antd-icon>
            </template>
        </a-button>
    </div>
</template>

<script lang='ts' setup>
import { IServices } from '../../types';
import { computed, inject, ref } from 'vue';
import { useDsList } from '../../hooks/use-ds-list';
import { js_is_string } from '@qimao/quantum-utils';

const props = withDefaults(
    defineProps<{
        value: string | number;
    }>(),
    {
        value: '',
    }
);
const emits = defineEmits(['change','update:value', 'blur']);

defineOptions({
    name: 'InputSelect',
});

const showDs = ref(false);
const service = inject<IServices>('services');
const {getDsFieldsSelect} = useDsList(service);

const getSelectValue = computed(() => {
    if (!(js_is_string(props.value) && props.value.includes('$'))) {
        return ''
    }
    const path = props.value.replace(/\$\{([^}]+)\}/, '\$1');
    return path.split('.'); 
})

function changeComp() {
    showDs.value = !showDs.value;
}

function changeCasValue(e: string[]) {
    if (!e) {
        changeEvent('');
        return
    }
    if (e.length < 2) {return};
    const val = '${'+e.join('.') + '}'
    changeEvent(val)
}
function blurCasValue() {
    blurEvent()
}

function changeValue(e: any) {
    changeEvent(e.target.value)
}
function blurValue(e: any) {
    blurEvent()
}

function blurEvent() {
    emits('blur')
}
function changeEvent(value: string | number) {
    emits('change', value)
    emits('update:value', value)
}

</script>
<style lang='scss' scoped>
.q-editor-input-select {
    display: flex;
    align-items: center;
    &-button {
        color: $text-color-secondary;
        margin-left: 4px;
        &.select-active {
            background-color: $primary-color;
        }
    }
}
</style>
