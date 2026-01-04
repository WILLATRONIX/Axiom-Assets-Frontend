'use client';

import { useState } from 'react';

import { CssVarsProvider } from '@mui/joy/styles';

import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Navbar from 'components/Navbar/Navbar';
import AssetGrid from 'components/Grid/AssetGrid';
// import GlbRenderer from 'components/3D/GlbRenderer';

import Box from '@mui/joy/Box';

function BrowseGrid({ initialUserData, initialAssetData }) {
	const theme = useTheme();
	const desktopView = useMediaQuery(theme.breakpoints.up('md'));

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
						highlightSearchMatch
						initialAssetData={initialAssetData}
					/>
				</Box>
			</Box>
		</CssVarsProvider>
	);
}

export default BrowseGrid;
