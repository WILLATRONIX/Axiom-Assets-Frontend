"use client";

import { useState, useEffect, Fragment } from "react";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

import { useAuth } from "lib/auth/authContext.js";
import { getFilter, setFilter, subscribeFilter } from "lib/searchFilter";
import { post } from "lib/network";

import DebouncedInput from "components/Input/DebouncedInput";
import AssetGrid from "components/Grid/AssetGrid";

import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import AspectRatio from "@mui/joy/AspectRatio";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";
import CircularProgress from "@mui/joy/CircularProgress";
import ToggleButtonGroup from "@mui/joy/ToggleButtonGroup";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Card from "@mui/joy/Card";

function App({ userName }) {
	const [validUser, setValidUser] = useState(true);

	const [viewerUUID, setViewerUUID] = useState(null);
	const [userData, setUserData] = useState(null);

	const [userBadges, setUserBadges] = useState([]);

	const [assetView, setAssetView] = useState("owned");
	const [searchFilter, setSearchFilter] = useState();

	const [searchInputValue, setSearchInputValue] = useState("");

	const [sortBy, setSortBy] = useState("date_created");
	const [sortOrder, setSortOrder] = useState("desc");

	const { user, loadingUser } = useAuth();

	const badgeMappings = {
		1: ["Beta Tester", "neutral"],
		2: ["Creator", "danger"],
		4: ["Most Downloads", "warning"],
		8: ["Most Assets", "warning"],
		16: ["Collector", "warning"],
		32: ["Cat Connoisseur", "danger"],
		64: ["Interior Designer", "warning"],
		128: "128",
		256: "256",
		512: "512",
		1024: "1024",
		2048: "2048",
		4096: "4096",
		8192: "8192",
		16384: "16384",
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

	const getRelativeTime = (date) => {
		const parsedDate = new Date(date);
		return formatDistanceToNow(parsedDate, { addSuffix: true }).replace(
			/^about\s/,
			"",
		);
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

	const handleDebouncedSearch = (event) => {
		const newValue = event.target.value.trim();
		const current = getFilter();

		const baseFilter = [
			{ field: "visibility", op: "eq", value: "public" },
			{ field: "publisher.username", op: "eq", value: userName },
		];

		const newFilter = {
			...current,
			filter:
				newValue === ""
					? { and: baseFilter }
					: {
							and: [
								...baseFilter,
								{
									field: "header",
									op: "like",
									value: newValue,
								},
							],
						},
		};

		setFilter(newFilter);
	};

	const handleSortByChange = (event, newValue) => {
		const current = getFilter();
		const newFilter = {
			...current,
			sort: [{ field: newValue, direction: sortOrder }],
		};
		setSortBy(newValue);
		setFilter(newFilter);
	};

	useEffect(() => {
		const unsubscribe = subscribeFilter((newFilter) => {
			setSearchFilter(newFilter);
			setSortBy(newFilter.sort[0]?.field || "date_created");
			setSortOrder(newFilter.sort[0]?.direction || "desc");
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (user && !loadingUser) {
			setViewerUUID(user.uuid);
		}
	}, [user, loadingUser]);

	useEffect(() => {
		if (window.location.hash == "#saved" && viewerUUID === userData) {
			setAssetView("saved");
			changeAssetView("saved");
		}
	}, []);

	const getUserInfo = async (name) => {
		try {
			const response = await post(
				`${process.env.NEXT_PUBLIC_API_URL}/get-user-info`,
				name,
			);
			if (response.ok) {
				const data = response.data;
				setUserData(data.user);
				setValidUser(true);

				switch (data.user.permission_level) {
					case 0:
						setUserBadges((prev) => [
							...prev,
							["Admin", "primary"],
						]);
						break;
					case 1:
						setUserBadges((prev) => [
							...prev,
							["Moderator", "success"],
						]);
						break;

					default:
						break;
				}

				parseUserBadges(data.user.badge_value);
				return;
			}
			setValidUser(false);
		} catch (error) {
			console.warn("Unable to find user:", error);
			setValidUser(false);
		}
	};

	useEffect(() => {
		if (!userData) {
			getUserInfo({ username: userName });
		}
	}, []);

	useEffect(() => {
		const currentFilter = getFilter();
		setFilter({
			...currentFilter,
			filter: {
				and: [
					{ field: "visibility", op: "eq", value: "public" },
					{ field: "publisher.username", op: "eq", value: userName },
				],
			},
		});
	}, []);

	if (!validUser) {
		notFound();
	}

	return (
		<Box sx={{ display: "flex", flex: 1 }}>
			{userData ? (
				<Box
					sx={{
						height: "calc(100% - 68px)",
						width: "100%",
						display: "flex",
						flexDirection: "row",
						gap: 2,
						pl: 2,
						mt: 1,
					}}
				>
					<Box
						sx={{
							width: "320px",
							display: "flex",
							flexDirection: "column",
							gap: 2,
							height: "100%",
						}}
					>
						<Card
							variant="soft"
							sx={{ height: "100%", width: "314px", p: 0 }}
						>
							<Box
								sx={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									gap: 2,
								}}
							>
								<Box
									sx={{
										width: "100%",
										display: "flex",
										flexDirection: "column",
										gap: 2,
									}}
								>
									<AspectRatio
										ratio="1"
										sx={{
											minWidth: "100px",
											flexGrow: 1,
											borderRadius: "sm",
										}}
									>
										<img
											src={`https://cdn.axiomassets.net/defaults/profile-img/256/${userData.image_id}.webp`}
											alt=""
											draggable={false}
											style={{
												pointerEvents: "none",
												userSelect: "none",
											}}
											onError={(e) => {
												e.target.src =
													"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
											}}
										/>
									</AspectRatio>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											flexShrink: 1,
											px: 2,
										}}
									>
										<Tooltip
											title={userData.display_name}
											variant="outlined"
											placement="top"
										>
											<Typography
												level="h3"
												sx={{
													whiteSpace: "nowrap",
													textOverflow: "ellipsis",
													overflow: "hidden",
													maxWidth: "184px",
												}}
											>
												{userData.display_name}
											</Typography>
										</Tooltip>
										<Typography
											level="body-sm"
											sx={{
												whiteSpace: "nowrap",
												textOverflow: "ellipsis",
												overflow: "hidden",
												maxWidth: "184px",
											}}
										>
											@{userData.username}
										</Typography>
										<Divider
											sx={{
												margin: "0.25rem 0 0.5rem 0",
											}}
										/>
										<Box
											sx={{
												whiteSpace: "wrap",
												wordBreak: "break-word",
												"& > *": { my: 0 },
											}}
											dangerouslySetInnerHTML={{
												__html: userData.about_me_md,
											}}
										></Box>

										<Typography
											level="body-xs"
											sx={{
												textAlign: "end",
												mt: "0.8rem",
											}}
										>
											Joined&nbsp;
											<RelativeTime
												date={userData.date_created}
											/>
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
											<Typography level="title-lg">
												Badges
											</Typography>
											<Divider
												sx={{
													margin: "0.25rem 0 0.5rem 0",
												}}
											/>
											<Box
												sx={{
													display: "flex",
													gap: "10px",
													overflow: "hidden",
													flexWrap: "wrap",
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
																userSelect:
																	"none",
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
							width: "100%",
							height: "100%",
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								gap: 2,
								pr: 2,
								justifyContent: "end",
							}}
						>
							<DebouncedInput
								placeholder="Search"
								sx={{
									width: "100%",
									// pl: 0,
									backgroundColor:
										"color-mix(in srgb, var(--joy-palette-neutral-softBg) 100%, transparent 30%)",
								}}
								variant="soft"
								debounceTimeout={200}
								value={searchInputValue}
								onChange={(event) =>
									setSearchInputValue(event.target.value)
								}
								onDebounce={handleDebouncedSearch}
							/>
							<Select
								variant="soft"
								value={sortBy}
								sx={{ flexShrink: 0 }}
								onChange={handleSortByChange}
							>
								<Option value="downloads">Downloads</Option>
								<Option value="saves">Saves</Option>
								<Option value="date_created">Latest</Option>
								<Option value="metric">Size</Option>
								<Option value="header">Title</Option>
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
							highlightSearchMatch={false}
							// filterOverride={{
							// 	filter: {
							// 		and: [
							// 			{ field: 'visibility', op: 'eq', value: 'public' },
							// 			{ field: 'publisher.username', op: 'eq', value: userName },
							// 		],
							// 	},
							// 	sort: [{ field: 'date_created', direction: 'desc' }],
							// 	savedOnly: false,
							// }}
						/>
					</Box>
				</Box>
			) : validUser ? (
				<Box
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<CircularProgress />
				</Box>
			) : (
				<Box
					sx={{
						width: "100%",
						height: "60%",
						justifyContent: "center",
						alignItems: "center",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Typography>User not found</Typography>
				</Box>
			)}
		</Box>
	);
}

export default App;
