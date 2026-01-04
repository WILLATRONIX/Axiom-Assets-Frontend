import { useRef, useState, Fragment } from 'react';
import PropTypes from 'prop-types';

import { useNotification } from 'lib/NotificationContext';
import { post } from 'lib/network';

import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Box from '@mui/joy/Box';
import ModalClose from '@mui/joy/ModalClose';
import Textarea from '@mui/joy/Textarea';

import PublishIcon from '@mui/icons-material/Publish';

function DebounceInput({ handleDebounce, debounceTimeout, ...props }) {
	const timerRef = useRef(null);

	const handleChange = (event) => {
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			handleDebounce(event.target.value);
		}, debounceTimeout);
	};

	return <Textarea {...props} onChange={handleChange} sx={{ '--Input-focused': 0 }} />;
}

DebounceInput.propTypes = {
	debounceTimeout: PropTypes.number.isRequired,
	handleDebounce: PropTypes.func.isRequired,
};

const BasicModalDialog = ({ open, setOpen }) => {
	const [isValidThemeData, setIsValidThemeData] = useState(null);
	const [themeInput, setThemeInput] = useState(null);
	const [uploading, setUploading] = useState(false);

	const [themeData, setThemeData] = useState({ theme: { name: '' } });

	const { notify } = useNotification();

	const checkThemeData = async (theme) => {
		if (!theme) {
			setIsValidThemeData(null);
			return;
		} else if (theme.length < 48 || !theme.startsWith('AS')) {
			setIsValidThemeData(false);
			notify('Invalid Theme Data', 'danger');
			return;
		}

		try {
			const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/upload/get-theme-data`, { theme });

			if (response.ok) {
				setIsValidThemeData(true);
				setThemeInput(theme);

				if (!response.data.theme.name || response.data.theme.name.trim() === '') {
					response.data.theme.name = 'Untitled Theme';
				}

				setThemeData(response.data);
			} else {
				setIsValidThemeData(false);
				notify('Invalid Theme Data', 'danger');
			}
		} catch (error) {
			setIsValidThemeData(false);
			notify('Invalid Theme Data', 'danger');
		}
	};

	const ImGuiScheme = {
		Text: 0,
		TextDisabled: 1,
		WindowBg: 2,
		Border: 5,
		TitleBg: 10,
		Button: 21,
		ButtonHovered: 22,
		ButtonActive: 23,
		ResizeGripActive: 32,
	};

	const uploadTheme = async () => {
		if (!uploading) {
			setUploading(true);

			const clientTimeISO = new Date().toISOString();

			const itemData = {
				clientTime: clientTimeISO,
				lastUpdated: clientTimeISO,
				type: 2,
				metric: themeData.theme.changedColorCount,
				header: themeData.theme.name,
				value: themeInput,
				version: themeData.theme.version,
			};

			const themeValues = themeData.theme.modifiedStyleValues.colorValues;

			const formData = new FormData();
			formData.append('themeData', JSON.stringify(itemData));
			formData.append('themeValues', JSON.stringify(themeValues));

			const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/upload/theme`, formData);

			if (response.ok) {
				notify('Your theme has been uploaded');
				setOpen(false);
			} else {
				notify('A network error has occurred. Please try again.', 'danger');
			}

			setUploading(false);
		}
	};

	return (
		<Fragment>
			<Modal
				hideBackdrop
				open={open}
				onClose={() => {
					setOpen(false);
					setIsValidThemeData(null);
					setThemeData({ theme: { name: '' } });
				}}
			>
				<ModalDialog
					variant="plain"
					sx={{
						width: '600px',
						boxShadow: 'none',
					}}
				>
					<ModalClose />
					<DialogTitle sx={{ paddingBottom: '10px' }}>Upload Theme</DialogTitle>
					<DialogContent>
						<Box
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '15px',
								overflow: 'hidden',
							}}
						>
							<DebounceInput
								variant="soft"
								minRows={13}
								size="lg"
								spellCheck="false"
								sx={{
									wordBreak: 'break-all',
									overflowWrap: 'break-word',
								}}
								readOnly={isValidThemeData}
								placeholder="Paste your Theme here…"
								debounceTimeout={500}
								handleDebounce={checkThemeData}
							/>
							{themeData.theme.name && (
								<Button
									sx={{
										width: '100%',
										overflow: 'hidden',
										maxHeight: '38px',
									}}
									startDecorator={<PublishIcon />}
									disabled={!isValidThemeData}
									onClick={() => {
										uploadTheme();
										setIsValidThemeData(null);
									}}
								>
									{`Publish "${themeData.theme.name || 'Untitled Theme'}"`}
								</Button>
							)}
						</Box>
					</DialogContent>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
};

export default BasicModalDialog;
