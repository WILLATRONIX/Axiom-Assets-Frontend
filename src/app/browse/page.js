import { redirect } from 'next/navigation';
import BrowseGrid from 'components/BrowseGrid';
import Box from '@mui/joy/Box';
import { cookies } from 'next/headers';

export default async function Page({ searchParams }) {
	const params = await searchParams;
	const inspectItemUUID = params?.share || null;

	if (inspectItemUUID) {
		redirect(`/asset/${inspectItemUUID}`);
	}

	const cookieStore = await cookies();
	const token = cookieStore.get('jwt')?.value ?? null;

	let initialUserData = null;

	if (token) {
		try {
			//NOTE: must use fetch(), axios setup overrides authorization
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-cookies`, {
				headers: {
					Cookie: `jwt=${token}`,
					Authorization: `Bearer ${process.env.SSR_TOKEN}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				initialUserData = { ...data.user, valid: data.user?.uuid !== undefined } ?? null;
			} else {
				console.error('Failed to fetch user data:', response.status);
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	}

	let initialAssetData = null;

	try {
		const queryParams = new URLSearchParams({
			flags: JSON.stringify({
				filter: {
					field: 'visibility',
					op: 'eq',
					value: 'public',
				},
				offset: 0,
				limit: 64,
				sort: [{ field: 'date_created', direction: 'desc' }],
				savedOnly: false,
			}),
		}).toString();

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/browse/get-assets?${queryParams}`, {
			headers: {
				Authorization: `Bearer ${process.env.SSR_TOKEN}`,
				Cookie: `jwt=${token}`,
			},
		});

		if (response.ok) {
			initialAssetData = await response.json();
		} else {
			console.error('Failed to fetch asset data:', response.status);
		}
	} catch (error) {
		console.error('Error fetching asset data:', error);
	}

	const filters = {
		sort: params.sort ?? 'date_created',
		order: params.order ?? 'DESC',
		type: params.type ?? 'all',
		tags: params.tags?.split(',') ?? [],
		tools: params.tools?.split(',') ?? [],
		publisher: params['publisher-title'] ?? '',
		asset: params['asset-title'] ?? '',
	};

	return (
		<Box
			sx={{
				width: '100vw',
				height: '100vh',
				bgcolor: 'background.surface',
			}}
		>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<BrowseGrid
					initialUserData={initialUserData}
					initialAssetData={initialAssetData}
					initialFilters={filters}
				/>
			</Box>
		</Box>
	);
}
