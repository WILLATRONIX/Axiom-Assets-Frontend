import { Fragment, useState, useMemo, useEffect, useRef } from 'react';

import { post } from 'lib/network';
import { useRouter } from 'next/navigation';
import { useAuth } from 'lib/auth/authContext';

import LoginModal from 'components/Modal/Login';

import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

const UploadComplete = ({ onUploadAgain, onStartUpload, uploadType, uploadItems, uploadSettings, uploadDetails }) => {
	const [mainContainerWidth, setMainContainerWidth] = useState(180);
	const [mainContainerHeight, setMainContainerHeight] = useState(60);

	const [uploading, setUploading] = useState(false);
	const [status, setStatus] = useState('pending');
	const [statusMessage, setStatusMessage] = useState('');
	const [activeUpload, setActiveUpload] = useState([]);
	const [isAuthorised, setIsAuthorised] = useState(0);

	const [uploadedItemUUID, setUploadedItemUUID] = useState(null);

	const [loginModalOpen, setLoginModalOpen] = useState(false);

	const router = useRouter();
	const { user, loading } = useAuth();

	const verifyToken = async () => {
		if (user && !loading) {
			if (user.permission_level && user.permission_level > 3) {
				setIsAuthorised(false);
				return;
			}

			setIsAuthorised(true);
		} else if (!user && !loading) {
			setIsAuthorised(false);
		}
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	const handleUploadClick = async () => {
		if (isAuthorised) {
			setMainContainerWidth(400);
			setMainContainerHeight(360);
			setUploading(true);
			onStartUpload();
			switch (uploadType) {
				case 0:
					if (uploadItems[0].type === 1) {
						const success = await uploadWithoutDetails(uploadItems[0]);
						if (!success) break;
					} else {
						const success = await uploadWithDetails(uploadItems[0]);
						if (!success) break;
					}
					break;
				case 1:
					await mainUploadLoop();
					break;
				case 2:
					await uploadAll();
					break;

				default:
					break;
			}
			if (status === 'pending') setStatus('complete');
		} else {
			setLoginModalOpen(true);
		}
	};

	const mainUploadLoop = async () => {
		let remaining = [...uploadItems];
		let activeUploads = new Array(10).fill(null);

		const findFreeSlot = () => activeUploads.findIndex((slot) => slot === null);

		const startUploadAtSlot = (slotIndex) => {
			if (remaining.length === 0) return;

			const nextItem = remaining.shift();

			const promise = uploadWithoutDetails(nextItem, remaining.length === 1).then(() => {
				activeUploads[slotIndex] = null;
				setActiveUpload(activeUploads.map((item) => (item ? item.fileName : null)).filter(Boolean));
			});

			activeUploads[slotIndex] = { fileName: nextItem.fileName, promise };
			setActiveUpload(activeUploads.map((item) => (item ? item.fileName : null)).filter(Boolean));
		};

		while (remaining.length > 0 || activeUploads.some((slot) => slot !== null)) {
			let slot;
			while ((slot = findFreeSlot()) !== -1 && remaining.length > 0) {
				startUploadAtSlot(slot);
			}

			if (activeUploads.some((slot) => slot !== null)) {
				await Promise.race(activeUploads.filter((slot) => slot !== null).map((slot) => slot.promise));
			}
		}
	};

	const getThumbnailData = (thumbnails) => {
		if (!thumbnails) return { type: null, value: null };

		const thumbCount = thumbnails.filter((t) => t !== null);

		if (thumbCount.length === 0) {
			return { type: null, value: null };
		}

		if (thumbCount.length === 1) {
			return { type: 'thumbnail', value: thumbCount[0] };
		}

		return { type: 'thumbnailCarousel', value: thumbCount };
	};

	const uploadWithDetails = async (item) => {
		const { thumbnails, ...strippedDetails } = uploadDetails;
		const header = {
			type: uploadType,
			settings: uploadSettings,
			details: { ...strippedDetails },
		};

		const { thumbnail, ...strippedItem } = item;
		const body = strippedItem;

		const assetForm = new FormData();
		assetForm.append('header', JSON.stringify(header));
		assetForm.append('body', JSON.stringify(body));
		assetForm.append('files', item.buffer);

		const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/upload/asset`, assetForm);

		if (!response.ok) {
			setStatusMessage(response.data.error);
			setStatus('failed');
			return;
		}

		const { type: thumbType, value: thumbValue } = getThumbnailData(thumbnails);

		if (response.ok && thumbType) {
			const edits = [thumbType];

			const thumbForm = new FormData();
			thumbForm.append('editValues', JSON.stringify(edits));
			thumbForm.append('editData', JSON.stringify({ thumbnail: thumbValue, ...uploadDetails }));

			await post(`${process.env.NEXT_PUBLIC_API_URL}/asset/edit/${response.data.uuid}`, thumbForm);
		}

		setUploadedItemUUID(response.data.uuid);
		return false;
	};

	const uploadWithoutDetails = async (item, isLastInQueue = false) => {
		const { thumbnail, ...strippedItem } = item;
		const body = strippedItem;

		const header = {
			type: uploadType,
			settings: uploadSettings,
			totalAssets: uploadItems.length,
			isLastItem: isLastInQueue,
			details: { ...strippedItem },
		};

		const assetForm = new FormData();
		assetForm.append('header', JSON.stringify(header));
		assetForm.append('body', JSON.stringify(body));
		assetForm.append('files', item.buffer);

		const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/upload/asset`, assetForm);

		if (item.type === 0 && thumbnail.isCustom) {
			const edits = ['thumbnail'];

			const thumbForm = new FormData();
			thumbForm.append('editValues', JSON.stringify(edits));
			thumbForm.append('editData', JSON.stringify(item));

			await post(`${process.env.NEXT_PUBLIC_API_URL}/asset/edit/${response.data.uuid}`, thumbForm);
		}

		return true;
	};

	const uploadAll = async () => {
		const { thumbnails, ...strippedDetails } = uploadDetails;
		const header = {
			type: uploadType,
			settings: uploadSettings,
			details: { ...strippedDetails, metric: uploadItems.length },
		};

		const body = uploadItems.map(({ thumbnail, ...uploadData }) => uploadData);

		const formData = new FormData();
		formData.append('header', JSON.stringify(header));
		formData.append('body', JSON.stringify(body));

		for (let i = 0; i < uploadItems.length; i++) {
			formData.append('files', uploadItems[i].buffer);
		}

		const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/upload/asset`, formData);

		if (uploadDetails?.thumbnails) {
			const renamedUploadDetails = { ...uploadDetails, thumbnail: uploadDetails.thumbnails[0], thumbnails: [] };
			const edits = ['thumbnail'];

			const thumbForm = new FormData();
			thumbForm.append('editValues', JSON.stringify(edits));
			thumbForm.append('editData', JSON.stringify(renamedUploadDetails));

			await post(`${process.env.NEXT_PUBLIC_API_URL}/asset/edit/${response.data.uuid}`, thumbForm);
		}
		setUploadedItemUUID(response.data.uuid);
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
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Card
						variant="soft"
						sx={{
							width: mainContainerWidth,
							height: mainContainerHeight,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							position: 'relative',
						}}
					>
						<Typography
							sx={{
								position: 'absolute',
								opacity: uploading ? 0 : 1,
								pointerEvents: uploading ? 'none' : 'auto',
							}}
						>
							Upload {uploadDetails?.header || `${uploadItems.length} Assets`}
						</Typography>

						<CardContent
							orientation="vertical"
							sx={{
								justifyContent: 'center',
								alignItems: 'center',
								gap: 1,
								width: mainContainerWidth - 32,
								position: 'absolute',
								opacity: uploading ? 1 : 0,
								pointerEvents: uploading ? 'auto' : 'none',
							}}
						>
							{Array.isArray(activeUpload) && activeUpload.length > 0 ? (
								activeUpload.map((name, i) => (
									<Box
										key={i}
										sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
									>
										<Typography level="body-sm">{`Uploading: ${name}`}</Typography>
										<CircularProgress size="sm" />
									</Box>
								))
							) : (
								<Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'center' }}>
									<Typography level="title-md">{`Upload ${status}.`}</Typography>
									<Button onClick={() => router.push('/browse')}>Return to Browse</Button>
									{uploadType !== 1 && status === 'complete' && (
										<Button
											variant="plain"
											onClick={() => {
												router.push(`/u/${user.username}/${uploadedItemUUID}`);
											}}
										>
											View Asset
										</Button>
									)}
									{status === 'failed' && (
										<Typography level="body-sm">Reason: {statusMessage}</Typography>
									)}
								</Box>
							)}
						</CardContent>
					</Card>
					<Box sx={{ display: 'flex', justifyContent: 'center', opacity: uploading ? 0 : 1 }}>
						<Button onClick={handleUploadClick}>Upload</Button>
					</Box>
				</Box>
			</Box>
			<LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
		</Fragment>
	);
};

export default UploadComplete;
