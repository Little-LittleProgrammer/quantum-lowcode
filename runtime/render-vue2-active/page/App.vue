<template>
    <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
</template>

<script lang="ts">
import { computed, defineComponent, inject} from 'vue';

import type {  LowCodeRoot } from '@qimao/quantum-core';
import { IQuantum} from '@qimao/quantum-sandbox';
import Page from '../src/page/index.vue'

declare global {
    interface Window {
        quantum: IQuantum;
        appInstance: LowCodeRoot;
    }
}

export default defineComponent({
    components: {
        page: Page
    },
    setup() {
        const app = inject<LowCodeRoot | undefined>('app');

        const pageConfig = computed(() => {
            return app?.page?.data
        });

        return {
            pageConfig,
        };
    },
});
</script>

