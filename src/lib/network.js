import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.axiomassets.net';

const api = axios.create({
	proxy: false, // prevent depricated function call: url.parse()
	baseURL: API_BASE_URL,
	withCredentials: true,
});

let onUnauthorized = () => {};

export const setUnauthorizedHandler = (handler) => {
	onUnauthorized = handler;
};

api.interceptors.response.use(
	(response) => ({
		ok: true,
		status: response.status,
		data: response.data,
	}),
	(error) => {
		const status = error.response?.status;
		const requestUrl = error.config?.url || '';

		if (status === 401 && !requestUrl.endsWith('/auth/register-cookies')) {
			onUnauthorized();
		}

		return Promise.resolve({
			ok: false,
			status,
			data: error.response?.data ?? {
				message: error.message,
			},
		});
	}
);

api.interceptors.request.use((config) => {
	if (typeof window === 'undefined' && process.env.SSR_TOKEN) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${process.env.SSR_TOKEN}`,
		};
		return config;
	}

	const token = localStorage.getItem('jwt');
	if (token) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${token}`,
		};
	}
	return config;
});

function safeSerialize(value) {
	if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(safeSerialize);
	}

	if (typeof value === 'object') {
		const cleanObj = {};

		for (const [key, val] of Object.entries(value)) {
			if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
			if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

			cleanObj[key] = safeSerialize(val);
		}

		return cleanObj;
	}

	return undefined;
}

export const get = (url, config = {}) => {
	const { baseURL, responseType, ...rest } = config;

	const params = {};
	if (rest.params) {
		for (const [key, val] of Object.entries(rest.params)) params[key] = val;
	}

	for (const [key, value] of Object.entries(rest)) {
		if (key === 'params' || key === 'ssr') continue;
		params[key] = typeof value === 'object' ? JSON.stringify(safeSerialize(value)) : value;
	}

	return api.get(url, { ...rest, params, baseURL: baseURL || API_BASE_URL, responseType });
};

export const post = (url, data, config = {}) =>
	api.post(url, data, { ...config, baseURL: config.baseURL || API_BASE_URL });
export const put = (url, data, config = {}) =>
	api.put(url, data, { ...config, baseURL: config.baseURL || API_BASE_URL });
export const del = (url, config = {}) => api.delete(url, { ...config, baseURL: config.baseURL || API_BASE_URL });
