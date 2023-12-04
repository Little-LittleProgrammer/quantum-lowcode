import { ISchemasRoot } from '@qimao/quantum-core';
import { IEditorProps } from 'src/props';
import { IServices } from 'src/types';
import { nextTick, onUnmounted, toRaw, watch } from 'vue';

export function useServicesInit(
    props: IEditorProps,
    emit: ((event: 'update:value', value: ISchemasRoot | null) => void),
    {
        editorService,
        uiService,
    }: IServices
) {
    function initServiceState() {
        watch(() => props.value, (val) => {
            console.log('editorService', editorService);
            nextTick(() => {
                editorService.set('root', val || null);
            });
        }, {immediate: true, });
        watch(() => props.boxRect, (val) => {
            val && uiService.set('sandboxRect', val);
        }, {immediate: true, });
    }
    function initServiceEvents() {
        async function root_change_handler(value: ISchemasRoot, preValue: ISchemasRoot) {
            if (value?.children?.length) {
                if (preValue?.children?.length && value.children.length <= preValue.children.length && editorService.get('page')) {
                    editorService.select(editorService.get('page')!);
                } else {
                    editorService.select(value.children[0]);
                }
            }
            if (toRaw(value) !== toRaw(preValue)) {
                emit('update:value', value);
            }
        }
        editorService.on('root-change', root_change_handler);
    }
    onUnmounted(() => {
        editorService.reset();
        editorService.remove('root-change');
    });
    return {
        initServiceState,
        initServiceEvents,
    };
}
