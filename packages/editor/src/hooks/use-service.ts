import { IDataSourceSchema, ISchemasPage, ISchemasRoot } from '@qimao/quantum-schemas';
import { IEditorProps } from 'src/props';
import { IServices } from 'src/types';
import { nextTick, onBeforeUnmount, toRaw, watch } from 'vue';
import {useComponentRegister, delComponentRegister} from '@q-front-npm/vue3-antd-pc-ui';
import EventSelect from '../components/form/event-select.vue';
import DataSourceFields from '../components/form/datasource-fields.vue';
import DataSourceMethods from '../components/form/datasource-methods.vue';
import KeyValue from '../components/form/key-value.vue';
import ShowInput from '../components/form/show-input.vue';
import EventChoose from '../components/form/event-choose.vue';
import { QCodeEditor, QRichText } from '@q-front-npm/vue3-pc-ui';

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
        contentmenuService,
    }: IServices
) {
    function initServiceState() {
        watch(() => props.value, (val) => {
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
        }, {immediate: true, });
        watch(() => props.boxContextmenuConfigs, (val) => {
            if (val.dropDownList) {
                contentmenuService.set('extraDropMenuList', val.dropDownList);
            }
            if (val.handleMenuEvent) {
                contentmenuService.set('extraDropEvent', val.handleMenuEvent);
            }
        }, {immediate: true, });

        function registerFormComp() {
            useComponentRegister<'EventSelect'>('EventSelect', EventSelect);
            useComponentRegister<'DataSourceFields'>('DataSourceFields', DataSourceFields);
            useComponentRegister<'DataSourceMethods'>('DataSourceMethods', DataSourceMethods);
            useComponentRegister<'KeyValue'>('KeyValue', KeyValue);
            useComponentRegister<'CodeEditor'>('CodeEditor', QCodeEditor);
            useComponentRegister<'RichText'>('RichText', QRichText);
            useComponentRegister<'ShowInput'>('ShowInput', ShowInput);
            useComponentRegister<'EventChoose'>('EventChoose', EventChoose);
        }
        function unRegisterFormComp() {
            delComponentRegister('EventSelect');
            delComponentRegister('DataSourceFields');
            delComponentRegister('DataSourceMethods');
            delComponentRegister('KeyValue');
            delComponentRegister('CodeEditor');
            delComponentRegister('RichText');
            delComponentRegister('ShowInput');
            delComponentRegister('EventChoose');
        }
        registerFormComp();

        onBeforeUnmount(() => {
            unRegisterFormComp();
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

            // const nodeField = editorService.get('node')?.field || props.defaultSelected;
            // let node;
            // if (nodeField) {
            //     node = editorService.getNodeByField(nodeField);
            // }

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

        function dataSourceAddHandler(config: IDataSourceSchema) {
            const app = getApp();
            if (!app) return;
            app.dataSourceManager?.addDataSource(config);
        }

        function dataSourceUpdateHandler(config: IDataSourceSchema) {
            const root = editorService.get('root');
            if (root?.dataSources) {
                getApp()?.dataSourceManager?.updateSchema([config]);
            }
        }

        function dataSourceRemoveHandler(id: string) {
            const app = getApp();
            if (!app) return;
            app.dataSourceManager?.removeDataSource(id);
        }

        dataSourceService.on('add', dataSourceAddHandler);
        dataSourceService.on('update', dataSourceUpdateHandler);
        dataSourceService.on('remove', dataSourceRemoveHandler);

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
