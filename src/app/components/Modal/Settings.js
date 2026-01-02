import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { post } from 'api/network';
import { useAuth } from 'api/auth/authContext.js';
import { useNotification } from 'api/NotificationContext';

import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Sheet from '@mui/joy/Sheet';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

export default function SettingsModal({ open, setOpen }) {
	const settingKeys = ['Preferences', 'My Account'];
	const [selectedSetting, setSelectedSetting] = useState(settingKeys[0]);
	const [siteBaseTheme, setSiteBaseTheme] = useState(null);

	const [newUserName, setNewUserName] = useState('');
	const [prevUserName, setPrevUserName] = useState('');

	const [newDisplayName, setNewDisplayName] = useState('');
	const [prevDisplayName, setPrevDisplayName] = useState('');

	const [newUserAboutMe, setNewUserAboutMe] = useState('');
	const [prevUserAboutMe, setPrevUserAboutMe] = useState('');
	const [userData, setUserData] = useState(null);

	const { user, loadingUser } = useAuth();
	const router = useRouter();
	const { notify } = useNotification();

	const handleClose = () => setOpen(false);

	const handleChangeBaseTheme = (theme) => {
		const currentTheme = localStorage.getItem('joy-mode');
		if (theme && theme !== currentTheme) {
			localStorage.setItem('joy-mode', theme);
			window.location.reload();
		}
	};

	const normalizeUsername = (value) =>
		value
			.replace(/\s/g, '-')
			.replace(/[^a-zA-Z0-9_-]/g, '')
			.replace(/-{2,}/g, '-')
			.slice(0, 32)
			.replace(/^[-_]+|[-_]+$/g, '')
			.toLowerCase();

	const normalizeDisplayName = (value) =>
		value
			.replace(/\s/g, '-')
			.replace(/[^a-zA-Z0-9_-]/g, '')
			.replace(/-{2,}/g, '-')
			.slice(0, 64);

	const normalizeAboutMe = (value) => value.replace(/[^a-zA-Z0-9 _\-.,#\n]/g, '').toLowerCase();

	const isUsernameValid = (username) => username.length >= 3;

	const handleEditUserDetails = async () => {
		try {
			const userDataToSend = {
				username: newUserName,
				display_name: newDisplayName,
				about_me: newUserAboutMe,
			};

			const response = await post('/auth/edit-user-data', { userData: userDataToSend });

			if (response.ok) {
				setPrevUserName(newUserName);
				setPrevDisplayName(newDisplayName);
				setPrevUserAboutMe(newUserAboutMe);
				notify('User info updated.');
			} else {
				notify('Failed to update user info', { color: 'danger' });
			}
		} catch (error) {
			const errorMessage = error?.reason || error?.message || 'Error while editing user.';
			notify(errorMessage, 'danger');
			console.error(error);
		}
	};

	useEffect(() => {
		const currentTheme = localStorage.getItem('joy-mode');
		setSiteBaseTheme(currentTheme);
	}, []);

	useEffect(() => {
		if (user && !loadingUser) {
			setNewUserName(user.username ?? '');
			setPrevUserName(user.username ?? '');
			setNewDisplayName(user.display_name ?? '');
			setPrevDisplayName(user.display_name ?? '');
			setNewUserAboutMe(user.about_me ?? '');
			setPrevUserAboutMe(user.about_me ?? '');
			setUserData(user);
		}
	}, [user, loadingUser]);

	const settingValues = [
		<Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
			<FormControl>
				<FormLabel>Theme</FormLabel>
				<Select
					defaultValue={siteBaseTheme || undefined}
					onChange={(event, newValue) => handleChangeBaseTheme(newValue)}
				>
					<Option value="dark">Dark</Option>
					<Option value="light">Light</Option>
				</Select>
			</FormControl>
		</Box>,
		<Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
			{userData ? (
				<>
					<FormControl>
						<FormLabel>Username</FormLabel>
						<Input
							value={newUserName}
							onChange={(e) => setNewUserName(normalizeUsername(e.target.value))}
							endDecorator={
								<Button
									disabled={prevUserName === newUserName.trim() || !isUsernameValid(newUserName)}
									onClick={handleEditUserDetails}
								>
									Save
								</Button>
							}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Display Name</FormLabel>
						<Input
							value={newDisplayName}
							onChange={(e) => setNewDisplayName(normalizeDisplayName(e.target.value))}
							endDecorator={
								<Button
									disabled={prevDisplayName === newDisplayName.trim()}
									onClick={handleEditUserDetails}
								>
									Save
								</Button>
							}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>About Me</FormLabel>
						<Input
							value={newUserAboutMe}
							onChange={(e) => setNewUserAboutMe(normalizeAboutMe(e.target.value))}
							endDecorator={
								<Button
									disabled={prevUserAboutMe === newUserAboutMe.trim()}
									onClick={handleEditUserDetails}
								>
									Save
								</Button>
							}
						/>
					</FormControl>
				</>
			) : (
				<Button onClick={() => router.push('/auth')}>Create account</Button>
			)}
		</Box>,
	];

	return (
		<Fragment>
			<Modal open={open} onClose={handleClose}>
				<ModalDialog sx={{ width: 600, height: 400 }}>
					<ModalClose />
					<DialogTitle>Settings</DialogTitle>
					<DialogContent sx={{ gap: 3, display: 'flex', flexDirection: 'row', mt: 0.5 }}>
						<RadioGroup
							value={selectedSetting}
							size="md"
							sx={{ gap: 1.5, p: 0.5, width: 160, flexShrink: 0 }}
							onChange={(event) => {
								setSelectedSetting(event.target.value);
							}}
						>
							{settingKeys.map((value) => (
								<Sheet key={value} sx={{ p: '4px 8px', borderRadius: 'md', boxShadow: 'sm' }}>
									<Radio
										disabled={settingKeys.indexOf(value) > 1}
										label={value}
										overlay
										disableIcon
										value={value}
										slotProps={{
											label: ({ checked }) => ({
												sx: {
													fontWeight: 'md',
													fontSize: 'md',
													color: checked ? 'text.primary' : 'text.secondary',
												},
											}),
											action: ({ checked }) => ({
												sx: (theme) => ({
													...(checked && {
														'--variant-borderWidth': '2px',
														'&&': {
															borderColor: theme.vars.palette.primary[500],
														},
													}),
												}),
											}),
										}}
									/>
								</Sheet>
							))}
						</RadioGroup>
						<Divider orientation="vertical" />
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 1, flexGrow: 1 }}>
							{settingValues[settingKeys.indexOf(selectedSetting)]}
						</Box>
					</DialogContent>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
