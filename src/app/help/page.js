'use client';

import { useState, useEffect } from 'react';

import { marked } from 'marked';
import { createHighlighter } from 'shiki';

import { useNotification } from 'api/NotificationContext';
import SidebarMenu from 'components/Input/SidebarMenu';

import Navbar from 'components/Navbar/Navbar';
import SidebarMenuTree from 'components/Navbar/SidebarMenuTree';

import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import Link from '@mui/joy/Link';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Sheet from '@mui/joy/Sheet';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Input from '@mui/joy/Input';

import ExploreIcon from '@mui/icons-material/Explore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

const pageViews = [
	{
		name: 'Important',
		children: [{ name: 'Rules' }, { name: 'Privacy Policy' }, { name: 'Terms of Service' }],
	},
	{
		name: 'Assets',
		children: [{ name: 'Uploading' }, { name: 'Downloading' }],
	},
	{
		name: 'Account',
		children: [{ name: 'Signing up' }, { name: 'Managing your account' }, { name: 'Becoming a Creator' }],
	},
];

const formatChapterHash = (input) => {
	return input
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export default function Page({}) {
	const [selectedPage, setSelectedPage] = useState('Rules');
	const [pageContent, setPageContent] = useState('');

	const getPagePath = (pageName, nodes = pageViews, parentPath = '') => {
		for (const node of nodes) {
			const currentPath = parentPath
				? `${parentPath}/${node.name.toLowerCase().replace(/\s+/g, '-')}`
				: node.name.toLowerCase().replace(/\s+/g, '-');
			if (node.name === pageName) {
				return currentPath;
			}
			if (node.children) {
				const childPath = getPagePath(pageName, node.children, currentPath);
				if (childPath) return childPath;
			}
		}
	};
	

	
	useEffect(() => {
		const onHashChange = () => {
			const hash = window.location.hash.substring(1);
			if (hash === '') return;

			const [basePart, queryString] = hash.split('?');

			const formattedChapter = formatChapterHash(basePart);
			setSelectedPage(formattedChapter);

			const params = new URLSearchParams(queryString);
		};

		window.addEventListener('hashchange', onHashChange);

		onHashChange();

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		const pagePath = getPagePath(selectedPage);

		fetch(
			`https://raw.githubusercontent.com/WILLATRONIX/Axiom-Assets-Markdown/refs/heads/main/help-pages/${pagePath}.md`
		)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP ${res.status}`);
				}
				return res.text();
			})
			.then((md) => {
				if (!cancelled) {
					setPageContent(marked.parse(md));
				}
			})
			.catch((error) => {
				if (!cancelled) {
					setPageContent(marked.parse(`# Page not found\n\n${error.message}`));
				}
			});

		return () => {
			cancelled = true;
		};
	}, [selectedPage]);

	return (
		<Box
			sx={{
				width: '100vw',
				height: '100vh',
				bgcolor: 'background.surface',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Box
				sx={{
					position: 'sticky',
					top: 0,
					zIndex: 1000,
					width: '100%',
					bgcolor: 'color-mix(in srgb, var(--joy-palette-background-surface) 70%, transparent)',
					backdropFilter: 'blur(48px)',
				}}
			>
				<Navbar />
			</Box>
			<Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0 }}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 1,
						maxWidth: 300,
						overflowY: 'auto',
						p: 1,
						minHeight: 0,
					}}
				>
					<SidebarMenuTree options={pageViews} onChange={setSelectedPage} selectedPage={selectedPage} />
				</Box>
				<Divider orientation="vertical" />
				<Box
					sx={{
						flex: 1,
						overflowY: 'auto',
						px: 5,
						py: 3,
						minHeight: 0,
					}}
				>
					<Box dangerouslySetInnerHTML={{ __html: pageContent }} sx={{ maxWidth: 800, mx: 'auto' }} />
				</Box>
			</Box>
		</Box>
	);
}
