'use client';

import { Fragment, useState, useMemo, useEffect, useRef } from 'react';

import { post } from 'api/network';

import EditItemModal from 'components/Modal/EditItem';
import UploadTheme from 'components/Modal/Upload/Theme';
import CatImageUpload from 'components/Modal/Upload/CatImage';
import { useNotification } from 'api/NotificationContext';
import AssetGrid from 'components/Grid/AssetGrid';

import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import LinearProgress from '@mui/joy/LinearProgress';

import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import PetsIcon from '@mui/icons-material/Pets';
import AddIcon from '@mui/icons-material/Add';
import DeleteForever from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

const toolSettings = {
	Autoshade: [
		'SunPitchRadians',
		'SunYawRadians',
		'PaletteMode',
		'Dither',
		'DoSunShading',
		'BlockPercentages',
		'PaletteFlags',
		'GlobalIllumination',
		'DoAmbientShading',
	],
	Distort: [
		'DistanceY',
		'Seed',
		'SmoothEdges',
		'DistanceZ',
		'DistortionScale',
		'DistanceX',
		'Iterations',
		'SeparateAxis',
	],
	Elevation: [
		'Rate',
		'CustomHeightmapSize',
		'CustomHeightmapZoom',
		'ApplyMode',
		'Smoothing',
		'Mode',
		'Height',
		'FalloffType',
		'CustomHeightmapAsInts',
	],
	'Gradient Painter': [
		'NoiseSeed',
		'MaskSurface',
		'ClampToEdge',
		'GradientShape',
		'BlockPercentages',
		'GradientInterpolation',
	],
	Melt: ['SmoothStrength', 'SmoothThreshold'],
	'Noise Painter': [
		'Anisotropic',
		'BlockMode',
		'Jitter',
		'ThreeDimensional',
		'Gain',
		'Octaves',
		'NoiseSeed',
		'NoiseScaleY',
		'NoiseScaleX',
		'NoiseType',
		'MaskSurface',
		'NoiseScaleZ',
		'BlockThresholds',
		'Lacunarity',
		'MetaballRange',
		'W1',
		'W2',
		'W3',
	],
	Painter: [
		'MinimumRadius',
		'MaskSurface',
		'NoiseSeed',
		'SoftEdge',
		'MergeStrokes',
		'Mode',
		'BlockPercentages',
		'GradientInterpolation',
	],
	Path: [
		'PlayerPosY',
		'KeepExisting',
		'CatenaryInverted',
		'CatenarySlack',
		'PathPoints',
		'PlayerPosX',
		'PlayerPosZ',
		'ExtendToGround',
		'CurveType',
		'Looped',
		'Radius',
	],
	Rock: ['ReplaceSolidBlocks', 'NoiseSeed', 'SolidBlockInfluence', 'Noisiness', 'SmoothingStddev', 'NoiseRadius'],
	Roughen: ['BrushHeight', 'RemoveBlocks', 'Ratio', 'AddBlocks', 'MinFaces'],
	'Script Brush': ['Script'],
	'Sculpt Draw': ['Strength', 'Invert', 'Denoise', 'MaskY'],
	Shatter: ['BrushHeight', 'ShatterScale', 'UseActiveBlock', 'ShatterWidth', 'NoiseSeed', 'Axis'],
	Slope: ['RaiseLowerMode', 'Smoothing', 'Shape', 'Height', 'FalloffType'],
	Smooth: ['SmoothStrength', 'BlockRatio', 'FixEdges', 'MeltStableGrowMode'],
	Stamp: ['BaseChance', 'Blueprints', 'RandomYaw', 'MinSpacingPercentage', 'RandomXZFlip', 'PlaceMode'],
	'Tool Masks': ['mask', 'lua'],
	Weld: ['SmoothStrength', 'ReplaceSolidBlocks', 'SmoothThreshold'],
};

const UploadFile = ({ uploadType, onConfirm, defaultValue }) => {
	const [itemData, setItemData] = useState(defaultValue ? defaultValue : []);
	const [totalFileSize, setTotalFileSize] = useState(0);

	const [loading, setLoading] = useState(false);

	const [windowWidth, setWindowWidth] = useState(0);
	const [windowHeight, setWindowHeight] = useState(0);

	const [selectedAsset, setSelectedAsset] = useState({});
	const [activeAsset, setActiveAsset] = useState({});
	const [editModalOpen, setEditModalOpen] = useState(false);

	const [themeModalOpen, setThemeModalOpen] = useState(false);
	const [catModalOpen, setCatModalOpen] = useState(false);

	const fileInputRef = useRef(null);
	const { notify } = useNotification();
	const megabyte = 1000000;

	useEffect(() => {
		let timeout;
		const handleResize = () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				const navbarHeight = 230;
				setWindowWidth(window.innerWidth);
				setWindowHeight(window.innerHeight - navbarHeight);
			}, 50);
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const columnCount = useMemo(() => Math.max(1, Math.floor(windowWidth / 160)) - 1, [windowWidth]);

	const handleNewFile = (e) => {
		setLoading(true);
		const selectedFiles = Array.from(e.target.files);
		const MAGIC = 0xae5bb36;

		selectedFiles.forEach((file) => {
			const fileAlreadyExists = itemData.some((f) => {
				const existingName = typeof f === 'object' ? f?.fileName : f;
				return existingName?.toLowerCase() === file.name?.toLowerCase();
			});

			if (fileAlreadyExists && uploadType === 0) onConfirm(itemData);

			if (fileAlreadyExists) {
				setLoading(false);
				return;
			}

			if (file.size >= 5 * megabyte) {
				notify('The blueprint cannot be larger than 5 megabytes.', 'danger');
				setLoading(false);
				return;
			}

			const extension = file.name.split('.').pop().toLowerCase();

			switch (extension) {
				case 'bp':
					const reader = new FileReader();
					const fileSlice = file.slice(0, 4);

					reader.onload = async (event) => {
						const arrayBuffer = event.target.result;
						const uint8Array = new Uint8Array(arrayBuffer);

						const extractedBytes =
							(uint8Array[0] << 24) | (uint8Array[1] << 16) | (uint8Array[2] << 8) | uint8Array[3];

						if (extractedBytes === MAGIC) {
							try {
								const formData = new FormData();
								formData.append('file', file);

								const response = await post(
									`${process.env.NEXT_PUBLIC_API_URL}/upload/get-blueprint-header`,
									formData
								);

								if (!response.ok) {
									notify(`A network error has occurred. Please try again.`, 'danger');
									setLoading(false);
									return;
								}

								const { name, tags, blockCount, lockedThumbnail, thumbnail } = response.data.blueprint;

								const blueprintData = {
									type: 0,
									fileName: file.name,
									fileSize: file.size,
									header: name,
									image_aspect_ratio: '1:1',
									tags: tags.map((value) => value.toLowerCase()),
									metric: blockCount,
									publisherData: {
										// username: 'username'
									},
									thumbnail: {
										defaultBuffer: `data:image/png;base64,${thumbnail}`,
										buffer: `data:image/png;base64,${thumbnail}`,
										lockedThumb: lockedThumbnail,
										crop: { x: 0, y: 0 },
										zoom: 1,
										isCustom: false,
									},
									buffer: file,
								};

								setItemData((prevFiles) => {
									return [...prevFiles, blueprintData];
								});

								if (uploadType === 0) {
									onConfirm([blueprintData]);
									return;
								}
							} catch (error) {
								console.error(error);
								notify('Server was unable to process blueprint data.', 'danger');
							}

							setTotalFileSize((prevSize) => prevSize + file.size);
						} else {
							notify(`Blueprint data for ${file.name} is invalid or corrupted.`, 'danger');
						}
					};

					reader.readAsArrayBuffer(fileSlice);
					break;

				case 'nbt':
					const handlePreset = async () => {
						try {
							const formData = new FormData();
							formData.append('file', file);

							const response = await post(
								`${process.env.NEXT_PUBLIC_API_URL}/upload/get-preset-data`,
								formData
							);

							if (response.ok) {
								const presetJson = response.data;

								const presetTitle = presetJson.presetJson.Name;
								const presetVersion = presetJson.presetJson.Version;
								const presetSettings = presetJson.presetJson.Settings;

								let toolSettingsFiltered = [];

								console.log(presetSettings);

								for (const [compareSetting, _] of Object.entries(presetSettings)) {
									for (const [defaultSettingTitle, defaultValues] of Object.entries(toolSettings)) {
										if (Array.isArray(defaultValues) && defaultValues.includes(compareSetting)) {
											toolSettingsFiltered.push(defaultSettingTitle);
										}
									}
								}

								const counts = toolSettingsFiltered.reduce((acc, item) => {
									acc[item] = (acc[item] || 0) + 1;
									return acc;
								}, {});

								const mostFrequentItem = Object.keys(counts).reduce((a, b) =>
									counts[a] > counts[b] ? a : b
								);

								const toolName = mostFrequentItem.toLowerCase().replace(/\s+/g, '-');

								const presetData = {
									type: 1,
									fileName: file.name,
									metric: counts[mostFrequentItem],
									value: toolName,
									header: presetTitle,
									version: presetVersion,
									thumbnail: `https://cdn.axiomassets.net/defaults/tool-icons/192/${toolName}.png`,
									buffer: file,
								};

								setItemData((prevFiles) => {
									return [...prevFiles, presetData];
								});

								if (uploadType === 0) {
									onConfirm([presetData]);
									return;
								}

								setTotalFileSize((prevSize) => prevSize + file.size);
							} else {
								notify(`A network error has occurred. Please try again.`, 'danger');
							}
						} catch (error) {
							notify(`Server was unable to process ${file.name}.`, 'danger');
							console.error(error);
						}
					};

					handlePreset();
					break;

				default:
					notify(`Incorrect file format selected: ${file.name}`, 'danger');
					break;
			}
		});
		setLoading(false);
	};

	const handleUploadClick = () => {
		fileInputRef.current.click();
	};

	const handleNextStep = () => {
		if (itemData.length < 3) {
			notify('Three or more assets are required.', 'danger');
			return;
		}

		if (loading) {
			notify('Loading has not finished. Please try again', 'danger');
			return;
		}

		if (totalFileSize >= (uploadType === 1 ? 100 : 10) * megabyte) {
			notify('The maximum file size has been reached. Try removing assets or thumbnails', 'danger');
			return;
		}

		onConfirm(itemData);
	};

	const handleSelectAsset = (item) => {
		setSelectedAsset(item);
	};

	const recalculateTotalFileSize = () => {
		const total = itemData.reduce((sum, item) => {
			return sum + item.fileSize + (item.thumbnail?.fileSize || 0);
		}, 0);

		setTotalFileSize(total);
	};

	const handleEditAsset = (item) => {
		const index = itemData.findIndex((i) => i.fileName === item.fileName);

		if (index !== -1) {
			itemData[index] = item;
		}

		recalculateTotalFileSize();
	};

	const handleOpenEditMenu = (item) => {
		setActiveAsset(item);
		setEditModalOpen(true);
	};

	function handleDeleteAsset(item) {
		const index = itemData.findIndex((i) => i.fileName === item.fileName);

		if (index !== -1) {
			itemData.splice(index, 1);
			setItemData([...itemData]);

			recalculateTotalFileSize();
		}
	}

	return (
		<Fragment>
			{uploadType === 0 ? (
				<Card
					variant="plain"
					sx={{
						justifyContent: 'center',
						alignItems: 'center',
						width: '100%',
						height: '100%',
						display: 'flex',
						m: 2,
					}}
				>
					<Button startDecorator={<AddIcon />} onClick={handleUploadClick}>
						Add File
					</Button>
					<Dropdown>
						<MenuButton variant="plain" color="primary">
							More...
						</MenuButton>
						<Menu placement="bottom" variant="soft">
							<MenuItem onClick={() => setThemeModalOpen(true)}>
								<ListItemDecorator>
									<ColorLensOutlinedIcon />
								</ListItemDecorator>
								Upload Theme
							</MenuItem>
							<MenuItem onClick={() => setCatModalOpen(true)}>
								<ListItemDecorator>
									<PetsIcon />
								</ListItemDecorator>
								Cat Image
							</MenuItem>
						</Menu>
					</Dropdown>
				</Card>
			) : (
				<Box
					sx={{
						width: '100%',
						height: 'auto',
						display: 'flex',
						m: 2,
						gap: 2,
					}}
				>
					<Box sx={{ gap: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
						<Box sx={{ gap: 2, display: 'flex', mr: 4 }}>
							<Button
								startDecorator={<AddIcon />}
								onClick={handleUploadClick}
								sx={{ flexShrink: 0 }}
								disabled={loading}
							>
								Add Files
							</Button>
							{/* <Button disabled={itemData.length === 0}>Actions</Button> */}
							<Button onClick={() => handleNextStep(itemData)} disabled={itemData.length < 3}>
								Next
							</Button>
							<LinearProgress
								determinate
								size="sm"
								thickness={24}
								value={Math.min(
									100,
									totalFileSize / (((uploadType === 1 ? 100 : 10) * megabyte) / 100)
								)}
								variant="soft"
								color={totalFileSize >= (uploadType === 1 ? 100 : 10) * megabyte ? 'danger' : 'primary'}
								sx={{
									'--LinearProgress-radius': '6px',
									'--LinearProgress-thickness': '36px',
									top: 0,
									left: 0,
									width: '100%',
									zIndex: 0,
								}}
							>
								<Typography
									level="body-sm"
									textColor="common.white"
									sx={{
										fontWeight: 'xl',
										position: 'absolute',
										width: '100%',
										textAlign: 'center',
										zIndex: 2,
									}}
								>
									{`${(totalFileSize / megabyte).toFixed(1)}MB / ${uploadType === 1 ? 100 : 10}MB`}
								</Typography>
							</LinearProgress>
						</Box>
						{itemData.length < 3 && <Typography>{`${itemData.length}/3`}</Typography>}
						<Box sx={{ overflow: 'auto' }}>
							<AssetGrid
								itemWidth={120}
								defaultItems={itemData}
								disableExpandItem
								optionsOverride={[
									{
										label: 'Edit',
										icon: EditIcon,
										action: handleOpenEditMenu,
									},
									{
										label: 'Remove',
										icon: DeleteForever,
										action: handleDeleteAsset,
										color: 'danger',
									},
								]}
							/>
						</Box>
					</Box>
				</Box>
			)}
			<EditItemModal
				open={editModalOpen}
				setOpen={setEditModalOpen}
				item={activeAsset}
				onConfirm={handleEditAsset}
			/>
			<UploadTheme open={themeModalOpen} setOpen={setThemeModalOpen} />
			<CatImageUpload open={catModalOpen} setOpen={setCatModalOpen} />
			<input
				ref={fileInputRef}
				type="file"
				multiple={uploadType !== 0}
				accept=".bp, .nbt"
				style={{ display: 'none' }}
				onChange={handleNewFile}
			/>
		</Fragment>
	);
};

export default UploadFile;
