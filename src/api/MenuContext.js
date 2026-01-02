"use client"

import { createContext, useContext, useState } from 'react';

const ContextMenuContext = createContext();

export const useContextMenu = () => useContext(ContextMenuContext);

export const ContextMenuProvider = ({ children }) => {
	const [openMenuId, setOpenMenuId] = useState(null);

	return <ContextMenuContext.Provider value={{ openMenuId, setOpenMenuId }}>{children}</ContextMenuContext.Provider>;
};
