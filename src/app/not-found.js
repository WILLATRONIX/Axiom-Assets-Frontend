'use client';

import { redirect, usePathname } from 'next/navigation';

import Navbar from 'components/Navbar/Navbar';

import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';

const pathDescriptionMap = [
	{
		path: '/user/profile/[username]',
		title: `This path is invalid.`,
		description: ({ username }) =>
			`This path is no longer in use. Please use the new URL: axiomassets.net/u/${username}.`,
		redirect: ({ username }) => `/u/${username}`,
		forceRedirect: true,
	},
	{
		path: '/asset/[uuid]',
		title: `This path is invalid.`,
		description: ({ uuid }) =>
			`This path is no longer in use. Please use the new URL: axiomassets.net/u/[user]/[asset].`,
		redirect: '/browse',
		forceRedirect: false,
	},
	{
		path: '/u/[username]',
		title: `This user does not exist.`,
		description: ({ username }) =>
			`This user either does not exist. They may be using a private account or have changed their username.`,
		redirect: '/browse',
		forceRedirect: false,
	},
	{
		path: '/u/[username]/[asset]',
		title: `This asset does not exist.`,
		description: ({ username }) =>
			`This user either does not exist. The asset may no longer be public or has been given a new URL.`,
		redirect: ({ username }) => `/u/${username}`,
		forceRedirect: false,
	},
];

function matchRoute(pattern, pathname) {
	const keys = [];

	const regex = new RegExp(
		'^' +
			pattern.replace(/\[([^\]]+)\]/g, (_, key) => {
				keys.push(key);
				return '([^/]+)';
			}) +
			'$'
	);

	const match = pathname.match(regex);
	if (!match) return null;

	const params = {};
	keys.forEach((key, i) => {
		params[key] = match[i + 1];
	});

	return params;
}

function getPageContext(path) {
	const descriptionDefaults = {
		title: 'This page does not exist.',
		description:
			'The page you have requested did not return any results. Navigate back to the browse page, or report this as a mistake.',
		redirect: '/browse',
		forceRedirect: false,
	};

	for (const entry of pathDescriptionMap) {
		const params = matchRoute(entry.path, path);

		if (params) {
			return {
				title: entry.title || descriptionDefaults.title,
				description: entry.description(params) || descriptionDefaults.description,
				redirect: typeof entry.redirect === 'function' ? entry.redirect(params) : entry.redirect,
				forceRedirect: entry.forceRedirect === true,
			};
		}
	}

	return descriptionDefaults;
}

export default function NotFoundPage() {
	const pathname = usePathname();
	const { title, description, redirect: redirectPath, forceRedirect } = getPageContext(pathname);

	const handleRedirect = () => {
		if (redirectPath) {
			redirect(redirectPath);
		}
	};

	if (forceRedirect) handleRedirect();

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
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Card variant="soft" sx={{ width: 'min(500px, 80vw)', height: 'min(300px, 80%)', gap: 0.5 }}>
						<Typography level="body-xs">{pathname}</Typography>
						<Typography level="h3">{`404 ${title}`}</Typography>
						<Divider sx={{ mx: 0 }} />
						<Typography level="body-md" sx={{ pt: 1 }}>
							{description}
						</Typography>
					</Card>
					<Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'end' }}>
						{/* <Button variant="soft" color="neutral">
							Report Mistake
						</Button> */}
						<Button variant="solid" onClick={handleRedirect}>
							Continue
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
