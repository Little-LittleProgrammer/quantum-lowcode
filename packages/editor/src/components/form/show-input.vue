<!-- ifShow逻辑更改  -->
<template>
    <div></div>
</template>

<script lang='ts' setup>
defineOptions({
     name: 'ShowInput'
})

const props = defineProps({
    value: {
        type: String,
        default: ''
    }
})

</script>
<style lang='scss' scoped>
</style>