import { useRef, useState, Fragment } from 'react';

import Cropper from 'react-easy-crop';

import { useNotification } from 'lib/NotificationContext';
import { post } from 'lib/network';

import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Box from '@mui/joy/Box';
import ModalClose from '@mui/joy/ModalClose';
import AspectRatio from '@mui/joy/AspectRatio';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';

import PublishIcon from '@mui/icons-material/Publish';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

const CatImageUpload = ({ open, setOpen }) => {
	const [catImage, setCatImage] = useState(null);
	const [catName, setCatName] = useState('');

	const [customThumbZoom, setCustomThumbZoom] = useState(1);
	const [customThumbCrop, setCustomThumbCrop] = useState({ x: 0, y: 0 });
	const [customThumbRegion, setCustomThumbRegion] = useState(null);

	const catImgInputRef = useRef(null);
	const { notify } = useNotification();
	const megabyte = 1000000;

	const onCropComplete = (croppedArea) => {
		setCustomThumbRegion(croppedArea);
	};

	const resetAdjustments = () => {
		setCustomThumbZoom(1);
		setCustomThumbCrop({ x: 0, y: 0 });
	};

	const handleImageSelect = () => {
		catImgInputRef.current.click();
	};

	const handleImageChange = (e) => {
		const selectedThumb = e.target.files[0];

		if (selectedThumb.size >= 5 * megabyte) {
			notify('The image must be less than .', 'danger');
			return;
		}

		if (selectedThumb) {
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.onload = () => {
					setCatImage(reader.result);
					setCustomThumbZoom(1);
					setCustomThumbCrop({ x: 0, y: 0 });
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(selectedThumb);
		}
	};

	const handleClose = () => {
		setOpen(false);
		resetAdjustments();
		setCatImage(null);
	};

	const uploadCat = async () => {
		const imageData = { buffer: catImage, cropRegion: customThumbRegion };

		const formData = new FormData();
		formData.append('header', JSON.stringify(catName));
		formData.append('thumbnail', JSON.stringify(imageData));

		const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/upload/cat`, formData);

		if (response.ok) {
			notify('Your cat has been uploaded');
			setOpen(false);
		} else {
			notify(response.error, 'danger');
		}
	};

	return (
		<Fragment>
			<Modal hideBackdrop open={open} onClose={handleClose}>
				<ModalDialog
					variant="plain"
					sx={{
						maxWidth: '640px',
						boxShadow: 'none',
					}}
				>
					<ModalClose />
					<DialogTitle sx={{ paddingBottom: 1.5 }}>Upload Cat Image</DialogTitle>
					<DialogContent>
						<Box
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: '1rem',
								overflow: 'hidden',
							}}
						>
							<AspectRatio
								ratio="1"
								sx={{
									position: 'relative',
									width: 280,
									flexShrink: 0,
								}}
							>
								{!catImage ? (
									<Box sx={{ position: 'absolute' }}>
										<Button
											startDecorator={<AddIcon />}
											variant="plain"
											onClick={handleImageSelect}
										>
											Add Image
										</Button>
									</Box>
								) : (
									<Box sx={{ position: 'relative' }}>
										<Cropper
											image={catImage}
											crop={customThumbCrop}
											zoom={customThumbZoom}
											aspect={1}
											maxZoom={5}
											zoomSpeed={0.5}
											onCropChange={setCustomThumbCrop}
											onCropComplete={onCropComplete}
											onZoomChange={setCustomThumbZoom}
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
										<IconButton
											sx={{ position: 'absolute', top: 2, right: 2 }}
											variant="plain"
											color="danger"
											onClick={() => setCatImage(null)}
										>
											<DeleteOutlinedIcon />
										</IconButton>
									</Box>
								)}
							</AspectRatio>
							<Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
								<FormControl>
									<FormLabel>Your Cat's Name</FormLabel>
									<Input
										placeholder="e.g. Larry"
										value={catName}
										onChange={(event) => setCatName(event.target.value)}
									/>
								</FormControl>
								<Typography level="body-sm">
									This information is used to provide new users with random profile images. If you
									want to keep your cat's name private, you can make one up.
								</Typography>
								<Typography level="body-sm" sx={{ mt: 'auto' }}>
									Must be an unedited image of your own cat. Your cat's face must be centered and
									visible.
								</Typography>
								<Button
									startDecorator={<PublishIcon />}
									onClick={uploadCat}
									disabled={!catImage || !catName}
								>
									Upload
								</Button>
							</Box>
						</Box>
					</DialogContent>
				</ModalDialog>
			</Modal>
			<input
				ref={catImgInputRef}
				type="file"
				accept=".png, .jpg, .webp, .jpeg"
				style={{ display: 'none' }}
				onChange={handleImageChange}
			/>
		</Fragment>
	);
};

export default CatImageUpload;
