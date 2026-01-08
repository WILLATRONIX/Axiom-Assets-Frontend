import { redirect } from 'next/navigation';
import BrowseGrid from 'components/BrowseGrid';
import Box from '@mui/joy/Box';
import { cookies } from 'next/headers';

export default async function Page({ params, searchParams }) {
	const slug = params.slug ?? [];
	const sortSlug = slug[0] ?? 'latest';
	const searchParamValue = await searchParams

	const sortByMap = {
		latest: 'date_created',
		downloads: 'downloads',
		saves: 'saves',
		size: 'metric',
	};

	const sortByField = sortByMap[sortSlug] ?? 'date_created';

	const itemTypeMap = ['blueprint', 'preset', 'theme', 'asset-pack'];
	const typeParam = searchParamValue?.type ?? null;
	const itemType = itemTypeMap.includes(typeParam) ? itemTypeMap.indexOf(typeParam) : null;

	if (searchParamValue?.share) {
		redirect(`/asset/${searchParamValue.share}`);
	}

	const cookieStore = await cookies();
	const token = cookieStore.get('jwt')?.value ?? null;

	let initialUserData = null;

	if (token) {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-cookies`, {
				headers: {
					Cookie: `jwt=${token}`,
					Authorization: `Bearer ${process.env.SSR_TOKEN}`,
				},
			});

			if (res.ok) {
				const data = await res.json();
				initialUserData = {
					...data.user,
					valid: Boolean(data.user?.uuid),
				};
			}
		} catch (e) {
			console.error(e);
		}
	}

	const filterAnd = [
		{ field: 'visibility', op: 'eq', value: 'public' },
		...(itemType !== null ? [{ field: 'type', op: 'eq', value: itemType }] : []),
	];

	const queryParams = new URLSearchParams({
		flags: JSON.stringify({
			filter: { and: filterAnd },
			offset: 0,
			limit: 64,
			sort: [{ field: sortByField, direction: 'desc' }],
			savedOnly: false,
		}),
	}).toString();

	let initialAssetData = null;

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/browse/get-assets?${queryParams}`, {
			headers: {
				Authorization: `Bearer ${process.env.SSR_TOKEN}`,
				Cookie: `jwt=${token}`,
			},
		});

		if (res.ok) {
			initialAssetData = await res.json();
		}
	} catch (e) {
		console.error(e);
	}

	const initialFilter = {
		baseFilter: {
			sortBy: sortByField,
			sortOrder: 'desc',
			itemType: itemType ?? 0,
			searchQuery: '',
			searchQueryField: 'header',
		},
		filter: { and: filterAnd },
	};

	return (
		<Box sx={{ width: '100vw', height: '100vh', bgcolor: 'background.surface' }}>
			<Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
				<BrowseGrid
					initialUserData={initialUserData}
					initialAssetData={initialAssetData}
					initialFilter={initialFilter}
				/>
			</Box>
		</Box>
	);
}
