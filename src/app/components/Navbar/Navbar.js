"use client";

import { useState, useEffect, Fragment } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { post } from "lib/network";
import { useAuth } from "lib/auth/authContext.js";
import { useNotification } from "lib/NotificationContext";
import { hasPermission } from "lib/permissionContext";
import { resetFilter } from "lib/searchFilter";

const SettingsModal = dynamic(() => import("components/Modal/Settings"));
const MaintenanceMessage = dynamic(
	() => import("components/Modal/Maintainance"),
);

import BrowseNavbar from "components/Navbar/BrowseNavbar";

import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import ListDivider from "@mui/joy/ListDivider";
import Link from "@mui/joy/Link";
import Dropdown from "@mui/joy/Dropdown";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LoginIcon from "@mui/icons-material/Login";

const Navbar = ({
	initialUserData,
	onChange = () => {},
	context,
	defaultViewType,
}) => {
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);

	const [userData, setUserData] = useState(initialUserData);

	const [maintainenceMessageOpen, setMaintainenceMessageOpen] = useState(
		process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
	);

	const router = useRouter();
	const { notify } = useNotification();
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
			let validUserData = true;

			switch (user.state) {
				case "onboarding":
					router.push("/create-account");
					break;
				case "authenticated":
					break;
				case "visitor":
					break;
				case "unverified":
					router.push("/verify-email");
					break;
				default:
					validUserData = false;
					console.error("unknown user state: ", user.state);
			}

			if (validUserData) {
				setUserData(user);
			} else {
				notify("Failed to sign in", { color: "danger" });
				logoutUser();
			}
		}
	};

	const handleSaveMaintainenceBypass = () => {
		localStorage.setItem("bypassMaintanenceMessage", "true");
		setMaintainenceMessageOpen(false);
	};

	useEffect(() => {
		const state = localStorage.getItem("bypassMaintanenceMessage");
		if (state === "true") {
			setMaintainenceMessageOpen(false);
		}
	}, []);

	useEffect(() => {
		if (!user) {
			fetchUserDetails();
		}
		verifyToken();
	}, [user, loading, userData]);

	return (
		<Fragment>
			{maintainenceMessageOpen && (
				<MaintenanceMessage
					open={maintainenceMessageOpen}
					setOpen={setMaintainenceMessageOpen}
					onClose={handleSaveMaintainenceBypass}
				/>
			)}
			<Sheet
				sx={{
					width: "100vw",
					display: "flex",
					flexDirection: "row",
					pointerEvents: "all",
					overflow: "auto",
					py: 2,
					px: 2,
					flexShrink: 0,
					backgroundColor: "transparent",
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: "1rem",
							height: "100%",
						}}
					>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "space-between",
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "start",
									alignItems: "center",
									width: 280,
									position: "relative",
								}}
							>
								<img
									src={
										"https://cdn.axiomassets.net/defaults/icons/32.webp"
									}
									loading="lazy"
									width={32}
									height={32}
								/>
								<Link
									overlay
									sx={{
										fontWeight: "bold",
										textWrap: "nowrap",
										ml: "0.4rem",
									}}
									level="h3"
									color="#FFFFFF"
									underline="none"
									tabIndex={0}
									onClick={() => {
										router.push("/browse");
										resetFilter();
									}}
								>
									Axiom Asset Library
								</Link>
								<Typography
									level="body-xs"
									sx={{
										alignSelf: "end",
										flexShrink: 0,
										ml: 1,
									}}
								>
									by WILLATRONIX
								</Typography>
							</Box>
							<Box sx={{ gap: 2, display: "flex" }}>
								<Button
									variant="plain"
									color="neutral"
									onClick={() => router.push("/help")}
								>
									Guide
								</Button>
								<Dropdown>
									<MenuButton
										variant="plain"
										startDecorator={<ExpandMoreIcon />}
									>
										Support
									</MenuButton>
									<Menu placement="bottom" variant="soft">
										<MenuItem>
											<ListItemDecorator>
												<OpenInNewIcon />
											</ListItemDecorator>
											<Link
												href="https://discord.gg/JYMDCvmtfK"
												target="_blank"
												rel="noopener noreferrer"
												overlay
												color="#FFF"
											>
												Discord
											</Link>
										</MenuItem>
										<MenuItem>
											<ListItemDecorator>
												<OpenInNewIcon />
											</ListItemDecorator>
											<Link
												href="https://github.com/WILLATRONIX/Axiom-Assets-Frontend"
												target="_blank"
												rel="noopener noreferrer"
												overlay
												color="#FFF"
											>
												GitHub
											</Link>
										</MenuItem>
									</Menu>
								</Dropdown>
							</Box>
							<Box
								sx={{
									width: 280,
									display: "flex",
									gap: 2,
									justifyContent: "end",
								}}
							>
								{hasPermission(
									userData?.permissions,
									"moderation",
								) ? (
									<Button
										sx={{ flexShrink: 0 }}
										onClick={() => {
											router.push("/admin/console");
										}}
										startDecorator={
											<AdminPanelSettingsIcon />
										}
									>
										Admin Panel
									</Button>
								) : (
									<Dropdown>
										<MenuButton
											variant="plain"
											startDecorator={<ExpandMoreIcon />}
										>
											Donate
										</MenuButton>
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
								{userData?.state === "authenticated" && (
									<Button
										onClick={() => router.push("/upload")}
									>
										Upload
									</Button>
								)}
								{userData?.state === "authenticated" ? (
									<Dropdown>
										<MenuButton
											variant="solid"
											color="primary"
											startDecorator={
												<AccountCircleOutlinedIcon />
											}
											sx={{ textWrap: "nowrap" }}
										>
											{userData.username === userData.uuid
												? "Account"
												: userData.display_name}
										</MenuButton>
										<Menu placement="bottom" variant="soft">
											<MenuItem
												onClick={() => {
													router.push(
														`/u/${userData.username}`,
													);
												}}
											>
												<ListItemDecorator>
													<AccountCircleOutlinedIcon />
												</ListItemDecorator>
												Profile
											</MenuItem>
											<MenuItem
												onClick={() => {
													router.push(
														`/u/${userData.username}#saved`,
													);
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
									context !== "auth" && (
										<Button
											startDecorator={<LoginIcon />}
											onClick={() => {
												router.push("/login");
											}}
										>
											Login
										</Button>
									)
								)}
							</Box>
						</Box>
						{context === "browse" && (
							<BrowseNavbar onChange={handleMoreFilterChange} />
						)}
					</Box>
				</Box>
			</Sheet>
			<SettingsModal
				open={settingsModalOpen}
				setOpen={setSettingsModalOpen}
				defaultViewType={defaultViewType}
			/>
		</Fragment>
	);
};

export default Navbar;
