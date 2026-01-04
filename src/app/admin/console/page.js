'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { get } from 'lib/network';
import { useAuth } from 'lib/auth/authContext.js';
import { hasPermission } from 'lib/permissionContext';

import LoginModal from 'components/Modal/Login';
import Navbar from 'components/Navbar/Navbar';
import SidebarMenuTree from 'components/Navbar/SidebarMenuTree';

import ConsoleTable from 'components/Table/ConsoleTable';
import ChartContainer from 'components/Charts/ChartContainer';
import ElementEditor from 'components/Card/ElementEditor';
import CatImageReview from 'components/Card/CatImageReview';

import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';

const consoleViews = [
	{
		name: 'Management',
		disabled: false,
		children: [
			{ name: 'Mass Editor', disabled: false },
			{ name: 'Element Editor', disabled: false },
		],
	},
	{
		name: 'To Review',
		disabled: false,
		children: [
			{ name: 'Reports', disabled: true },
			{ name: 'Teams', disabled: true },
			{ name: 'Cat Images', disabled: false },
		],
	},
	{
		name: 'Statistics',
		disabled: false,
		children: [
			{ name: 'Global Statistics', disabled: false },
			{ name: 'Per-User Statistics', disabled: true },
		],
	},
	{
		name: 'Server Maintainence',
		disabled: false,
		children: [
			{ name: 'Console', disabled: true },
			{ name: 'Resource Usage', disabled: true },
		],
	},
];

export default function Page() {
	const router = useRouter();

	const [isAuthorized, setIsAuthorized] = useState(null);
	const [currentView, setCurrentView] = useState('Mass Editor');
	const [loginModalOpen, setLoginModalOpen] = useState(false);

	const [elementEditorDefaultValue, setElementEditorDefaultValue] = useState(null);

	const { user, loading } = useAuth();

	const verifyToken = async () => {
		if (user && !loading) {
			if (hasPermission(user.permissions, 'moderation')) {
				setIsAuthorized(true);
				return;
			}

			setLoginModalOpen(true);
		} else if (!user && loading === false) {
			setLoginModalOpen(true);
			setIsAuthorized(null);
		}
	};

	const handleCloseLoginModal = () => {
		if (!isAuthorized) {
			router.push('/browse');
		}
	};

	const formatChapterHash = (input) => {
		return input
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	useEffect(() => {
		const onHashChange = () => {
			const hash = window.location.hash.substring(1);
			if (hash === '') return;

			const [basePart, queryString] = hash.split('?');

			const formattedChapter = formatChapterHash(basePart);
			setCurrentView(formattedChapter);

			const params = new URLSearchParams(queryString);

			if (formattedChapter === 'Element Editor' && params.has('uuid')) {
				setElementEditorDefaultValue(params.get('uuid'));
			}
		};

		window.addEventListener('hashchange', onHashChange);

		onHashChange();

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, []);

	const handleInspectUUID = (uuid) => {
		setCurrentView('Element Editor');
		setElementEditorDefaultValue(uuid);
	};

	useEffect(() => {
		verifyToken();
	}, [user, loading]);

	if (isAuthorized === null) {
		return (
			<Fragment>
				<LoginModal
					onSuccess={verifyToken}
					open={loginModalOpen}
					setOpen={setLoginModalOpen}
					onClose={handleCloseLoginModal}
				/>
			</Fragment>
		);
	}

	const viewMap = {
		'Mass Editor': (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					width: '100%',
				}}
			>
				<ConsoleTable tableID="users" viewUUID={handleInspectUUID} />
				<ConsoleTable tableID="items" viewUUID={handleInspectUUID} />
				<ConsoleTable tableID="reports" viewUUID={handleInspectUUID} />
			</Box>
		),
		'Global Statistics': <ChartContainer />,
		'Element Editor': (
			<ElementEditor
				defaultValue={elementEditorDefaultValue}
				clearDefault={() => setElementEditorDefaultValue(null)}
			/>
		),
		'Cat Images': <CatImageReview />,
	};

	return (
		<Fragment>
			<Box
				sx={{
					overflow: 'hidden',
					width: '100vw',
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.surface',
				}}
			>
				<Navbar variant="console" />
				<Box
					sx={{
						display: 'flex',
						flex: 1,
						overflow: 'hidden',
						gap: 2,
						mr: 2,
					}}
				>
					<Box
						sx={{
							width: 260,
							flexShrink: 0,
							overflow: 'auto',
						}}
					>
						<SidebarMenuTree onChange={setCurrentView} selectedPage={currentView} options={consoleViews} />
					</Box>

					<Divider orientation="vertical" />

					<Box
						sx={{
							flex: 1,
							overflow: 'auto',
						}}
					>
						{viewMap[currentView]}
					</Box>
				</Box>
			</Box>
		</Fragment>
	);
}
