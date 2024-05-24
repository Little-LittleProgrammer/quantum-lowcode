import { Subscribe } from '@quantum-lowcode/utils';
import { IRuleOptions } from './types';
import { GuidesType } from './const';

// 辅助线,移动线规则
export class Rule extends Subscribe {
    constructor(container: HTMLDivElement, options?: IRuleOptions) {
        super();
    }

    public setGuides([hLines, vLines]: [number[], number[]]) {
        // TODO, 辅助线和移动线 change-guides
        this.emit('change-mask', {
            type: GuidesType.HORIZONTAL,
            guides: hLines,
        });

        this.emit('change-mask', {
            type: GuidesType.VERTICAL,
            guides: vLines,
        });
    }

    /**
     * 清空所有参考线
     */
    clearGuides() {

    }
}
