import { useState } from 'react';

import Slider from '@mui/joy/Slider';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

const StackingSlider = ({ width, minSliderValue = 1, maxValue = 10, step = 0.01, stackCount = 3 }) => {
	const generateValues = (stackCount, minSliderValue, maxValue) => {
		const stepSize = (maxValue - minSliderValue) / (stackCount - 1);
		return Array.from({ length: stackCount }, (_, i) => minSliderValue + i * stepSize);
	};

	const [values, setValues] = useState(generateValues(stackCount, minSliderValue, maxValue));

	const handleChange = (event, newValue, activeThumb) => {
		if (!Array.isArray(newValue)) return;

		const updatedValues = [...values];
		const delta = newValue[activeThumb] - values[activeThumb];

		if (
			updatedValues[activeThumb - 1] + minSliderValue >= newValue[activeThumb] ||
			minSliderValue >= newValue[activeThumb] ||
			maxValue - minSliderValue <= newValue[activeThumb]
		) {
			return;
		}

		updatedValues[activeThumb] += delta;

		for (let i = activeThumb + 1; i < updatedValues.length; i++) {
			updatedValues[i] = Math.max(updatedValues[i - 1], updatedValues[i] + delta);
		}

		const clampedValues = updatedValues.map((val) => Math.min(maxValue, Math.max(0, val)));

		setValues(clampedValues);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				width,
			}}
		>
			<Box
				sx={{
					position: 'relative',
					top: '24px',
					width: '100%',
					display: 'flex',
					overflow: 'hidden',
				}}
			>
				{values.map((value, index) => (
					<Box
						key={index}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							height: '6px',
							bgcolor: `hsl(${(index * 420) / stackCount}, 45%, 55%)`,
							width: `${((value - (values[index - 1] || 0)) / maxValue) * 100}%`,
						}}
					/>
				))}
				<Box
					sx={{
						height: '6px',
						bgcolor: 'hsl(50, 50%, 50%)',
						width: `${((maxValue - values[values.length - 1]) / maxValue) * 100}%`,
					}}
				></Box>
			</Box>
			<Slider
				value={values}
				onChange={(e, newValue, thumbIndex) => handleChange(e, newValue, thumbIndex)}
				step={step}
				min={0}
				max={maxValue}
				sx={{
					width: '100%',
					'--Slider-trackBackground': 'transparent',
					'--Slider-railBackground': 'transparent',
					'--Slider-thumbSize': '16px',
					'--Slider-thumbSize': '28px',
					'--Slider-thumbWidth': '14px',
					'&:hover': {
						'--Slider-trackBackground': '#00000022',
						'--Slider-railBackground': '#00000022',
					},
				}}
			/>
		</Box>
	);
};

export default StackingSlider;
