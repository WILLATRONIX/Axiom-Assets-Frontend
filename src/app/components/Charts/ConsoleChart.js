import { BarPlot } from '@mui/x-charts/BarChart';
import { LineHighlightPlot, LinePlot } from '@mui/x-charts/LineChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';

import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

export default function ConsoleChart({ title, series, labels }) {
	return (
		<Box sx={{ width: '100%' }}>
			<Typography level="title-lg">{title}</Typography>
			<Box>
				<ChartContainer
					series={series}
					height={320}
					xAxis={[
						{
							...labels.xAxis,
							scaleType: 'band',
							height: 40,
						},
					]}
					yAxis={[
						{
							...labels.yAxisLeft,
							scaleType: 'linear',
							position: 'left',
							width: 40,
						},
					]}
				>
					<ChartsAxisHighlight x="line" />
					<BarPlot />
					<LinePlot />
					<LineHighlightPlot />
					<ChartsLegend position="top" />
					<ChartsXAxis
						label={labels.xAxis.label}
						axisId={labels.xAxis.id}
						tickInterval={(value, index) => index % 2 === 0}
						tickLabelStyle={{ fontSize: 10 }}
					/>
					<ChartsYAxis
						label={labels.yAxisLeft.label}
						axisId={labels.yAxisLeft.id}
						tickLabelStyle={{ fontSize: 10 }}
					/>
					<ChartsTooltip sx={{ bgcolor: 'inherit' }} />
				</ChartContainer>
			</Box>
		</Box>
	);
}
