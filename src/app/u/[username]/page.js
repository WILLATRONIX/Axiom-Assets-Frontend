import { formatDistanceToNow } from 'date-fns';

import { post } from 'api/network';

import UserProfile from 'components/Card/UserProfile';

import Box from '@mui/joy/Box';
import Navbar from 'components/Navbar/Navbar';

async function getUserByUUID(name) {
	try {
		const res = await post(
			'/get-user-info',
			{
				username: name,
			},
			{ ssr: true }
		);

		if (res.ok) {
			return res.data.user;
		}
	} catch (error) {
		console.error(error);
	}
}

export async function generateMetadata({ params }) {
	const { username } = await params;
	const user = await getUserByUUID(username);

	if (!user) {
		return {
			title: 'User not found',
		};
	}

	const title = `${user.username}`;
	const description = user.about_me || '';

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: `https://axiomassets.net/user/profile/${username}`,
			type: 'article',
			publishedTime: user.date_created,
			authors: [user.username],
			images: [
				{
					url: `https://cdn.axiomassets.net/defaults/profile-img/256/${user.image_id}.webp`,
					width: 288,
					height: 288,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [`https://cdn.axiomassets.net/defaults/profile-img/256/${user.image_id}.webp`],
		},
		alternates: {
			canonical: `https://axiomassets.net/user/profile/${username}`,
		},
	};
}

async function Page({ params }) {
	const { username } = await params;

	return (
		<Box
			sx={{
				bgcolor: 'var(--joy-palette-background-surface)',
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
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
					browseFilter={{}}
					// variant="browse"
				/>
			</Box>
			<UserProfile userName={decodeURIComponent(username)} />
		</Box>
	);
}

export default Page;
