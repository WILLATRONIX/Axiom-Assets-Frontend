import { Fragment, useState, useEffect, useRef } from 'react';

import Cropper from 'react-easy-crop';

import { useNotification } from 'lib/NotificationContext';

import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Autocomplete from '@mui/joy/Autocomplete';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import AspectRatio from '@mui/joy/AspectRatio';

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

const UploadDetails = ({ uploadType, onConfirm, singleItem, hasBlueprint, defaultValue }) => {
	const [thumbnails, setThumbnails] = useState([null, null, null, null, null]);
	const [thumbnailAR, setThumbnailAR] = useState(1);
	const [aspectStr, setAspectStr] = useState(null);
	const [selectedThumbnailPosition, setSelectedThumbnailPosition] = useState(null);

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [tags, setTags] = useState([]);

	const thumbImgInputRef = useRef(null);
	const { notify } = useNotification();
	const megabyte = 1000000;

	const resetValues = () => {
		if (defaultValue && !aspectStr) {
			setTitle(defaultValue.header);
			setDescription(defaultValue.description);
			setTags(defaultValue.tags);
			setThumbnails(defaultValue.thumbnails);
			setAspectStr(defaultValue.aspectRatio);
			setSelectedThumbnailPosition(0);

			return;
		}

		if (uploadType === 0) {
			setThumbnails((prev) => {
				const updated = [...prev];
				updated[0] = {
					buffer: singleItem.thumbnail.buffer,
					adjustments: { zoom: 1, crop: { x: 0, y: 0 } },
				};
				return updated;
			});

			setTitle(singleItem.header);
			setTags(singleItem?.tags);
			setSelectedThumbnailPosition(0);
		} else {
			setThumbnails([null, null, null, null, null]);
			setTitle('');
			setTags([]);
			setSelectedThumbnailPosition(null);
		}

		setDescription('');
		setThumbnailAR(1);
		setAspectStr('1:1');
	};

	useEffect(() => {
		resetValues();
	}, [singleItem]);

	const handleSelectAR = (event, newValue) => {
		setAspectStr(newValue);
		const ratioArray = newValue.split(':');
		const ratio = ratioArray[0] / [ratioArray[1]];
		setThumbnailAR(ratio);
	};

	const handleThumbChange = (e) => {
		const selectedThumb = e.target.files[0];

		if (selectedThumb.size >= 5 * megabyte) {
			notify('The image cannot be larger than 5 megabytes.', 'danger');
			return;
		}

		if (selectedThumb) {
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.onload = () => {
					setThumbnails((prev) => {
						const updated = [...prev];
						updated[selectedThumbnailPosition] = {
							buffer: reader.result,
							adjustments: { zoom: 1, crop: { x: 0, y: 0 } },
						};
						return updated;
					});
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(selectedThumb);
		}
	};

	const handleThumbnailSelect = (index) => {
		if (selectedThumbnailPosition === index || thumbnails[index] === null) {
			thumbImgInputRef.current.click();
		}

		setSelectedThumbnailPosition(index);
	};

	const confirmValues = () => {
		let hasThumbnail;

		for (const t of thumbnails) {
			if (t !== null) {
				hasThumbnail = true;
			}
		}

		if (!hasThumbnail) {
			notify('A thumbnail is required.', 'danger');
			return;
		}

		if (!title) {
			notify('A title is required.', 'danger');
			return;
		}

		const assetDetails = {
			header: title,
			description: description,
			tags: tags,
			thumbnails: thumbnails,
			aspectRatio: aspectStr,
		};

		onConfirm(assetDetails);
	};

	const onCropComplete = (newValue) => {
		setThumbnails((prev) => {
			const updated = [...prev];
			const current = prev[selectedThumbnailPosition] || {};
			const adjustments = current.adjustments || {};

			updated[selectedThumbnailPosition] = {
				...current,
				adjustments: {
					...adjustments,
					cropRegion: newValue,
				},
			};
			return updated;
		});
	};

	const setThumbnailCrop = (newValue) => {
		setThumbnails((prev) => {
			const updated = [...prev];
			const current = prev[selectedThumbnailPosition] || {};
			const adjustments = current.adjustments || {};

			updated[selectedThumbnailPosition] = {
				...current,
				adjustments: {
					...adjustments,
					crop: newValue,
				},
			};
			return updated;
		});
	};

	const setThumbnailZoom = (newValue) => {
		setThumbnails((prev) => {
			const updated = [...prev];
			const current = prev[selectedThumbnailPosition] || {};
			const adjustments = current.adjustments || {};

			updated[selectedThumbnailPosition] = {
				...current,
				adjustments: {
					...adjustments,
					zoom: newValue,
				},
			};
			return updated;
		});
	};

	return (
		<Fragment>
			<Box
				sx={{
					display: 'flex',
					width: '100%',
					height: '100%',
					gap: 6,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, height: 390 }}>
					<FormControl>
						<FormLabel>Thumbnail</FormLabel>
						<AspectRatio
							ratio={thumbnailAR}
							sx={{
								position: 'relative',
								width: 320,
								my: 'auto',
								flexShrink: 0,
							}}
						>
							{!thumbnails[selectedThumbnailPosition] ? (
								<Box>
									<Typography sx={{ maxWidth: 140, textAlign: 'center' }}>
										Add a thumbnail using the buttons below
									</Typography>
								</Box>
							) : (
								<Box>
									<Cropper
										image={thumbnails[selectedThumbnailPosition]?.buffer}
										crop={thumbnails[selectedThumbnailPosition]?.adjustments?.crop}
										zoom={thumbnails[selectedThumbnailPosition]?.adjustments?.zoom}
										aspect={thumbnailAR}
										maxZoom={5}
										zoomSpeed={0.5}
										onCropChange={setThumbnailCrop}
										onCropComplete={onCropComplete}
										onZoomChange={setThumbnailZoom}
										objectFit="cover"
										style={{
											mediaStyle: {
												backgroundColor: 'var(--joy-palette-background-surface)',
											},
											cropAreaStyle: {
												border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
												boxShadow: 'none',
											},
										}}
									/>

									<Box
										sx={{
											position: 'absolute',
											top: 1,
											right: 1,
											zIndex: 1500,
											pointerEvents: 'auto',
										}}
									>
										<IconButton
											variant="plain"
											color="danger"
											onClick={() =>
												setThumbnails((prev) => {
													const updated = [...prev];
													updated[selectedThumbnailPosition] = null;
													return updated;
												})
											}
										>
											<DeleteIcon />
										</IconButton>
									</Box>
								</Box>
							)}
						</AspectRatio>
						<Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
							{thumbnails.map((thumb, i) => (
								<IconButton
									key={i}
									onClick={() => handleThumbnailSelect(i)}
									variant={selectedThumbnailPosition === i && 'soft'}
									color={selectedThumbnailPosition === i ? 'primary' : 'neutral'}
								>
									{!thumb?.buffer ? <AddIcon /> : <img src={thumb.buffer} width={24}></img>}
								</IconButton>
							))}
							<Select value={aspectStr} sx={{ ml: 'auto' }} onChange={handleSelectAR}>
								<Option value="1:1">1:1</Option>
								<Option value="4:3">4:3</Option>
								<Option value="16:9">16:9</Option>
								<Option value="2:1">2:1</Option>
							</Select>
						</Box>
					</FormControl>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<FormControl>
							<FormLabel>Title</FormLabel>
							<Input
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								color={!title ? 'danger' : 'neutral'}
							/>
						</FormControl>
						<FormControl sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 236 }}>
							<FormLabel>Description</FormLabel>
							<Textarea
								sx={{ flex: 1 }}
								maxRows={6}
								value={description}
								onChange={(event) => setDescription(event.target.value)}
							/>
						</FormControl>
						<Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
							<Button variant="plain" sx={{ width: '100%' }} onClick={resetValues}>
								Reset
							</Button>
							{uploadType !== 0 && (
								<Button sx={{ width: '100%' }} onClick={confirmValues}>
									Next
								</Button>
							)}
						</Box>
					</Box>
					{hasBlueprint && uploadType === 0 && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
							<FormControl sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 236 }}>
								<FormLabel>Tags</FormLabel>
								<Autocomplete
									sx={{
										flex: 1,
										maxWidth: 280,
										// maxHeight: 320,
										minHeight: 320,
										// overflowY: 'hidden',
										overflowX: 'hidden',
										alignItems: 'start',
									}}
									freeSolo
									multiple
									filterSelectedOptions
									clearOnBlur
									handleHomeEndKeys
									options={tags}
									getOptionLabel={(option) => option}
									onChange={(e, newValue) => {
										setTags(newValue.map((value) => value.toLowerCase()));
									}}
									value={tags}
									renderTags={(tags, getTagProps) =>
										tags.map((item, index) => {
											const tagProps = getTagProps({
												index,
											});
											const { key, ...restProps } = tagProps;
											return (
												<Chip
													key={key}
													variant="solid"
													color="primary"
													endDecorator={<CloseIcon fontSize="sm" />}
													sx={{
														minWidth: 0,
														alignSelf: 'start',
														userSelect: 'none',
													}}
													{...restProps}
												>
													{item}
												</Chip>
											);
										})
									}
								/>
							</FormControl>
							<Button onClick={confirmValues}>Next</Button>
						</Box>
					)}
				</Box>
			</Box>
			<input
				ref={thumbImgInputRef}
				type="file"
				accept=".png, .jpg, .webp, .jpeg"
				style={{ display: 'none' }}
				onChange={handleThumbChange}
			/>
		</Fragment>
	);
};

export default UploadDetails;
