import { useState, useEffect } from 'react';

import { useContextMenu } from 'lib/MenuContext';

import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';

export default function ContextMenuWrapper({ children, menuItems = [], id, enableOverride = true }) {
	const { openMenuId, setOpenMenuId } = useContextMenu();

	const isVisible = openMenuId === id;

	const handleContextMenu = (e) => {
		if (!enableOverride) return;

		e.preventDefault();
		setOpenMenuId(id);
		setMenuPosition({ x: e.clientX, y: e.clientY });
	};

	const handleClickOutside = () => {
		if (isVisible) setOpenMenuId(null);
	};

	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [isVisible]);

	return (
		<div onContextMenu={handleContextMenu} style={{ display: 'inline-block' }}>
			{children}

			{isVisible && (
				<Sheet
					variant="outlined"
					sx={{
						position: 'fixed',
						top: menuPosition.y,
						left: menuPosition.x,
						bgcolor: 'background.surface',
						borderRadius: 'sm',
						boxShadow: 'lg',
						p: 1,
						minWidth: 150,
						zIndex: 1300,
					}}
				>
					{menuItems.map((item, index) => (
						<Button
							key={index}
							variant="plain"
							onClick={() => {
								item.onClick();
								setOpenMenuId(null);
							}}
							sx={{ width: '100%', justifyContent: 'flex-start' }}
						>
							{item.label || item}
						</Button>
					))}
				</Sheet>
			)}
		</div>
	);
}
