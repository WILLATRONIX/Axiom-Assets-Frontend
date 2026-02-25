"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

import { post } from "lib/network";
import { useNotification } from "lib/NotificationContext";
import { useAuth } from "lib/auth/authContext";
import { msalInstance, initializeMsal } from "lib/msalConfig";
import {
	validateInput,
	usernameInputRules,
	passwordInputRules,
} from "lib/inputRequirements";

import InputRequirements from "components/Tooltip/InputRequirements";
import Navbar from "components/Navbar/Navbar";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Input from "@mui/joy/Input";
import Divider from "@mui/joy/Divider";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/joy/IconButton";
import GoogleIcon from "@mui/icons-material/Google";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { FormControl, FormLabel } from "@mui/joy";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const [validUsername, setValidUsername] = useState(true);
	const [validPassword, setValidPassword] = useState(true);

	const [passwordVisible, setPasswordVisible] = useState(false);
	const [showInputErrors, setShowInputErrors] = useState(false);

	const usernameRequirements = [
		{
			label: "Invalid Username or Email",
			value: false,
		},
	];
	const passwordRequirements = [
		{
			label: "Invalid Password",
			value: false,
		},
	];

	const [userData, setUserData] = useState(null);

	const { user, loading, fetchUserDetails } = useAuth();
	const { notify } = useNotification();
	const router = useRouter();

	const verifyToken = async () => {
		if (user && !loading) {
			setUserData(user);
		}
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	const handleLoginClick = async () => {
		const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

		const { isValid: validUsername, requirements: usernameRequirements } =
			validateInput(username, usernameInputRules);

		const { isValid: validPassword, requirements: passwordRequirements } =
			validateInput(password, passwordInputRules);

		if ((validUsername || validEmail) && validPassword) {
			setShowInputErrors(false);
			setValidUsername(true);
			setValidPassword(true);

			const res = await post(`/auth/axiomassets`, {
				usernameOrEmail: username,
				password: password,
			});

			if (res.ok) {
				await fetchUserDetails();
				router.push("/browse");
			} else {
				notify(`Failed to login: ${res.data.error}`, {
					color: "danger",
				});
			}
		} else {
			setShowInputErrors(true);
			setValidUsername(validUsername || validEmail);
			setValidPassword(validPassword);
		}
	};

	const handleGoogleSuccess = async (response) => {
		const res = await post(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
			{
				access_token: response.access_token,
			},
		);

		if (res.ok) {
			await fetchUserDetails();
		} else {
			notify("Failed to sign in with Google", { color: "danger" });
		}
	};

	const handleGoogleLogin = useGoogleLogin({
		onSuccess: (tokenResponse) => handleGoogleSuccess(tokenResponse),
		onError: () => {
			notify("Google sign-in failed. Please try again.", {
				color: "danger",
			});
		},
	});

	const handleMicrosoftLogin = async () => {
		try {
			await initializeMsal();

			const loginResponse = await msalInstance.loginPopup({
				scopes: ["User.Read"],
				prompt: "select_account",
			});

			const accessToken = loginResponse.accessToken;

			const res = await post(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`,
				{
					access_token: accessToken,
				},
			);

			if (res.ok) {
				await fetchUserDetails();
			} else {
				notify("Failed to sign in with Microsoft", { color: "danger" });
			}
		} catch (error) {
			notify("Failed to sign in with Microsoft", { color: "danger" });
			console.error(error);
		}
	};

	const handleDiscordLogin = () => {
		try {
			const clientId = process.env.NEXT_PUBLIC_DISCORD_AUTH_CLIENT_ID;
			const redirectUri = encodeURIComponent(
				process.env.NEXT_PUBLIC_DISCORD_AUTH_CALLBACK_URI,
			);
			const scope = encodeURIComponent("identify email");
			const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=consent`;

			window.location.href = discordAuthUrl;
		} catch (error) {
			notify("Failed to sign in with Discord", { color: "danger" });
			console.error(error);
		}
	};

	const handlePasswordInputChange = (event) => {
		const newValue = event.target.value;
		setPassword(newValue);

		const { isValid, requirements } = validateInput(
			newValue,
			passwordInputRules,
		);

		setValidPassword(isValid);
	};

	const handleUsernameInputChange = (event) => {
		const newValue = event.target.value;
		setUsername(newValue);

		const { isValid, requirements } = validateInput(
			newValue,
			usernameInputRules,
		);

		const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue);

		setValidUsername(isValid || validEmail);
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
						<Typography level={"title-lg"}>Login</Typography>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								flexDirection: "column",
							}}
						>
							<FormControl>
								<FormLabel>Username or Email</FormLabel>
								<InputRequirements
									required={usernameRequirements}
									open={showInputErrors && !validUsername}
								>
									<Input
										placeholder={"username"}
										variant={"soft"}
										color={
											showInputErrors && !validUsername
												? "danger"
												: "neutral"
										}
										value={username}
										onChange={handleUsernameInputChange}
									/>
								</InputRequirements>
							</FormControl>
							<FormControl>
								<FormLabel>Password</FormLabel>
								<InputRequirements
									required={passwordRequirements}
									open={showInputErrors && !validPassword}
								>
									<Input
										placeholder={"password"}
										variant={"soft"}
										color={
											showInputErrors && !validPassword
												? "danger"
												: "neutral"
										}
										type={
											passwordVisible
												? "text"
												: "password"
										}
										value={password}
										onChange={handlePasswordInputChange}
										endDecorator={
											<IconButton
												onClick={() =>
													setPasswordVisible(
														(prev) => !prev,
													)
												}
											>
												{passwordVisible ? (
													<VisibilityIcon />
												) : (
													<VisibilityOffIcon />
												)}
											</IconButton>
										}
									/>
								</InputRequirements>
							</FormControl>
						</Box>
						<Divider
							sx={{
								width: { xs: "90%", sm: 300 },
								mx: "auto",
								px: 2,
								textAlign: "center",
							}}
						>
							or login with
						</Divider>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								flexDirection: "column",
								alignItems: "center",
								width: "100%",
								"& > *": { maxWidth: 200, width: "100%" },
							}}
						>
							<Button
								variant={"outlined"}
								color={"neutral"}
								startDecorator={<GoogleIcon />}
								onClick={handleGoogleLogin}
							>
								Google
							</Button>
							<Button
								variant={"outlined"}
								color={"neutral"}
								startDecorator={<SportsEsportsIcon />}
								onClick={handleDiscordLogin}
							>
								Discord
							</Button>
							<Button
								variant={"outlined"}
								color={"neutral"}
								startDecorator={<MicrosoftIcon />}
								onClick={handleMicrosoftLogin}
							>
								Microsoft
							</Button>
						</Box>
						<Divider
							sx={{
								width: { xs: "90%", sm: 300 },
								mx: "auto",
								px: 2,
							}}
						/>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								justifyContent: "space-between",
							}}
						>
							<Typography level={"body-sm"}>
								Don't have an account?&nbsp;
								<NextLink href={"/register"}>register</NextLink>
							</Typography>
						</Box>
						<Divider
							sx={{
								width: { xs: "90%", sm: 300 },
								mx: "auto",
								px: 2,
							}}
						/>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								width: "100%",
							}}
						>
							<Box
								sx={{
									display: "flex",
									gap: 1,
								}}
							>
								<Button
									color="neutral"
									variant="soft"
									onClick={() => router.push("/browse")}
								>
									Cancel
								</Button>
								<Button
									color="neutral"
									variant="plain"
									onClick={() => router.push("/help")}
								>
									Help
								</Button>
							</Box>
							<Button onClick={handleLoginClick}>Login</Button>
						</Box>
					</Card>
				</Box>
			</Box>
		</Box>
	);
}
