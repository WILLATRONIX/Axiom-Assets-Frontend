let currentFilter = null;
const listeners = new Set();

export const defaultFilter = () => ({
	filter: {
		field: 'visibility',
		op: 'eq',
		value: 'public',
	},
	sort: [{ field: 'date_created', direction: 'desc' }],
	savedOnly: false,
});

currentFilter = defaultFilter();

export const getFilter = () => currentFilter;

export const setFilter = (newFilter) => {
	currentFilter = newFilter;
	listeners.forEach((callback) => callback(currentFilter));
};

export const resetFilter = () => {
	currentFilter = defaultFilter();
	listeners.forEach((callback) => callback(currentFilter));
};

export const subscribeFilter = (callback) => {
	listeners.add(callback);
	return () => listeners.delete(callback);
};
