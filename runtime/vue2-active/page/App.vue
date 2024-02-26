<template>
    <div id="app">
        <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject} from 'vue';

import type { LowCodeRoot } from '@qimao/quantum-core';
import { IQuantum} from '@qimao/quantum-sandbox';
import {Page} from '@qimao/quantum-ui-vue2';

declare global {
    interface Window {
        quantum: IQuantum;
        appInstance: LowCodeRoot;
        quantumCompConfigs: any
    }
}

export default defineComponent({
    components: {
        page: Page,
    },
    setup() {
        const app = inject<LowCodeRoot | undefined>('app');

        const pageConfig = computed(() => {
            return app?.page?.data;
        });

        return {
            pageConfig,
        };
    },
});
</script>

<style lang="scss">
html,body {margin: 0; padding: 0}

// .quantum-ui-page {
//     height: 100%;
//     overflow: auto;
// }

::-webkit-scrollbar {
    width: 0 !important;
}

html,
body,
#app {
    width: 100%;
    height: 100%;
}

#app {
    position: relative;
    overflow: auto;
}
</style>
