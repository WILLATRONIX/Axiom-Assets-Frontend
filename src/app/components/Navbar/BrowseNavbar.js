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

const BrowseNavbar = ({ onChange, filterQuery }) => {
	const [tagList, setTagList] = useState([]);
	const [tagInputValue, setTagInputValue] = useState('');

	const [searchType, setSearchType] = useState('header');
	const [searchInputValue, setSearchInputValue] = useState('');

	const [sortIconRotation, setSortIconRotation] = useState(0);
	const [sortBy, setSortBy] = useState('date_created');
	const [sortOrder, setSortOrder] = useState('desc');

	const [selectedTags, setSelectedTags] = useState([]);
	const [selectedTools, setSelectedTools] = useState([]);

	const [moreFilterModalOpen, setMoreFilterModalOpen] = useState(false);
	const [searchFilter, setSearchFilter] = useState(getFilter());

	const handleSearchTypeChange = (event, newValue) => {
		setSearchType(newValue);
		handleDebouncedSearch(searchInputValue);
	};

	const handleDebouncedSearch = (event) => {
		const newValue = event.target.value.trim();
		const current = getFilter();

		const newFilter = {
			...current,
			filter:
				newValue === ''
					? { and: [{ field: 'visibility', op: 'eq', value: 'public' }] }
					: {
							and: [
								{ field: searchType, op: 'like', value: newValue },
								{ field: 'visibility', op: 'eq', value: 'public' },
							],
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
		});
	};

	useEffect(() => {
		const unsubscribe = subscribeFilter((newFilter) => {
			setSearchFilter(newFilter);
			setSortBy(newFilter.sort[0]?.field || 'date_created');
			setSortOrder(newFilter.sort[0]?.direction || 'desc');
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
					placeholder="Search"
					sx={{
						width: '100%',
						// pl: 0,
						backgroundColor: 'color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)',
					}}
					variant="soft"
					debounceTimeout={200}
					value={searchInputValue}
					onChange={(event) => setSearchInputValue(event.target.value)}
					onDebounce={handleDebouncedSearch}
					// startDecorator={
					// 	<Select
					// 		variant="soft"
					// 		defaultValue={0}
					// 		sx={{
					// 			boxShadow: 'unset',
					// 			backgroundColor: 'transparent',
					// 		}}
					// 		onChange={handleSearchTypeChange}
					// 	>
					// 		<Option value={0}>Asset</Option>
					// 		<Option value={1}>Publisher</Option>
					// 		<Option value={2}>Tag</Option>
					// 	</Select>
					// }
				/>
				<Autocomplete
					multiple
					variant="soft"
					placeholder={filterQuery.type === '1' ? 'Filter Tools' : 'Filter Tags'}
					sx={{
						width: '50%',
						display: filterQuery.type !== '0' && filterQuery.type !== '1' ? 'none' : undefined,
						flexShrink: 0,
					}}
					limitTags={10}
					freeSolo
					filterSelectedOptions
					options={filterQuery.type === '1' ? editorTools : tagList}
					getOptionLabel={(option) => (typeof option === 'string' ? option : option.tag)}
					value={
						filterQuery.type === '1'
							? selectedTools
							: selectedTags.map((tag) => tagList.find((t) => t.tag === tag) || { tag, ref_count: 0 })
					}
					onInputChange={(e, newInput) => setTagInputValue(newInput)}
					onChange={(e, newValue) => {
						if (filterQuery.type === '1') {
							handleToolChange(newValue);
							setSelectedTools(newValue);
						} else {
							const tagNames = newValue.map((t) => (typeof t === 'string' ? t : t.tag));
							handleTagChange(tagNames);
							setSelectedTags(tagNames);
						}
					}}
					renderOption={(props, tag) => {
						const tagName = typeof tag === 'string' ? tag : tag.tag;
						const refCount = typeof tag === 'string' ? 0 : tag.ref_count;

						return (
							<AutocompleteOption key={tagName} {...props}>
								<ListItemContent
									sx={{
										fontSize: 'md',
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography level="body-md">{tagName}</Typography>
									<Typography
										level="body-sm"
										sx={{
											display: filterQuery.type === '1' ? 'none' : undefined,
										}}
									>
										{`${refCount} ${refCount === 1 ? 'Result' : 'Results'}`}
									</Typography>
								</ListItemContent>
							</AutocompleteOption>
						);
					}}
					renderTags={(tags, getTagProps) =>
						tags.map((tag, index) => {
							const { key, ...tagProps } = getTagProps({ index });
							const tagName = typeof tag === 'string' ? tag : tag.tag;

							return (
								<Chip
									key={tagName}
									size="lg"
									variant="solid"
									color="primary"
									endDecorator={<Close fontSize="sm" />}
									sx={{ minWidth: 0 }}
									{...tagProps}
								>
									{tagName}
								</Chip>
							);
						})
					}
				/>
			</Box>
			<MoreFilterModal open={moreFilterModalOpen} setOpen={setMoreFilterModalOpen} />
		</Fragment>
	);
};

export default BrowseNavbar;
