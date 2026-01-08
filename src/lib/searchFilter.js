let currentFilter = null;
const listeners = new Set();

export const defaultFilter = () => ({
	baseFilter: {
		sortBy: 'date_created',
		sortOrder: 'desc',
		itemType: 0,
		searchQuery: '',
		searchQueryField: 'header',
	},
	filter: {
		and: [{ field: 'visibility', op: 'eq', value: 'public' }],
	},
	sort: [{ field: 'date_created', direction: 'desc' }],
	savedOnly: false,
});

currentFilter = defaultFilter();

export const getFilter = () => currentFilter;

export const setFilter = (newFilter, { initial = false } = {}) => {
	currentFilter = newFilter;

	listeners.forEach((callback) => callback(newFilter, { initial }));
};

export const resetFilter = () => {
	setFilter(defaultFilter(), { initial: true });
};

export const subscribeFilter = (callback, { emitCurrent = true } = {}) => {
	listeners.add(callback);

	if (emitCurrent && currentFilter) {
		callback(currentFilter, { initial: true });
	}

	return () => listeners.delete(callback);
};
