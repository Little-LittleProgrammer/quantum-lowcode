<!--  -->
<template>
    <div class="q-editor-key-value">
        <div class="q-editor-key-value-item" v-for="(item, index) in records" :key="index">
            <a-form-item-rest>
                <a-input v-model:value="item[0]" class="item-key" placeholder="请输入key" @change="changeData"></a-input>: 
                <a-input v-model:value="item[1]" class="item-value" placeholder="请输入value" @change="changeData"></a-input>
            </a-form-item-rest>
            <a-button danger class="item-button" @click="deleteItem(index)">
                <template #icon>
                    <q-antd-icon type="DeleteOutlined"></q-antd-icon>
                </template>
            </a-button>
        </div>
        <a-button size="small" @click="addItem">添加</a-button>
    </div>
</template>

<script lang='ts' setup>
import { PropType, ref, watch } from 'vue';

defineOptions({
    name: 'KeyValue',
});
const props = defineProps({
    value: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({}),
    },
})
const records = ref<[string, any][]>([])
watch(() => props.value, (val) => {
    const initValue = Object.entries(props.value);
    records.value = initValue
})
const emit = defineEmits(['update:value', 'change'])

function addItem(){
    records.value.push(['', '']);
}

function deleteItem(i: number) {
    records.value.splice(i, 1)
    emit('change', formatValue())
    emit('update:value', formatValue())
}

function formatValue() {
    const record:Record<string, any> = {};
    records.value.forEach(item => {
        if (item[0]) {
            record[item[0]] = item[1]
        }
    })
    return record
}

function changeData() {
    emit('change', formatValue())
    emit('update:value', formatValue())
}

</script>
<style lang='scss' scoped>
.q-editor-key-value {
    &-item {
        display: flex;
        align-items: center;
        padding: 0 0 10px 0;
        .item-key {
            width: 30%;
        }
        .item-value {
            margin-left: 10px;
            width: 40%;
        }
        .item-button {
            margin-left: 10px;
        }
    }
}
</style>
