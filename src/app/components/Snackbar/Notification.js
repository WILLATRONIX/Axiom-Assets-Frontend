import { useState, useEffect } from 'react';

import Button from '@mui/joy/Button';
import Snackbar from '@mui/joy/Snackbar';
import LinearProgress from '@mui/joy/LinearProgress';
import Box from '@mui/joy/Box';

import { Portal } from '@mui/base';

import InfoIcon from '@mui/icons-material/Info';

const NotificationSnackbar = ({ message, open, setOpen, closeMessage = 'Dismiss', color = 'primary' }) => {
	const [time, setTime] = useState(0);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		if (!open) {
			setTime(0);
			return;
		}

		const interval = 20;

		const timer = setInterval(() => {
			setTime((prevTime) => {
				if (isHovered) return 0;

				const newTime = prevTime + interval;

				if (newTime >= 3000) {
					clearInterval(timer);
					setTimeout(() => setOpen(false), 0);
				}

				return Math.min(newTime, 3000);
			});
		}, interval);

		return () => clearInterval(timer);
	}, [open, isHovered, message]);

	return (
		<Portal>
			<Snackbar
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				variant="soft"
				color={color}
				open={open}
				onClose={(event, reason) => {
					if (reason === 'clickaway') {
						return;
					}
					setOpen(false);
				}}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				startDecorator={<InfoIcon />}
				endDecorator={
					<Button
						onClick={() => setOpen(false)}
						size="sm"
						variant="soft"
						color={color}
						sx={{ marginLeft: '10px' }}
					>
						{closeMessage}
					</Button>
				}
			>
				{message}
				<Box
					sx={{
						display: 'flex',
						position: 'absolute',
						bottom: 0,
						left: 0,
						width: '100%',
					}}
				>
					<LinearProgress
						variant="plain"
						value={(time / 3000) * 100}
						determinate
						color={color}
						sx={{
							'--LinearProgress-progressRadius':
								'0 var(--LinearProgress-radius) var(--LinearProgress-radius) var(--LinearProgress-radius)',
						}}
					/>
				</Box>
			</Snackbar>
		</Portal>
	);
};

export default NotificationSnackbar;
