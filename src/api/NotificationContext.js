'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import NotificationSnackbar from 'components/Snackbar/Notification';

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [color, setColor] = useState('primary');
	const [closeMessage, setCloseMessage] = useState('Dismiss');

	const notify = useCallback((msg, options = {}) => {
		setMessage(msg);
		setColor(options.color || 'primary');
		setCloseMessage(options.closeMessage || 'Dismiss');
		setOpen(true);
	}, []);

	return (
		<NotificationContext.Provider value={{ notify }}>
			{children}
			<NotificationSnackbar
				message={message}
				open={open}
				setOpen={setOpen}
				color={color}
				closeMessage={closeMessage}
			/>
		</NotificationContext.Provider>
	);
};
