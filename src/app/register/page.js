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
	emailInputRules,
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
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordRetype, setPasswordRetype] = useState("");

	const [validEmail, setValidEmail] = useState(true);
	const [validPassword, setValidPassword] = useState(true);
	const [passwordRetypeMatches, setPasswordRetypeMatches] = useState(true);

	const [passwordVisible, setPasswordVisible] = useState(false);
	const [showInputErrors, setShowInputErrors] = useState(false);

	const [emailRequirements, setEmailRequirements] = useState([]);
	const [passwordRequirements, setPasswordRequirements] = useState([]);

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

	const handleRegisterClick = async () => {
		const { isValid: validEmail, requirements: emailRequirements } =
			validateInput(email, emailInputRules);

		const { isValid: validPassword, requirements: passwordRequirements } =
			validateInput(password, passwordInputRules);

		if (validEmail && validPassword && passwordRetypeMatches) {
			setShowInputErrors(false);
			setValidEmail(true);
			setValidPassword(true);
			const res = await post(`/auth/register/axiomassets`, {
				email: email,
				password: password,
			});
			if (res.ok) {
				await fetchUserDetails();
			} else {
				notify(`Failed to register: ${res.data.error}`, {
					color: "danger",
				});
			}
		} else {
			setShowInputErrors(true);
			setValidEmail(validEmail);
			setValidPassword(validPassword);
			setEmailRequirements(emailRequirements);
			setPasswordRequirements(passwordRequirements);
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

		setPasswordRequirements(requirements);
		setValidPassword(isValid);
	};

	const handleEmailInputChange = (event) => {
		const newValue = event.target.value;
		setEmail(newValue);

		const { isValid, requirements } = validateInput(
			newValue,
			emailInputRules,
		);

		setEmailRequirements(requirements);
		setValidEmail(isValid);
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
						<Typography level={"title-lg"}>Register</Typography>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								flexDirection: "column",
							}}
						>
							<FormControl>
								<FormLabel>Email</FormLabel>
								<InputRequirements
									required={emailRequirements}
									open={showInputErrors && !validEmail}
									placement="right-end"
								>
									<Input
										placeholder={"email"}
										variant={"soft"}
										color={
											showInputErrors && !validEmail
												? "danger"
												: "neutral"
										}
										value={email}
										onChange={handleEmailInputChange}
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
							<FormControl>
								<FormLabel>Re-enter Password</FormLabel>
								<InputRequirements
									required={[
										{
											label: "Password does not match",
											value: false,
										},
									]}
									open={!passwordRetypeMatches}
								>
									<Input
										placeholder={"re-enter password"}
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
										value={passwordRetype}
										onChange={(event) => {
											const newValue = event.target.value;

											setPasswordRetypeMatches(
												newValue === password,
											);

											setPasswordRetype(newValue);
										}}
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
							or register with
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
								Already have an account?&nbsp;
								<NextLink href={"/login"}>login</NextLink>
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
							<Button onClick={handleRegisterClick}>
								Register
							</Button>
						</Box>
					</Card>
				</Box>
			</Box>
		</Box>
	);
}
