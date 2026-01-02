import { useState, Fragment, useMemo, useEffect } from 'react';

import { getFilter, setFilter, subscribeFilter } from 'api/searchFilter';

import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Input from '@mui/joy/Input';
import Divider from '@mui/joy/Divider';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Tooltip from '@mui/joy/Tooltip';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Checkbox from '@mui/joy/Checkbox';

import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import ReplayIcon from '@mui/icons-material/Replay';

const fieldContext = {
	type: {
		name: 'Type',
		type: 'select',
		options: [
			{ name: 'Blueprint', value: 0 },
			{ name: 'Preset', value: 1 },
			{ name: 'Theme', value: 2 },
			{ name: 'Asset Pack', value: 3 },
		],
		canSort: false,
	},
	header: { name: 'Title', type: 'str', canSort: true },
	metric: { name: 'Size', type: 'int', canSort: true },
	// publisher: { name: 'Publisher', type: 'str', canSort: false },
	downloads: { name: 'Downloads', type: 'int', canSort: true },
	visibility: {
		name: 'Visibility',
		type: 'select',
		options: [
			{ name: 'Public', value: 'public' },
			{ name: 'Asset Pack Item', value: 'childItem' },
		],
		canSort: false,
	},
	saves: { name: 'Saves', type: 'int', canSort: true },
	date_created: { name: 'Date Uploaded', type: 'date', canSort: true },
};

const operatorsByType = {
	str: ['eq', 'neq', 'like'],
	int: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'],
	date: ['gt', 'gte', 'lt', 'lte'],
	select: ['eq'],
};

const operatorLabels = {
	eq: '=',
	neq: '!=',
	gt: '>',
	gte: '≥',
	lt: '<',
	lte: '≤',
	in: 'IN',
	like: '~',
};

const MAX_FILTER_LENGTH = 1000;

function getDefaultValueForField(field) {
	const ctx = fieldContext[field];
	if (!ctx) return '';

	switch (ctx.type) {
		case 'select':
			return ctx.options[0]?.value ?? '';
		case 'int':
			return 0;
		case 'str':
			return '';
		case 'date':
			return '';
		default:
			return '';
	}
}

function getDefaultOperatorForField(field) {
	const ctx = fieldContext[field];
	if (!ctx) return 'eq';

	return operatorsByType[ctx.type]?.[0] ?? 'eq';
}

function isValidValue(field, value) {
	const ctx = fieldContext[field];
	if (!ctx) return false;

	switch (ctx.type) {
		case 'int':
		case 'select':
			return value !== undefined && value !== null;
		case 'str':
		case 'date':
			return typeof value === 'string' && value.trim() !== '';
		default:
			return false;
	}
}

function parseFilterToRootGroup(filterObj) {
	if (!filterObj) {
		return { operator: 'and', conditions: [] };
	}

	if (filterObj.field) {
		return {
			operator: 'and',
			conditions: [filterObj],
		};
	}

	const keys = Object.keys(filterObj);
	if (keys.length === 1 && (keys[0] === 'and' || keys[0] === 'or')) {
		const operator = keys[0];

		const conditions = filterObj[operator]
			.map((cond) => {
				if (!cond) return null;

				if (cond.field) {
					return cond;
				}

				const parsed = parseFilterToRootGroup(cond);
				if (!parsed.conditions.length) return null;

				return {
					type: 'group',
					operator: parsed.operator,
					conditions: parsed.conditions,
				};
			})
			.filter(Boolean);

		return { operator, conditions };
	}

	return { operator: 'and', conditions: [] };
}

function parseGlobalSorts(globalFilter) {
	const currentSorts = Array.isArray(globalFilter?.sort) ? globalFilter.sort : [];

	return [
		currentSorts[0] ?? { field: '', direction: 'asc' },
		currentSorts[1] ?? { field: '', direction: 'asc' },
		currentSorts[2] ?? { field: '', direction: 'asc' },
	];
}

function ValueInput({ field, value, onChange }) {
	const ctx = fieldContext[field];

	if (!ctx) {
		return (
			<Input
				placeholder="Value"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				sx={{ borderRadius: 0, boxShadow: 'none', flex: 1 }}
				variant="soft"
			/>
		);
	}

	switch (ctx.type) {
		case 'select': {
			const safeValue = ctx.options.some((o) => o.value === value) ? value : ctx.options[0]?.value ?? '';

			return (
				<Select
					value={safeValue}
					onChange={(e, newValue) => onChange(newValue)}
					sx={{ borderRadius: 0, boxShadow: 'none', flex: 1 }}
					variant="soft"
				>
					{ctx.options.map((opt) => (
						<Option key={opt.value} value={opt.value}>
							{opt.name}
						</Option>
					))}
				</Select>
			);
		}

		case 'int':
			return (
				<Input
					type="number"
					placeholder={ctx.name}
					value={value}
					onChange={(e) => onChange(Number(e.target.value))}
					sx={{ borderRadius: 0, boxShadow: 'none', flex: 1 }}
					variant="soft"
				/>
			);

		case 'date': {
			const dateStr = value ? new Date(value).toISOString().split('T')[0] : '';

			return (
				<Input
					type="date"
					value={dateStr}
					onChange={(e) => {
						const newDate = e.target.value;
						if (newDate) {
							onChange(new Date(newDate).toISOString());
						} else {
							onChange(undefined);
						}
					}}
					sx={{ borderRadius: 0, boxShadow: 'none', flex: 1 }}
					variant="soft"
				/>
			);
		}

		case 'str':
		default:
			return (
				<Input
					placeholder={ctx.name}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					sx={{ borderRadius: 0, boxShadow: 'none', flex: 1 }}
					variant="soft"
				/>
			);
	}
}

function FilterRow({ filter, setFilter, onDelete }) {
	const updateField = (key, value) => {
		setFilter({ ...filter, [key]: value });
	};

	const fieldType = fieldContext[filter.field]?.type;
	const validOperators = fieldType ? operatorsByType[fieldType] : [];
	const currentOp = validOperators.includes(filter.op) ? filter.op : validOperators[0];

	return (
		<Box sx={{ display: 'flex', gap: 0, mt: 1, pl: 2 }}>
			<Select
				placeholder="Field"
				value={filter.field || ''}
				onChange={(e, newField) => {
					setFilter({
						field: newField,
						op: getDefaultOperatorForField(newField),
						value: getDefaultValueForField(newField),
					});
				}}
				sx={{ borderRadius: 'var(--joy-radius-sm) 0 0 var(--joy-radius-sm)', boxShadow: 'none' }}
				variant="soft"
			>
				{Object.entries(fieldContext).map(([key, ctx]) => (
					<Option key={key} value={key}>
						{ctx.name}
					</Option>
				))}
			</Select>

			<Select
				placeholder="Operator"
				value={currentOp || ''}
				onChange={(e, newValue) => updateField('op', newValue)}
				disabled={!fieldType}
				sx={{ borderRadius: 0, boxShadow: 'none' }}
				variant="soft"
			>
				{validOperators.map((op) => (
					<Option key={op} value={op}>
						{operatorLabels[op]}
					</Option>
				))}
			</Select>

			<ValueInput field={filter.field} value={filter.value} onChange={(v) => updateField('value', v)} />

			<IconButton
				variant="soft"
				onClick={onDelete}
				sx={{ borderRadius: '0 var(--joy-radius-sm) var(--joy-radius-sm) 0' }}
			>
				<ClearIcon />
			</IconButton>
		</Box>
	);
}

function FilterGroup({ group, setGroup, root = false, onDelete }) {
	const addCondition = () => {
		setGroup({
			...group,
			conditions: [
				...(group.conditions || []),
				{
					field: 'type',
					op: getDefaultOperatorForField('type'),
					value: getDefaultValueForField('type'),
				},
			],
		});
	};

	const addSubGroup = () => {
		setGroup({
			...group,
			conditions: [...(group.conditions || []), { type: 'group', operator: 'and', conditions: [] }],
		});
	};

	const updateCondition = (index, newCondition) => {
		const updated = [...group.conditions];
		updated[index] = newCondition;
		setGroup({ ...group, conditions: updated });
	};

	const deleteGroup = () => {
		if (onDelete) onDelete();
	};

	const content = (
		<>
			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
				<Select
					value={group.operator}
					onChange={(e, newValue) => setGroup({ ...group, operator: newValue })}
					variant="soft"
					size="sm"
				>
					<Option value="and">All</Option>
					<Option value="or">Any</Option>
				</Select>

				<Dropdown>
					<MenuButton
						slots={{ root: IconButton }}
						slotProps={{ root: { variant: 'soft', color: 'neutral', size: 'sm' } }}
					>
						<AddIcon />
					</MenuButton>
					<Menu sx={{ zIndex: 1500 }}>
						<MenuItem onClick={addCondition}>Condition</MenuItem>
						<MenuItem onClick={addSubGroup}>Group</MenuItem>
					</Menu>
				</Dropdown>

				{!root && (
					<IconButton size="sm" onClick={deleteGroup} variant="plain" color="danger">
						<DeleteOutlinedIcon />
					</IconButton>
				)}
			</Box>

			{(group.conditions || []).map((c, i) =>
				c.type === 'group' ? (
					<FilterGroup
						key={i}
						group={c}
						setGroup={(newGroup) => updateCondition(i, newGroup)}
						onDelete={() => {
							const updated = [...group.conditions];
							updated.splice(i, 1);
							setGroup({ ...group, conditions: updated });
						}}
					/>
				) : (
					<FilterRow
						key={i}
						filter={c}
						setFilter={(newFilter) => updateCondition(i, newFilter)}
						onDelete={() => {
							const updated = [...group.conditions];
							updated.splice(i, 1);
							setGroup({ ...group, conditions: updated });
						}}
					/>
				)
			)}
		</>
	);

	return root ? (
		<Sheet
			variant="outlined"
			sx={{
				px: 0.5,
				py: 1,
				borderRadius: 'sm',
			}}
		>
			{content}
		</Sheet>
	) : (
		<Sheet
			variant="outlined"
			sx={{
				pr: 0.5,
				ml: 2,
				pl: 1,
				py: 1,
				my: 1,
				borderRadius: 'sm',
			}}
		>
			{content}
		</Sheet>
	);
}

export default function MoreFilterModal({ open, setOpen }) {
	const initialGlobalFilter = getFilter();
	const initialRootGroup = parseFilterToRootGroup(initialGlobalFilter.filter);

	const [rootGroup, setRootGroup] = useState(initialRootGroup);

	const encodeFilterSettings = () => {
		const json = JSON.stringify(rootGroup);
		return btoa(unescape(encodeURIComponent(json)));
	};

	const [filterCode, setFilterCode] = useState(encodeFilterSettings());
	const [sorts, setSorts] = useState(() => parseGlobalSorts(initialGlobalFilter));

	const [savedOnly, setSavedOnly] = useState(initialGlobalFilter.savedOnly);

	const serializedRootGroup = useMemo(() => {
		const str = JSON.stringify(rootGroup);
		return {
			value: str,
			tooLong: str.length > MAX_FILTER_LENGTH,
			length: str.length,
		};
	}, [rootGroup]);

	const defaultRootGroup = {
		operator: 'and',
		conditions: [
			{
				field: 'visibility',
				op: 'eq',
				value: 'public',
			},
		],
	};

	useEffect(() => {
		setFilterCode(encodeFilterSettings());
	}, [rootGroup]);

	const decodeFilterSettings = (base64) => {
		const json = decodeURIComponent(escape(atob(base64)));
		return JSON.parse(json);
	};

	const handleSetRootGroup = (event) => {
		try {
			const decoded = decodeFilterSettings(event.target.value);
			setRootGroup(decoded);
		} catch (error) {}
	};

	const updateSort = (index, newSort) => {
		const updated = [...sorts];
		updated[index] = newSort;
		setSorts(updated);
	};

	function transformGroupToFilter(group) {
		if (!group || !group.conditions) return {};

		const operator = group.operator;

		const filters = group.conditions
			.map((cond) => {
				if (cond.type === 'group') {
					return transformGroupToFilter(cond);
				}

				const { field, op, value } = cond;

				if (field && op && isValidValue(field, value)) {
					return { field, op, value };
				}

				return null;
			})
			.filter(Boolean);

		if (!filters.length) return {};

		return { [operator]: filters };
	}

	const handleClose = () => {
		const filter = transformGroupToFilter(rootGroup) ?? {};
		const finalSorts = sorts.filter((s) => s.field);

		const result = {
			filter,
			sort: finalSorts.length ? finalSorts : [{ field: 'date_created', direction: 'asc' }],
			savedOnly: savedOnly,
		};

		setFilter(result);
		setOpen(false);
	};

	useEffect(() => {
		const unsubscribe = subscribeFilter((newFilter) => {
			const newRootGroup = parseFilterToRootGroup(newFilter.filter);
			setRootGroup(newRootGroup);
			
			const newSorts = parseGlobalSorts(newFilter);
			setSorts(newSorts)
		});
		return () => unsubscribe();
	}, []);

	return (
		<Fragment>
			<Modal open={open} onClose={() => setOpen(false)}>
				<ModalDialog sx={{ maxWidth: 600, width: '100%' }}>
					<ModalClose />
					<DialogTitle>Advanced Filters</DialogTitle>
					<Divider />
					<DialogContent sx={{ gap: 1.5 }}>
						<Box>
							<Typography level="title-md">Filter Code (copy/paste)</Typography>
							<Input
								value={filterCode}
								onChange={handleSetRootGroup}
								endDecorator={
									<IconButton variant="soft" onClick={() => setRootGroup(defaultRootGroup)}>
										<ReplayIcon />
									</IconButton>
								}
							/>
						</Box>
						<Box>
							<Typography level="title-md">Filter</Typography>
							<FilterGroup group={rootGroup} setGroup={setRootGroup} root />
						</Box>

						<Box>
							<Typography level="title-md">Sorting</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								{sorts.map((s, i) => (
									<Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
										<Typography sx={{ width: 16 }}>{`${i + 1}.`}</Typography>
										<Select
											sx={{ flex: 1 }}
											value={s.field}
											onChange={(e, v) => updateSort(i, { ...s, field: v })}
											variant="soft"
										>
											{Object.entries(fieldContext).map(([key, ctx]) =>
												ctx.canSort ? (
													<Option key={key} value={key}>
														{ctx.name}
													</Option>
												) : null
											)}
										</Select>

										<Select
											value={s.direction}
											onChange={(e, v) => updateSort(i, { ...s, direction: v.toLowerCase() })}
											variant="soft"
											disabled={!s.field}
										>
											<Option value="asc">Ascending</Option>
											<Option value="desc">Descending</Option>
										</Select>
									</Box>
								))}
							</Box>
						</Box>
						<FormControl>
							<Checkbox
								label="Saved only"
								sx={{ width: 'fit-content' }}
								checked={savedOnly}
								onChange={(event) => setSavedOnly(event.target.checked)}
							/>
							<FormHelperText>Only show assets you have saved.</FormHelperText>
						</FormControl>
						<Tooltip
							title={`Filter Length too long (${serializedRootGroup.length}/${MAX_FILTER_LENGTH})`}
							open={serializedRootGroup.tooLong}
							onClick={handleClose}
							color="danger"
							arrow
						>
							<Button disabled={serializedRootGroup.tooLong}>Apply Filters</Button>
						</Tooltip>
					</DialogContent>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
