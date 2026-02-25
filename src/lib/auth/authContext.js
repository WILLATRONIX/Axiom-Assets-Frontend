"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { setUnauthorizedHandler } from "lib/network";
import { get, post } from "lib/network";

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
			const response = await get(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/register-cookies`,
			);

			if (!response.ok) {
				setUser(null);
				return;
			}

			const userData = {
				...(response.data.user ?? {}),
				state: response.data.state ?? null,
			};

			setUser(userData);
		} catch (error) {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}

	function setUserDetails(userData) {
		setUser(userData);
		setLoading(false);
	}

	function clientLogout() {
		setUser(null);
	}

	async function logout() {
		try {
			await post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`);
			clientLogout();
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		setUnauthorizedHandler(async () => {
			try {
				await fetchUserDetails();
			} catch (error) {
				clientLogout();
			}
		});
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				fetchUserDetails,
				clientLogout,
				setUserDetails,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
