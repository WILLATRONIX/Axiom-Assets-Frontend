"use client";

import { useEffect } from "react";

import { setFilter } from "lib/searchFilter";
import { useAuth } from "lib/auth/authContext";

import Navbar from "components/Navbar/Navbar";
import AssetGrid from "components/Grid/AssetGrid";
// import GlbRenderer from 'components/3D/GlbRenderer';

import Box from "@mui/joy/Box";

function BrowseGrid({ initialUserData, initialAssetData, initialFilter }) {
	const { setUserDetails } = useAuth();

	useEffect(() => {
		setUserDetails(initialUserData);
	}, [initialUserData]);

	useEffect(() => {
		if (!initialFilter) return;

		const defaultFilter = {
			baseFilter: {
				sortBy: "date_created",
				sortOrder: "desc",
				itemType: "all",
				searchQuery: "",
				searchQueryField: "header",
			},
			filter: {
				and: [{ field: "visibility", op: "eq", value: "public" }],
			},
			sort: [{ field: "date_created", direction: "desc" }],
			savedOnly: false,
		};

		setFilter(
			{
				...defaultFilter,
				...initialFilter,
				baseFilter: {
					...defaultFilter.baseFilter,
					...initialFilter.baseFilter,
				},
				filter: {
					...defaultFilter.filter,
					...initialFilter.filter,
				},
				sort: initialFilter.sort ?? defaultFilter.sort,
			},
			{ initial: true },
		);
	}, [initialFilter]);

	return (
		<Box sx={{ backgroundColor: "var(--joy-palette-background-surface)" }}>
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1000,
					backgroundColor:
						"color-mix(in srgb, var(--joy-palette-background-surface) 70%, transparent)",
					backdropFilter: "blur(48px)",
				}}
			>
				<Navbar context="browse" initialUserData={initialUserData} />
			</Box>

			{/* <GlbRenderer/> */}

			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
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
	);
}

export default BrowseGrid;
