import {inject} from 'vue'
import {LowCodeRoot} from '@qimao/quantum-core';

export function useApp(props: any) {
    const app: LowCodeRoot | undefined = inject('app');

    return {app}
}