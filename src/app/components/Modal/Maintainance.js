import { useState, Fragment } from 'react';
import { post } from 'api/network';
import { useNotification } from 'api/NotificationContext';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

export default function MaintainenceMessage({ open, setOpen }) {
	const [secretInputValue, setSecretInputValue] = useState('');

	const handleSubmit = (event) => {
		event.preventDefault();
		if (secretInputValue === 'itsmewillatronix') {
			setOpen(false);
		}
	};

	return (
		<Modal open={open}>
			<ModalDialog sx={{ width: 480 }}>
				<DialogTitle>Under Maintenance</DialogTitle>
				<Divider />

				<DialogContent component="form" onSubmit={handleSubmit} sx={{ gap: 1 }}>
					<Typography>Axiom Asset Library is currently under maintenance.</Typography>

					<Input
						autoFocus
						sx={{
							width: 0,
							height: 0,
							p: 0,
							minHeight: 0,
							borderRadius: 0,
							my: -0.5,
						}}
						variant="plain"
						value={secretInputValue}
						onChange={(e) => setSecretInputValue(e.target.value)}
					/>

					<button type="submit" hidden />

					<Typography level="body-sm">
						Join the <a href="https://discord.gg/JYMDCvmtfK">Discord</a> for updates.
					</Typography>
				</DialogContent>
			</ModalDialog>
		</Modal>
	);
}
  
