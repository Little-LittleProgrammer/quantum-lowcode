import {inject, onMounted, onUnmounted} from 'vue';
import {LowCodeRoot} from '@qimao/quantum-core';

export function useApp(props: any) {
    const app: LowCodeRoot | undefined = inject('app');

    const node = app?.page?.getNode(props.config.field);

    const emitData = {
        ...(props.methods || {}),
    };

    node?.emit('created', emitData);

    onMounted(() => {
        node?.emit('mounted', emitData);
    });

    onUnmounted(() => {
        node?.emit('destroy', emitData);
    });

    return {app, };
}
