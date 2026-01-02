import { formatDistanceToNow } from 'date-fns';

import InitColorSchemeScript from '@mui/joy/InitColorSchemeScript';
import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider } from '@mui/joy/styles';
import { AuthProvider } from 'api/auth/authContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from 'api/NotificationContext';
import { ContextMenuProvider } from 'api/MenuContext';

export async function generateMetadata() {
	const dateCreated = formatDistanceToNow(new Date('2024-11-24T19:27:51.263Z'), { addSuffix: true });

	const title = 'Axiom Asset Library';
	const description =
		'The largest collection of Minecraft resources and assets for the Axiom mod. Download Blueprints, Presets and Themes from multiple publishers.';

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: `https://axiomassets.net/browse`,
			type: 'article',
			publishedTime: dateCreated,
			authors: ['WILLATRONIX'],
			images: [
				{
					url: `https://axiomassets.net/256.png`,
					width: 96,
					height: 96,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary',
			title,
			description,
			images: [`https://axiomassets.net/256.png`],
		},
		alternates: {
			canonical: `https://axiomassets.net/browse`,
		},
	};
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<head>
				<meta property="og:type" content="website" />
				<meta property="og:logo" content="https://axiomassets.net/256.png" />
				<meta property="og:site_name" content="Axiom Asset Library" />
				<meta property="og:locale" content="en_US" />
				<meta name="darkreader-lock" />
				{/* <meta name="theme-color" content="#2D8AC8" /> */}
				<meta name="application-name" content="Axiom Asset Library" />
				<meta
					name="keywords"
					content="Axiom, Assets, Resources, Minecraft, Mod, Builds, Download, Upload, Share, Edit, WILLATRONIX, Blueprint, Preset, Theme, Pack, Schematic, Free"
				/>
				<meta name="robots" content="index, follow" />
				<meta charSet="UTF-8" />
				<meta httpEquiv="content-language" content="en" />
				<link rel="canonical" href="https://axiomassets.net/browse" />
				<InitColorSchemeScript defaultMode="dark" />
			</head>
			<body>
				<CssBaseline />
				<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID}>
					<AuthProvider>
						<NotificationProvider>
							<ContextMenuProvider>
								<CssVarsProvider defaultMode="dark">{children}</CssVarsProvider>
							</ContextMenuProvider>
						</NotificationProvider>
					</AuthProvider>
				</GoogleOAuthProvider>
			</body>
		</html>
	);
}
