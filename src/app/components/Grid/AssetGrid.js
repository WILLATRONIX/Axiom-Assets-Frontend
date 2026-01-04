'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { getFilter, subscribeFilter, setFilter } from 'lib/searchFilter';
import { post, get } from 'lib/network';
import { useAuth } from 'lib/auth/authContext.js';
import { useNotification } from 'lib/NotificationContext';

import EditItemModal from 'components/Modal/EditItem';
import ReportItemModal from 'components/Modal/ReportItemModal';
import ShareItemModal from 'components/Modal/ShareItemModal';
import ItemCard from 'components/Card/ItemCard';

import Skeleton from '@mui/joy/Skeleton';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import Box from '@mui/joy/Box';

import DeleteForever from '@mui/icons-material/DeleteForever';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReportIcon from '@mui/icons-material/FlagOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/ShareOutlined';

function AssetGrid({
	itemWidth = 200,
	readyToLoad = true,
	highlightSearchMatch = false,
	defaultItems = [],
	disableExpandItem = false,
	optionsOverride = null,
	initialAssetData = { rows: [], count: 0 },
	totalItemLimit = Number.MAX_SAFE_INTEGER,
	filterOverride = null,
}) {
	const [assets, setAssets] = useState(initialAssetData.rows);
	const [totalItemCount, setTotalItemCount] = useState(initialAssetData.count);

	const [hasNoItems, setHasNoItems] = useState(false);

	const [suggestCreateAccount, setSuggestCreateAccount] = useState(false);

	const [userLoggedIn, setUserLoggedIn] = useState(false);
	const [userData, setUserData] = useState({});

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [reportModalOpen, setReportModalOpen] = useState(false);
	const [suggestLoginModalOpen, setSuggestLoginModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const [selectedItem, setSelectedItem] = useState(null);
	const [searchFilter, setSearchFilter] = useState(getFilter());

	const [isLoading, setIsLoading] = useState(false);
	const [index, setIndex] = useState(0);
	const fetchItemsLimit = totalItemLimit < 48 ? totalItemLimit : 48;

	const triggerLoadRef = useRef(null);

	const { user, loadingUser } = useAuth();
	const router = useRouter();
	const { notify } = useNotification();

	const hasInitialAssets = initialAssetData.count > 0;

	useEffect(() => {
		if (user && !loadingUser) {
			setUserLoggedIn(true);
			setUserData(user);
		}
	}, [user, loadingUser]);

	const clearItems = () => {
		setHasNoItems(false);
		setIndex(0);
		setAssets([]);
		setTotalItemCount(0);
		setIsLoading(false);
	};

	useEffect(() => {
		const unsubscribe = subscribeFilter((newFilter) => {
			clearItems();
			setSearchFilter(newFilter);
		});
		return () => unsubscribe();
	}, []);

	const getChangedValues = (original, edited) => {
		const changes = {};

		for (const key in edited) {
			if (!Object.prototype.hasOwnProperty.call(original, key)) {
				changes[key] = edited[key];
			} else if (typeof edited[key] === 'object' && edited[key] !== null && !Array.isArray(edited[key])) {
				const nestedChanges = getChangedValues(original[key], edited[key]);
				if (Object.keys(nestedChanges).length > 0) {
					changes[key] = nestedChanges;
				}
			} else if (edited[key] !== original[key]) {
				changes[key] = edited[key];
			}
		}

		return changes;
	};

	const deleteItem = async (item) => {
		try {
			const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/asset/delete/${item.uuid}`);

			if (response.ok) {
				notify(`Deleted ${item.header}`);
			}

			setDeleteModalOpen(false);
			clearItems();
		} catch (error) {
			notify(`Failed to delete ${item.header}`, 'danger');
		}
	};

	const handleEditClick = async (item) => {
		const thumbData = {
			url: `https://cdn.axiomassets.net/thumbnail/${item.uuid}/thumb.webp`,
			defaultUrl: `https://cdn.axiomassets.net/thumbnail/${item.uuid}/thumb.webp`,
		};

		const { uuid, type, header, desc_value, tags, visibility } = item;
		const newItem = {
			uuid,
			type,
			header,
			description: desc_value === null ? '' : desc_value,
			tags,
			visibility,
			thumbnail: thumbData,
		};
		setSelectedItem(newItem);
		setEditModalOpen(true);
	};

	const handleDeleteClick = async (item) => {
		setSelectedItem(item);
		setDeleteModalOpen(true);
	};

	const handleReportClick = async (item) => {
		setSelectedItem(item);
		setReportModalOpen(true);
	};

	const handleShareClick = async (item) => {
		setSelectedItem(item);
		setShareModalOpen(true);
	};

	const handleEditAsset = async (newItemData, uuid) => {
		const diff = getChangedValues(selectedItem, newItemData);

		const edits = Object.keys(diff);

		const thumbForm = new FormData();
		thumbForm.append('editValues', JSON.stringify(edits));
		thumbForm.append('editData', JSON.stringify(diff));

		await post(`${process.env.NEXT_PUBLIC_API_URL}/asset/edit/${uuid}`, thumbForm);
		clearItems();

		notify('Asset updated');

		if (edits.includes('thumbnail')) {
			notify('Your browser will take some time to update the image.');
		}
	};

	const handleLoginSuggestionClick = async (createAccount) => {
		localStorage.setItem('shownSuggestLogin', true);
		if (createAccount) {
			router.push('/auth');
		}
		setSuggestLoginModalOpen(false);
		setSuggestCreateAccount(false);
	};

	const handleDownloadBlueprint = async (item) => {
		try {
			const response = await get(`/blueprint/${item.uuid}/blueprint.bp`, {
				baseURL: 'https://cdn.axiomassets.net',
			});
			if (response.ok) {
				await get(`/download/${item.uuid}/none`);
				const blob = await response.blob();

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

	const handleCopyTheme = async (item) => {
		try {
			const themeText = `AxiomInstall~SetTheme~${item.header} By ${
				item.publisherData.username
			}'~${item.value.replace(/\s+/g, '')}`;
			await navigator.clipboard.writeText(themeText);
			await get(`/download/${item.uuid}/none`);
			notify('Theme Copied');
		} catch (e) {
			notify('Failed to copy theme', 'danger');
		}
	};

	const handleDownloadPreset = async (item) => {
		try {
			const res = await get(`/preset/${item.uuid}/preset.nbt`, {
				baseURL: 'https://cdn.axiomassets.net',
			});
			if (res.ok) {
				await get(`/download/${item.uuid}/none`);
				const blob = await res.blob();
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

	const handleDownloadAssetPack = async (item) => {
		try {
			const res = await get(`/asset-pack/${item.uuid}/pack.zip`, {
				baseURL: 'https://cdn.axiomassets.net',
			});
			if (res.ok) {
				await get(`/download/${item.uuid}/none`);
				const blob = await res.blob();
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

	const onDownload = async (uuid) => {
		if (suggestCreateAccount) {
			setSuggestLoginModalOpen(true);
		}
	};

	const handleAssetDownload = async (item) => {
		switch (item.type) {
			case 0:
				handleDownloadBlueprint(item);
				onDownload();
				break;
			case 1:
				handleDownloadPreset(item);
				onDownload();
				break;
			case 2:
				handleCopyTheme(item);
				break;
			case 3:
				handleDownloadAssetPack(item);
				onDownload();
				break;
			default:
				break;
		}
	};

	const fetchData = useCallback(async () => {
		if (isLoading || hasNoItems) return;

		const adjustedFetchLimit =
			fetchItemsLimit + assets.length > totalItemLimit ? totalItemLimit - assets.length : fetchItemsLimit;

		setIsLoading(true);

		const selectedFilter = filterOverride || searchFilter;
		
		const res = await get('/browse/get-assets', {
			params: {
				flags: JSON.stringify({
					...selectedFilter,
					offset: index,
					limit: adjustedFetchLimit,
				}),
			},
		});

		if (!res.ok) {
			notify('Failed to load assets', 'danger');
			setHasNoItems(true);
			setIsLoading(false);
		}

		if (!res.data.rows || res.data.rows.length === 0) {
			setHasNoItems(true);
			setTotalItemCount(0);
			return;
		}

		if (res.data.rows.length < adjustedFetchLimit) {
			setHasNoItems(true);
		}

		if (totalItemLimit && assets.length + res.data.rows.length > totalItemLimit) {
			setHasNoItems(true);
			setTotalItemCount(0);
			return;
		}

		setAssets((prev) => [...prev, ...res.data.rows]);
		setTotalItemCount(totalItemLimit < res.data.count ? totalItemLimit : res.data.count);
		setIndex((prev) => prev + adjustedFetchLimit);

		setIsLoading(false);
	}, [isLoading, index, fetchItemsLimit, hasNoItems]);

	useEffect(() => {
		if (hasInitialAssets) {
			setIndex(initialAssetData.rows.length);
		}
	}, [initialAssetData.rows, hasInitialAssets]);

	useEffect(() => {
		if (hasInitialAssets) {
			setAssets(initialAssetData.rows);
		}
	}, [initialAssetData.rows, hasInitialAssets]);

	useEffect(() => {
		if (hasInitialAssets) {
			setTotalItemCount(initialAssetData.count);
		}
	}, [initialAssetData.count, hasInitialAssets]);

	useEffect(() => {
		if (defaultItems.length > 0) {
			setAssets(defaultItems);
		}
	}, [defaultItems]);

	useEffect(() => {
		let shownSuggestLogin = JSON.parse(localStorage.getItem('shownSuggestLogin')) || false;

		if (shownSuggestLogin === false) {
			setSuggestCreateAccount(true);
		}
	}, [suggestLoginModalOpen]);

	useEffect(() => {
		const runObserver = () => {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && readyToLoad && !hasNoItems) {
						fetchData();
					}
				},
				{ threshold: 0.0 }
			);

			if (triggerLoadRef.current) {
				observer.observe(triggerLoadRef.current);
			}

			return observer;
		};

		let observer = runObserver();

		const interval = setInterval(() => {
			observer.disconnect();
			observer = runObserver();
		}, 500);

		return () => {
			observer.disconnect();
			clearInterval(interval);
		};
	}, [fetchData]);

	return (
		<>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: `repeat(auto-fill, ${itemWidth}px)`,
					gap: 2,
					alignItems: 'start',
					width: '100%',
				}}
				ref={assets.length === 0 && triggerLoadRef}
			>
				{assets.map((item, i) => {
					const skip = defaultItems.some((di) => di.uuid === item.uuid);
					if (skip) return;

					const editPerms = userData.uuid === item.publisher || userData.permission_level === 0;
					const itemId = item.uuid ?? item.fileName;

					const [w, h] = item.image_aspect_ratio.split(':').map(Number);
					const adjustedWidth = (itemWidth * w) / h;
					const colSpan = Math.ceil(adjustedWidth / itemWidth);

					const defaultItemDropdownOptions = [
						{
							label: 'Open',
							icon: OpenInNewIcon,
							action: () => {
								window.open(
									`/u/${item.publisherData.username}/${item.uuid}`,
									'_blank',
									'noopener,noreferrer'
								);
							},
						},
						{ label: 'Share', icon: ShareIcon, action: handleShareClick },
						...(editPerms
							? [
									{
										label: 'Edit',
										icon: EditIcon,
										action: handleEditClick,
									},
									{
										label: 'Delete',
										icon: DeleteForever,
										color: 'danger',
										action: handleDeleteClick,
									},
							  ]
							: [{ label: 'Report', icon: ReportIcon, color: 'danger', action: handleReportClick }]),
					];

					return (
						<Box
							key={itemId}
							sx={{
								gridColumn: `span ${colSpan}`,
								height: itemWidth + 56,
							}}
						>
							<ItemCard
								item={item}
								baseDiameter={itemWidth}
								itemDiameter={adjustedWidth}
								highlightSearchMatch={highlightSearchMatch}
								userData={{ ...userData, canManageAsset: editPerms, userLoggedIn }}
								handleDeleteClick={handleDeleteClick}
								handleEditClick={handleEditClick}
								handleReportClick={handleReportClick}
								handleShareClick={handleShareClick}
								disableExpandItem={disableExpandItem}
								dropdownOptions={optionsOverride || defaultItemDropdownOptions}
								handleDownload={handleAssetDownload}
							/>
						</Box>
					);
				})}
				{[...Array(totalItemCount)].map((_, i) => {
					if (i >= assets.length) {
						const isNextTrigger = assets.length + 1 === i;
						return (
							<Box
								ref={isNextTrigger ? triggerLoadRef : null}
								key={i}
								sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: itemWidth + 56 }}
							>
								<Skeleton variant="rectangular" sx={{ borderRadius: 'sm' }}>
									<Box sx={{ width: itemWidth, height: itemWidth, pb: 1 }} />
								</Skeleton>
								<Skeleton variant="rectangular" sx={{ borderRadius: 'sm' }}>
									<Box sx={{ width: itemWidth, height: 16 }} />
								</Skeleton>
								<Skeleton variant="rectangular" sx={{ borderRadius: 'sm' }}>
									<Box sx={{ width: itemWidth, height: 10 }} />
								</Skeleton>
							</Box>
						);
					}
				})}
			</Box>

			<EditItemModal
				open={editModalOpen}
				setOpen={setEditModalOpen}
				item={selectedItem}
				onConfirm={handleEditAsset}
			/>
			<ShareItemModal open={shareModalOpen} setOpen={setShareModalOpen} targetItem={selectedItem} />
			<ReportItemModal open={reportModalOpen} setOpen={setReportModalOpen} targetItem={selectedItem} />

			<Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
				<ModalDialog sx={{ width: 480 }}>
					<DialogTitle>Permanently Delete Asset</DialogTitle>
					<Divider />
					<DialogContent>
						{`Are you sure you want to permanently delete "${selectedItem?.header}"?`}
					</DialogContent>
					<DialogActions>
						<Button variant="solid" color="danger" onClick={() => deleteItem(selectedItem)}>
							Delete
						</Button>
						<Button variant="plain" color="neutral" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
					</DialogActions>
				</ModalDialog>
			</Modal>
			<Modal open={suggestLoginModalOpen} onClose={() => setSuggestLoginModalOpen(false)}>
				<ModalDialog sx={{ width: 480 }}>
					<DialogTitle>Got spare assets?</DialogTitle>
					<Divider />
					<DialogContent>
						By creating an account, you can upload as many of your asssets as you want.
					</DialogContent>
					<DialogActions>
						<Button variant="solid" onClick={() => handleLoginSuggestionClick(true)}>
							Login
						</Button>
						<Button variant="plain" color="neutral" onClick={() => handleLoginSuggestionClick(false)}>
							Don't show again
						</Button>
					</DialogActions>
				</ModalDialog>
			</Modal>
		</>
	);
}

export default AssetGrid;
