"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import InputRequirements from "components/Tooltip/InputRequirements";
import { validateInput, emailInputRules } from "lib/inputRequirements";

import { get, post } from "lib/network";
import { useNotification } from "lib/NotificationContext";
import { useAuth } from "lib/auth/authContext";

import Navbar from "components/Navbar/Navbar";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Input from "@mui/joy/Input";
import Divider from "@mui/joy/Divider";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";

import VerifiedIcon from "@mui/icons-material/Verified";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const hasToken = searchParams.has("token");

	const [emailArray, setEmailArray] = useState([]);

	const [userData, setUserData] = useState(null);

	const [activeEmailEdit, setActiveEmailEdit] = useState(null);
	const [activeEmailEditInput, setActiveEmailEditInput] = useState(null);

	const [emailRequirements, setEmailRequirements] = useState([]);
	const [invalidEmail, setInvalidEmail] = useState(false);

	const [cooldownTimer, setCooldownTimer] = useState(0);

	const { user, loading, logout } = useAuth();
	const { notify } = useNotification();

	const hasUnverifiedEmail = emailArray?.some((e) => !e.verified);

	const verifyToken = async () => {
		if (user && !loading) {
			setUserData(user);
			if (user.state === "visitor") {
				router.push("/browse");
			}
		}
	};

	const getLinkedEmails = async () => {
		const res = await get("/auth/list-emails");
		setEmailArray(res.data.emails);
	};

	const verifyTokenCode = async (token) => {
		const res = await post("/auth/link-email", { token });
		await getLinkedEmails();
		if (res.ok) {
			notify(res.data.message);
			router.push("/verify-email");
		} else {
			notify(`Failed to link email: ${res.data.message}`, {
				color: "danger",
			});
		}
	};

	const startCooldown = () => {
		if (cooldownTimer > 0) return;

		setCooldownTimer(30);

		const interval = setInterval(() => {
			setCooldownTimer((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const handleVerifyClick = async (emailInfo) => {
		startCooldown();

		const res = await post("/auth/verify-email", {
			email: emailInfo.email,
		});

		if (res.ok) {
			notify(`Email code sent to ${emailInfo.email}`);
		} else {
			notify(`Failed to send code to ${emailInfo.email}`, {
				color: "danger",
			});
			setCooldownTimer(0);
			await getLinkedEmails();
		}
	};

	const handleUpdateEmailArray = async () => {
		const { isValid: validEmail, requirements: emailRequirements } =
			validateInput(activeEmailEditInput || "", emailInputRules);

		setEmailRequirements(emailRequirements);

		if (validEmail) {
			setEmailArray((prev) => {
				const index = prev.findIndex(
					(item) => item.email === activeEmailEdit,
				);
				if (index === -1) return prev;

				const copy = [...prev];
				copy[index] = {
					...copy[index],
					email: activeEmailEditInput,
				};
				return copy;
			});

			let res;

			if (activeEmailEdit === "") {
				res = await post("/auth/add-email", {
					email: activeEmailEditInput,
				});
			} else {
				res = await post("/auth/update-email", {
					email: activeEmailEdit,
					newEmail: activeEmailEditInput,
				});
			}

			if (res.ok) {
				notify(`Email successfully updated to ${activeEmailEditInput}`);
			} else {
				await getLinkedEmails();
				notify(`Failed to update email to ${activeEmailEditInput}`, {
					color: "danger",
				});
			}
		}
	};

	const handleUpdateEmailEditInput = () => {
		const { isValid: validEmail, requirements: emailRequirements } =
			validateInput(activeEmailEditInput || "", emailInputRules);

		setEmailRequirements(emailRequirements);

		if (validEmail) {
			setInvalidEmail(false);
		} else {
			setInvalidEmail(true);
		}
	};

	const handleAddEmailClick = () => {
		setActiveEmailEdit("");
		setActiveEmailEditInput("");
		setEmailArray((prev) => [
			...prev,
			{ email: "", verified: false, provider: "axiomassets" },
		]);
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	useEffect(() => {
		handleUpdateEmailEditInput();
	}, [activeEmailEditInput, activeEmailEdit]);

	useEffect(() => {
		if (hasToken) {
			const token = searchParams.get("token");
			verifyTokenCode(token);
		} else {
			getLinkedEmails();
		}
	}, [hasToken]);

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
					width: "100vw",
					height: "100%",
					alignItems: "center",
					justifyContent: "center",
					display: "flex",
				}}
			>
				<Box
					sx={{
						display: "flex",
						gap: 2,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Card
						variant={"outlined"}
						sx={{
							display: "flex",
							gap: 2,
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Typography level={"title-lg"}>
							Verify an Email
						</Typography>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								flexDirection: "column",
								width: "100%",
							}}
						>
							{emailArray?.length === 0 && (
								<Card
									variant="soft"
									sx={{
										p: 1.5,
										minWidth: 300,
										display: "flex",
										flexDirection: "row",
										alignItems: "center",
										gap: 8,
										justifyContent: "space-between",
									}}
								>
									You have no linked emails.
								</Card>
							)}
							{emailArray?.map((item) => {
								const isSelected =
									activeEmailEdit === item.email;

								const isLocal = item.provider === "axiomassets";
								const providerFormatted =
									item.provider.charAt(0).toUpperCase() +
									item.provider.slice(1) +
									" OAuth";

								return (
									<Card
										key={item.email}
										variant="soft"
										sx={{
											p: 1.5,
											minWidth: 300,
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											gap: 8,
											justifyContent: "space-between",
										}}
									>
										<Box
											sx={{
												display: "flex",
												flexDirection: "row",
												gap: 1,
											}}
										>
											{isSelected ? (
												<Box
													sx={{
														display: "flex",
														flexDirection: "row",
														gap: 1,
													}}
												>
													<InputRequirements
														required={
															emailRequirements
														}
														open={invalidEmail}
														placement="left-start"
													>
														<Input
															size="sm"
															value={
																activeEmailEditInput
															}
															onChange={(event) =>
																setActiveEmailEditInput(
																	event.target
																		.value,
																)
															}
														/>
													</InputRequirements>
													<Box
														sx={{
															display: "flex",
															alignItems:
																"center",
															gap: 1,
														}}
													>
														{activeEmailEdit !==
															"" &&
															activeEmailEdit !==
																null && (
																<IconButton
																	size="sm"
																	variant="plain"
																	onClick={() => {
																		setActiveEmailEdit(
																			null,
																		);
																	}}
																>
																	<CloseIcon />
																</IconButton>
															)}
														<IconButton
															size="sm"
															variant="solid"
															color="primary"
															disabled={
																invalidEmail
															}
															onClick={() => {
																setActiveEmailEdit(
																	null,
																);
																handleUpdateEmailArray();
															}}
														>
															<DoneIcon />
														</IconButton>
													</Box>
												</Box>
											) : (
												<Typography
													level="title-sm"
													sx={{
														alignItems: "center",
														gap: 1,
														display: "flex",
													}}
												>
													{item.verified && (
														<VerifiedIcon />
													)}
													{isLocal
														? item.email
														: providerFormatted}
												</Typography>
											)}
											{!isSelected && !item.verified && (
												<Tooltip
													title="Edit email"
													placement="top"
													variant="outlined"
												>
													<IconButton
														size="sm"
														variant="outlined"
														onClick={() => {
															setActiveEmailEdit(
																item.email,
															);
															setActiveEmailEditInput(
																item.email,
															);
														}}
													>
														<EditOutlinedIcon />
													</IconButton>
												</Tooltip>
											)}
										</Box>
										{!item.verified && (
											<Box
												sx={{ display: "flex", gap: 1 }}
											>
												<Button
													disabled={
														isSelected ||
														cooldownTimer > 0
													}
													size="sm"
													onClick={() =>
														handleVerifyClick(item)
													}
												>
													{cooldownTimer > 0 &&
														cooldownTimer}{" "}
													Send Code
												</Button>
											</Box>
										)}
									</Card>
								);
							})}
						</Box>
						<Divider
							sx={{
								width: "90%",
								mx: "auto",
								px: 2,
							}}
						/>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								width: "100%",
								gap: 4,
							}}
						>
							<Box sx={{ display: "flex", gap: 1 }}>
								<Button
									color="neutral"
									variant="plain"
									onClick={() => {
										logout();
										router.push("/browse");
									}}
								>
									Logout
								</Button>
								<Button
									color="neutral"
									variant="plain"
									onClick={() => router.push("/help")}
								>
									Help
								</Button>
							</Box>
							<Box sx={{ display: "flex", gap: 1 }}>
								{/* <Tooltip
									open={hasUnverifiedEmail && false}
									title="Requires all emails to be verified before you can add a new one."
									arrow
									variant="outlined"
									sx={{ maxWidth: 180, textAlign: "center" }}
								>
									<Button
										disabled={hasUnverifiedEmail}
										color="neutral"
										variant="soft"
										onClick={handleAddEmailClick}
										sx={{
											"&.Mui-disabled": {
												pointerEvents: "all",
											},
										}}
									>
										Add Email
									</Button>
								</Tooltip>*/}
								<Button
									disabled={hasUnverifiedEmail}
									color="primary"
									variant="solid"
									onClick={() => router.push("/browse")}
								>
									Browse Assets
								</Button>
							</Box>
						</Box>
					</Card>
				</Box>
			</Box>
		</Box>
	);
}
