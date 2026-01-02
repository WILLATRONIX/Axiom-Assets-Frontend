'use client';

import { useEffect, useState, Fragment } from 'react';
import { get } from 'api/network';

import ConsoleChart from 'components/Charts/ConsoleChart';

import Box from '@mui/joy/Box';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

export default function ChartContainer() {
	const [charts, setCharts] = useState([]);
	const [dateRange, setDateRange] = useState(7);

	const chartGroups = [
		{
			title: 'Downloads',
			yAxisId: 'downloads',
			series: [
				{ label: 'Total Downloads', key: 'total_downloads', color: 'hsl(0 0% 20%)', type: 'bar' },
				{ label: 'Blueprint Downloads', key: 'blueprint_downloads', color: 'hsl(30 90% 50%)', type: 'line' },
				{ label: 'Preset Downloads', key: 'preset_downloads', color: 'hsl(320 90% 50%)', type: 'line' },
				{ label: 'Theme Downloads', key: 'theme_downloads', color: 'hsl(220 90% 50%)', type: 'line' },
				{ label: 'Asset Pack Downloads', key: 'asset_pack_downloads', color: 'hsl(90 90% 50%)', type: 'line' },
			],
		},
		{
			title: 'Uploads',
			yAxisId: 'uploads',
			series: [
				{ label: 'Total Uploads', key: 'total_uploads', color: 'hsl(0 0% 20%)', type: 'bar' },
				{ label: 'Blueprint Uploads', key: 'blueprint_uploads', color: 'hsl(30 90% 50%)', type: 'line' },
				{ label: 'Preset Uploads', key: 'preset_uploads', color: 'hsl(320 90% 50%)', type: 'line' },
				{ label: 'Theme Uploads', key: 'theme_uploads', color: 'hsl(220 90% 50%)', type: 'line' },
				{ label: 'Asset Pack Uploads', key: 'asset_pack_uploads', color: 'hsl(90 90% 50%)', type: 'line' },
				{ label: 'Cat Image Uploads', key: 'cat_image_uploads', color: 'hsl(350 90% 50%)', type: 'line' },
			],
		},
		{
			title: 'User Activity',
			yAxisId: 'user_activity',
			series: [
				{ label: 'New Users', key: 'new_users', color: 'hsl(50 90% 50%)', type: 'bar' },
				{ label: 'Logins', key: 'login_count', color: 'hsl(30 90% 50%)', type: 'line' },
				{ label: 'Items Saved', key: 'saves', color: 'hsl(200 90% 50%)', type: 'line' },
			],
		},
		{
			title: 'API Requests',
			yAxisId: 'api_requests',
			series: [{ label: 'API Requests', key: 'api_requests', color: 'hsl(200 90% 50%)', type: 'line' }],
		},
		{
			title: 'Reports',
			yAxisId: 'reports',
			series: [{ label: 'Reports', key: 'reports', color: 'hsl(200 90% 50%)', type: 'bar' }],
		},
		{
			title: 'Total Blocks Uploaded',
			yAxisId: 'total_blocks',
			series: [{ label: 'Total Blocks Uploaded', key: 'total_blocks', color: 'hsl(200 90% 50%)', type: 'bar' }],
		},
	];

	const getStats = async () => {
		const res = await get(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-statistics/global/${dateRange - 1}`);
		const globalStats = res.data.data;

		const formattedCharts = chartGroups.map((group) => {
			const series = group.series.map((stat) => ({
				label: stat.label,
				type: stat.type,
				yAxisId: group.yAxisId,
				color: stat.color,
				data: globalStats.map((entry) => entry[stat.key]),
				highlightScope: { highlight: 'item' },
				stack: group.stack || undefined,
				area: group.stack === 'total',
			}));

			const xAxisData = globalStats.map((entry) => new Date(entry.date));

			return {
				title: group.title,
				series,
				xAxis: {
					label: '',
					id: 'date',
					data: xAxisData,
					valueFormatter: (value) => (value instanceof Date ? value.toLocaleDateString() : String(value)),
				},
				yAxis: {
					label: group.yAxisLabel,
					id: group.yAxisId,
					valueFormatter: (value) => String(value),
				},
			};
		});

		setCharts(formattedCharts);
	};

	useEffect(() => {
		getStats();
	}, [dateRange]);

	return (
		<Fragment>
			<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
				<Box sx={{ display: 'flex' }}>
					<Select
						value={dateRange}
						variant="soft"
						onChange={(event, newValue) => {
							setDateRange(newValue);
						}}
					>
						<Option value={7}>Past Week</Option>
						<Option value={30}>Past Month</Option>
						<Option value={90}>Past 3 Months</Option>
					</Select>
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
					}}
				>
					{charts.map((chart, index) => (
						<ConsoleChart
							key={index}
							title={chart.title}
							series={chart.series}
							labels={{
								xAxis: chart.xAxis,
								yAxisLeft: chart.yAxis,
							}}
						/>
					))}
				</Box>
			</Box>
		</Fragment>
	);
}
