import { ISchemasPage, ISchemasRoot } from '@qimao/quantum-schemas';
import { IEditorProps } from 'src/props';
import { IServices } from 'src/types';
import { nextTick, onBeforeUnmount, toRaw, watch } from 'vue';
import {useComponentRegister, delComponentRegister} from '@q-front-npm/vue3-antd-pc-ui';
import EventSelect from '../components/form/event-select.vue';

export function useServicesInit(
    props: IEditorProps,
    emit: ((event: 'update:value', value: ISchemasRoot | null) => void),
    {
        editorService,
        uiService,
        componentService,
        propsService,
        historyService,
        dataSourceService,
    }: IServices
) {
    function initServiceState() {
        useComponentRegister<'EventSelect'>('EventSelect', EventSelect);
        watch(() => props.value, (val) => {
            console.log('editorService', editorService);
            nextTick(() => {
                editorService.set('root', val || null);
            });
        }, {immediate: true, });
        watch(() => props.boxRect, (val) => {
            val && uiService.set('sandboxRect', val);
        }, {immediate: true, });
        watch(() => props.componentGroupList, (componentGroupList) => {
            componentGroupList && componentService.setList(componentGroupList);
        }, {immediate: true, });
        watch(() => props.propsValues, (values) => {
            values && propsService.setPropsValues(values);
        }, {immediate: true, });
        watch(() => props.propsConfigs, (val) => {
            val && propsService.setPropsConfigs(val);
        });
        watch(() => props.methodsList, (val) => {
            val && propsService.setMethodsConfigs(val);
        });
        watch(() => props.datasourceList, (datasourceList) => {
            datasourceList && dataSourceService.set('datasourceTypeList', datasourceList);
        }, {immediate: true, }
        );

        onBeforeUnmount(() => {
            delComponentRegister('EventSelect');
            editorService.reset();
            historyService.reset();
            propsService.reset();
            uiService.reset();
            componentService.reset();
        });
    }
    function initServiceEvents() {
        const getApp = () => {
            const sandbox = editorService.get('sandbox');
            return sandbox?.renderer.runtime?.getApp?.();
        };

        async function rootChangeHandler(value: ISchemasRoot, preValue: ISchemasRoot) {
            if (!value) return;

            value.dataSources = value.dataSources || [];
            dataSourceService.set('dataSources', value.dataSources);

            const nodeField = editorService.get('node')?.field || props.defaultSelected;
            let node;
            if (nodeField) {
                node = editorService.getNodeByField(nodeField);
            }

            if (value?.children?.length) {
                if (preValue?.children?.length && value.children.length <= preValue.children.length && editorService.get('page')) {
                    editorService.select(editorService.get('page')! as ISchemasPage);
                } else {
                    editorService.select(value.children[0]);
                }
            } else if (value.field) {
                editorService.set('nodes', [value]);
                editorService.set('parent', null);
                editorService.set('page', null);
            }
            if (toRaw(value) !== toRaw(preValue)) {
                emit('update:value', value);
            }
        }
        editorService.on('root-change', rootChangeHandler);

        onBeforeUnmount(() => {
            editorService.remove('root-change');
            dataSourceService.remove('add');
            dataSourceService.remove('update');
            dataSourceService.remove('remove');
        });
    }
    return {
        initServiceState,
        initServiceEvents,
    };
}
