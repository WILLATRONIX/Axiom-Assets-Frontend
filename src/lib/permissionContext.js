export function hasPermission(permissions, required) {
	const userPerms = new Set(permissions ?? []);

	if (userPerms.has(`-${required}`)) return false;
	if (userPerms.has(required)) return true;

    if (userPerms.has('-*')) return false;
	if (userPerms.has('*')) return true;

	const parts = required.split('.');

	while (parts.length > 0) {
		const wildcard = `${parts.join('.')}.*`;

		if (userPerms.has(`-${wildcard}`)) return false;
		if (userPerms.has(wildcard)) return true;

		parts.pop();
	}

	return false;
}
