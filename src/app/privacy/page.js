'use client';

import { useState, useEffect } from 'react';

import NavbarTest from 'components/Navbar/Navbar';

import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import Sheet from '@mui/joy/Sheet';

function App() {
	return (
		<Box
			sx={{
				overflow: 'hidden',
				width: '100vw',
				height: '100vh',
				bgcolor: 'background.surface',
			}}
		>
			<NavbarTest />
			<Box
				sx={{
					overflow: 'auto',
					height: '100%',
					mt: '1rem'
				}}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						mb: '5rem',
						display: 'flex',
						height: 'auto',
					}}
				>
					<Card
						sx={{
							bgcolor: 'var(--joy-palette-background-level1)',
							width: {
								xs: '100%',
								sm: '70%',
								md: '50%',
								lg: '40%',
							},
							maxWidth: '800px',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
							height: '100%',
							border: 'none',
							gap: '1rem',
						}}
					>
						<Typography sx={{ textAlign: 'center' }} level="h1">
							Privacy Notice
						</Typography>
						<Divider sx={{ marginInline: '1rem' }} />
						<Typography>Last updated: 12 March 2025</Typography>
						<Typography level="h4" fontWeight={900}>
							1 - Introduction
						</Typography>
						<Typography>
							The Axiom Asset Library ("we", "our" or "us") ensures your privacy and personal data is
							handled securely and in compliance with applicable data protection laws.
						</Typography>
						<Typography level="h4" fontWeight={900}>
							2 - Information We Collect
						</Typography>
						<Typography>
							When you use our website, we may collect the following types of information:
						</Typography>
						<Box sx={{ paddingInline: '2rem', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
							<Box
								sx={{
									display: 'flex',
									flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
									justifyContent: 'space-between',
									gap: '1rem',
								}}
							>
								<Typography fontWeight={900} sx={{ flexShrink: { xs: 1, sm: 1, md: 0, lg: 0 } }}>
									Account Information:
								</Typography>
								<Typography
									sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}
								>
									When you create an account, we collect your Google Identifier and the information
									you provide such as your username and about me.
								</Typography>
							</Box>
							<Divider />
							<Box
								sx={{
									display: 'flex',
									flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
									justifyContent: 'space-between',
									gap: '1em',
								}}
							>
								<Typography fontWeight={900} sx={{ flexShrink: { xs: 1, sm: 1, md: 0, lg: 0 } }}>
									Uploaded Content and Metadata:
								</Typography>
								<Typography
									sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}
								>
									Any files or content that follow the correct data format uploaded to our platform
									are processed and stored. Additionally, we store metadata related to uploaded
									assets, including titles, descriptions, tags, theme settings, version history, and
									ownership details. This information is linked to the account that uploaded the
									asset.
								</Typography>
							</Box>
							<Divider />
							<Box
								sx={{
									display: 'flex',
									flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
									justifyContent: 'space-between',
									gap: '1em',
								}}
							>
								<Typography fontWeight={900} sx={{ flexShrink: { xs: 1, sm: 1, md: 0, lg: 0 } }}>
									Communication Data:
								</Typography>
								<Typography
									sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}
								>
									If you send a report, we collect the information for up to a year unless requested
									otherwise by the creator of the report.
								</Typography>
							</Box>
							<Divider />
							<Box
								sx={{
									display: 'flex',
									flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
									justifyContent: 'space-between',
									gap: '1em',
								}}
							>
								<Typography fontWeight={900} sx={{ flexShrink: { xs: 1, sm: 1, md: 0, lg: 0 } }}>
									User Activity:
								</Typography>
								<Typography
									sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}
								>
									We track account activity, including login and interaction timestamps, (e.g., saving
									assets, uploading an asset or the last time you used the site). This data allows us
									to improve our service with necessary security.
								</Typography>
							</Box>
						</Box>
						<Typography level="h4" fontWeight={900}>
							3 - How We Use Your Information
						</Typography>
						<Typography>We use the collected information for the following purposes:</Typography>
						<Box
							sx={{
								paddingInline: '2rem',
								gap: '0.5rem',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- To provide and maintain our services.
							</Typography>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- To track user activity for security and service enhancements.
							</Typography>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- To comply with legal obligations.
							</Typography>
						</Box>
						<Typography level="h4" fontWeight={900}>
							4 - Data Sharing and Third Parties
						</Typography>
						<Typography>
							We do not sell your personal data. However, we may share your information in the following
							cases:
						</Typography>
						<Box sx={{ paddingInline: '2rem', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
							<Box
								sx={{
									display: 'flex',
									flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
									justifyContent: 'space-between',
									gap: '1rem',
								}}
							>
								<Typography fontWeight={900} sx={{ flexShrink: { xs: 1, sm: 1, md: 0, lg: 0 } }}>
									Service Providers:
								</Typography>
								<Typography
									sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}
								>
									With third-party service providers who help us operate our website (e.g., cloud
									storage, analytics, and security services).
								</Typography>
							</Box>
							<Divider />
							<Box
								sx={{
									display: 'flex',
									flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
									justifyContent: 'space-between',
									gap: '1em',
								}}
							>
								<Typography fontWeight={900} sx={{ flexShrink: { xs: 1, sm: 1, md: 0, lg: 0 } }}>
									Legal Requirements:
								</Typography>
								<Typography
									sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}
								>
									If required by law or to protect our rights and users.
								</Typography>
							</Box>
						</Box>
						<Typography level="h4" fontWeight={900}>
							5 - Data Retention
						</Typography>
						<Typography>
							We retain your information for as long as necessary to provide our services and comply with
							legal obligations. You may request the deletion of your account and associated data by
							deleting your account using the Account Settings or by contacting us. Some metadata (e.g.,
							tags and contributors), may be retained for security and operational purposes.
						</Typography>
						<Typography level="h4" fontWeight={900}>
							6 - Your Rights
						</Typography>
						<Typography>Depending on your location, you may have the right to:</Typography>
						<Box
							sx={{
								paddingInline: '2rem',
								gap: '0.5rem',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- Access the data we hold about you.
							</Typography>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- Request correction or deletion of your data.
							</Typography>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- Withdraw consent for data processing (where applicable).
							</Typography>
							<Typography sx={{ flex: 1, maxWidth: { xs: undefined, sm: undefined, md: 400, lg: 400 } }}>
								- Lodge a complaint with a data protection authority.
							</Typography>
						</Box>
						<Typography level="h4" fontWeight={900}>
							7 - Security Measures
						</Typography>
						<Typography>
							We implement appropriate security measures to protect your data from unauthorized access,
							loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute
							security.
						</Typography>
						<Typography level="h4" fontWeight={900}>
							8 - Changes to This Privacy Notice
						</Typography>
						<Typography>
							We may update this Privacy Notice from time to time. Any changes will be posted on this
							page, and we encourage you to review it periodically.
						</Typography>
					</Card>
				</Box>
			</Box>
		</Box>
	);
}

export default App;
