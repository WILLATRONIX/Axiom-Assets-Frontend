"use client"

import { useEffect } from 'react';

import { formatDistanceToNow } from 'date-fns';

const getRelativeTime = (date) => {
	const parsedDate = new Date(date);
	return formatDistanceToNow(parsedDate, { addSuffix: true }).replace(/^about\s/, '');
};

const RelativeTime = ({ date }) => {
    let relativeTime = getRelativeTime(date);

	useEffect(() => {
		const interval = setInterval(() => {
			relativeTime = getRelativeTime(date);
		}, 60000);

		return () => clearInterval(interval);
	}, [date]);

	return <span>{relativeTime}</span>;
};

export default RelativeTime;
