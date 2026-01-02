'use client';

import { useState, useEffect } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { format } from 'date-fns';
import { post } from 'api/network';
import { useRouter } from 'next/navigation';

import PropTypes from 'prop-types';
import Box from '@mui/joy/Box';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Link from '@mui/joy/Link';
import Tooltip from '@mui/joy/Tooltip';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import Button from '@mui/joy/Button';
import Dropdown from '@mui/joy/Dropdown';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';

import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import OpenInNew from '@mui/icons-material/OpenInNew';

const tableMap = {
	users: {
		label: 'Users',
		values: {
			uuid: {
				id: 'uuid',
				label: 'UUID',
				visible: true,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			username: {
				id: 'username',
				label: 'Name',
				visible: true,
				allowSorting: false,
				headerData: {
					inputType: 'input',
				},
			},
			// permission_level: {
			// 	id: 'permission_level',
			// 	label: 'Permission Level',
			// 	visible: true,
			// 	allowSorting: true,
			// 	headerData: {
			// 		inputType: 'select',
			// 		values: [
			// 			{ label: 'Admin', value: 0 },
			// 			{ label: 'Moderator', value: 1 },
			// 			{ label: 'User', value: 2 },
			// 			{ label: 'Viewer', value: 3 },
			// 			{ label: 'Blocked', value: 4 },
			// 		],
			// 	},
			// },
			image_id: {
				id: 'image_id',
				label: 'Image ID',
				visible: false,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			last_login: {
				id: 'last_login',
				label: 'Last Login',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			last_visit: {
				id: 'last_visit',
				label: 'Last Visit',
				visible: false,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			last_interaction: {
				id: 'last_interaction',
				label: 'Last Interaction',
				visible: false,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			date_created: {
				id: 'date_created',
				label: 'Date Created',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
		},
	},
	items: {
		label: 'Items',
		values: {
			uuid: {
				id: 'uuid',
				label: 'UUID',
				visible: true,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			type: {
				id: 'type',
				label: 'Item Type',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'select',
					values: [
						{ label: 'Blueprint', value: 0 },
						{ label: 'Preset', value: 1 },
						{ label: 'Theme', value: 2 },
						{ label: 'Asset Pack', value: 3 },
						{ label: 'Cat Image', value: 4 },
					],
				},
			},
			header: {
				id: 'header',
				label: 'Header',
				visible: true,
				allowSorting: false,
				headerData: {
					inputType: 'input',
				},
			},
			metric: {
				id: 'metric',
				label: 'Metric',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			publisher: {
				id: 'publisher',
				label: 'Publisher',
				visible: false,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			parent: {
				id: 'parent',
				label: 'Parent UUID',
				visible: false,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			downloads: {
				id: 'downloads',
				label: 'Downloads',
				visible: false,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			saves: {
				id: 'saves',
				label: 'Saves',
				visible: false,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			date_created: {
				id: 'date_created',
				label: 'Date Created',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
			last_updated: {
				id: 'last_updated',
				label: 'Last Updated',
				visible: false,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
		},
	},
	reports: {
		label: 'Reports',
		values: {
			uuid: {
				id: 'uuid',
				label: 'UUID',
				visible: true,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			report_status: {
				id: 'report_status',
				label: 'Status',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'select',
					values: [
						{ label: 'Open', value: 'open' },
						{ label: 'Closed', value: 'closed' },
					],
				},
			},
			topic: {
				id: 'topic',
				label: 'Topic',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'select',
					values: [
						{ label: 'Stolen / Impersonation', value: 'stolen' },
						{ label: 'NSFW', value: 'nsfw' },
						{ label: 'Discriminatory', value: 'discriminatory' },
						{ label: 'Swearing / Slurs', value: 'swearing' },
						{ label: 'Advertising', value: 'advertising' },
						{ label: 'Spam / Misleading', value: 'spam' },
						{ label: 'Other', value: 'other' },
					],
				},
			},
			desc_value: {
				id: 'desc_value',
				label: 'Description',
				visible: false,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			author: {
				id: 'author',
				label: 'Author',
				visible: false,
				allowSorting: false,
				headerData: {
					inputType: 'none',
				},
			},
			date_created: {
				id: 'date_created',
				label: 'Date Created',
				visible: true,
				allowSorting: true,
				headerData: {
					inputType: 'none',
				},
			},
		},
	},
};

function labelDisplayedRows({ from, to, maxRows }) {
	return `${from}-${to} of ${maxRows}`;
}

function EnhancedTableHead(props) {
	const { order, orderBy, onRequestSort, headCells, tableData, setFilter } = props;
	const createSortHandler = (property) => (event) => {
		onRequestSort(event, property);
	};

	return (
		<thead>
			<tr>
				{headCells.map((headCell) => {
					const headCellData = tableData?.values[headCell];
					if (!headCellData) return;
					const active = orderBy === headCellData.id;

					let headCellValue = headCellData.label;

					if (headCellData.headerData.inputType === 'input') {
						headCellValue = (
							<Input
								sx={{ mr: 2, width: '100%' }}
								placeholder={'Search ' + headCellData.label}
								onChange={(event) => setFilter(headCellData.id, event.target.value, false)}
							/>
						);
					}

					if (headCellValue === 'UUID') {
						headCellValue = '';
					}

					if (headCellData.headerData.inputType === 'select') {
						headCellValue = (
							<Box
								sx={{
									mr: 2,
									flexShrink: 0,
									width: 'calc(100% - 64px)',
								}}
							>
								<Select
									defaultValue={null}
									onChange={(event, newValue) => setFilter(headCellData.id, newValue, true)}
								>
									<Option value={null}>{'Filter ' + headCellData.label}</Option>
									{headCellData.headerData.values.map(({ label, value }) => (
										<Option value={value} key={value}>
											{label}
										</Option>
									))}
								</Select>
							</Box>
						);
					}
					return (
						<th key={headCellData.id}>
							<Box sx={{ flexDirection: 'row', display: 'flex' }}>
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'row',
										width: '100%',
										height: '36px',
										gap: '1rem',
										alignItems: 'center',
									}}
								>
									{headCellData.allowSorting && (
										<IconButton
											size="sm"
											color={active ? 'primary' : 'neutral'}
											variant={active ? 'solid' : 'soft'}
											component="button"
											onClick={createSortHandler(headCellData.id)}
											sx={{
												width: 0,
												'& svg': {
													transition: '0.2s',
													transform:
														active && order === 'DESC' ? 'rotate(0deg)' : 'rotate(180deg)',
												},
												'&:hover svg': { opacity: 1 },
											}}
										>
											<ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} />
										</IconButton>
									)}
									{headCellValue}
								</Box>
								<Divider orientation="vertical" />
							</Box>
						</th>
					);
				})}
			</tr>
		</thead>
	);
}

EnhancedTableHead.propTypes = {
	onRequestSort: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['ASC', 'DESC']).isRequired,
	orderBy: PropTypes.string.isRequired,
	headCells: PropTypes.array.isRequired,
	tableData: PropTypes.object.isRequired,
	setFilter: PropTypes.func.isRequired,
};

const getRelativeTime = (date) => {
	const parsedDate = new Date(date);

	if (isNaN(parsedDate) || date === null) {
		return <span color="danger">INT ERR</span>;
	}

	return formatDistanceToNow(parsedDate, { addSuffix: true }).replace(/^about\s/, '');
};

const RelativeTime = ({ date }) => {
	const [relativeTime, setRelativeTime] = useState(getRelativeTime(date));

	useEffect(() => {
		const interval = setInterval(() => {
			setRelativeTime(getRelativeTime(date));
		}, 60000);

		return () => clearInterval(interval);
	}, [date]);

	return <span>{relativeTime}</span>;
};

export default function TableSortAndSelection({ tableID, viewUUID }) {
	const tableData = tableMap[tableID];

	const [order, setOrder] = useState('DESC');
	const [orderBy, setOrderBy] = useState('date_created');
	const [filter, setFilter] = useState({});

	const [selected, setSelected] = useState([]);
	const [page, setPage] = useState(0);
	const [totalRows, setTotalRows] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [rows, setRows] = useState([]);
	const [pendingRows, setPendingRows] = useState([]);
	const [selectedHeadValues, setSelectedHeadValues] = useState([]);

	const router = useRouter();

	const appendToPendingRows = (newRow) => {
		setPendingRows((prev) => {
			const existingRowIndex = prev.findIndex((row) => row.uuid === newRow.uuid);

			if (existingRowIndex >= 0) {
				const updatedRow = {
					...prev[existingRowIndex],
					...newRow,
				};

				return [...prev.slice(0, existingRowIndex), updatedRow, ...prev.slice(existingRowIndex + 1)];
			} else {
				const originalRow = rows.find((row) => row.uuid === newRow.uuid);
				if (originalRow) {
					return [...prev, { ...originalRow, ...newRow }];
				}
				return prev;
			}
		});
	};

	const savePendingRows = async () => {
		const rowsToUpdate = pendingRows
			.map((pendingRow) => {
				const existingRow = rows.find((row) => row.uuid === pendingRow.uuid);

				if (!existingRow) return null;

				const update = {};

				Object.keys(pendingRow).forEach((key) => {
					if (pendingRow[key] !== existingRow[key]) {
						update[key] = pendingRow[key];
					}
				});

				return Object.keys(update).length > 0 ? { uuid: pendingRow.uuid, update } : null;
			})
			.filter((update) => update !== null);

		const res = await post(
			`${process.env.NEXT_PUBLIC_API_URL}/admin/update-table`,
			{
				tableName: tableData.name,
				rowsToUpdate,
			},
			{
				withCredentials: true,
			}
		);

		setRows((prevRows) => {
			const updatedMap = new Map(pendingRows.map((row) => [row.uuid, row]));

			return prevRows.map((row) => (updatedMap.has(row.uuid) ? { ...row, ...updatedMap.get(row.uuid) } : row));
		});

		setPendingRows([]);
	};

	const renderCell = (valueId, data) => {
		switch (valueId) {
			case 'date_created':
				return (
					<td scope="row" key={valueId}>
						<Tooltip title={format(data.date_created, 'MMMM dd, yyyy hh:mm a')} variant="soft">
							<Typography>
								<RelativeTime date={data.date_created} />
							</Typography>
						</Tooltip>
					</td>
				);

			case 'last_visit':
				return (
					<td scope="row" key={valueId}>
						<Tooltip title={format(data.last_visit, 'MMMM dd, yyyy hh:mm a')} variant="soft">
							<Typography>
								<RelativeTime date={data.last_visit} />
							</Typography>
						</Tooltip>
					</td>
				);

			case 'last_login':
				return (
					<td scope="row" key={valueId}>
						<Tooltip title={format(data.last_login, 'MMMM dd, yyyy hh:mm a')} variant="soft">
							<Typography>
								<RelativeTime date={data.last_login} />
							</Typography>
						</Tooltip>
					</td>
				);

			case 'last_interaction':
				return (
					<td scope="row" key={valueId}>
						<Tooltip title={format(data.last_interaction, 'MMMM dd, yyyy hh:mm a')} variant="soft">
							<Typography>
								<RelativeTime date={data.last_interaction} />
							</Typography>
						</Tooltip>
					</td>
				);

			case 'last_updated':
				return (
					<td scope="row" key={valueId}>
						<Tooltip title={format(data.last_updated, 'MMMM dd, yyyy hh:mm a')} variant="soft">
							<Typography>
								<RelativeTime date={data.last_updated} />
							</Typography>
						</Tooltip>
					</td>
				);

			case 'uuid':
				return (
					<td scope="row" key={valueId}>
						<Button
							startDecorator={<OpenInNew />}
							size="sm"
							variant="plain"
							onClick={() => {
								viewUUID(data.uuid);
							}}
						>
							Edit
						</Button>
					</td>
				);

			case 'publisher':
				return (
					<td scope="row" key={valueId}>
						<Button
							startDecorator={<OpenInNew />}
							size="sm"
							variant="plain"
							onClick={() => {
								viewUUID(data.publisher);
							}}
						>
							Edit
						</Button>
					</td>
				);

			case 'author':
				return (
					<td scope="row" key={valueId}>
						<Button
							startDecorator={<OpenInNew />}
							size="sm"
							variant="plain"
							onClick={() => {
								viewUUID(data.author);
							}}
						>
							Edit
						</Button>
					</td>
				);

			case 'parent':
				return (
					<td scope="row" key={valueId}>
						{data.parent ? (
							<Button
								startDecorator={<OpenInNew />}
								size="sm"
								variant="plain"
								onClick={() => {
									viewUUID(data.parent);
								}}
							>
								Edit
							</Button>
						) : (
							<Typography>N/A</Typography>
						)}
					</td>
				);

			case 'type':
				const typeMap = ['Blueprint', 'Preset', 'Theme', 'Asset Pack', 'Cat Image'];
				return (
					<td scope="row" key={valueId}>
						{typeMap[data.type] ?? ''}
					</td>
				);

			default:
				return (
					<td
						scope="row"
						key={valueId}
						style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
					>
						{data[valueId]}
					</td>
				);
		}
	};

	useEffect(() => {
		if (tableData?.values) {
			const visibleHeadValues = Object.entries(tableData?.values)
				.filter(([, field]) => field.visible)
				.map(([key, field]) => field.id);
			setSelectedHeadValues(visibleHeadValues);
		}
	}, [tableData?.values]);

	useEffect(() => {
		setPage(0);
	}, [tableData]);

	useEffect(() => {
		const getRows = async () => {
			const pagination = {
				limit: rowsPerPage,
				offset: page * rowsPerPage,
			};

			const filterQuery = {
				order: [[orderBy, order]],
				table: tableID,
				filter: filter,
			};

			const res = await post(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-data`, {
				filterQuery,
				pagination,
			});

			setRows(res.data.rows);
			setTotalRows(res.data.count);
		};

		getRows();
	}, [page, rowsPerPage, orderBy, order, filter]);

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'ASC';
		setOrder(isAsc ? 'DESC' : 'ASC');
		setOrderBy(property);
	};

	const handleChangePage = (newPage) => {
		setPage(newPage);
	};

	const handleFilterChange = (column, newValue, exactMatch) => {
		setFilter((prev) => {
			const updatedFilter = { ...prev };
			const isEmpty = newValue === null || String(newValue).trim() === '';

			if (isEmpty) {
				delete updatedFilter[column];
			} else {
				if (exactMatch) {
					updatedFilter[column] = newValue;
				} else {
					updatedFilter[column] = [newValue];
				}
			}

			return updatedFilter;
		});
	};

	const handleChangeRowsPerPage = (e, newValue) => {
		setRowsPerPage(parseInt(newValue.toString(), 10));
		setPage(0);
	};

	const getLabelDisplayedRowsTo = () => {
		if (totalRows === -1) {
			return (page + 1) * rowsPerPage;
		}
		return rowsPerPage === -1 ? totalRows : Math.min(totalRows, (page + 1) * rowsPerPage);
	};

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalRows) : 0;

	return (
		<Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', mb: 2, gap: 1, flexGrow: 0 }}>
			<Typography level="h4">{tableData.label}</Typography>
			<Sheet
				variant="outlined"
				sx={{
					height: '100%',
					boxShadow: 'sm',
					borderRadius: 'sm',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					flexGrow: 0,
				}}
			>
				<Box sx={{ flexGrow: 0, overflow: 'auto' }}>
					<Table
						aria-labelledby="tableTitle"
						stickyHeader
						stickyFooter
						sx={{
							'--TableCell-selectedBackground': (theme) => theme.vars.palette.primary.softBg,
							// maxWidth: 'auto',
							flexGrow: 1,
							'& thead th:nth-of-type(1)': {
								width: '104px',
							},
						}}
					>
						<EnhancedTableHead
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
							headCells={selectedHeadValues}
							tableData={tableData}
							setFilter={handleFilterChange}
						/>
						<tbody>
							{[...rows].slice(0, rowsPerPage).map((data) => {
								const isItemSelected = selected.includes(data);

								return (
									<tr
										key={`tr-${data.uuid}`}
										role="checkbox"
										aria-checked={isItemSelected}
										tabIndex={-1}
										style={{
											...(isItemSelected
												? {
														'--TableCell-dataBackground':
															'var(--TableCell-selectedBackground)',
														'--TableCell-headBackground':
															'var(--TableCell-selectedBackground)',
												  }
												: {}),
										}}
									>
										{selectedHeadValues?.map((value) => {
											const modifiedRow = pendingRows.find((row) => row.uuid === data.uuid);

											const row = modifiedRow || data;

											return renderCell(value, row);
										})}
									</tr>
								);
							})}
							{emptyRows > 0 && (
								<tr
									style={{
										height: `calc(${emptyRows} * 45px)`,
										'--TableRow-hoverBackground': 'transparent',
									}}
								>
									<td colSpan={selectedHeadValues.length} aria-hidden />
								</tr>
							)}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={selectedHeadValues.length}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'flex-end',
											gap: 2,
										}}
									>
										<FormControl orientation="horizontal" size="sm">
											<FormLabel>Rows per page:</FormLabel>
											<Select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
												<Option value={5}>5</Option>
												<Option value={10}>10</Option>
												<Option value={20}>20</Option>
												<Option value={40}>40</Option>
												<Option value={80}>80</Option>
											</Select>
										</FormControl>
										<Typography sx={{ textAlign: 'center', minWidth: 80 }}>
											{labelDisplayedRows({
												from: totalRows === 0 ? 0 : page * rowsPerPage + 1,
												to: getLabelDisplayedRowsTo(),
												maxRows: totalRows,
											})}
										</Typography>
										<Box sx={{ display: 'flex', gap: 1 }}>
											<IconButton
												size="sm"
												color="neutral"
												variant="outlined"
												disabled={page === 0}
												onClick={() => handleChangePage(page - 1)}
												sx={{ bgcolor: 'background.surface' }}
											>
												<KeyboardArrowLeftIcon />
											</IconButton>
											<IconButton
												size="sm"
												color="neutral"
												variant="outlined"
												disabled={
													totalRows !== -1
														? page >= Math.ceil(totalRows / rowsPerPage) - 1
														: false
												}
												onClick={() => handleChangePage(page + 1)}
												sx={{ bgcolor: 'background.surface' }}
											>
												<KeyboardArrowRightIcon />
											</IconButton>
										</Box>
										<Tooltip title="Filter">
											<Dropdown>
												<MenuButton
													slots={{ root: IconButton }}
													slotProps={{
														root: {
															variant: 'outlined',
															color: 'neutral',
															size: 'sm',
															sx: { bgcolor: 'background.surface' },
														},
													}}
												>
													<TuneIcon />
												</MenuButton>
												<Menu placement="bottom-start" variant="plain" sx={{ p: 0 }}>
													<ToggleButtonGroup
														color="primary"
														orientation="vertical"
														value={selectedHeadValues}
														onChange={(event, newKeys) => {
															setSelectedHeadValues(newKeys);
														}}
													>
														{Object.entries(tableData?.values).map(([key, value]) => (
															<Button value={value.id} key={key} variant="plain">
																{value.label}
															</Button>
														))}
													</ToggleButtonGroup>
												</Menu>
											</Dropdown>
										</Tooltip>
									</Box>
								</td>
							</tr>
						</tfoot>
					</Table>
				</Box>
			</Sheet>
		</Box>
	);
}
