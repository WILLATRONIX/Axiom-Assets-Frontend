import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';
import { get } from 'api/network';
import AssetPage from 'components/Card/AssetPage';
import Box from '@mui/joy/Box';
import Navbar from 'components/Navbar/Navbar';

async function getItemByUUID(uuid) {
	try {
		const res = await get(
			'/browse/get-new-item',
			{
				params: {
					flags: JSON.stringify({
						itemUUID: uuid,
					}),
				},
			},
			{ ssr: true }
		);

		return res.assetData;
	} catch (error) {
		notFound();
	}
}

export async function generateMetadata({ params }) {
	const { uuid } = await params;
	const item = await getItemByUUID(uuid);

	if (!item) return { title: 'Asset not found' };

	const dateCreated = formatDistanceToNow(new Date(item.date_created), { addSuffix: true });

	return {
		title: item.header,
		description: item.desc_value || 'No description.',
		openGraph: {
			title: item.header,
			description: item.desc_value || 'No description.',
			url: `https://axiomassets.net/asset/${item.uuid}`,
			type: 'article',
			publishedTime: dateCreated,
			authors: [item.publisherData.username],
			images: [
				{
					url: `https://cdn.axiomassets.net/thumbnail/${item.uuid}/thumb.webp`,
					width: 288,
					height: 288,
					alt: item.header,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: item.header,
			description: item.desc_value || 'No description.',
			images: [`https://cdn.axiomassets.net/thumbnail/${item.uuid}/thumb.webp`],
		},
		alternates: {
			canonical: `https://axiomassets.net/asset/${item.uuid}`,
		},
	};
}

export default async function Page({ params }) {
	const { uuid } = await params;

	const item = await getItemByUUID(uuid);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100vh',
				bgcolor: 'background.surface',
				gap: 2,
			}}
		>
			<Navbar />
			<Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
				<AssetPage item={item} />
			</Box>
		</Box>
	);
}
