'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'lib/auth/authContext.js';

import LoginModal from 'components/Modal/Login';
import CreateAccountCard from 'components/Card/CreateAccount';
import Navbar from 'components/Navbar/Navbar';

import Box from '@mui/joy/Box';

function App() {
	const [userPermLvl, setUserPermLvl] = useState(null);
	const [userName, setUserName] = useState(null);
	const [userUUID, setUserUUID] = useState(null);
	const [userImageID, setUserImageID] = useState(null);
	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [loginModalOpen, setLoginModalOpen] = useState(true);
	const [createAccount, setCreateAccount] = useState(false);

	const router = useRouter();

	const { user, loading } = useAuth();

	const verifyToken = async () => {
		if (user && !loading) {
			setUserUUID(user.uuid);
			setUserName(user.username);
			setUserPermLvl(user.permission_level);
			setUserImageID(user.image_id);

			if (user.permission_level && user.permission_level < 3) {
				router.push('/browse');
			}
			if (user.username === user.uuid && user.permission_level >= 3) {
				router.push('/auth');
			}
		} else if (!user && !loading) {
			setUserLoggedIn(false);
		}
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	const handleLoginClose = async () => {
		router.push('/browse');
	};

	return (
		<Box
			sx={{
				overflow: 'hidden',
				width: '100vw',
				height: '100vh',
				bgcolor: 'background.surface',
			}}
		>
			<Navbar />
			<Box
				sx={{
					height: '100%',
				}}
			>
				{createAccount ? (
					<CreateAccountCard imageID={userImageID} />
				) : (
					<LoginModal
						onSuccess={verifyToken}
						open={loginModalOpen}
						setOpen={setLoginModalOpen}
						backgroundBlur={false}
						onClose={handleLoginClose}
					/>
				)}
			</Box>
		</Box>
	);
}

export default App;
