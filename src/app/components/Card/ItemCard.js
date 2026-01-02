'use client';

import { useState, useEffect, useRef } from 'react';

import NextLink from 'next/link';
import Portal from '@mui/material/Portal';
import { motion, AnimatePresence } from 'framer-motion';
import { get } from 'api/network';

import { useNotification } from 'api/NotificationContext';

import ThumbPreview from 'components/Card/ItemCard/ThumbPreview';
import SearchMatchText from 'components/Typography/SearchMatchText';
import RelativeTime from 'components/Typography/RelativeTimeFormat';

import Card from '@mui/joy/Card';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import MenuButton from '@mui/joy/MenuButton';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tooltip from '@mui/joy/Tooltip';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import DeleteForever from '@mui/icons-material/DeleteForever';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReportIcon from '@mui/icons-material/FlagOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const ItemCard = ({
	item,
	itemDiameter,
	baseDiameter,
	filterQuery,
	highlightSearchMatch = false,
	userData,
	dropdownOptions = [],
	disableExpandItem,
	handleDownload,
}) => {
	const itemRef = useRef(null);
	const parentRef = useRef(null);

	const [isHovered, setIsHovered] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	const [scrolledWhileExpanded, setScrolledWhileExpanded] = useState(false);

	const [originOffset, setOriginOffset] = useState(null);
	const [overlayOffset, setOverlayOffset] = useState(null);

	const [lastCopiedTag, setLastCopiedTag] = useState('');

	const shortNames = ['Blueprint', 'Preset', 'Theme', 'Asset Pack', null];

	const [isSaved, setIsSaved] = useState(item.isSaved);
	const [saveCount, setSaveCount] = useState(item.saves);
	const [downloadCount, setDownloadCount] = useState(item.downloads);

	const showTags = item.type === 0 && item.tags.length > 0;
	const isTheme = item.type === 2;
	const isPreset = item.type === 1;
	const isCarousel = item.image_carousel_length >= 2;
	const shortTypeName = shortNames[item.type];
	const themeData = item.metadata?.themeData;

	const expandedCardWidth = 320 + itemDiameter;
	const expandedCardHeight = 290;

	const metricNameMap = ['Blocks', 'Modified Settings', 'Modified Colours', 'Assets'];

	const { notify } = useNotification();

	function formatNumberShort(n) {
		if (n < 1000) return n.toString();

		const units = ['K', 'M', 'B', 'T'];
		let unitIndex = -1;
		let value = n;

		while (value >= 1000 && unitIndex < units.length - 1) {
			value /= 1000;
			unitIndex++;
		}

		const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

		return formatted + units[unitIndex];
	}

	const handleSaveItem = async () => {
		try {
			const res = await get(`/save/${item.uuid}`);
			if (res.ok) {
				notify(`${isSaved ? 'Unsaved' : 'Saved'} "${item.header}"`);
				setIsSaved((prev) => !prev);
				setSaveCount((prev) => {
					return isSaved ? --prev : ++prev;
				});
			} else {
				notify('You must login to save items', 'danger');
			}
		} catch (error) {
			notify('Failed to save item', 'danger');
			console.error(error);
		}
	};

	const handleClipboardInstall = async (item) => {
		try {
			const downloadURL = `https://api.axiomassets.net/download/${item.uuid}/blueprint.bp`;

			await navigator.clipboard.writeText(`AxiomInstall~DownloadBlueprint~${item.header}~${downloadURL}`);
			notify('Open Axiom to finish installing the Blueprint.');
		} catch (error) {
			console.error('Failed to copy theme: ', error);
		}
	};

	const getOverlayOffset = (rect) => {
		if (!rect) return { x: 0, y: 0 };

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const overlayWidth = expandedCardWidth;
		const overlayHeight = expandedCardHeight;

		const elementCenterX = rect.x + rect.width / 2;
		const elementCenterY = rect.y + rect.height / 2;

		const screenCenterX = viewportWidth / 2;
		const screenCenterY = viewportHeight / 2;

		const offsetX = -(elementCenterX - screenCenterX) * 0.2;
		const offsetY = -(elementCenterY - screenCenterY) * 0.05;

		let overlayX = elementCenterX - overlayWidth / 2 + offsetX;
		let overlayY = rect.top + offsetY;

		const padding = 16;

		const minY = padding + 126;
		const maxY = viewportHeight - overlayHeight - padding;
		if (overlayY < minY) overlayY = minY;
		if (overlayY > maxY) overlayY = maxY;

		const minX = padding;
		const maxX = viewportWidth - overlayWidth - padding;
		if (overlayX < minX) overlayX = minX;
		if (overlayX > maxX) overlayX = maxX;

		return { x: overlayX, y: overlayY };
	};

	const updateBounds = ({ refresh = false }) => {
		if (!itemRef.current) return;
		const parentRect = parentRef.current.getBoundingClientRect();

		const bounds = {
			x: parentRect.x,
			y: parentRect.y,
			width: parentRect.width,
			height: parentRect.height,
			top: parentRect.top,
			left: parentRect.left,
			right: parentRect.right,
			bottom: parentRect.bottom,
		};

		if (!originOffset || refresh) {
			setOriginOffset(bounds);
			setOverlayOffset(getOverlayOffset(bounds));
		}
	};

	const toggleExpanded = (newValue) => {
		if (disableExpandItem) return;

		if (newValue) {
			updateBounds({ refresh: true });
			setScrolledWhileExpanded(false);
		}

		setIsExpanded(newValue);

		if (!newValue) {
			setOriginOffset(null);
			setOverlayOffset(null);
			setScrolledWhileExpanded(false);
			setIsHovered(false);
		}
	};

	const handleCopyTag = async (tag) => {
		setLastCopiedTag(tag);
		await navigator.clipboard.writeText(tag);
		notify('Tag copied to clipboard.');
	};

	useEffect(() => {
		const onResize = () => {
			updateBounds({ refresh: true });
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	useEffect(() => {
		let lastCall = 0;
		const interval = 50;

		const onScroll = () => {
			const now = performance.now();
			if (now - lastCall > interval) {
				updateBounds({ refresh: true });
				lastCall = now;
			}
		};

		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	function blendRgbaWithBlack(rgba) {
		const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
		if (!match) return rgba;

		const [, r, g, b, a] = match.map(Number);
		const alpha = a;

		return `rgb(
		  ${Math.round(r * alpha)},
		  ${Math.round(g * alpha)},
		  ${Math.round(b * alpha)}
		)`;
	}

	return (
		<Box
			sx={{
				position: 'relative',
			}}
			ref={parentRef}
		>
			<Box
				ref={itemRef}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				component={motion.div}
				animate={{
					top: isExpanded && !scrolledWhileExpanded ? overlayOffset?.y - originOffset?.y : 0,
					left: isExpanded && !scrolledWhileExpanded ? overlayOffset?.x - originOffset?.x : 0,
					opacity: isExpanded && !scrolledWhileExpanded ? 0 : 1,
				}}
				transition={{
					type: 'spring',
					stiffness: 250,
					damping: 30,
					mass: 0.8,
				}}
				sx={{
					position: 'absolute',
					borderRadius: 'var(--joy-radius-md)',
					width: itemDiameter,
					height: baseDiameter + 56,
					gap: 0.75,
					pb: 0.5,
					display: 'flex',
					flexDirection: 'column',
					bgcolor: isTheme ? blendRgbaWithBlack(themeData.WindowBg) : 'background.surface',
				}}
			>
				<AnimatePresence>
					{isExpanded && (
						<Portal>
							<motion.div
								initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
								animate={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
								exit={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
								transition={{
									type: 'spring',
									stiffness: 250,
									damping: 30,
									mass: 0.8,
								}}
								style={{
									position: 'fixed',
									inset: 0,
									display: 'flex',
									zIndex: 1300,
								}}
								onClick={(e) => {
									e.stopPropagation();
									toggleExpanded(false);
								}}
							>
								<motion.div
									initial={{
										width: itemDiameter,
										height: isTheme ? 256 : baseDiameter,
										top: originOffset?.y,
										left: originOffset?.x,
									}}
									animate={{
										width: expandedCardWidth,
										height: expandedCardHeight,
										top: overlayOffset?.y,
										left: overlayOffset?.x,
									}}
									exit={{
										width: itemDiameter,
										height: isTheme ? 256 : baseDiameter,
										top: originOffset?.y,
										left: originOffset?.x,
									}}
									transition={{
										type: 'spring',
										stiffness: 250,
										damping: 30,
										mass: 0.8,
									}}
									style={{
										overflow: 'hidden',
										borderRadius: 8,
										position: 'absolute',
									}}
									onClick={(e) => e.stopPropagation()}
								>
									<Box sx={{ width: expandedCardWidth, height: expandedCardHeight, bgcolor: '#000' }}>
										<Card
											variant="soft"
											sx={{
												p: 0,
												border: 'none',
												borderRadius: 'md',
												width: '100%',
												height: '100%',
												maxHeight: expandedCardHeight,
												maxWidth: expandedCardWidth,
												gap: 0,
												boxShadow: 'lg',
												display: 'flex',
												flexDirection: 'column',
												bgcolor: isTheme && themeData.WindowBg,
											}}
										>
											<Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
												<Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
													<ThumbPreview
														customOverride={item.thumbnail?.buffer ?? null}
														width={itemDiameter}
														itemType={item.type}
														itemUUID={item.uuid}
														presetValue={item.value}
														aspectRatio={item.image_aspect_ratio}
														isCarousel={isCarousel}
														currentImageIndex={0}
														themeData={themeData}
													/>
													<Box
														sx={{
															pl: 0.5,
															maxWidth: itemDiameter,
															py: 0.75,
															display: 'flex',
															flexDirection: 'column',
															flex: 1,
														}}
													>
														<Typography
															level="body-sm"
															sx={{
																color: isTheme ? themeData.Text : 'text.primary',
															}}
															noWrap
														>
															{item.header}
														</Typography>
														<NextLink
															href={`/u/${item.publisherData.username}`}
															style={{
																textDecoration: 'none',
																width: 'fit-content',
															}}
															onClick={(e) => {
																e.stopPropagation();
															}}
														>
															<Typography
																level="body-xs"
																sx={{
																	overflow: 'hidden',
																	textOverflow: 'ellipsis',
																	whiteSpace: 'nowrap',
																	display: 'flex',
																	alignItems: 'center',
																	gap: 0.25,
																	color: isTheme && themeData.TextDisabled,
																	'&:hover': {
																		color: isTheme
																			? themeData.Text
																			: 'text.secondary',
																		textDecoration: 'underline',
																	},
																}}
															>
																{item.publisherData.is_creator && <VerifiedIcon />}
																{item.publisherData.display_name}
															</Typography>
														</NextLink>
														<Box
															sx={{
																mt: 'auto',
																gap: 0.25,
																display: 'flex',
																flexDirection: 'column',
															}}
														>
															<Box
																sx={{
																	display: 'flex',
																	alignItems: 'center',
																}}
															>
																<BookmarkBorderOutlinedIcon
																	sx={{
																		color: isTheme
																			? themeData.TextDisabled
																			: 'text.tertiary',
																	}}
																/>
																<Tooltip
																	title={`${saveCount.toLocaleString('en-US')} Saves`}
																	variant="soft"
																	placement="top"
																>
																	<Typography
																		level="body-sm"
																		sx={{
																			mr: 'auto',
																			color: isTheme
																				? themeData.TextDisabled
																				: 'text.tertiary',
																		}}
																	>
																		{formatNumberShort(saveCount)}
																	</Typography>
																</Tooltip>
																<DownloadOutlinedIcon
																	sx={{
																		color: isTheme
																			? themeData.TextDisabled
																			: 'text.tertiary',
																	}}
																/>
																<Tooltip
																	title={`${downloadCount.toLocaleString(
																		'en-US'
																	)} Downloads`}
																	variant="soft"
																	placement="top"
																>
																	<Typography
																		level="body-sm"
																		sx={{
																			color: isTheme
																				? themeData.TextDisabled
																				: 'text.tertiary',
																		}}
																	>
																		{formatNumberShort(downloadCount)}
																	</Typography>
																</Tooltip>
															</Box>
														</Box>
													</Box>
												</Box>
												<Box
													sx={{
														width: '100%',
														pt: 1.5,
														px: 1,
														display: 'flex',
														flexDirection: 'column',
													}}
												>
													<Box
														sx={{
															maxHeight: expandedCardHeight - 60,
															overflowY: 'auto',
															gap: 1,
															display: 'flex',
															flexDirection: 'column',
															minWidth: 280,
														}}
													>
														<Box>
															<Typography
																level="title-sm"
																sx={{
																	color: isTheme ? themeData.Text : 'text.secondary',
																}}
															>
																Description
															</Typography>
															<Typography
																level="body-sm"
																sx={{
																	overflowWrap: 'break-word',
																	wordBreak: 'break-word',
																	hyphens: 'auto',
																	color: isTheme
																		? themeData.TextDisabled
																		: 'text.tertiary',
																}}
															>
																{item.desc_value || 'No description.'}
															</Typography>
														</Box>
														<Divider
															sx={{
																bgcolor: isTheme && themeData.Separator,
															}}
														/>
														{item.tags.length > 0 && [
															<Box key={0}>
																<Typography level="title-sm">Tags</Typography>
																<Box
																	sx={{
																		gap: 0.5,
																		display: 'flex',
																		pt: 0.5,
																		flexWrap: 'wrap',
																	}}
																>
																	{item.tags.map((tag) => (
																		<Tooltip
																			key={tag}
																			title={
																				lastCopiedTag === tag
																					? 'Tag Copied'
																					: 'Copy Tag'
																			}
																			size="sm"
																			variant="soft"
																			placement="top"
																		>
																			<Chip
																				variant="plain"
																				size="sm"
																				onClick={() => {
																					handleCopyTag(tag);
																				}}
																				sx={{
																					display: 'inline-flex',
																					userSelect: 'none',
																					flexShrink: 0,
																				}}
																			>
																				{tag}
																			</Chip>
																		</Tooltip>
																	))}
																</Box>
															</Box>,
															<Divider
																key={1}
																sx={{
																	bgcolor: isTheme && themeData.Separator,
																}}
															/>,
														]}
														<Box
															sx={{
																display: 'flex',
																justifyContent: 'space-between',
															}}
														>
															<Typography
																level="body-xs"
																sx={{
																	color: isTheme
																		? themeData.TextDisabled
																		: 'text.secondary',
																}}
															>
																Uploaded <RelativeTime date={item.date_created} />
															</Typography>
															<Typography
																level="body-xs"
																sx={{
																	color: isTheme
																		? themeData.TextDisabled
																		: 'text.secondary',
																}}
															>
																{`${formatNumberShort(item.metric)} ${
																	metricNameMap[item.type]
																}`}
															</Typography>
														</Box>
														<Divider
															sx={{
																bgcolor: isTheme && themeData.Separator,
															}}
														/>
													</Box>
													<Box sx={{ display: 'flex', gap: 1, pb: 1, mt: 'auto' }}>
														{userData.userLoggedIn ? (
															<Button
																size="sm"
																variant="plain"
																sx={{
																	bgcolor: isTheme && themeData.WindowBg,
																	color: isTheme && themeData.Text,
																	'&:hover': {
																		bgcolor: isTheme && themeData.ButtonHovered,
																	},
																	'&:active': {
																		bgcolor: isTheme && themeData.ButtonActive,
																	},
																}}
																startDecorator={
																	isSaved ? (
																		<BookmarkIcon />
																	) : (
																		<BookmarkBorderOutlinedIcon />
																	)
																}
																onClick={handleSaveItem}
															>
																{isSaved ? 'saved' : 'save'}
															</Button>
														) : (
															<Button
																size="sm"
																variant="plain"
																sx={{
																	bgcolor: isTheme && themeData.WindowBg,
																	color: isTheme && themeData.Text,
																	'&:hover': {
																		bgcolor: isTheme && themeData.ButtonHovered,
																	},
																	'&:active': {
																		bgcolor: isTheme && themeData.ButtonActive,
																	},
																}}
																startDecorator={<OpenInNewIcon />}
																onClick={() => {
																	window.open(
																		`/u/${item.publisherData.username}/${item.uuid}`,
																		'_blank',
																		'noopener,noreferrer'
																	);
																}}
															>
																Open
															</Button>
														)}
														<Button
															size="sm"
															sx={{
																width: '100%',
																bgcolor: isTheme && themeData.Button,
																color: isTheme && themeData.Text,
																'&:hover': {
																	bgcolor: isTheme && themeData.ButtonHovered,
																},
																'&:active': {
																	bgcolor: isTheme && themeData.ButtonActive,
																},
															}}
															startDecorator={<DownloadOutlinedIcon />}
															onClick={() => {
																setDownloadCount((prev) => ++prev);
																handleDownload(item);
															}}
														>
															Download
														</Button>
													</Box>
												</Box>
											</Box>
										</Card>
									</Box>
								</motion.div>
							</motion.div>
						</Portal>
					)}
				</AnimatePresence>
				<Card
					variant="plain"
					orientation={'vertical'}
					sx={{
						height: baseDiameter,
						gap: 0,
						p: 0,
						'&:hover': {
							cursor: !disableExpandItem && 'pointer',
						},
					}}
					onClick={(e) => {
						e.stopPropagation();
						toggleExpanded(true);
					}}
				>
					<Box
						sx={{
							display: 'flex',
							borderRadius: 'var(--joy-radius-md)',
							overflow: 'hidden',
							width: itemDiameter,
							height: baseDiameter,
							bgcolor: isTheme && blendRgbaWithBlack(themeData.WindowBg),
							boxShadow: isHovered && !isTheme && 'var(--joy-shadow-sm)',
						}}
					>
						<ThumbPreview
							customOverride={item.thumbnail?.buffer ?? null}
							width={itemDiameter}
							hidden={isTheme}
							isHovered={isHovered}
							itemType={item.type}
							itemUUID={item.uuid}
							presetValue={item.value}
							aspectRatio={item.image_aspect_ratio}
							isCarousel={isCarousel}
							currentImageIndex={0}
							themeData={themeData}
						/>
						<Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
							{shortTypeName && (
								<Chip
									size="sm"
									sx={{
										borderRadius: 'sm',
										maxHeight: '24px',
										bgcolor: isTheme
											? themeData.WindowBg
											: 'color-mix(in srgb, var(--joy-palette-neutral-softBg) 60%, transparent)',
										color: isTheme && themeData.Text,
									}}
								>
									{shortTypeName}
								</Chip>
							)}
						</Box>
					</Box>
				</Card>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'start',
						justifyContent: 'space-between',
						width: '100%',
						pl: 0.5,
						pr: 0,
						gap: isHovered ? 0.5 : 0,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							minWidth: 0,
						}}
					>
						<NextLink
							href={`/u/${item.publisherData.username}/${item.uuid}`}
							style={{
								textDecoration: 'none',
								width: 'fit-content',
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<Typography
								level="body-sm"
								sx={{
									color: 'text.primary',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									color: isTheme ? themeData.Text : 'text.primary',
									mr: 0.5,
									'&:hover': {
										color: isTheme ? themeData.Text : 'text.primary',
										textDecoration: 'underline',
									},
								}}
							>
								<SearchMatchText
									highlight={highlightSearchMatch ? filterQuery?.header : ''}
									text={item.header}
								/>
							</Typography>
						</NextLink>

						<NextLink
							href={`/u/${item.publisherData.username}`}
							style={{
								textDecoration: 'none',
								width: 'fit-content',
							}}
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<Typography
								level="body-xs"
								sx={{
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									display: 'flex',
									alignItems: 'center',
									gap: 0.25,
									color: isTheme && themeData.TextDisabled,
									'&:hover': {
										color: isTheme ? themeData.Text : 'text.secondary',
										textDecoration: 'underline',
									},
								}}
							>
								{item.publisherData.is_creator && <VerifiedIcon />}
								<SearchMatchText
									highlight={highlightSearchMatch ? filterQuery?.publisherData.display_name : ''}
									text={item.publisherData.display_name}
								/>
							</Typography>
						</NextLink>
					</Box>
					<AnimatePresence>
						{isHovered && (
							<Dropdown>
								<MenuButton
									slots={{ root: IconButton }}
									slotProps={{ root: { variant: 'soft', color: 'neutral' } }}
									onClick={(e) => {
										e.stopPropagation();
									}}
									sx={{
										boxShadow: !isTheme && 'var(--joy-shadow-sm)',
										bgcolor: isTheme && themeData.WindowBg,
										'&:hover': {
											bgcolor: isTheme && themeData.Button,
										},
									}}
								>
									<MoreVertIcon
										sx={{
											color: isTheme && themeData.TextDisabled,
											'&:hover': {
												color: isTheme && themeData.Text,
											},
										}}
									/>
								</MenuButton>
								<Menu
									placement="bottom-start"
									variant="soft"
									sx={{
										bgcolor: isTheme && themeData.WindowBg,
										'& .MuiMenuItem-root': {
											color: isTheme && themeData.Text,
											'&:hover': {
												backgroundColor: isTheme
													? themeData.ButtonHovered
													: 'var(--joy-palette-neutral-softHoverBg)',
											},
											'&:active': {
												backgroundColor: isTheme
													? themeData.ButtonActive
													: 'var(--joy-palette-neutral-softActiveBg)',
											},
										},
										'& .danger-bg-override': {
											backgroundColor: 'var(--joy-palette-danger-softBg)',
											color: 'var(--joy-palette-danger-plainColor)',
											'& * > *': { color: 'var(--joy-palette-danger-plainColor)' },
											'&:hover': {
												backgroundColor: 'var(--joy-palette-danger-softHoverBg)',
											},
											'&:active': {
												backgroundColor: 'var(--joy-palette-danger-softActiveBg)',
											},
										},
									}}
								>
									{dropdownOptions.map((option) => {
										const Icon = option.icon;

										return (
											<MenuItem
												className={option.color === 'danger' && 'danger-bg-override'}
												key={option.label}
												variant="neutral"
												onClick={(e) => {
													e.stopPropagation();
													option.action(item);
												}}
												sx={{
													color: isTheme && themeData.Text,
												}}
											>
												<ListItemDecorator>
													{Icon && (
														<Icon
															sx={{
																color: isTheme && themeData.Text,
															}}
														/>
													)}
												</ListItemDecorator>
												{option.label}
											</MenuItem>
										);
									})}
								</Menu>
							</Dropdown>
						)}
					</AnimatePresence>
				</Box>
			</Box>
		</Box>
	);
};

export default ItemCard;
