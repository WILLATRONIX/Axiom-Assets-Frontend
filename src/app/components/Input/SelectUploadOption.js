import { useState, useEffect, Fragment } from 'react';

import Button from '@mui/joy/Button';
import Snackbar from '@mui/joy/Snackbar';
import LinearProgress from '@mui/joy/LinearProgress';
import Box from '@mui/joy/Box';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';

import ExploreIcon from '@mui/icons-material/Explore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

const options = [
	{
		name: 'Single Asset',
		desc: 'Upload one asset',
	},
	{
		name: 'Mass Upload',
		desc: 'Upload separate assets',
	},
	{
		name: 'Asset Pack',
		desc: 'Combine assets into one',
	},
];

const SelectUploadOption = ({ onConfirm, defaultValue, hasConflictingAssets }) => {
	const [selectedOption, setSelectedOption] = useState(defaultValue !== null ? options[defaultValue].name : null);
	
	return (
		<Fragment>
			<Box
				variant="plain"
				sx={{
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					gap: 1.5,
					m: 2,
				}}
			>
				<Typography level="title-md">Select Upload Type</Typography>
				<RadioGroup
					value={selectedOption || ''}
					onChange={(event) => {
						setSelectedOption(event.target.value);
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyItems: 'center',
							gap: 1.5,
						}}
					>
						{options.map((item, index) => (
							<Card
								key={index}
								sx={{
									width: '14rem',
									height: '6rem',
									boxShadow: 'none',
									'&:hover': {
										bgcolor: 'background.level1',
									},
								}}
							>
								<CardContent>
									<Typography level="h4">{item.name}</Typography>
									<Typography>{item.desc}</Typography>
								</CardContent>
								<Radio
									disableIcon
									overlay
									checked={selectedOption === item.name}
									variant="outlined"
									color="neutral"
									value={item.name}
									sx={{ mt: -2 }}
									slotProps={{
										action: {
											sx: {
												...(selectedOption === item.name && {
													borderWidth: 2,
													borderColor: 'var(--joy-palette-primary-500)',
												}),
												'&:hover': {
													bgcolor: 'transparent',
												},
											},
										},
									}}
								/>
							</Card>
						))}
					</Box>
				</RadioGroup>
				{options.findIndex((option) => option.name === selectedOption) !== defaultValue &&
					hasConflictingAssets && (
						<Typography color="danger">Warning: Previously selected assets will be removed.</Typography>
					)}
				<Button
					disabled={selectedOption === null}
					onClick={() => onConfirm(options.findIndex((option) => option.name === selectedOption))}
				>
					Next
				</Button>
			</Box>
		</Fragment>
	);
};

export default SelectUploadOption;
