<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, inject, PropType } from 'vue';

import {useApp} from '../../hooks/use-app';
import type { ISchemasNode} from '@quantum-lowcode/schemas';

export default defineComponent({
    name: 'QText',
    props: {
        config: {
            type: Object as PropType<ISchemasNode>,
            default: () => ({}),
        },

        text: {
            type: [String, Function] as PropType<string | Function>,
            default: ''
        },

        vars: {
            type: Object,
            default: () => ({}),
        },

        multiple: {
            type: Boolean,
            default: false
        },
        isNative: {
            type: String,
            default: '1',
        },
    },

    setup(props, {slots}) {
        const {app} = useApp(props);
        const vm = getCurrentInstance()?.proxy;
        const displayText = computed(() => {
            let text = props.text || '';
            const { vars } = props;
            if (typeof text === 'function') {
                return text.bind(vm)(vm, { app });
            }
            if (Object.prototype.toString.call(vars) === '[object Object]') {
                let tmp: string = text;
                Object.entries(vars).forEach(([key, value]) => {
                    tmp = tmp.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
                });
                return tmp;
            }
            return text || '';
        });

        return {
            displayText,
            slots
        };
    },

    render() {
        if (this.isNative === '2') {
            return h('div', {
                innerHTML: this.displayText
            })
        }
        const className = this.multiple ? 'quantum-ui-text' : 'quantum-ui-text quantum-ui-text--single-line';
        if (typeof this.slots?.default === 'function') {
            return h('p', { class: className }, [this.slots?.default?.() || '']);
        }
        return h('p', {
            class: className,
            innerHTML: this.displayText,
        });
    },
});
</script>
<style>
.quantum-ui-text {
    margin: 0;
    &.quantum-ui-text--single-line {
        white-space: nowrap
    }
}
</style> 
