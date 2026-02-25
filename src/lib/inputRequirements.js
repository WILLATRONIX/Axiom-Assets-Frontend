export const validateInput = (input, rules) => {
	const results = rules.map((rule) => rule(input));

	const isValid =
		results.length > 0 && results.every((r) => r.value === true);

	return {
		isValid,
		requirements: results,
	};
};

export const usernameInputRules = [
	(input = "") => ({
		label: "Too Long",
		value: input.length <= 32,
		current: input.length,
		required: 32,
	}),
	(input = "") => ({
		label: "Too Short",
		value: input.length >= 3,
		current: input.length,
		required: 3,
	}),
	(input = "") => ({
		label: "No Spaces",
		value: !input.includes(" "),
	}),
	(input = "") => ({
		label: "No Special Characters",
		value: /^[a-zA-Z0-9_-]*$/.test(input),
	}),
	(input = "") => ({
		label: "No Double Dashes",
		value: !input.includes("--"),
	}),
];

export const passwordInputRules = [
	(input = "") => ({
		label: "Too Short",
		value: input.length >= 8,
		current: input.length,
		required: 8,
	}),
	(input = "") => ({
		label: "Lowercase Required",
		value: /[a-z]/.test(input),
	}),
	(input = "") => ({
		label: "Uppercase Required",
		value: /[A-Z]/.test(input),
	}),
	(input = "") => ({
		label: "Number Required",
		value: /\d/.test(input),
	}),
	(input = "") => ({
		label: "No Spaces",
		value: !/\s/.test(input),
	}),
	(input = "") => ({
		label: "No Double Dashes",
		value: !input.includes("--"),
	}),
];

export const emailInputRules = [
	(input = "") => ({
		label: "Too Long",
		value: input.length <= 254,
		current: input.length,
		required: 254,
	}),
	(input = "") => ({
		label: "Too Short",
		value: input.length >= 5,
		current: input.length,
		required: 5,
	}),
	(input = "") => ({
		label: "Invalid Email Format",
		value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input),
	}),
	(input = "") => ({
		label: "No Spaces",
		value: !/\s/.test(input),
	}),
	(input = "") => ({
		label: 'One "@" symbol',
		value: (input.match(/@/g) || []).length === 1,
	}),
	(input = "") => ({
		label: "TLD Required",
		value: input.includes("@") && input.split("@")[1]?.includes("."),
	}),
	(input = "") => ({
		label: "No Double Dashes",
		value: !input.includes("--"),
	}),
];

export const displayNameInputRules = [
	(input = "") => ({
		value: input.length <= 32,
		label: "Too Long",
		current: input.length,
		required: 32,
	}),
	(input = "") => ({
		value: input.length >= 1,
		label: "Too Short",
		current: input.length,
		required: 1,
	}),
	(input = "") => ({
		value: /^[a-zA-Z0-9 _-]*$/.test(input),
		label: "No Special Characters",
	}),
	(input = "") => ({
		value: !/--/.test(input),
		label: "No Double Dashes",
	}),
	(input = "") => ({
		value: !/ {2,}/.test(input),
		label: "No Double Spaces",
	}),
];

export const aboutMeInputRules = [
	(input = "") => ({
		value:
			/^[a-zA-Z0-9 _\-.,#*~`>|\n!]*$/.test(input) &&
			!/(\[.*?\]\(.*?\)|\[.*?\]\[.*?\]|<https?:\/\/.*?>|https?:\/\/|www\.)/i.test(
				input,
			),
		label: "No Special Characters or Links",
	}),
	(input = "") => ({
		value: input.length <= 1024,
		label: "Max Length",
		current: input.length,
		required: 1024,
	}),
	(input = "") => ({
		value: !/--/.test(input),
		label: "No Double Dashes",
	}),
	(input = "") => ({
		value: !/ {2,}/.test(input),
		label: "No Double Spaces",
	}),
];
