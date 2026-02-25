"use client";

import { Tooltip, Typography, Box, Divider } from "@mui/joy";

export default function InputRequirements({
	required = {},
	showValid = false,
	placement = "right-start",
	color = "danger",
	children,
	...props
}) {
	const content = (
		<Box>
			{required.map((condition) => {
				if (!showValid && condition.value) return null;

				return (
					<Typography level="title-md" key={condition.label}>
						<Typography
							component="span"
							color={condition.value ? "success" : color}
						>
							{condition.current !== undefined
								? `${condition.label}: ${condition.current}/${condition.required}`
								: condition.label}
						</Typography>
					</Typography>
				);
			})}
		</Box>
	);

	return (
		<Tooltip
			title={content}
			variant="soft"
			placement={placement}
			{...props}
		>
			{children}
		</Tooltip>
	);
}
