import { useState, Fragment, useEffect, useRef } from 'react';

import { get, post } from 'lib/network';
import { useAuth } from 'lib/auth/authContext.js';

import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Autocomplete from '@mui/joy/Autocomplete';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import AspectRatio from '@mui/joy/AspectRatio';
import DialogContent from '@mui/joy/DialogContent';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import Checkbox from '@mui/joy/Checkbox';

import CloseIcon from '@mui/icons-material/Close';

const itemColumnMap = {
	users: {
		uuid: { dataType: 'string', locked: true },
		username: { dataType: 'string', maxSize: 64, locked: false },
		about_me: { dataType: 'string', maxSize: 256, locked: false },
		permission_level: { dataType: 'integer', maxSize: 32767, locked: false },
		badge_value: { dataType: 'integer', maxSize: 32767, locked: false },
		google_id: { dataType: 'string', maxSize: 32, locked: true },
		image_id: { dataType: 'integer', maxSize: 32767, locked: false },
		is_creator: { dataType: 'boolean', locked: true },
		last_login: { dataType: 'string', locked: true },
		last_visit: { dataType: 'string', locked: true },
		last_interaction: { dataType: 'string', locked: true },
		date_created: { dataType: 'string', locked: true },
		logging_uuid: { dataType: 'string', locked: true },
	},
	items: {
		uuid: { dataType: 'string', locked: true },
		type: { dataType: 'integer', locked: true },
		header: { dataType: 'string', maxSize: 256, locked: false },
		desc_value: { dataType: 'string', maxSize: 32767, locked: false },
		value: { dataType: 'string', maxSize: 512, locked: false },
		metric: { dataType: 'integer', locked: false },
		publisher: { dataType: 'string', locked: true },
		parent: { dataType: 'string', locked: true },
		downloads: { dataType: 'integer', locked: true },
		saves: { dataType: 'integer', locked: true },
		image_carousel_length: { dataType: 'integer', locked: true },
		image_aspect_ratio: { dataType: 'string', locked: false },
		visibility: { dataType: 'string', maxSize: 64, locked: false },
		date_created: { dataType: 'string', locked: true },
		last_updated: { dataType: 'string', locked: true },
	},
	reports: {
		uuid: { dataType: 'string', locked: true },
		topic: { dataType: 'string', locked: true },
		desc_value: { dataType: 'string', maxSize: 512, locked: false },
		author: { dataType: 'string', locked: true },
		target_item: { dataType: 'string', locked: true },
		report_status: { dataType: 'string', maxSize: 16, locked: false },
		date_created: { dataType: 'string', locked: true },
	},
};

const ElementEditor = ({ defaultValue, clearDefault }) => {
	const [inputTopOffset, setInputTopOffset] = useState(50);
	const [inputValue, setInputValue] = useState('');

	const [isLoading, setIsLoading] = useState(false);
	const [isErrored, setIsErrored] = useState(false);

	const [matchedElement, setMatchedElement] = useState('');
	const [elementType, setElementType] = useState(null);
	const [elementName, setElementName] = useState('');

	const [hideLockedColumns, setHideLockedColumns] = useState(true);

	const [userUUID, setUserUUID] = useState(null);
	const [userName, setUserName] = useState('');
	const [userPermLvl, setUserPermLvl] = useState(3);
	const [userImageID, setUserImageID] = useState(null);

	const inputRef = useRef(null);
	const { user, loading } = useAuth();

	useEffect(() => {
		const verifyToken = async () => {
			if (user && !loading) {
				setUserUUID(user.uuid);
				setUserName(user.username);
				setUserPermLvl(user.permission_level);
				setUserImageID(user.image_id);
			}
		};

		verifyToken();
	}, [user, loading]);

	function sanitiseUrlParam(input) {
		return input
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-_]/g, '')
			.replace(/[\s_]+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	const reset = async (keepInput) => {
		setIsErrored(false);
		setIsLoading(false);

		if (keepInput) {
			await handleInputChange(inputValue);
			return;
		}

		setInputTopOffset(50);
		setInputValue('');
	};

	const handleInputChange = async (newValue) => {
		setIsErrored(false);
		setInputValue(newValue);
		setIsLoading(true);
		if (newValue.trim() !== '') {
			await getElementData(newValue);
		} else {
			setIsErrored(false);
			setInputTopOffset(50);
		}
		setIsLoading(false);
	};

	const updateElementData = async () => {
		let elementData;

		elementData = Object.fromEntries(
			Object.entries(matchedElement).filter(([key, value]) => {
				const columnDef = itemColumnMap[elementType][key];
				return columnDef && columnDef.locked === false;
			})
		);

		await post(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-element/${matchedElement.uuid}`, {
			elementData,
			elementType,
		});
	};

	const getElementData = async (value) => {
		try {
			const sanitisedValue = sanitiseUrlParam(value);
			const res = await get(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-element/${sanitisedValue}`);

			setMatchedElement(res.data.elementData);
			setElementType(res.data.elementType);

			const itemTypeMap = ['blueprint', 'preset', 'theme', 'asset Pack', 'cat Image'];

			if (res.data.elementType === 'item') {
				setElementName(itemTypeMap[res.data.elementData.type]);
			} else {
				setElementName(res.data.elementType);
			}

			setInputTopOffset(0);
		} catch (error) {
			setIsErrored(true);
			setInputTopOffset(50);
		}
	};

	const handleElementValueChange = async (newValue, cellConfig, columnKey) => {
		let sanitisedValue = newValue?.trim() ?? '';

		const skipValues = ['', '-'];

		if (skipValues.includes(sanitisedValue)) {
			setMatchedElement((prev) => ({ ...prev, [columnKey]: sanitisedValue }));
			return;
		}

		if (cellConfig.dataType === 'integer') {
			const isStrictInteger = /^-?\d+$/.test(sanitisedValue);

			if (!isStrictInteger) {
				return;
			}

			let parsedValue = parseInt(sanitisedValue, 10);

			if (typeof cellConfig.maxSize === 'number') {
				parsedValue = Math.min(parsedValue, cellConfig.maxSize);
			}

			if (columnKey === 'permission_level') {
				parsedValue = Math.max(userPermLvl + 1, parsedValue);
			}

			sanitisedValue = parsedValue;
		}

		if (cellConfig.dataType === 'string') {
			if (typeof cellConfig.maxSize === 'number') {
				if (sanitisedValue.length > cellConfig.maxSize) {
					sanitisedValue = sanitisedValue.slice(0, cellConfig.maxSize);
				}
			}
		}

		setMatchedElement((prev) => ({ ...prev, [columnKey]: sanitisedValue }));
	};

	useEffect(() => {
		if (defaultValue) {
			handleInputChange(defaultValue);
			clearDefault();
		}
	}, [defaultValue]);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	return (
		<Fragment>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
				}}
			>
				<Box
					sx={{
						alignItems: 'center',
						display: 'flex',
						flexDirection: 'column',
						gap: 1,
						pt: inputTopOffset,
						transition: 'padding-top 0.5s ease-out',
					}}
				>
					<Typography level="h3">Element Editor</Typography>
					<Input
						sx={{ width: 400 }}
						color={isErrored ? 'danger' : 'neutral'}
						placeholder="Enter a UUID..."
						value={inputValue}
						onChange={(event) => handleInputChange(event.target.value)}
						slotProps={{
							input: {
								ref: inputRef,
							},
						}}
						endDecorator={
							isLoading ? (
								<CircularProgress size="sm" />
							) : (
								inputTopOffset === 0 && (
									<IconButton onClick={() => reset()}>
										<CloseIcon />
									</IconButton>
								)
							)
						}
					/>
				</Box>
				<Box
					sx={{
						display: 'flex',
						width: '100%',
						height: 'auto',
						gap: 3,
						flexDirection: 'column',
						opacity: 100 - inputTopOffset * 2,
						transition: 'opacity 1s ease-out',
					}}
				>
					<Divider />
					<Typography level="h3">{elementName.charAt(0).toUpperCase() + elementName.slice(1)}</Typography>
					<Card sx={{ width: '100%', height: 'auto', gap: 2 }} variant="soft">
						<Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
							<Button onClick={updateElementData}>Save Changes</Button>
							<Button
								variant="plain"
								onClick={() => {
									reset({ keepInput: true });
								}}
							>
								Reset
							</Button>
							<Checkbox
								label="Hide locked values"
								checked={hideLockedColumns}
								onChange={(event) => setHideLockedColumns(event.target.checked)}
							/>
						</Box>
						<Box
							sx={{
								width: '100%',
								display: 'grid',
								gridTemplateColumns: 'repeat(3, 1fr)',
								gap: 2,
							}}
						>
							{Object.entries(matchedElement).map(([key, value]) => {
								const config = itemColumnMap[elementType][key];
								if (config.locked && hideLockedColumns) return;

								let newValue = JSON.stringify(value);
								let placeholder;

								if (config.dataType === 'string') {
									newValue = newValue.replace(/^(['"])(.*)\1$/, '$2');
								} else {
									newValue = value;
								}

								if (matchedElement.username === matchedElement.uuid && key === 'username') {
									newValue = '';
									placeholder = '[UNSET]';
								}

								if (value === null) {
									newValue = '';
									placeholder = '[NULL]';
								}

								return (
									<FormControl disabled={config.locked} key={key}>
										<FormLabel>
											{key}
											{config.locked && ' (locked)'}
										</FormLabel>
										<Input
											value={newValue}
											onChange={(event) => {
												handleElementValueChange(event.target.value, config, key);
											}}
											placeholder={placeholder}
											disabled={config.locked}
										/>
									</FormControl>
								);
							})}
						</Box>
					</Card>
				</Box>
			</Box>
		</Fragment>
	);
};

export default ElementEditor;
