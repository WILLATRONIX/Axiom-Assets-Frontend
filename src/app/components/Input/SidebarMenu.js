'use client';

import { useState, useEffect, Fragment } from 'react';

import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import Link from '@mui/joy/Link';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Sheet from '@mui/joy/Sheet';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Input from '@mui/joy/Input';

import ExploreIcon from '@mui/icons-material/Explore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

const SidebarMenu = ({ options, onChange }) => {
	const [selectedChapter, setSelectedChapter] = useState(options[0]);

	return (
		<RadioGroup
			value={selectedChapter}
			size="md"
			sx={{ gap: 1.5, p: 0.5, width: 200, flexShrink: 0 }}
			onChange={(event) => {
				setSelectedChapter(event.target.value);
			}}
		>
			{options.map((value) => (
				<Sheet key={value} sx={{ p: '6px 8px', borderRadius: 'md', boxShadow: 'sm' }}>
					<Radio
						label={value}
						overlay
						disableIcon
						value={value}
						slotProps={{
							label: ({ checked }) => ({
								sx: {
									fontWeight: 'md',
									fontSize: 'md',
									color: checked ? 'text.primary' : 'text.secondary',
								},
							}),
							action: ({ checked }) => ({
								sx: (theme) => ({
									...(checked && {
										'--variant-borderWidth': '2px',
										'&&': {
											borderColor: theme.vars.palette.primary[500],
										},
									}),
								}),
							}),
						}}
					/>
				</Sheet>
			))}
		</RadioGroup>
	);
};

export default SidebarMenu;
