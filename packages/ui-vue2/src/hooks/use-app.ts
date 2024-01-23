import {getCurrentInstance, inject, onMounted, onUnmounted} from 'vue';
import {LowCodeRoot} from '@qimao/quantum-core';

export function useApp(props: any) {
    const app: LowCodeRoot | undefined = inject('app');

    const node = app?.page?.getNode(props.config.field);

    const vm = getCurrentInstance()?.proxy;

    node?.emit('created', vm);

    onMounted(() => {
        node?.emit('mounted', vm);
    });

    onUnmounted(() => {
        node?.emit('destroy', vm);
    });

    return {app, };
}
