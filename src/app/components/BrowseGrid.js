'use client';

import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Navbar from 'components/Navbar/Navbar';
import AssetGrid from 'components/Grid/AssetGrid';
// import GlbRenderer from 'components/3D/GlbRenderer';

import Box from '@mui/joy/Box';

function BrowseGrid({ initialUserData, initialAssetData, initialFilters }) {
	const theme = useTheme();
	const desktopView = useMediaQuery(theme.breakpoints.up('md'));

	const [filterQuery, setFilterQuery] = useState({
		header: initialFilters.asset,
		publisherData: { username: initialFilters.publisher },
		order: [[initialFilters.sort, initialFilters.order]],
		type: initialFilters.type,
		tags: initialFilters.tags,
		tools: initialFilters.tools,
	});

	const handleFilterChange = (data) => {
		const newFilter = {
			header: data.header,
			publisherData: { username: data?.publisherData?.username || '' },
			order: [[data.sortBy || filterQuery.order[0][0], data.sortOrder || filterQuery.order[0][1]]],
			type: 'all',
			tags: data.tags,
			tools: data.tools,
		};

		if (JSON.stringify(newFilter) !== JSON.stringify(filterQuery)) {
			setFilterQuery(newFilter);
		}
	};

	return (
		<CssVarsProvider>
			<Box sx={{ backgroundColor: 'var(--joy-palette-background-surface)' }}>
				<Box
					sx={{
						position: 'sticky',
						top: 0,
						zIndex: 1000,
						backgroundColor: 'color-mix(in srgb, var(--joy-palette-background-surface) 70%, transparent)',
						backdropFilter: 'blur(48px)',
					}}
				>
					<Navbar
						desktopView={desktopView}
						onChange={handleFilterChange}
						filterQuery={filterQuery}
						variant="browse"
						initialUserData={initialUserData}
					/>
				</Box>

				{/* <GlbRenderer/> */}

				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						px: 2,
						pb: 16,
					}}
				>
					<AssetGrid
						itemWidth={200}
						filterQuery={filterQuery}
						handleFilterChange={handleFilterChange}
						highlightSearchMatch
						initialAssetData={initialAssetData}
					/>
				</Box>
			</Box>
		</CssVarsProvider>
	);
}

export default BrowseGrid;
