import { useState, useEffect, Fragment } from 'react';

import { getFilter, setFilter, subscribeFilter } from 'lib/searchFilter';

import MoreFilterModal from 'components/Modal/MoreFilterModal';
import DebouncedInput from 'components/Input/DebouncedInput';

import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Autocomplete from '@mui/joy/Autocomplete';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import ListItemContent from '@mui/joy/ListItemContent';
import Tooltip from '@mui/joy/Tooltip';
import Button from '@mui/joy/Button';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Close from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

const editorTools = [
	'Autoshade',
	'Distort',
	'Elevation',
	'Gradient Painter',
	'Melt',
	'Noise Painter',
	'Painter',
	'Path',
	'Rock',
	'Roughen',
	'Script Brush',
	'Sculpt Draw',
	'Shatter',
	'Slope',
	'Smooth',
	'Stamp',
	'Tool Masks',
	'Weld',
];

const BrowseNavbar = ({}) => {
	const [tagList, setTagList] = useState([]);
	const [tagInputValue, setTagInputValue] = useState('');

	const [searchField, setSearchField] = useState('header');
	const [searchType, setSearchType] = useState('all');
	const [searchInputValue, setSearchInputValue] = useState('');

	const [sortIconRotation, setSortIconRotation] = useState(0);
	const [sortBy, setSortBy] = useState('date_created');
	const [sortOrder, setSortOrder] = useState('desc');

	const [selectedTags, setSelectedTags] = useState([]);
	const [selectedTools, setSelectedTools] = useState([]);

	const [moreFilterModalOpen, setMoreFilterModalOpen] = useState(false);
	const [searchFilter, setSearchFilter] = useState(getFilter());

	const handleSortTypeChange = (event, newValue) => {
		setSearchType(newValue);
		const current = getFilter();

		const defaultFilter =
			searchField && searchInputValue?.trim()
				? {
						and: [
							{ field: searchField, op: 'like', value: searchInputValue.trim() },
							{ field: 'visibility', op: 'eq', value: 'public' },
						],
				  }
				: { and: [{ field: 'visibility', op: 'eq', value: 'public' }] };

		let newFilter;

		if (newValue === 'all') {
			newFilter = {
				...current,
				filter: defaultFilter,
			};
		} else {
			newFilter = {
				...current,
				filter: {
					...defaultFilter,
					and: [...defaultFilter.and, { field: 'type', op: 'eq', value: newValue }],
				},
				baseFilter: {
					...current.baseFilter,
					type: newValue,
					searchQuery: searchInputValue.trim(),
					searchQueryField: searchField,
				},
			};
		}

		setFilter(newFilter);
	};

	const handleSearchTypeChange = (event, newValue) => {
		setSearchField(newValue);
		if (searchInputValue.trim() !== '') {
			handleDebouncedSearch(searchInputValue, newValue);
		}
	};

	const handleDebouncedSearch = (newValue = '', field = searchField) => {
		const trimmedValue = newValue.trim();
		const current = getFilter();

		const newFilter = {
			...current,
			filter:
				trimmedValue === ''
					? { and: [{ field: 'visibility', op: 'eq', value: 'public' }] }
					: {
							and: [
								{ field: field, op: 'like', value: trimmedValue },
								{ field: 'visibility', op: 'eq', value: 'public' },
							],
					  },
			baseFilter: {
				...current.baseFilter,
				searchQuery: trimmedValue,
				searchQueryField: field,
			},
		};

		setFilter(newFilter);
	};

	const handleSortByChange = (event, newValue) => {
		const current = getFilter();
		const newFilter = {
			...current,
			sort: [{ field: newValue, direction: sortOrder }],
		};
		setSortBy(newValue);
		setFilter(newFilter);
	};

	const handleSortOrderChange = () => {
		const newDirection = sortOrder === 'desc' ? 'asc' : 'desc';
		setSortIconRotation(newDirection === 'desc' ? 0 : 180);
		setSortOrder(newDirection);

		const current = getFilter();
		setFilter({
			...current,
			sort: [{ field: sortBy, direction: newDirection }],
			baseFilter: {
				...current.baseFilter,
				sortBy,
				sortOrder: newDirection,
			},
		});
	};

	useEffect(() => {
		const unsubscribe = subscribeFilter((newFilter) => {
			setSearchFilter(newFilter);
			setSortBy(newFilter.sort[0]?.field || 'date_created');
			setSortOrder(newFilter.sort[0]?.direction || 'desc');
			setSortIconRotation(newFilter.sort[0]?.direction === 'desc' ? 0 : 180);
		});
		return () => unsubscribe();
	}, []);

	return (
		<Fragment>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					gap: '20px',
					py: '3px',
				}}
			>
				<Select
					sx={{
						// width: 'auto',
						// boxShadow: 'unset',
						// borderRadius: '0 var(--joy-radius-sm) var(--joy-radius-sm) 0',
						width: 'fit-content',
						// backgroundColor: 'color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)',
					}}
					variant="soft"
					defaultValue={'all'}
					value={searchType}
					onChange={handleSortTypeChange}
				>
					<Option value={'all'}>All</Option>
					<Option value={0}>Blueprint</Option>
					<Option value={1}>Preset</Option>
					<Option value={2}>Theme</Option>
					<Option value={3}>Asset Pack</Option>
				</Select>
				<Box
					sx={{
						display: 'flex',
						borderRadius: 'var(--joy-radius-sm)',
						boxShadow:
							'var(--joy-shadowRing, 0 0 #000),0px 1px 2px 0px rgba(var(--joy-shadowChannel, 21 21 21) / var(--joy-shadowOpacity, 0.08))',
					}}
				>
					<Tooltip title={sortOrder === 'asc' ? 'Ascending' : 'Descending'} variant="soft" placement="top">
						<IconButton
							sx={{
								borderRadius: 'var(--joy-radius-sm) 0 0 var(--joy-radius-sm)',
								backgroundColor:
									'color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)',
							}}
							variant="soft"
							onClick={handleSortOrderChange}
						>
							<ExpandMoreIcon sx={{ transform: `rotate(${sortIconRotation}deg)` }} />
						</IconButton>
					</Tooltip>
					<Select
						sx={{
							width: 'auto',
							boxShadow: 'unset',
							borderRadius: '0 var(--joy-radius-sm) var(--joy-radius-sm) 0',
							flexShrink: 0,
							backgroundColor:
								'color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)',
						}}
						variant="soft"
						value={sortBy}
						onChange={handleSortByChange}
					>
						<Option value="downloads">Downloads</Option>
						<Option value="saves">Saves</Option>
						<Option value="date_created">Latest</Option>
						<Option value="metric">Size</Option>
						<Option value="header">Title</Option>
					</Select>
				</Box>
				<DebouncedInput
					placeholder={searchField === 'header' ? 'Search asset...' : 'Search by user...'}
					sx={{
						flex: 1,
						pl: 0,
						backgroundColor: 'color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)',
					}}
					variant="soft"
					debounceTimeout={200}
					value={searchInputValue}
					onChange={(event) => setSearchInputValue(event.target.value)}
					onDebounce={(event) => handleDebouncedSearch(event.target.value)}
					startDecorator={
						<Select
							variant="soft"
							value={searchField}
							sx={{
								boxShadow: 'unset',
								backgroundColor: 'transparent',
							}}
							onChange={handleSearchTypeChange}
						>
							<Option value={'header'}>Asset</Option>
							<Option value={'publisher.display_name'}>Publisher</Option>
						</Select>
					}
				/>
				<Button
					color="neutral"
					variant="soft"
					startDecorator={<TuneIcon />}
					sx={{
						flexShrink: 0,
						backgroundColor: 'color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)',
						boxShadow:
							'var(--joy-shadowRing, 0 0 #000),0px 1px 2px 0px rgba(var(--joy-shadowChannel, 21 21 21) / var(--joy-shadowOpacity, 0.08))',
					}}
					onClick={() => setMoreFilterModalOpen(true)}
				>
					Advanced
				</Button>
			</Box>
			<MoreFilterModal open={moreFilterModalOpen} setOpen={setMoreFilterModalOpen} />
		</Fragment>
	);
};

export default BrowseNavbar;
