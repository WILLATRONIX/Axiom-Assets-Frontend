import { useState, useEffect } from 'react';

import Button from '@mui/joy/Button';
import Snackbar from '@mui/joy/Snackbar';
import LinearProgress from '@mui/joy/LinearProgress';
import Box from '@mui/joy/Box';

import { Portal } from '@mui/base';

import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const ActionNotification = ({
	message = 'action',
	open,
	setOpen,
	color = 'primary',
	variant = 'soft',
	onClick,
	options = ['Yes', 'No'],
    length = 5000
}) => {
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
				if (isHovered) return prevTime;

				const newTime = prevTime + interval;

				if (newTime >= length) {
					clearInterval(timer);
					setTimeout(() => setOpen(false), 0);
				}

				return Math.min(newTime, length);
			});
		}, interval);

		return () => clearInterval(timer);
	}, [open, isHovered, message]);

	const confirmAction = (choice) => {
		if (typeof onClick === 'function') {
			onClick(choice);
			setOpen(false);
		} else {
			console.error('Unable to return choice');
		}
	};

	return (
		<Portal>
			<Snackbar
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				variant={variant}
				color={color}
				open={open}
				onClose={(event, reason) => {
					if (reason === 'clickaway') {
						return;
					}
					setOpen(false);
				}}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				startDecorator={<QuestionMarkIcon />}
				endDecorator={options.map((option, index) => (
					<Button
						key={index}
						onClick={() => confirmAction(option)}
						size="sm"
						variant={variant}
						color={color}
						sx={{ marginLeft: '10px' }}
					>
						{option}
					</Button>
				))}
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
						value={(time / length) * 100}
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

export default ActionNotification;
