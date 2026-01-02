import { useRef } from 'react';
import PropTypes from 'prop-types';

import Input from '@mui/joy/Input';

export default function DebouncedInput(props) {
	const { onDebounce, debounceTimeout, value, onChange, ...other } = props;

	const timerRef = useRef(null);

	const handleInputChange = (event) => {
		if (onChange) onChange(event);

		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			onDebounce(event);
		}, debounceTimeout);
	};

	return <Input {...other} value={value} onChange={handleInputChange} />;
}

DebouncedInput.propTypes = {
	debounceTimeout: PropTypes.number.isRequired,
	onDebounce: PropTypes.func.isRequired,
	onChange: PropTypes.func,
	value: PropTypes.string,
};
