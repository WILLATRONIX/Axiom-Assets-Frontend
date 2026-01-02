'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { post } from 'api/network';
import { useAuth } from 'api/auth/authContext';
import { useNotification } from 'api/NotificationContext';

import Box from '@mui/joy/Box';

const DiscordCallback = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const discordCode = searchParams.get('code');

	const { fetchUserDetails } = useAuth();
	const { notify } = useNotification();

	useEffect(() => {
		if (!discordCode) return;

		const handleDiscordLogin = async () => {
			try {
				const res = await post(`${process.env.NEXT_PUBLIC_API_URL}/auth/discord`, {
					discord_code: discordCode,
				});

				if (res.ok) {
					await fetchUserDetails();
					router.replace('/browse');
				} else {
					notify('Failed to authorise with discord', 'danger');
				}
			} catch (err) {
				console.error('Discord login failed:', err);
			}
		};

		handleDiscordLogin();
	}, [discordCode, router]);

	return (
		<Box
			sx={{
				overflow: 'hidden',
				width: '100vw',
				height: '100vh',
				bgcolor: 'background.surface',
			}}
		/>
	);
};

export default DiscordCallback;
