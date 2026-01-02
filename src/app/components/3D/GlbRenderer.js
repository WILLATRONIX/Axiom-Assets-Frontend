'use client';

import ThreeScene from './Scene.js';

import Card from '@mui/joy/Card';

export default function GlbRenderer() {
	const models = [
		'model.glb',
	];

	return (
		<Card variant="soft" sx={{ width: 300, height: 300, mx: 2, p: 0 }}>
			<ThreeScene modelUrls={models} />
		</Card>
	);
}
