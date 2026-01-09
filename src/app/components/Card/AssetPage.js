'use client';

import { useState, useEffect, Fragment } from 'react';
import { formatDistanceToNow } from 'date-fns';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';

import { get } from 'lib/network';
import { useAuth } from 'lib/auth/authContext.js';

import AssetGrid from 'components/Grid/AssetGrid';
import { useNotification } from 'lib/NotificationContext';

import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import CircularProgress from '@mui/joy/CircularProgress';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

const linkStyle = {
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	flexGrow: 1,
	minWidth: 0,
	fontSize: 'var(--joy-fontSize-md)',
	color: 'var(--joy-palette-text-secondary)',
};

function App({ item }) {
	const [validAsset, setValidAsset] = useState(true);

	const [viewerUUID, setViewerUUID] = useState(null);

	const [assetData, setAssetData] = useState(null);
	const [assetAspectRatio, setAssetAspectRatio] = useState(1);
	const [isCarousel, setIsCarousel] = useState(false);
	const [imageSource, setImageSource] = useState(null);

	const [isSaved, setIsSaved] = useState(false);
	const [assetDownloadCount, setAssetDownloadCount] = useState(0);
	const [assetSaveCount, setAssetSaveCount] = useState(0);

	const { user, loadingUser } = useAuth();

	const metricMap = ['Blocks', 'Settings Changed', 'Colours Changed', 'Assets'];

	const { notify } = useNotification();

	const getRelativeTime = (date) => {
		const parsedDate = new Date(date);
		return formatDistanceToNow(parsedDate, { addSuffix: true }).replace(/^about\s/, '');
	};

	const RelativeTime = ({ date }) => {
		const [relativeTime, setRelativeTime] = useState(getRelativeTime(date));

		useEffect(() => {
			const interval = setInterval(() => {
				setRelativeTime(getRelativeTime(date));
			}, 60000);

			return () => clearInterval(interval);
		}, [date]);

		return <span>{relativeTime}</span>;
	};

	useEffect(() => {
		if (user && !loadingUser) {
			setViewerUUID(user.uuid);
		}
	}, [user, loadingUser]);

	useEffect(() => {
		if (item) {
			setAssetData(item);
			switch (item.type) {
				case 0:
					setImageSource(`https://cdn.axiomassets.net/thumbnail/${item.uuid}/thumb.webp`);
					break;
				case 1:
					setImageSource(`https://cdn.axiomassets.net/defaults/tool-icons/288/${item.value}.png`);
					break;
				case 3:
					setImageSource(`https://cdn.axiomassets.net/thumbnail/${item.uuid}/thumb.webp`);
					break;
				default:
					break;
			}
		}
	}, [item]);

	const handleDownloadBlueprint = async (event) => {
		event.stopPropagation();
		try {
			const response = await get(`/blueprint/${item.uuid}/blueprint.bp`, {
				baseURL: 'https://cdn.axiomassets.net',
				responseType: 'blob',
			});
			if (response.ok) {
				await get(`/download/${item.uuid}/none`);
				const blob = response.data;

				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = `${item.header}.bp`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				console.error(`Download failed (${item.uuid}/blueprint.bp`);
			}
		} catch (error) {
			console.error('Failed to download: ', error);
		}
	};

	const handleClipboardInstall = async (event) => {
		event.stopPropagation();
		try {
			const downloadURL = `${process.env.NEXT_PUBLIC_API_URL}/download/${assetData.uuid}/blueprint.bp`;

			await navigator.clipboard.writeText(`AxiomInstall~DownloadBlueprint~${assetData.header}~${downloadURL}`);
			notify('Open Axiom to finish installing the Blueprint.');
		} catch (error) {
			console.error('Failed to copy theme: ', error);
		}
	};

	const handleSaveItem = async (event) => {
		event.stopPropagation();
		if (!viewerUUID) return;

		try {
			const res = await get(`${process.env.NEXT_PUBLIC_API_URL}/save/${assetData.uuid}`, {
				credentials: 'include',
			});
			if (res.ok) {
				notify(`${isSaved ? 'Unsaved' : 'Saved'} "${assetData.header}"`);
				setIsSaved((prev) => !prev);
			} else {
				notify('You must login to save items', 'danger');
			}

			setAssetSaveCount((prev) => prev + (isSaved ? -1 : 1));
		} catch (error) {
			notify('Failed to save item', 'danger');
			console.error(error);
		}
	};

	const handleCopyTheme = async (event) => {
		event.stopPropagation();
		try {
			const themeText = `AxiomInstall~SetTheme~${assetData.header} By ${
				assetData.publisherData.username
			}'~${assetData.value.replace(/\s+/g, '')}`;
			await navigator.clipboard.writeText(themeText);
			await get(`${process.env.NEXT_PUBLIC_API_URL}/download/${assetData.uuid}/none`);
			setAssetDownloadCount((prev) => prev + 1);
			notify('Theme Copied');
		} catch (e) {
			notify('Failed to copy theme', 'danger');
		}
	};

	const handleDownloadPreset = async (event) => {
		event.stopPropagation();
		try {
			const res = await get(`/preset/${item.uuid}/preset.nbt`, {
				baseURL: 'https://cdn.axiomassets.net',
				responseType: 'blob',
			});
			if (res.ok) {
				await get(`/download/${item.uuid}/none`);
				const blob = res.data;

				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = `${item.header}.nbt`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				notify('Failed to download preset', 'danger');
			}
		} catch (e) {
			notify('Failed to download preset', 'danger');
		}
	};

	const handleDownloadAssetPack = async (event) => {
		event.stopPropagation();
		try {
			const res = await get(`/asset-pack/${item.uuid}/pack.zip`, {
				baseURL: 'https://cdn.axiomassets.net',
				responseType: 'blob',
			});
			if (res.ok) {
				await get(`/download/${item.uuid}/none`);
				const blob = res.data;
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = `${item.header}.zip`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				notify('Failed to download asset pack', 'danger');
			}
		} catch (e) {
			notify('Failed to download asset pack', 'danger');
		}
	};

	if (!item) {
		notFound();
	}

	const downloadDisplayOptions = {
		0: (
			<Dropdown>
				<MenuButton variant="solid" color="primary">
					Download
				</MenuButton>
				<Menu placement="bottom-end" variant="soft">
					<MenuItem onClick={(event) => handleDownloadBlueprint(event)}>
						<ListItemDecorator>
							<SaveOutlinedIcon />
						</ListItemDecorator>
						Blueprint File
					</MenuItem>
					<MenuItem onClick={(event) => handleClipboardInstall(event)}>
						<ListItemDecorator>
							<ContentCopyOutlinedIcon />
						</ListItemDecorator>
						Clipboard Install
					</MenuItem>
				</Menu>
			</Dropdown>
		),
		1: <Button onClick={(event) => handleDownloadPreset(event)}>Download</Button>,
		2: <Button onClick={(event) => handleCopyTheme(event)}>Copy</Button>,
		3: <Button onClick={(event) => handleDownloadAssetPack(event)}>Download</Button>,
	};

	return (
		<Fragment>
			{assetData ? (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 2,
						px: 2,
					}}
				>
					{imageSource !== null && (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								gap: '1.5vw',
								width: '100%',
								justifyContent: 'center',
								alignItems: 'center',
								minHeight: 400 / eval(assetAspectRatio),
							}}
						>
							{isCarousel ? (
								[...Array(assetData.image_carousel_length)].map((_, index) => (
									<AspectRatio
										key={index}
										ratio={assetAspectRatio}
										sx={{
											width: 288,
											transition: 'width 0.25s ease-out',
											borderRadius: 'var(--joy-radius-md)',
											'&:hover': {
												width: 400,
												cursor: 'pointer',
											},
										}}
									>
										<img
											src={imageSource.replace('%%', index)}
											alt=""
											draggable={false}
											onError={(e) => {
												e.target.src =
													'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
											}}
										/>
									</AspectRatio>
								))
							) : (
								<AspectRatio
									ratio={assetAspectRatio}
									sx={{
										width: 288,
										transition: 'width 0.25s ease-out',
										borderRadius: 'var(--joy-radius-md)',
										'&:hover': {
											width: 400,
											cursor: 'pointer',
										},
									}}
								>
									<img
										src={imageSource}
										alt=""
										draggable={false}
										onError={(e) => {
											e.target.src =
												'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
										}}
									/>
								</AspectRatio>
							)}
						</Box>
					)}
					<Typography level="body-xs">I will update this page soon, its pretty ugly</Typography>
					<Divider />
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							justifyContent: 'center',
							maxWidth: 1000,
							minWidth: 0,
							width: '100%',
							pb: 8,
						}}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}
						>
							<Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
								<Typography level="h3">{assetData.header}</Typography>
								<Box sx={{ gap: 1, display: 'flex' }}>
									<Tooltip
										title={viewerUUID === null ? 'You must be logged in to save items.' : null}
										placement="top"
										variant="soft"
									>
										<Button variant="plain" onClick={(event) => handleSaveItem(event)}>
											{isSaved ? 'Unsave' : 'Save'}
										</Button>
									</Tooltip>
									{downloadDisplayOptions[assetData.type]}
								</Box>
							</Box>
							<Typography level="body-md">
								{`By `}
								<NextLink
									style={linkStyle}
									draggable={false}
									href={`/user/profile/${assetData.publisherData.username}`}
								>
									{assetData.publisherData.username}
								</NextLink>
								{`, `}
								<RelativeTime date={assetData.date_created} />
							</Typography>
						</Box>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								gap: 2,
								minHeight: 200,
							}}
						>
							<Card variant="soft" sx={{ width: '100%', height: '100%', wordBreak: 'break-word' }}>
								<Typography level="title-lg">Description:</Typography>
								{assetData.desc_value || 'No description.'}
							</Card>
							{assetData.type === 0 && assetData.tags.length !== 0 && (
								<Card variant="soft" sx={{ minWidth: 323, maxWidth: 323 }}>
									<Typography level="title-lg">Tags:</Typography>
									<Box
										sx={{
											gap: 1,
											display: 'flex',
											flexWrap: 'wrap',
										}}
									>
										{assetData.tags.map((tag) => (
											<Chip
												key={tag}
												variant="outlined"
												size="md"
												onClick={() => {}}
												sx={{
													display: 'inline-flex',
													userSelect: 'none',
													flexShrink: 0,
												}}
											>
												{tag}
											</Chip>
										))}
									</Box>
								</Card>
							)}
						</Box>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								gap: 2,
								width: '100%',
								justifyContent: 'center',
							}}
						>
							<Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
								<Card variant="soft" sx={{ width: '100%', display: 'flex', gap: 0 }}>
									<Typography level="title-md">Downloads:</Typography>
									<Typography sx={{ ml: 'auto' }} level="h3">
										{assetDownloadCount.toLocaleString('en-US')}
									</Typography>
								</Card>
								<Card variant="soft" sx={{ width: '100%', display: 'flex', gap: 0 }}>
									<Typography level="title-md">Saves:</Typography>
									<Typography sx={{ ml: 'auto' }} level="h3">
										{assetSaveCount.toLocaleString('en-US')}
									</Typography>
								</Card>
								<Card variant="soft" sx={{ width: '100%', display: 'flex', gap: 0 }}>
									<Typography level="title-md">{`${metricMap[assetData.type]}:`}</Typography>
									<Typography sx={{ ml: 'auto' }} level="h3">
										{assetData.metric.toLocaleString('en-US')}
									</Typography>
								</Card>
							</Box>
						</Box>
						{assetData.type === 3 && (
							<>
								<Typography level="h4">Assets in this pack:</Typography>
								<AssetGrid
									itemWidth={153}
									filterOverride={{
										filter: {
											field: 'visibility',
											op: 'eq',
											value: 'childItem',
											and: [{ field: 'parent', op: 'eq', value: item.uuid }],
										},
										sort: [{ field: 'date_created', direction: 'desc' }],
										savedOnly: false,
									}}
								/>
								<Divider sx={{ my: 4 }} />
							</>
						)}
						<Typography level="h4">{`More from ${assetData.publisherData.username}:`}</Typography>
						<AssetGrid
							itemWidth={153}
							totalItemLimit={12}
							filterOverride={{
								filter: {
									and: [
										{ field: 'visibility', op: 'eq', value: 'public' },
										{ field: 'publisher.username', op: 'eq', value: item.publisherData.username },
										{
											or: [
												{ field: 'date_created', op: 'lt', value: item.date_created },
												{ field: 'date_created', op: 'gt', value: item.date_created },
											],
										},
									],
								},
								sort: [{ field: 'date_created', direction: 'desc' }],
								savedOnly: false,
							}}
						/>
					</Box>
				</Box>
			) : validAsset ? (
				<Box
					sx={{
						width: '100%',
						height: '60%',
						justifyContent: 'center',
						alignItems: 'center',
						display: 'flex',
					}}
				>
					<CircularProgress />
				</Box>
			) : (
				<Box
					sx={{
						width: '100%',
						height: '60%',
						justifyContent: 'center',
						alignItems: 'center',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Typography>Asset not found</Typography>
				</Box>
			)}
		</Fragment>
	);
}

export default App;
