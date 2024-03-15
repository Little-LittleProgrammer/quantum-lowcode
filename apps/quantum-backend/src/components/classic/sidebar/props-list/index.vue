<script lang="tsx">
	import { IServices } from '@qimao/quantum-editor';
	import { ISchemasNode, Id } from '@qimao/quantum-schemas';
	import {
		js_is_array,
		js_utils_dom_add_class,
		js_utils_dom_remove_class,
	} from '@qimao/quantum-utils';
	import { computed, defineComponent, inject, nextTick, onBeforeMount, onMounted, ref, watch } from 'vue';
	import { useSortable } from '@q-front-npm/hooks/base/use-sortable';
import { CLASSIC_WORKSPACE_WIDTH } from '@/enums/projectEnum';
	export default defineComponent({
		name: 'PropsList',
		inheritAttrs: false,
		setup() {
			const services = inject<IServices>('services');
			const page = computed(() => services?.editorService.get('page'));
            const list = ref<any>([])
			const compList =
				computed(() => {
					return page.value?.children  || [];
				});

			watch(
				() => compList.value,
				(val) => {
                    list.value = []
					nextTick(() => {
                        list.value = val
						setTimeout(() => {
                            initDrag();
                        })
					});
				},
				{ immediate: true, deep: true }
			);

			function initDrag() {
				const $dom = document.querySelectorAll('.drop-father');
				$dom.forEach((el) => {
					const { initSortable } = useSortable(el, {
						group: 'propsList',
						fallbackOnBody: true,
						emptyInsertThreshold: 5, // 像素值，根据需要调整
						animation: 150,
						swapThreshold: 0.65,
						preventOnFilter: false,
						filter: (_evt: ChangeEvent, target: HTMLElement) => {
							if (
								_evt.target?.className?.includes?.(
									'anticon-drag'
								) ||
								_evt.target.tagName?.toLowerCase() === 'svg' ||
								_evt.target.tagName?.toLowerCase() === 'path'
							) {
								return false;
							}
							return true;
						},
						onStart: (_evt: ChangeEvent) => {
							console.log('onStart');
							const els = document.querySelectorAll('.drop-father');
							els.forEach((el) => {
                                const parent = el.parentElement
                                // 添加占位元素
                                if(!el.className?.includes('item-children') && (parent?.id?.includes('container') || parent?.id?.includes('page'))) {
                                    js_utils_dom_add_class(el, 'placeholder'); 
                                }
							});
						},
						onEnd: (_evt: any) => {
							const els = document.querySelectorAll('.drop-father');
							els.forEach((el) => {
								js_utils_dom_remove_class(el, 'placeholder');
							});
                            const curField = _evt.item.id;
                            const curNode = services?.editorService.getNodeByField(curField);
                            const curParent = services?.editorService.getParentByField(curField);
                            let parentNode = null;
                            let newIndex = _evt.newIndex
                            if (_evt.to?.id) {
                                parentNode = services?.editorService.getNodeByField(_evt.to.id);
                            } else {
                                const parentEl = (_evt.to as HTMLElement).parentElement;
                                if (parentEl?.id) {
                                    parentNode = services?.editorService.getNodeByField(parentEl.id);
                                }
                            }
                            if (curParent?.field === parentNode?.field && _evt.oldIndex < _evt.newIndex) {
                                newIndex++
                            }
                            if (parentNode) {
                                services?.editorService.dragTo(curNode, parentNode, newIndex)
                            }
						},
					});
					initSortable();
				});
			}
			function changeValue(
				value: Record<string, any>,
				node: ISchemasNode
			) {
				const finValue = { ...node, label: value.label };
				finValue.componentProps = {
					...value.componentProps,
				};
				if (finValue.componentProps?.events) {
					finValue.componentProps = {
						...finValue.componentProps,
						...finValue.componentProps.events,
					};
				}

				services?.editorService.update(finValue);
			}
            function selectNode(e: MouseEvent, field: Id) {
                e.stopPropagation()
                services?.editorService.select(field);
                services?.editorService.get('sandbox')?.select(field)
            }
			function deleteNode(node: ISchemasNode) {
				services?.editorService.delete(node);
			}
			function renderNode(nodes: ISchemasNode[]) {
				const renderItem = (node: ISchemasNode) => {
					const propsConfig = computed(() => {
                        const configs = services?.propsService.getConfig(
                            node.component || node.type
                        ) || []
                        if (configs[configs.length-1]?.component === 'EventSelect') {
                            return services?.propsService.getConfig(
                                node.component || node.type
                            )?.slice(2, configs.length-1) || []
                        }
                        return services?.propsService.getConfig(
                            node.component || node.type
                        )?.slice(2) || []
                    });
					return (
						<div class="classic-sidebar-props-list" id={node.field} onClick={(e) =>selectNode(e, node.field)}>
							<div class="item-top">
								<p class="item-title">{node.label}({node.field})</p>
								<div class="item-extra">
									<q-antd-icon
										type="DeleteOutlined"
										onClick={() => deleteNode(node)}
									></q-antd-icon>
									<q-antd-icon type="DragOutlined"></q-antd-icon>
								</div>
							</div>
							{propsConfig.value?.length > 0 && (<div class="item-content">
								<q-antd-form
									model={node}
									layout="vertical"
									rowProps={{ gutter: 10 }}
									showActionButtonGroup={false}
									schemas={propsConfig.value}
									onBlur={(value) => changeValue(value, node)}
								></q-antd-form>
							</div>)}

							<div
								class={
									js_is_array(node.children) &&
									node.children.length > 0
										? 'item-children drop-father'
										: 'drop-father'
								}
							>
								{js_is_array(node.children) &&
									node.children.map((item) =>
										renderItem(item)
									)}
							</div>
						</div>
					);
				};
				return js_is_array(nodes) ? nodes.map(renderItem) : null;
			}
            onMounted(() => {
                services?.uiService.set('workspaceRight', CLASSIC_WORKSPACE_WIDTH.Right)
                services?.uiService.set('workspaceCenter', CLASSIC_WORKSPACE_WIDTH.Center)
                services?.uiService.set('workspaceLeft', CLASSIC_WORKSPACE_WIDTH.Left)
            })
			return () => (
				<div class="classic-sidebar-props drop-father" id={page.value?.field}>
					{renderNode(list.value || [])}
				</div>
			);
		},
	});
</script>
<style lang="scss" scoped>
	.classic-sidebar-props {
		margin: 6px;
		padding: 6px;
		border: 1px solid;
		@include border-color(border-color);
		@include bg-color(body-bg);
		&-list {
            border-radius: 10px;
			position: relative;
			@include bg-color(aside-bg);
			margin-bottom: 6px;
			border: 1px solid;
			padding: 0px 10px;
			@include border-color(border-color);
            box-shadow: 2px 2px 5px 3px $border-color-base;
            &:hover {
                box-shadow: 2px 2px 5px 5px #d0d0d2;
            }
            .sortable-ghost{
                position: relative;
            }
            .sortable-ghost::after {
                content: '';
                position: absolute;
                border-radius: 10px;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-color: #000;
                opacity: .1;
                pointer-events: none;
            }
			.placeholder {
				min-height: 30px;
                margin-bottom: 10px;
				@include bg-color(body-bg);
                position: relative;
                &::after {
                    content: '拖入此处成为此节点的子节点';
			        @include text-color(text-color-secondary);
                    line-height: 30px;
                    text-align: center;
                    position: absolute;
                    border-radius: 10px;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                }
			}
			.item-top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				height: 30px;
				border-bottom: 1px solid;
				@include border-color(border-color);
				.item-title {
					margin-left: 10px;
					flex: 1;
					font-size: 18px;
					font-weight: 800;
				}
				.item-extra {
					span {
						width: 30px;
						height: 30px;
						cursor: pointer;
						color: $link-color;
					}
				}
			}
			.item-content {
				padding: 10px;
			}
			.item-children {
				padding: 10px;
			}
			:deep(.ant-form-vertical .ant-form-item-label) {
				padding: 0;
				font-weight: 700;
			}
		}
	}
</style>

