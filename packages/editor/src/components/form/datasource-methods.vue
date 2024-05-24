<!--  -->
<template>
	<div>
		<q-antd-table @register="registerTable">
			<template #bodyCell="{ column, record, index }">
				<template v-if="column.key === 'timing'"> 
                    {{ timeOptions.find((item) => item.value === record.timing)?.label }}
                </template>
				<template v-if="column.key === 'params'"> 
                   {{ record.params?.map(item => item.name).join(';') }}
                </template>
				<template v-if="column.key === 'action'">
					<q-antd-table-action
						:actions="createActions(record, index)"
					/>
				</template>
			</template>
		</q-antd-table>
		<div>
			<a-button size="small" type="link" @click="addData">添加</a-button>
		</div>
		<q-antd-drawer
			:width="800"
			@register="registerDrawer"
			@ok="handlerOk"
			@cancel="handlerCancel"
		>
			<q-antd-form @register="registerForm">
				<template #params="{ field, model }">
					<q-antd-table
						@register="registerTable2"
						:dataSource="model[field]"
					>
						<template #bodyCell="{ column, record }">
							<template v-if="column.key === 'action'">
								<q-antd-table-action
									:actions="createActions2(record)"
								/>
							</template>
						</template>
					</q-antd-table>
                    <div> <a-button size="small" type="link" @click="addParamsData(model, field)">添加</a-button></div>
				</template>
			</q-antd-form>
		</q-antd-drawer>
	</div>
</template>

<script lang="ts" setup>
	import {
		useDrawerInner,
		useForm,
		useTable,
	} from '@quantum-design/vue3-antd-pc-ui';
	import { ICodeBlockContent } from '@quantum-lowcode/schemas';
	import { isArray, js_utils_get_uuid, parseSchemas } from '@quantum-lowcode/utils';
	import { cloneDeep } from 'lodash-es';
    import { getConfig } from '../../utils';
	import { computed, nextTick, ref, unref } from 'vue';

	defineOptions({
		name: 'DataSourceMethods',
	});

	const props = withDefaults(
		defineProps<{
			value: Partial<ICodeBlockContent & { id: string }>[];
		}>(),
		{
			value: [],
		}
	);

	const emits = defineEmits(['change', 'update:value']);

	const timeOptions = [
		{
			label: '页面初始化前',
			value: 'beforeInit',
		},
		{
			label: '页面初始化后',
			value: 'afterInit',
		},
		{
			label: '请求发送前(base类型不生效)',
			value: 'beforeRequest',
		},
		{
			label: '请求发送后(base类型不生效)',
			value: 'afterRequest',
		},
	];

	const getDataSourceProps = computed(() => {
		const data = cloneDeep(props.value);
		return data.map((item) => {
			if (!item.id) {
				item.id = js_utils_get_uuid(4);
			}
			return item;
		});
	});

	let editIndex = -1;

	const [registerTable, { getDataSource, deleteTableDataRecord }] = useTable({
		pagination: false,
		rowKey: 'id',
		dataSource: getDataSourceProps,
		resizable: false,
		columns: [
			{
				title: '方法key',
				key: 'name',
				dataIndex: 'name',
				align: 'center',
				width: 100,
			},
			{
				title: '方法名称',
				key: 'title',
				dataIndex: 'title',
				width: 100,
			},
			{
				title: '执行时机',
				key: 'timing',
				dataIndex: 'timing',
				align: 'center',
				width: 100,
			},
			{
				title: '参数',
				key: 'params',
				dataIndex: 'params',
				align: 'center',
				width: 150,
			},
			{
				title: '描述',
				key: 'description',
				dataIndex: 'description',
				align: 'left',
				width: 200,
			},
		],
		canResize: false,
	});

	function createActions(record: any, index: number) {
		return [
			{
				label: '编辑',
				onClick: () => {
					editIndex = index;
					setDrawerProps({
						visible: true,
					});
					nextTick(() => {
						setFieldsValue({
                            ...record
                        });
					});
				},
			},
			{
				label: '删除',
				popConfirm: {
					title: '是否删除数据',
					confirm: () => {
						deleteTableDataRecord(record.id);
						const data = getDataSource();
						emits('change', data);
						emits('update:value', data);
					},
				},
			},
		];
	}

	function addData() {
		setDrawerProps({
			visible: true,
		});

		nextTick(() => {
			setFieldsValue({
				id: js_utils_get_uuid(4),
				name: '',
				title: '',
				type: '',
				params: [],
				description: '',
                content: "({app, dataSource, }, params) => { console.log(app, dataSource, params) }"
			});
		});
	}

	const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner();

	const [
		registerForm,
		{ setFieldsValue, getFieldsValue, resetFields, validate },
	] = useForm({
		labelWidth: 100,
		schemas: computed(() => [
			{
				label: '方法key',
				field: 'name',
				component: 'Input',
				required: true,
				componentProps: {
					disabled: editIndex !== -1,
				},
			},
			{
				label: '方法名称',
				field: 'title',
				component: 'Input',
				required: true,
			},
			{
				label: '执行时机',
				field: 'timing',
				component: 'Select',
				componentProps: {
					options: timeOptions,
				},
			},
			{
				label: '参数',
				field: 'params',
				component: 'Input',
				slot: 'params',
                defaultValue: []
			},
			{
				label: '',
				field: 'content',
				component: 'CodeEditor',
                defaultValue: "({app, dataSource, }, params) => { console.log(app, dataSource, params) }",
				componentProps: {
					style: {
						height: '800px',
					},
				},
			},
		]),
		showActionButtonGroup: false,
		baseColProps: {
			span: 24,
		},
	});

	const [registerTable2, { deleteTableDataRecord: deleteTableDataRecord2 }] =
		useTable({
			pagination: false,
			rowKey: 'id',
			resizable: false,
			columns: [
				{
					title: '参数key',
					key: 'name',
					dataIndex: 'name',
					align: 'center',
					width: 100,
					editRow: true,
					editComponent: 'Input',
				},
				{
					title: '参数类型',
					key: 'type',
					dataIndex: 'type',
					align: 'center',
					width: 100,
					editRow: true,
					editComponent: 'Select',
					editComponentProps: {
						options: [
							{ label: '字符串', value: 'string' },
							{ label: '数字', value: 'number' },
							{ label: '布尔值', value: 'boolean' },
							{ label: '对象', value: 'object' },
							{ label: '数组', value: 'array' },
							{ label: 'null', value: 'null' },
							{ label: 'any', value: 'any' },
						],
					},
				},
				{
					title: '描述',
					key: 'description',
					dataIndex: 'description',
					align: 'left',
					width: 200,
					editRow: true,
					editComponent: 'Input',
				},
			],
			canResize: false,
		});

	function createActions2(record: any) {
		if (!record.editable) {
			return [
				{
					label: '编辑',
					onClick: () => {
						record.onEdit();
					},
				},
				{
					label: '删除',
					popConfirm: {
						title: '是否删除数据',
						confirm: () => {
							deleteTableDataRecord2(record.id);
						},
					},
				},
			];
		}
		return [
			{
				label: '保存',
				onClick: () => {
					record.onSubmit();
				},
			},
			{
				label: '取消',
				popConfirm: {
					title: '是否取消编辑',
					confirm: () => {
						if (!record.name) {
							deleteTableDataRecord2(record.id);
						}
						record.onCancel();
					},
				},
			},
		];
	}

    function addParamsData(model, field) {
        if (isArray(model[field])) {
            model[field].push({
                id: js_utils_get_uuid(4),
                name: '',
                type: '',
                description: '',
                editable: true,
            });
        } else {
            model[field] = {
                id: js_utils_get_uuid(4),
                name: '',
                type: '',
                description: '',
                editable: true,
            }
        }
    }

	async function handlerOk() {
		await validate();
		const values = getFieldsValue();
		if (isArray(values.params)) {
			values.params = values.params.map((item) =>
				unref(item.editValueRefs)
			);
		}
		const data = getDataSource();
		if (editIndex !== -1) {
			data.splice(editIndex, 1, values);
		} else {
			data.push(values);
		}
		emits('change', data);
		emits('update:value', data);
		editIndex = -1;
		resetFields();
		closeDrawer();
	}
	function handlerCancel() {
		resetFields();
		editIndex = -1;
	}
</script>
<style lang="scss" scoped>
:deep(.q-table) {
    height: auto;
}
</style>
