'use client';

import { useState, useEffect, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { post } from 'lib/network';
import { useAuth } from 'lib/auth/authContext.js';
import { hasPermission } from 'lib/permissionContext';

const SettingsModal = dynamic(() => import('components/Modal/Settings'));
const LoginModal = dynamic(() => import('components/Modal/Login'));

import BrowseNavbar from 'components/Navbar/BrowseNavbar';
import MaintainenceMessage from 'components/Modal/Maintainance';

import Sheet from '@mui/joy/Sheet';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import ListDivider from '@mui/joy/ListDivider';
import Link from '@mui/joy/Link';
import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Navbar = ({ initialUserData, onChange = () => {}, filterQuery, variant, defaultViewType }) => {
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);
	const [loginModalOpen, setLoginModalOpen] = useState(false);

	const [userLoggedIn, setUserLoggedIn] = useState(initialUserData?.valid);
	const [userData, setUserData] = useState(initialUserData);

	const [maintainenceMessageOpen, setMaintainenceMessageOpen] = useState(
		process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
	);

	const router = useRouter();
	const { user, loading, fetchUserDetails } = useAuth();

	const handleMoreFilterChange = (data) => {
		onChange(data);
	};

	const logoutUser = async () => {
		try {
			await post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`);
			await fetchUserDetails();
		} catch (error) {
			console.error(error);
		}
	};

	const verifyToken = async () => {
		if (user && !loading) {
			if (user.username === user.uuid && !hasPermission(userData?.permissions, 'asset.upload')) {
				setLoginModalOpen(true);
			}
			setUserData(user);
			setUserLoggedIn(true);
		} else if (!user && !loading) {
			setUserLoggedIn(false);
		}
	};

	const handleSaveMaintainenceBypass = () => {
		localStorage.setItem('bypassMaintanenceMessage', 'true');
		setMaintainenceMessageOpen(false);
	};

	useEffect(() => {
		const state = localStorage.getItem('bypassMaintanenceMessage');
		if (state === 'true') {
			setMaintainenceMessageOpen(false);
		}
	}, []);

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	useEffect(() => {
		if (variant === 'browse') {
			onChange(filterQuery);
		}
	}, [filterQuery]);

	return (
		<Fragment>
			{maintainenceMessageOpen && (
				<MaintainenceMessage
					open={maintainenceMessageOpen}
					setOpen={setMaintainenceMessageOpen}
					onClose={handleSaveMaintainenceBypass}
				/>
			)}
			<Sheet
				sx={{
					width: '100vw',
					display: 'flex',
					flexDirection: 'row',
					pointerEvents: 'all',
					overflow: 'auto',
					py: 2,
					px: 2,
					flexShrink: 0,
					backgroundColor: 'transparent',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
					}}
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
							}}
						>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'start',
									alignItems: 'center',
									width: 280,
									position: 'relative',
								}}
							>
								<img
									src={'https://cdn.axiomassets.net/defaults/icons/32.webp'}
									loading="lazy"
									width={32}
									height={32}
								/>
								<Link
									overlay
									sx={{ fontWeight: 'bold', textWrap: 'nowrap', ml: '0.4rem' }}
									level="h3"
									color="#FFFFFF"
									underline="none"
									tabIndex={0}
									onClick={() => {
										router.push('/browse');
									}}
								>
									Axiom Asset Library
								</Link>
								<Typography level="body-xs" sx={{ alignSelf: 'end', flexShrink: 0, ml: 1 }}>
									by WILLATRONIX
								</Typography>
							</Box>
							<Box sx={{ gap: 2, display: 'flex' }}>
								<Button variant="plain" color="neutral" onClick={() => router.push('/help')}>
									Help
								</Button>
								<Button
									variant="plain"
									color="neutral"
									onClick={() => {
										window.open(`https://discord.gg/JYMDCvmtfK`, '_blank', 'noopener,noreferrer');
									}}
								>
									Discord
								</Button>
							</Box>
							<Box sx={{ width: 280, display: 'flex', gap: 2, justifyContent: 'end' }}>
								{hasPermission(userData?.permissions, 'moderation') ? (
									<Button
										sx={{ flexShrink: 0 }}
										onClick={() => {
											router.push('/admin/console');
										}}
										startDecorator={<AdminPanelSettingsIcon />}
									>
										Admin Panel
									</Button>
								) : (
									<Dropdown>
										<MenuButton variant="plain">Donate</MenuButton>
										<Menu placement="bottom" variant="soft">
											<MenuItem>
												<ListItemDecorator>
													<OpenInNewIcon />
												</ListItemDecorator>
												<Link
													href="https://www.patreon.com/WILLATRONIX"
													target="_blank"
													rel="noopener noreferrer"
													overlay
													color="#FFF"
												>
													Patreon
												</Link>
											</MenuItem>
											<MenuItem>
												<ListItemDecorator>
													<OpenInNewIcon />
												</ListItemDecorator>
												<Link
													href="https://ko-fi.com/WILLATRONIX"
													target="_blank"
													rel="noopener noreferrer"
													overlay
													color="#FFF"
												>
													Ko-fi
												</Link>
											</MenuItem>
											<MenuItem>
												<ListItemDecorator>
													<OpenInNewIcon />
												</ListItemDecorator>
												<Link
													href="https://www.paypal.me/WILLATRONIX"
													target="_blank"
													rel="noopener noreferrer"
													overlay
													color="#FFF"
												>
													PayPal
												</Link>
											</MenuItem>
										</Menu>
									</Dropdown>
								)}
								{userLoggedIn && <Button onClick={() => router.push('/upload')}>Upload</Button>}
								{userLoggedIn ? (
									<Dropdown>
										<MenuButton
											variant="solid"
											color="primary"
											startDecorator={<AccountCircleOutlinedIcon />}
											sx={{ textWrap: 'nowrap' }}
										>
											{userData.username === userData.uuid ? 'Account' : userData.display_name}
										</MenuButton>
										<Menu placement="bottom" variant="soft">
											<MenuItem
												onClick={() => {
													router.push(`/u/${userData.username}`);
												}}
											>
												<ListItemDecorator>
													<AccountCircleOutlinedIcon />
												</ListItemDecorator>
												Profile
											</MenuItem>
											<MenuItem
												onClick={() => {
													router.push(`/u/${userData.username}#saved`);
												}}
											>
												<ListItemDecorator>
													<BookmarkBorderOutlinedIcon />
												</ListItemDecorator>
												Saved
											</MenuItem>
											<ListDivider />
											<MenuItem
												onClick={() => {
													setSettingsModalOpen(true);
												}}
											>
												<ListItemDecorator>
													<SettingsOutlinedIcon />
												</ListItemDecorator>
												Settings
											</MenuItem>
											<ListDivider />
											<MenuItem
												color="danger"
												onClick={() => {
													logoutUser();
												}}
											>
												<ListItemDecorator>
													<LogoutIcon />
												</ListItemDecorator>
												Logout
											</MenuItem>
										</Menu>
									</Dropdown>
								) : (
									<Button
										startDecorator={<LoginIcon />}
										onClick={() => {
											setLoginModalOpen(true);
										}}
									>
										Login
									</Button>
								)}
							</Box>
						</Box>
						{variant === 'browse' && (
							<BrowseNavbar onChange={handleMoreFilterChange} filterQuery={filterQuery} />
						)}
					</Box>
				</Box>
			</Sheet>
			<SettingsModal open={settingsModalOpen} setOpen={setSettingsModalOpen} defaultViewType={defaultViewType} />
			<LoginModal
				onSuccess={verifyToken}
				open={loginModalOpen}
				setOpen={setLoginModalOpen}
				onClose={() => setLoginModalOpen(false)}
			/>
		</Fragment>
	);
};

export default Navbar;
