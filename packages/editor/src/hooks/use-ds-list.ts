// import { addTableEditComp } from "@quantum-design/vue3-antd-pc-ui";
// import { Cascader } from "ant-design-vue";
import { IServices } from "../types";
import { computed } from "vue";

export function useDsList(service?: IServices) {
    const getDsFieldsSelect = computed(() => {
        return service?.editorService.get('root')?.dataSources?.map(ds => {
            return {
                label: `${ds.title || ''}(${ds.id})`,
                value: ds.id,
                children: ds.fields.map((method: any) => {
                    return {
                        label: method.title || method.name,
                        value: `${method.name}`,
                    }
                })
            }
        })
    });
    const getDsEventSelect = computed(() => {
        return service?.editorService.get('root')?.dataSources?.map(ds => {
            return {
                label: `${ds.title || ''}(${ds.id})`,
                value: ds.type === 'base' ? ds.id : `http:${ds.id}`,
                children: ds.methods.map((method: any) => {
                    return {
                        label: method.title || method.name,
                        value: `${ds.id}:${method.name}`,
                    }
                })
            }
        })
    });
    
    return {
        getDsFieldsSelect,
        getDsEventSelect
    }
}