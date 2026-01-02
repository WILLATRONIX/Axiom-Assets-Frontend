import AccordionGroup from '@mui/joy/AccordionGroup';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails, { accordionDetailsClasses } from '@mui/joy/AccordionDetails';
import AccordionSummary, { accordionSummaryClasses } from '@mui/joy/AccordionSummary';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';

const defaultButtonStyle = {
	borderLeft: 'solid var(--joy-palette-background-level2) 1px',
	borderRadius: '0 var(--joy-radius-sm) var(--joy-radius-sm) 0',
	justifyContent: 'flex-start',
	fontWeight: 'md'
};

const selectedButtonStyle = {
	color: 'var(--joy-palette-primary-400)',
	borderLeft: 'solid var(--joy-palette-primary-400) 1px',
	borderRadius: '0 var(--joy-radius-sm) var(--joy-radius-sm) 0',
	justifyContent: 'flex-start',
	fontWeight: 'md',
	'&:hover': {
		color: 'var(--joy-palette-primary-300)',
		borderLeft: 'solid var(--joy-palette-primary-300) 1px',
	},
};

function TreeNode({ node, onChange, selectedPage, depth = 0 }) {
	const hasChildren = Array.isArray(node.children) && node.children.length > 0;
	const isChild = depth >= 1;

	if (!hasChildren) {
		return (
			<Button
				variant="plain"
				color="neutral"
				size="sm"
				disabled={node.disabled}
				onClick={() => onChange(node.name)}
				sx={selectedPage === node.name ? selectedButtonStyle : defaultButtonStyle}
			>
				{node.name}
			</Button>
		);
	}

	return (
		<Accordion defaultExpanded={!node.disabled} disabled={node.disabled}>
			<AccordionSummary>
				<Typography level={isChild ? 'title-sm' : 'title-md'} color={node.disabled ? 'neutral' : undefined}>
					{node.name}
				</Typography>
			</AccordionSummary>

			<AccordionDetails>
				{node.children.map((child) => (
					<TreeNode
						key={child.name}
						node={child}
						onChange={onChange}
						selectedPage={selectedPage}
						depth={depth + 1}
					/>
				))}
			</AccordionDetails>
		</Accordion>
	);
}

export default function SidebarMenuTree({ onChange, selectedPage, options = [] }) {
	return (
		<AccordionGroup
			disableDivider
			sx={{
				gap: 1,
				[`& .${accordionSummaryClasses.button}`]: {
					flexDirection: 'row-reverse',
					justifyContent: 'start',
					borderRadius: '0 var(--joy-radius-sm) var(--joy-radius-sm) 0',
				},
				[`& .${accordionDetailsClasses.content}`]: {
					ml: '22.5px',
					p: 0,
				},
				[`& .${accordionSummaryClasses.indicator}`]: {
					transition: '0.2s',
					transform: 'rotate(-90deg)',
				},
				[`& [aria-expanded="true"] .${accordionSummaryClasses.indicator}`]: {
					transform: 'rotate(0deg)',
				},
			}}
		>
			{options.map((node) => (
				<TreeNode key={node.name} node={node} onChange={onChange} selectedPage={selectedPage} />
			))}
		</AccordionGroup>
	);
}
