'use client';

import { useState, useEffect, Fragment, useRef } from 'react';

import { useNotification } from 'lib/NotificationContext';

import Cropper from 'react-easy-crop';

import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import AspectRatio from '@mui/joy/AspectRatio';
import Textarea from '@mui/joy/Textarea';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Autocomplete from '@mui/joy/Autocomplete';
import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Chip from '@mui/joy/Chip';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Close from '@mui/icons-material/Close';

export default function UploadEditItem({ open, setOpen, item, onConfirm }) {
	if (!open) return;

	const [isBuffer, setIsBuffer] = useState(item.thumbnail?.defaultBuffer !== undefined);
	const defaultThumbnail = item.thumbnail?.defaultBuffer ?? item.thumbnail?.defaultUrl ?? null;

	const [customThumb, setCustomThumb] = useState(item.thumbnail?.buffer ?? item.thumbnail?.url ?? null);
	const [customThumbBytes, setCustomThumbBytes] = useState(0);

	const [customThumbCrop, setCustomThumbCrop] = useState(item.thumbnail?.crop ?? { x: 0, y: 0 });
	const [customThumbZoom, setCustomThumbZoom] = useState(item.thumbnail?.zoom ?? 1);
	const [customThumbRegion, setCustomThumbRegion] = useState(item.thumbnail?.cropRegion ?? null);

	const [selectedTags, setSelectedTags] = useState(item?.tags ?? []);
	const [header, setHeader] = useState(item.header ?? '');
	const [description, setDescription] = useState(item?.description ?? '');

	const thumbImgInputRef = useRef(null);
	const { notify } = useNotification();
	const megabyte = 1000000;

	const itemRequiresThumbnail = item.type === 0 || item.type === 3

	const onCropComplete = (croppedArea) => {
		setCustomThumbRegion(croppedArea);
	};

	const resetAdjustments = () => {
		setCustomThumbZoom(1);
		setCustomThumbCrop({ x: 0, y: 0 });
	};

	const resetThumbnail = () => {
		resetAdjustments();
		setCustomThumb(defaultThumbnail);
		setCustomThumbBytes(0);
	};

	const handleClose = () => {
		setOpen(false);
		resetAdjustments();
	};

	const handleThumbnailSelect = () => {
		thumbImgInputRef.current.click();
	};

	const handleThumbChange = (e) => {
		const selectedThumb = e.target.files[0];

		if (selectedThumb.size >= 5 * megabyte) {
			notify('The image cannot be larger than 5 megabytes.', 'danger');
			return;
		}

		setCustomThumbBytes(selectedThumb.size);
		setIsBuffer(true);

		if (selectedThumb) {
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.onload = () => {
					setCustomThumb(reader.result);
					setCustomThumbZoom(1);
					setCustomThumbCrop({ x: 0, y: 0 });
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(selectedThumb);
		}
	};

	const handleConfirm = () => {
		if (!header) {
			notify('A title is required.', 'danger');
			return;
		}

		if (!customThumb && itemRequiresThumbnail) {
			notify('The thumbnail is missing.', 'danger');
			return;
		}

		let thumbnailData;

		if (itemRequiresThumbnail && isBuffer) {
			thumbnailData = {
				...item.thumbnail,
				fileSize: customThumbBytes,
				buffer: customThumb,
				isCustom: customThumb !== item.thumbnail.defaultBuffer,
				adjustments: {
					cropRegion: customThumbRegion,
					crop: customThumbCrop,
					zoom: customThumbZoom,
				},
			};
		} else {
			thumbnailData = item.thumbnail;
		}

		const newItemData = {
			...item,
			header: header,
			description: description,
			tags: selectedTags,
			thumbnail: thumbnailData,
		};

		onConfirm(newItemData, item.uuid);
		handleClose();
	};

	return (
		<Fragment>
			<Modal open={open} onClose={() => handleClose()}>
				<ModalDialog
					sx={{
						width: 'auto',
						minWidth: 500,
						height: 'auto',
						minHeight: 340,
					}}
				>
					<ModalClose />
					<DialogTitle>Edit Asset</DialogTitle>
					<DialogContent sx={{ gap: 2 }}>
						<Divider />
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								gap: 2,
							}}
						>
							{itemRequiresThumbnail && (
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										gap: 2,
									}}
								>
									<FormControl>
										<FormLabel>Thumbnail</FormLabel>
										<AspectRatio
											ratio="1"
											sx={{
												minWidth: 240,
												position: 'relative',
											}}
										>
											<Cropper
												image={customThumb}
												crop={customThumbCrop}
												zoom={customThumbZoom}
												aspect={1}
												maxZoom={5}
												zoomSpeed={0.5}
												onCropChange={setCustomThumbCrop}
												onCropComplete={onCropComplete}
												onZoomChange={setCustomThumbZoom}
												objectFit="cover"
												showGrid={false}
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
													top: 0,
													right: 0,
													zIndex: 1500,
													pointerEvents: 'auto',
												}}
											>
												<Dropdown>
													<MenuButton
														variant="soft"
														color="plain"
														size="lg"
														sx={{
															display: 'flex',
															justifyContent: 'center',
															px: 1,
														}}
													>
														<MoreVertIcon />
													</MenuButton>
													<Menu placement="bottom-end" variant="plain" sx={{ zIndex: 1400 }}>
														<MenuItem onClick={handleThumbnailSelect}>Change</MenuItem>
														<MenuItem onClick={resetAdjustments}>
															Reset adjustments
														</MenuItem>
														<MenuItem
															color="danger"
															disabled={customThumb === defaultThumbnail}
															onClick={resetThumbnail}
														>
															Reset Thumbnail
														</MenuItem>
													</Menu>
												</Dropdown>
											</Box>
										</AspectRatio>
									</FormControl>
								</Box>
							)}
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									flexGrow: 1,
									gap: '1rem',
									height: 'auto',
								}}
							>
								<FormControl>
									<FormLabel>Title</FormLabel>
									<Input
										placeholder="Add a title..."
										value={header}
										color={header ? 'neutral' : 'danger'}
										onChange={(event) => setHeader(event.target.value)}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Description</FormLabel>
									<Textarea
										maxRows={3}
										sx={{ minHeight: '162px' }}
										placeholder="Add a description..."
										value={description}
										onChange={(event) => setDescription(event.target.value)}
									/>
								</FormControl>
							</Box>
							{item.type === 0 && (
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'column',
										flexGrow: 1,
										height: 'auto',
									}}
								>
									<FormControl>
										<FormLabel>Tags</FormLabel>
										<Autocomplete
											sx={{
												height: '240px',
												width: '280px',
												overflowY: 'auto',
												overflowX: 'hidden',
												alignItems: 'start',
											}}
											freeSolo
											multiple
											filterSelectedOptions
											clearOnBlur
											handleHomeEndKeys
											options={selectedTags}
											getOptionLabel={(option) => option}
											onChange={(e, newValue) => {
												setSelectedTags(newValue.map((value) => value.toLowerCase()));
											}}
											value={selectedTags}
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
															endDecorator={<Close fontSize="sm" />}
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
								</Box>
							)}
						</Box>
						<Box sx={{ gap: 1, display: 'flex', ml: 'auto' }}>
							<Button variant="plain" onClick={() => handleClose()}>
								cancel
							</Button>
							<Button onClick={() => handleConfirm()}>confirm</Button>
						</Box>
					</DialogContent>
				</ModalDialog>
			</Modal>
			<input
				ref={thumbImgInputRef}
				type="file"
				accept=".png, .jpg, .webp, .jpeg"
				style={{ display: 'none' }}
				onChange={handleThumbChange}
			/>
		</Fragment>
	);
}
