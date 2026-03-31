"use client";

import { useState, useEffect } from "react";

import { marked } from "marked";

import Navbar from "components/Navbar/Navbar";
import SidebarMenuTree from "components/Navbar/SidebarMenuTree";

import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";

const pageViews = [
	{
		name: "Important",
		children: [
			{ name: "Rules" },
			{ name: "Privacy Policy" },
			{ name: "Terms Of Service" },
		],
	},
	{
		name: "Assets",
		children: [{ name: "Uploading" }, { name: "Downloading" }],
	},
	{
		name: "Account",
		children: [
			{ name: "Signing Up" },
			{ name: "Managing Your Account" },
			{ name: "Becoming A Creator" },
		],
	},
];

const formatChapterHash = (input) => {
	return input
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export default function Page({}) {
	const [selectedPage, setSelectedPage] = useState("Rules");
	const [pageContent, setPageContent] = useState("");

	const getPagePath = (pageName, nodes = pageViews, parentPath = "") => {
		for (const node of nodes) {
			const currentPath = parentPath
				? `${parentPath}/${node.name.toLowerCase().replace(/\s+/g, "-")}`
				: node.name.toLowerCase().replace(/\s+/g, "-");
			if (node.name === pageName) {
				return currentPath;
			}
			if (node.children) {
				const childPath = getPagePath(
					pageName,
					node.children,
					currentPath,
				);
				if (childPath) return childPath;
			}
		}
	};

	useEffect(() => {
		const onHashChange = () => {
			const hash = window.location.hash.substring(1);
			if (hash === "") return;

			const [basePart, queryString] = hash.split("?");

			const formattedChapter = formatChapterHash(basePart);
			setSelectedPage(formattedChapter);

			const params = new URLSearchParams(queryString);
		};

		window.addEventListener("hashchange", onHashChange);

		onHashChange();

		return () => {
			window.removeEventListener("hashchange", onHashChange);
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		const pagePath = getPagePath(selectedPage);

		fetch(
			`https://raw.githubusercontent.com/WILLATRONIX/Axiom-Assets-Markdown/refs/heads/main/help-pages/${pagePath}.md`,
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
					setPageContent(
						marked.parse(`# Page not found\n\n${error.message}`),
					);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [selectedPage]);

	return (
		<Box
			sx={{
				width: "100vw",
				height: "100vh",
				bgcolor: "background.surface",
				display: "flex",
				flexDirection: "column",
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
				<Navbar />
			</Box>
			<Box sx={{ display: "flex", flex: 1, gap: 2, minHeight: 0 }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 1,
						maxWidth: 300,
						overflowY: "auto",
						p: 1,
						minHeight: 0,
					}}
				>
					<SidebarMenuTree
						options={pageViews}
						onChange={setSelectedPage}
						selectedPage={selectedPage}
					/>
				</Box>
				<Divider orientation="vertical" />
				<Box
					sx={{
						flex: 1,
						overflowY: "auto",
						px: 5,
						py: 3,
						minHeight: 0,
					}}
				>
					<Box
						dangerouslySetInnerHTML={{ __html: pageContent }}
						sx={{ maxWidth: 800, mx: "auto" }}
					/>
				</Box>
			</Box>
		</Box>
	);
}
