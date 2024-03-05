import {
    AntTreeNodeDropEvent
} from 'ant-design-vue/es/tree';
import { IServices } from '../../../../types';
import { ISchemasNode } from '@qimao/quantum-schemas';
import { Ref } from 'vue';

export function useDrag(services: IServices, gData: Ref<ISchemasNode[]>) {
    function handlerDrop(info: AntTreeNodeDropEvent) {
        const dropKey = info.node.field;
        const dragKey = info.dragNode.field;
        const dropPos = info.node.pos?.split('-') || [];
        const dropPosition =
			info.dropPosition - Number(dropPos[dropPos.length - 1]);
        const loop = (
            data: ISchemasNode[],
            field: string | number,
            callback: any
        ) => {
            data.forEach((item, index) => {
                if (item.field === field) {
                    return callback(item, index, data);
                }
                if (item.children) {
                    return loop(item.children, field, callback);
                }
            });
        };
        const data = [...gData.value];

        // Find dragObject
        let dragObj: ISchemasNode;
        loop(
            data,
            dragKey,
            (item: ISchemasNode, index: number, arr: ISchemasNode[]) => {
                arr.splice(index, 1);
                dragObj = item;
            }
        );
        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, (item: ISchemasNode) => {
                item.children = item.children || [];
                /// where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else if (
            (info.node.children || []).length > 0 && // Has children
			info.node.expanded && // Is expanded
			dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, (item: ISchemasNode) => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            let ar: ISchemasNode[] = [];
            let i = 0;
            loop(
                data,
                dropKey,
                (
                    _item: ISchemasNode,
                    index: number,
                    arr: ISchemasNode[]
                ) => {
                    ar = arr;
                    i = index;
                }
            );
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }
        console.log(data);
        services.editorService.update(data);
    }
    return {
        handlerDrop,
    };
}
