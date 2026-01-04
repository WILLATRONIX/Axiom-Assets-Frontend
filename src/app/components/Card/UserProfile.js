'use client';

import { useState, useEffect, Fragment } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from 'lib/auth/authContext.js';
import { notFound } from 'next/navigation';

import AssetGrid from 'components/Grid/AssetGrid';
import { post } from 'lib/network';

import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import CircularProgress from '@mui/joy/CircularProgress';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Input from '@mui/joy/Input';
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';

function App({ userName }) {
	const [validUser, setValidUser] = useState(true);

	const [viewerUUID, setViewerUUID] = useState(null);
	const [userData, setUserData] = useState(null);

	const [userBadges, setUserBadges] = useState([]);

	const [viewType, setViewType] = useState('grid');
	const [assetView, setAssetView] = useState('owned');

	const [windowWidth, setWindowWidth] = useState(0);
	const [windowHeight, setWindowHeight] = useState(0);

	const [filterQuery, setFilterQuery] = useState({
		publisherData: { username: userName },
		type: 'all',
		header: '',
		order: [['date_created', 'DESC']],
	});

	const router = useRouter();
	const { user, loadingUser } = useAuth();

	const badgeMappings = {
		1: ['Beta Tester', 'neutral'],
		2: ['Creator', 'danger'],
		4: ['Most Downloads', 'warning'],
		8: ['Most Assets', 'warning'],
		16: ['Collector', 'warning'],
		32: ['Cat Connoisseur', 'danger'],
		64: ['Interior Designer', 'warning'],
		128: '128',
		256: '256',
		512: '512',
		1024: '1024',
		2048: '2048',
		4096: '4096',
		8192: '8192',
		16384: '16384',
	};

	const parseUserBadges = (badgeValue) => {
		const badges = [];
		let bit = 1;

		while (bit <= badgeValue) {
			if (badgeValue & bit && badgeMappings[bit]) {
				badges.push(badgeMappings[bit]);
			}
			bit <<= 1;
		}

		setUserBadges((prev) => [...prev, ...badges]);
	};

	const changeAssetView = (to) => {
		let newQuery;

		switch (to) {
			case 'saved':
				newQuery = {
					order: [['date_created', 'DESC']],
					isSaved: true,
				};
				break;
			case 'owned':
				newQuery = {
					publisher: userData.uuid,
					order: [['date_created', 'DESC']],
				};
				break;
			default:
				console.warn(`Unknown view type: ${to}`);
		}

		setFilterQuery(newQuery);
	};

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

	const handleFilterChange = (data) => {
		let displayOptions = JSON.parse(localStorage.getItem('do')) || {};

		if (data.viewType !== undefined && data.viewType !== viewType) {
			displayOptions.viewType = data.viewType;
			setViewType(data.viewType);
		}

		if (data.type !== undefined && data.type !== null) {
			displayOptions.itemType = data.type;
			setItemType(data.type);
		}

		localStorage.setItem('do', JSON.stringify(displayOptions));

		setFilterQuery({
			header: data.header,
			order: [[data.sortBy || filterQuery.order[0][0], data.sortOrder || filterQuery.order[0][1]]],
			type: data.type ?? itemType,
			tags: data.tags,
			tools: data.tools,
		});
	};

	useEffect(() => {
		if (user && !loadingUser) {
			setViewerUUID(user.uuid);
		}
	}, [user, loadingUser]);

	useEffect(() => {
		const handleResize = () => {
			const sidebarWidth = 330;
			setWindowWidth(window.innerWidth - sidebarWidth - 17);
			setWindowHeight(window.outerHeight);
		};

		handleResize();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useEffect(() => {
		if (window.location.hash == '#saved' && viewerUUID === userData) {
			setAssetView('saved');
			changeAssetView('saved');
		}
	}, []);

	const getUserInfo = async (name) => {
		try {
			const response = await post(`${process.env.NEXT_PUBLIC_API_URL}/get-user-info`, name);
			if (response.ok) {
				const data = response.data;
				setUserData(data.user);
				setValidUser(true);

				switch (data.user.permission_level) {
					case 0:
						setUserBadges((prev) => [...prev, ['Admin', 'primary']]);
						break;
					case 1:
						setUserBadges((prev) => [...prev, ['Moderator', 'success']]);
						break;

					default:
						break;
				}

				parseUserBadges(data.user.badge_value);
				return;
			}
			setValidUser(false);
		} catch (error) {
			console.warn('Unable to find user:', error);
			setValidUser(false);
		}
	};

	useEffect(() => {
		if (!userData) {
			getUserInfo({ username: userName });
		}
	}, []);

	if (!validUser) {
		notFound();
	}

	return (
		<Box sx={{ display: 'flex', flex: 1 }}>
			{userData ? (
				<Box
					sx={{
						height: 'calc(100% - 68px)',
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						gap: 2,
						pl: 2,
						mt: 1,
					}}
				>
					<Box
						sx={{
							width: '320px',
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							height: '100%',
						}}
					>
						<Card variant="soft" sx={{ height: '100%', width: '314px', p: 0 }}>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									flexDirection: 'column',
									gap: 2,
								}}
							>
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										flexDirection: 'column',
										gap: 2,
									}}
								>
									<AspectRatio
										ratio="1"
										sx={{
											minWidth: '100px',
											flexGrow: 1,
											borderRadius: 'sm',
										}}
									>
										<img
											src={`https://cdn.axiomassets.net/defaults/profile-img/256/${userData.image_id}.webp`}
											alt=""
											draggable={false}
											style={{
												pointerEvents: 'none',
												userSelect: 'none',
											}}
											onError={(e) => {
												e.target.src =
													'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
											}}
										/>
									</AspectRatio>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											flexShrink: 1,
											px: 2,
										}}
									>
										<Tooltip title={userData.display_name} variant="outlined" placement="top">
											<Typography
												level="h3"
												sx={{
													whiteSpace: 'nowrap',
													textOverflow: 'ellipsis',
													overflow: 'hidden',
													maxWidth: '184px',
												}}
											>
												{userData.display_name}
											</Typography>
										</Tooltip>
										<Typography
											level="body-sm"
											sx={{
												whiteSpace: 'nowrap',
												textOverflow: 'ellipsis',
												overflow: 'hidden',
												maxWidth: '184px',
											}}
										>
											@{userData.username}
										</Typography>
										<Divider
											sx={{
												margin: '0.25rem 0 0.5rem 0',
											}}
										/>
										<Typography
											level="body-sm"
											sx={{ whiteSpace: 'wrap', wordBreak: 'break-word' }}
										>
											{userData.about_me}
										</Typography>

										<Typography level="body-xs" sx={{ textAlign: 'end', mt: '0.8rem' }}>
											Joined&nbsp;
											<RelativeTime date={userData.date_created} />
										</Typography>
									</Box>
								</Box>
								<Box
									sx={{
										my: 2,
										px: 2,
									}}
								>
									{userBadges.length > 0 && (
										<>
											<Typography level="title-lg">Badges</Typography>
											<Divider
												sx={{
													margin: '0.25rem 0 0.5rem 0',
												}}
											/>
											<Box
												sx={{
													display: 'flex',
													gap: '10px',
													overflow: 'hidden',
													flexWrap: 'wrap',
												}}
											>
												{userBadges.map((badge) => {
													return (
														<Chip
															key={badge[0]}
															color={badge[1]}
															variant="solid"
															size="sm"
															sx={{
																userSelect: 'none',
															}}
														>
															{badge[0]}
														</Chip>
													);
												})}
											</Box>
										</>
									)}
								</Box>
							</Box>
						</Card>
						<Divider orientation="vertical" />
					</Box>
					<Box
						sx={{
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
						}}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								gap: 2,
								pr: 2,
								justifyContent: 'end',
							}}
						>
							<Input
								variant="soft"
								placeholder="Search..."
								sx={{ width: '100%' }}
								onChange={(e) => {
									setFilterQuery((prev) => ({
										...prev,
										header: e.target.value,
									}));
								}}
							/>
							<Select
								variant="soft"
								value={filterQuery.order[0][0]}
								sx={{ flexShrink: 0 }}
								onChange={(e, newValue) => {
									setFilterQuery((prev) => ({
										...prev,
										order: [[newValue, prev.order[0][1]]],
									}));
								}}
							>
								<Option value="downloads">Downloads</Option>
								<Option value="saves">Saves</Option>
								<Option value="date_created">Latest</Option>
								<Option value="metric">Size</Option>
							</Select>
							{viewerUUID === userData && (
								<ToggleButtonGroup
									sx={{ flexShrink: 0 }}
									value={assetView}
									onChange={(event, newValue) => {
										setAssetView(newValue || assetView);
										changeAssetView(newValue || assetView);
									}}
								>
									<Button value="owned">My Assets</Button>
									<Button value="saved">Saved</Button>
								</ToggleButtonGroup>
							)}
						</Box>
						<AssetGrid
							itemWidth={200}
							filterQuery={filterQuery}
							highlightSearchMatch={false}
							handleFilterChange={handleFilterChange}
						/>
					</Box>
				</Box>
			) : validUser ? (
				<Box
					sx={{
						flex: 1,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
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
					<Typography>User not found</Typography>
				</Box>
			)}
		</Box>
	);
}

export default App;
