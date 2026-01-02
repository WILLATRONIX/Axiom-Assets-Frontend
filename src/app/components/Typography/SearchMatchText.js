import { useEffect } from 'react';
import Box from '@mui/joy/Box';

const SearchMatchText = ({ text, highlight, setHasMatchingText = () => {} }) => {
	if (!text) {
		return <>{text}</>;
	}

	if (!highlight?.trim()) {
		return <>{text}</>;
	}

	const isMatch = text.toLowerCase().includes(highlight.toLowerCase());

	useEffect(() => {
		setHasMatchingText(isMatch);
	}, [isMatch, setHasMatchingText]);

	const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

	return parts.map((part, index) =>
		part.toLowerCase() === highlight.toLowerCase() ? (
			<Box
				key={index}
				component="span"
				sx={{
					bgcolor: 'var(--joy-palette-warning-500)',
					borderRadius: '4px',
				}}
			>
				{part}
			</Box>
		) : (
			<span key={index}>{part}</span>
		)
	);
};

export default SearchMatchText;
