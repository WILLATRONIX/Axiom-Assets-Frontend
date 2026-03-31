"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";

import { useAuth } from "lib/auth/authContext";
import { post } from "lib/network";
import { useNotification } from "lib/NotificationContext";

import {
	validateInput,
	emailInputRules,
	passwordInputRules,
	displayNameInputRules,
	aboutMeInputRules,
	usernameInputRules,
} from "lib/inputRequirements";
import InputRequirements from "components/Tooltip/InputRequirements";
import Navbar from "components/Navbar/Navbar";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";

import { Divider, FormLabel, Textarea, Tooltip } from "@mui/joy";
import { FormControl } from "@mui/base";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [aboutMe, setAboutMe] = useState("");

	const [aboutMeMarkdown, setAboutMeMarkdown] = useState("");
	const [isAboutMeFocused, setIsAboutMeFocused] = useState(false);

	const [validUsername, setValidUsername] = useState(true);
	const [validDisplayName, setValidDisplayName] = useState(true);
	const [validAboutMe, setValidAboutMe] = useState(true);

	const [usernameRequirements, setUsernameRequirements] = useState([]);
	const [displayNameRequirements, setDisplayNameRequirements] = useState([]);
	const [aboutMeRequirements, setAboutMeRequirements] = useState([]);

	const [userImageId, setUserImageId] = useState(null);
	const [nextImageId, setNextImageId] = useState(null);

	const [highlightInvalid, setHighlightInvalid] = useState(false);

	const [userData, setUserData] = useState(null);

	const router = useRouter();

	const { user, loading, fetchUserDetails } = useAuth();
	const { notify } = useNotification();

	const verifyToken = async () => {
		if (user && !loading) {
			setUserData(user);
			setUserImageId(user.image_id);

			if (user.state === "visitor") {
				router.push("/login");
			} else if (user.state === "authenticated") {
				router.push("/browse");
			} else if (user.state === "unverified") {
				router.push("/verify-email");
			}
		}
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	useEffect(() => {
		fetchUserDetails();
	}, []);

	useEffect(() => {
		if (nextImageId !== null) return;

		const first = getRandomId();

		const next = getRandomId(first);
		setNextImageId(next);
		preloadImage(next);
	}, [nextImageId]);

	const getRandomId = (exclude) => {
		let id;
		do {
			id = Math.floor(Math.random() * 276) + 1;
		} while (id === exclude);
		return id;
	};

	const preloadImage = (id) => {
		const img = new Image();
		img.src = `https://cdn.axiomassets.net/defaults/profile-img/256/${id}.webp`;
	};

	const handleShuffleImage = () => {
		setUserImageId(nextImageId);

		const next = getRandomId(nextImageId);
		setNextImageId(next);
		preloadImage(next);
	};

	const handleUsernameInputChange = (event) => {
		const newValue = event.target.value;
		setUsername(newValue);

		const { isValid, requirements } = validateInput(
			newValue,
			usernameInputRules,
		);

		setValidUsername(isValid);
		setUsernameRequirements(requirements);
	};

	const handleDisplayNameChange = (event) => {
		const newValue = event.target.value;
		setDisplayName(newValue);

		const { isValid, requirements } = validateInput(
			newValue,
			displayNameInputRules,
		);

		setValidDisplayName(isValid);
		setDisplayNameRequirements(requirements);
	};

	const handleAboutMeChange = async (event) => {
		const newValue = event.target.value;
		setAboutMe(newValue);

		const { isValid, requirements } = validateInput(
			newValue,
			aboutMeInputRules,
		);

		setValidAboutMe(isValid);
		setAboutMeRequirements(requirements);

		if (isValid) {
			const md = await marked(
				newValue.replace(/([^\n])\n(?!- )/g, "$1  <br>\n"),
			);
			setAboutMeMarkdown(md);
		}
	};

	const handleCreateClick = async () => {
		const { isValid: validUsername, requirements: usernameRequirements } =
			validateInput(username, usernameInputRules);

		const {
			isValid: validDisplayName,
			requirements: displayNameRequirements,
		} = validateInput(displayName, displayNameInputRules);

		const { isValid: validAboutMe, requirements: aboutMeRequirements } =
			validateInput(aboutMe, aboutMeInputRules);

		if (validUsername && validDisplayName && validAboutMe) {
			const userData = {
				username: username,
				display_name: displayName || username,
				about_me: aboutMe,
				about_me_md: aboutMeMarkdown,
				image_id: userImageId,
			};

			const creationStatus = await post("/auth/edit-user-data", {
				userData,
			});

			if (creationStatus.ok) {
				router.push("browse");
				await fetchUserDetails();
			} else {
				const errorData = creationStatus?.data;
				notify(`${errorData.message}: ${errorData?.reason}`, {
					color: "danger",
				});
			}
		} else {
			setUsernameRequirements(usernameRequirements);
			setDisplayNameRequirements(displayNameRequirements);
			setAboutMeRequirements(aboutMeRequirements);
			setValidUsername(validUsername);
			setValidDisplayName(validDisplayName);
			setValidAboutMe(validAboutMe);
			setHighlightInvalid(true);
		}
	};

	const handleCancelClick = async () => {
		try {
			await post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`);
			await fetchUserDetails();
			router.push("/login");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Box
			sx={{
				width: "100vw",
				height: "100vh",
				bgcolor: "background.surface",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1000,
					width: "100%",
					bgcolor:
						"color-mix(in srgb, var(--joy-palette-background-surface) 70%, transparent)",
					backdropFilter: "blur(48px)",
				}}
			>
				<Navbar context={"auth"} />
			</Box>
			<Box
				sx={{
					height: "100%",
					alignItems: "center",
					justifyContent: "center",
					display: "flex",
				}}
			>
				<Card
					sx={{
						display: "flex",
						gap: 2,
						p: 0,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Card
						variant={"plain"}
						sx={{
							display: "flex",
							gap: 2,
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Typography level={"title-lg"}>
							Create Account
						</Typography>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								flexDirection: "row",
								width: "100%",
								maxWidth: 500,
							}}
						>
							<Box
								sx={{
									display: "flex",
									gap: 1,
									flexDirection: "column",
									width: "50%",
								}}
							>
								<FormControl>
									<FormLabel>Username</FormLabel>
									<InputRequirements
										placement="left-end"
										required={usernameRequirements}
										open={
											!validUsername && username !== null
										}
									>
										<Input
											color={
												!validUsername &&
												highlightInvalid
													? "danger"
													: "neutral"
											}
											variant={"soft"}
											value={username || ""}
											onChange={handleUsernameInputChange}
											placeholder="username"
										/>
									</InputRequirements>
								</FormControl>
								<FormControl>
									<FormLabel>Display Name</FormLabel>
									<InputRequirements
										placement="left-start"
										required={displayNameRequirements}
										open={
											!validDisplayName &&
											displayName !== null
										}
									>
										<Input
											color={
												!validDisplayName &&
												highlightInvalid
													? "danger"
													: "neutral"
											}
											variant={"soft"}
											value={displayName || ""}
											onChange={handleDisplayNameChange}
											placeholder="display name"
										/>
									</InputRequirements>
								</FormControl>
								<FormControl>
									<FormLabel>About Me</FormLabel>
									<Tooltip
										open={
											validAboutMe &&
											aboutMe !== null &&
											aboutMe !== "" &&
											isAboutMeFocused
										}
										sx={{
											maxWidth: 300,
											maxHeight: 300,
											overflowY: "scroll",
											overflowX: "hidden",
										}}
										title={
											<Box>
												<Typography level="title-md">
													Markdown Preview
												</Typography>
												<Divider />
												<Box
													dangerouslySetInnerHTML={{
														__html: aboutMeMarkdown,
													}}
												/>
											</Box>
										}
										variant="soft"
										placement="left-start"
										placeholder="about me"
									>
										<InputRequirements
											placement="left-start"
											required={aboutMeRequirements}
											open={
												!validAboutMe &&
												aboutMe !== null
											}
										>
											<Textarea
												color={
													!validAboutMe &&
													highlightInvalid
														? "danger"
														: "neutral"
												}
												variant="soft"
												minRows={5}
												maxRows={5}
												value={aboutMe || ""}
												onChange={handleAboutMeChange}
												onFocus={() =>
													setIsAboutMeFocused(true)
												}
												onBlur={() =>
													setIsAboutMeFocused(false)
												}
											/>
										</InputRequirements>
									</Tooltip>
								</FormControl>
								<Button
									sx={{ width: "100%" }}
									variant="plain"
									onClick={handleCancelClick}
								>
									Cancel
								</Button>
							</Box>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 1,
									maxWidth: 220 - 2,
									width: "100%",
								}}
							>
								<FormControl>
									<FormLabel>Profile Image</FormLabel>
									<Button
										variant="soft"
										color="neutral"
										onClick={handleShuffleImage}
										sx={{ width: "100%" }}
									>
										Shuffle
									</Button>
								</FormControl>
								<img
									style={{
										borderRadius: "var(--joy-radius-md)",
										maxWidth: 220 - 2,
										width: "100%",
										transition: "opacity 120ms ease",
									}}
									src={
										userImageId !== null
											? `https://cdn.axiomassets.net/defaults/profile-img/256/${userImageId}.webp`
											: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
									}
								/>
								<Button
									sx={{ maxWidth: 220 - 2, width: "100%" }}
									onClick={handleCreateClick}
								>
									Create Account
								</Button>
							</Box>
						</Box>
					</Card>
				</Card>
			</Box>
		</Box>
	);
}
