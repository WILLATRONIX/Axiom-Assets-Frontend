import { redirect } from "next/navigation";
import BrowseGrid from "components/BrowseGrid";
import Box from "@mui/joy/Box";
import { cookies } from "next/headers";

export default async function Page(props) {
	const { params, searchParams } = props;
	const { sortBy: slug = [] } = await params;
	const resolvedSearchParams = await searchParams;
	const sortSlug = slug[0] ?? "latest";

	const sortByMap = {
		latest: "date_created",
		downloads: "downloads",
		saves: "saves",
		size: "metric",
	};

	const sortByField = sortByMap[sortSlug] ?? "date_created";

	const itemTypeMap = ["blueprint", "preset", "theme", "asset-pack"];
	const typeParam = resolvedSearchParams?.type ?? null;
	const itemType = itemTypeMap.includes(typeParam)
		? itemTypeMap.indexOf(typeParam)
		: "all";

	const filterCodeParam = resolvedSearchParams?.filter;

	if (resolvedSearchParams?.share) {
		redirect(`/asset/${resolvedSearchParams.share}`);
	}

	const cookieStore = await cookies();
	const token = cookieStore.get("jwt")?.value ?? null;

	let initialUserData = null;

	if (token) {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/register-cookies`,
				{
					headers: {
						Cookie: `jwt=${token}`,
						Authorization: `Bearer ${process.env.SSR_TOKEN}`,
					},
				},
			);

			if (res.ok) {
				const data = await res.json();
				initialUserData = {
					...(data.user || []),
					state: data.state ?? null,
				};
			}
		} catch (e) {
			console.error(e);
		}
	}

	const filterAnd = [
		{ field: "visibility", op: "eq", value: "public" },
		...(itemType !== "all"
			? [{ field: "type", op: "eq", value: itemType }]
			: []),
	];

	const queryParams = new URLSearchParams({
		flags: JSON.stringify({
			filter: { and: filterAnd },
			offset: 0,
			limit: 64,
			sort: [{ field: sortByField, direction: "desc" }],
			savedOnly: false,
		}),
	}).toString();

	let initialAssetData = null;

	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/browse/get-assets?${queryParams}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.SSR_TOKEN}`,
					Cookie: `jwt=${token}`,
				},
			},
		);

		if (res.ok) {
			initialAssetData = await res.json();
		}
	} catch (e) {
		console.error(e);
	}

	const initialFilter = {
		baseFilter: {
			sortBy: sortByField,
			sortOrder: "desc",
			itemType: itemType ?? 0,
			searchQuery: "",
			searchQueryField: "header",
			filterCode: filterCodeParam,
		},
		filter: { and: filterAnd },
	};

	return (
		<Box
			sx={{
				width: "100vw",
				height: "100vh",
				bgcolor: "background.surface",
			}}
		>
			<Box
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<BrowseGrid
					initialUserData={initialUserData}
					initialAssetData={initialAssetData}
					initialFilter={initialFilter}
				/>
			</Box>
		</Box>
	);
}
