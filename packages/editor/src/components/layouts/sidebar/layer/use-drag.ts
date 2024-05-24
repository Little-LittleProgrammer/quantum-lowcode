import { AntTreeNodeDropEvent } from 'ant-design-vue/es/tree';
import { IServices } from '../../../../types';
import { ISchemasContainer, ISchemasNode } from '@quantum-lowcode/schemas';
import { Ref } from 'vue';
import { getNodeIndex } from '../../../../utils/editor';

export function useDrag(services: IServices, gData: Ref<ISchemasNode[]>) {
	function handlerDrop(info: AntTreeNodeDropEvent) {
		const dropKey = info.node.field; // 要替换的元素
		const dragKey = info.dragNode.field; // 拖拽的元素
		const dropPos = info.node.pos?.split('-') || [];
		const dropPosition =
			info.dropPosition - Number(dropPos[dropPos.length - 1]);
		console.log(dropKey, dragKey, dropPos, dropPosition);
		const dragNode = services.editorService.getNodeByField(dragKey);
		const dropNode = services.editorService.getNodeByField(dropKey);
		let dropParent = services.editorService.getParentByField(dropKey);
		let index = -1;
		if (dropNode?.type === 'node') {
			if (dropParent) {
				index = getNodeIndex(dropKey, dropParent) + 1;
			}
		} else {
			if (dropPosition === 0) {
				dropParent = dropNode as ISchemasContainer;
				index = 0;
			} else {
				if (dropParent) {
					index = getNodeIndex(dropKey, dropParent) + 1;
				}
			}
		}
		if (index >= 0) {
			services.editorService.dragTo(dragNode, dropParent, index);
		}
		// services.editorService.update(data);
	}
	return {
		handlerDrop,
	};
}
