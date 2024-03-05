<script lang="ts">
	import { computed, defineComponent, getCurrentInstance, h, inject, PropType } from 'vue';

	import {useApp} from '../../hooks/use-app';
	import type { ISchemasNode} from '@qimao/quantum-schemas';

	export default defineComponent({
	  props: {
	    config: {
	      type: Object as PropType<ISchemasNode>,
	      default: () => ({}),
	    },

	    text: {
            type: String || Function,
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
	      type: Boolean,
	      default: true,
	    },
	  },

	  setup(props) {
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
                    tmp = tmp.replace(new RegExp(`{{${key}}}`, 'g'), value);
                });
                return tmp;
            }
            return text || '';
	    });

	    return {
	      displayText,
	    };
	  },

	  render() {
        if (this.isNative) {
            return h('div', {
                domProps: {
                    innerHTML: this.displayText
                }
            })
        }
	    const className = this.multiple ? 'quantum-ui-text' : 'quantum-ui-text quantum-ui-text--single-line';
	    if (typeof this.$slots?.default === 'function') {
	        return h('p', { class: className }, [this.$slots?.default?.() || '']);
	    }
	    return h('p', {
            class: className,
            domProps: {
                innerHTML: this.displayText,
            },
	    });
	  },
	});
</script>
<style>
.quantum-ui-text {
    &.quantum-ui-text--single-line {
        white-space: nowrap
    }
}
</style>
