'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { setUnauthorizedHandler } from 'api/network';
import { get } from 'api/network';

const AuthContext = createContext({
	user: null,
	loading: true,
	fetchUserDetails: async () => {},
	logout: () => {},
});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	async function fetchUserDetails() {
		try {
			const response = await get(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-cookies`);
			if (!response.ok) {
				setUser(null);
				return;
			}

			setUser(response.data.user ?? null);
		} catch (error) {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}

	function logout() {
		setUser(null);
	}

	useEffect(() => {
		fetchUserDetails();

		setUnauthorizedHandler(async () => {
			try {
				await fetchUserDetails();
			} catch (error) {
				console.warn(error);
				logout();
			}
		});
	}, []);

	return <AuthContext.Provider value={{ user, loading, fetchUserDetails, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
