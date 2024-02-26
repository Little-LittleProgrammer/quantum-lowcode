import { IComponentGroup, IComponentGroupState } from '../types';
import { reactive } from 'vue';

/**左侧组件列表管理 */
class ComponentService {
    private state = reactive<IComponentGroupState>({
        list: [],
    });

    /**
	 * @param componentGroupList 组件列表配置
	 */
    public setList(componentGroupList: IComponentGroup[]): void {
        this.state.list = componentGroupList;
    }

    public getList(): IComponentGroup[] {
        return this.state.list;
    }

    public reset() {
        this.state.list = [];
    }

    public destroy() {
        this.reset();
    }
}

export type {ComponentService};

export const componentService = new ComponentService();
