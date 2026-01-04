import { useState } from 'react';

import { post } from 'lib/network';
import { useNotification } from 'lib/NotificationContext';

import Box from '@mui/joy/Box';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import AspectRatio from '@mui/joy/AspectRatio';
import DialogContent from '@mui/joy/DialogContent';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';

const CreateAccount = ({ imageID, onSuccess }) => {
	const [username, setUsername] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [aboutMe, setAboutMe] = useState('');
	const [userImageID, setUserImageID] = useState(imageID);

	const { notify } = useNotification();

	const handleDisplayNameInputChange = (event) => {
		const value = event.target.value;

		const normalized = value
			.replace(/\s/g, '-')
			.replace(/[^a-zA-Z0-9_-]/g, '')
			.replace(/-{2,}/g, '-')
			.slice(0, 64);

		setDisplayName(normalized);
	};

	const handleUsernameInputChange = (event) => {
		const value = event.target.value;

		const normalized = value
			.replace(/\s/g, '-')
			.replace(/[^a-zA-Z0-9_-]/g, '')
			.replace(/-{2,}/g, '-')
			.slice(0, 32);

		setUsername(normalized.toLowerCase());
	};

	const handleBlur = () => {
		setUsername((u) => u.replace(/^[-_]+|[-_]+$/g, ''));
	};

	const handleAboutMeInputChange = (event) => {
		const inputValue = event.target.value.replace(/[^a-zA-Z0-9 _\-.,#\n]/g, '');
		setAboutMe(inputValue.toLowerCase());
	};

	const randomUserImage = () => {
		const randomImageID = Math.floor(Math.random() * 276 + 1);
		setUserImageID(randomImageID);
	};

	const validUserData = async () => {
		if (username.length < 3) {
			notify('Username is too short. Must be at least 3 characters', { color: 'danger' });
			return false;
		}

		if (username.length === '') {
			notify('Username is too short. Must be at least 3 characters', { color: 'danger' });
			return false;
		}

		return true;
	};

	const createAccount = async () => {
		const userData = {
			username: username,
			display_name: displayName || username,
			about_me: aboutMe,
			image_id: userImageID,
		};

		const creationStatus = await post('/auth/edit-user-data', {
			userData,
		});

		if (creationStatus.ok) {
			onSuccess();
		} else {
			const errorData = creationStatus?.data;
			notify(`${errorData.message}: ${errorData?.reason}`, { color: 'danger' });
		}
	};

	return (
		<DialogContent sx={{ gap: 2 }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					gap: 2,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 2,
					}}
				>
					<FormControl>
						<FormLabel>Username</FormLabel>
						<Input
							color="neutral"
							variant="outlined"
							onChange={handleUsernameInputChange}
							value={username}
							onBlur={handleBlur}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Display Name</FormLabel>
						<Input
							color="neutral"
							variant="outlined"
							onChange={handleDisplayNameInputChange}
							value={displayName}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>About Me</FormLabel>
						<Textarea
							minRows={6}
							color="neutral"
							variant="outlined"
							value={aboutMe}
							onChange={handleAboutMeInputChange}
						/>
					</FormControl>
				</Box>
				<FormControl>
					<FormLabel>Profile Image</FormLabel>
					<AspectRatio
						ratio="1"
						sx={{
							width: '192px',
							cursor: 'pointer',
						}}
					>
						<img
							src={`https://cdn.axiomassets.net/defaults/profile-img/256/${userImageID}.webp`}
							alt=""
							draggable={false}
							style={{
								pointerEvents: 'none',
								userSelect: 'none',
							}}
							onError={(e) => {
								e.target.src =
									'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
							}}
						/>
					</AspectRatio>
					<Button variant="plain" sx={{ width: '100%', mt: 1 }} onClick={() => randomUserImage()}>
						Randomise
					</Button>
				</FormControl>
			</Box>
			<Button
				sx={{ width: '100%' }}
				onClick={() => {
					const valid = validUserData()
					if (valid) {
						createAccount();
					}
				}}
			>
				Confirm
			</Button>
		</DialogContent>
	);
};

export default CreateAccount;
