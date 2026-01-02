import { useState, Fragment, useEffect } from 'react';

import { useGoogleLogin } from '@react-oauth/google';
import { post } from 'api/network';
import { useAuth } from 'api/auth/authContext';
import { msalInstance, initializeMsal } from 'api/msalConfig';
import { hasPermission } from 'api/permissionContext';

import CreateAccountCard from 'components/Card/CreateAccount';
import { useNotification } from 'api/NotificationContext';

import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';

import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const LoginModal = ({ open, setOpen, onClose, backgroundBlur = true }) => {
	const [userImageID, setUserImageID] = useState(null);
	const [userPermLvl, setUserPermLvl] = useState(null);
	const [userName, setUserName] = useState(null);
	const [userUUID, setUserUUID] = useState(null);
	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [createAccount, setCreateAccount] = useState(false);

	const [isLoading, setIsLoading] = useState(false);

	const { fetchUserDetails } = useAuth();

	const { user, loading } = useAuth();

	const verifyToken = async () => {
		if (user && !loading) {
			setUserUUID(user.uuid);
			setUserName(user.username);
			setUserPermLvl(user.permission_level);
			setUserImageID(user.image_id);

			if (user.username === user.uuid && !hasPermission(user.permissions, 'user.*')) {
				setCreateAccount(true);
			}
		} else if (!user && !loading) {
			setUserLoggedIn(false);
		}
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	const { notify } = useNotification();

	const handleClose = () => {
		if (!createAccount) {
			onClose();
		}
	};

	const handleCreatedNewAccount = async () => {
		await fetchUserDetails();
		onClose();
		setCreateAccount(false);
	};

	const handleGoogleSuccess = async (response) => {
		if (isLoading) return;
		const res = await post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
			access_token: response.access_token,
		});

		if (res.ok) {
			await fetchUserDetails();
			handleClose();
			setIsLoading(false);
		} else {
			notify('Failed to sign in with Google', 'danger');
			console.error(res);
			setIsLoading(false);
		}
	};

	const handleLoginFailure = () => {
		notify('Google sign-in failed. Please try again.', 'danger');
	};

	const handleGoogleLogin = useGoogleLogin({
		onSuccess: (tokenResponse) => handleGoogleSuccess(tokenResponse),
		onError: handleLoginFailure,
	});

	const handleMicrosoftLogin = async () => {
		if (isLoading) return;
		try {
			setIsLoading(true);
			await initializeMsal();

			const loginResponse = await msalInstance.loginPopup({
				scopes: ['User.Read'],
				prompt: 'select_account',
			});

			const accessToken = loginResponse.accessToken;

			const res = await post(`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`, {
				access_token: accessToken,
			});

			if (res.ok) {
				await fetchUserDetails();
				handleClose();
			} else {
				notify('Failed to sign in with Microsoft', 'danger');
			}
			setIsLoading(false);
		} catch (error) {
			notify('Failed to sign in with Microsoft', 'danger');
			setIsLoading(false);
			console.error(error);
		}
	};

	const handleDiscordLogin = () => {
		if (isLoading) return;
		try {
			setIsLoading(true);
			const clientId = process.env.NEXT_PUBLIC_DISCORD_AUTH_CLIENT_ID;
			const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_AUTH_CALLBACK_URI);
			const scope = encodeURIComponent('identify email');
			const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=consent`;

			window.location.href = discordAuthUrl;
			setIsLoading(false);
		} catch (error) {
			notify('Failed to sign in with Discord', 'danger');
			setIsLoading(false);
			console.error(error);
		}
	};

	return (
		<Fragment>
			<Modal open={open} onClose={handleClose} hideBackdrop={!backgroundBlur}>
				<ModalDialog
					sx={{
						minWidth: '400px',
						height: 'auto',
						gap: 2,
						border: !backgroundBlur && 'none',
					}}
				>
					{!createAccount && <ModalClose />}
					<DialogTitle level="h4">{createAccount ? 'Create Account' : 'Login'}</DialogTitle>
					{createAccount ? (
						<CreateAccountCard imageID={userImageID} onSuccess={handleCreatedNewAccount} />
					) : (
						<DialogContent sx={{ gap: 2 }}>
							<Box
								sx={{
									height: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: '100%',
								}}
							>
								<Box
									sx={{
										justifyContent: 'center',
										display: 'flex',
										flexDirection: 'column',
										gap: 1,
										my: 1,
									}}
								>
									<Button onClick={handleGoogleLogin} startDecorator={<GoogleIcon />}>
										Sign in with Google
									</Button>
									<Button onClick={handleMicrosoftLogin} startDecorator={<MicrosoftIcon />}>
										Sign in with Microsoft
									</Button>
									<Button onClick={handleDiscordLogin} startDecorator={<SportsEsportsIcon />}>
										Sign in with Discord
									</Button>
								</Box>
							</Box>
							<Button variant="plain" sx={{ width: '100%' }} onClick={handleClose}>
								Cancel
							</Button>
						</DialogContent>
					)}
				</ModalDialog>
			</Modal>
		</Fragment>
	);
};

export default LoginModal;
