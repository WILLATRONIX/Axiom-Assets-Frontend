'use client';

import { useState, useEffect } from 'react';
import Autocomplete from '@mui/joy/Autocomplete';

export default function InputSuggestions({ onChange = () => {}, optionSource = '' }, props) {
	const [value, setValue] = useState('');
	const [options, setOptions] = useState(['Option 1', 'Option 2', 'Another option']);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (!tagInputValue || tagInputValue.length < 1) return;

			try {
				const res = await get('/search/suggestion', {
					params: {
						flags: JSON.stringify({
							optionSource,
						}),
					},
				});

				if (!res.results) throw new Error('Failed to fetch search suggestions');
				setOptions(res.results);
			} catch (error) {
				console.error(error);
			}
		};

		const timeoutId = setTimeout(fetchSuggestions, 200);
		return () => clearTimeout(timeoutId);
	}, [value]);

	return (
		<Autocomplete
			{...props}
			options={options}
			inputValue={value}
			onInputChange={(_, newValue) => setValue(newValue)}
			onChange={(_, newValue) => {
				if (typeof newValue === 'string') {
					setValue(newValue);
					onChange(newValue);
				}
			}}
			freeSolo
		/>
	);
}
