'use client';

import { Suspense, useRef, useEffect, useState, forwardRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import Box from '@mui/joy/Box';

const Model = forwardRef(({ url }, ref) => {
	const { scene } = useGLTF(url);
	const wrapper = useRef(new THREE.Group());

	useEffect(() => {
		const clone = scene.clone(true);

		clone.traverse((child) => {
			if (!child.isMesh) return;

			child.material = child.material.clone();

			const tex = child.material.map;
			if (tex) {
				tex.magFilter = THREE.NearestFilter;
				tex.minFilter = THREE.NearestFilter;
				tex.generateMipmaps = false;
				tex.needsUpdate = true;
			}

			child.material.metalness = 0;
			child.material.roughness = 1;
		});

		wrapper.current.clear();
		wrapper.current.add(clone);

		if (ref) ref.current = wrapper.current;
	}, [scene, ref]);

	return <primitive object={wrapper.current} />;
});

function CameraUpdater({ cameraZ }) {
	const { camera } = useThree();

	useEffect(() => {
		camera.position.set(0, 0, cameraZ);
		camera.updateProjectionMatrix();
	}, [cameraZ]);

	return null;
}

export default function ThreeScene({ modelUrls }) {
	const controlsRef = useRef();
	const modelRefs = useRef([]);
	const viewerRef = useRef(null);

	const [cameraZ, setCameraZ] = useState(1);
	const [minDist, setMinDist] = useState(1);
	const [maxDist, setMaxDist] = useState(1);

	const viewerPitchRef = useRef(20);

	useEffect(() => {
		let maxRadius = 16;

		for (const m of modelUrls) {
			const [x, y, z] = m
				.replace('.glb', '')
				.split('_')
				.map((v) => Math.abs(parseInt(v, 10)));

			const localMax = Math.max(x, y, z) * 16;

			if (localMax > maxRadius) {
				maxRadius = localMax;
			}
		}

		const fov = 25;
		const distance = maxRadius / Math.sin(THREE.MathUtils.degToRad(fov) / 2);

		setCameraZ(distance);
		setMinDist(maxRadius * 0.5);
		setMaxDist(maxRadius * 16);
	}, [modelUrls]);

	const handlePointerMove = (e) => {
		if (!viewerRef.current) return;

		const rect = viewerRef.current.getBoundingClientRect();
		const y = (e.clientY - rect.top) / rect.height;

		viewerPitchRef.current = THREE.MathUtils.clamp((0.5 - y) * -60, -60, 60);
	};

	function PitchUpdater({ controlsRef, pitchRef }) {
		useFrame(() => {
			const controls = controlsRef.current;
			if (!controls) return;

			const polar = THREE.MathUtils.degToRad(90 - pitchRef.current);
			controls.minPolarAngle = polar;
			controls.maxPolarAngle = polar;
		});

		return null;
	}

	return (
		<Box ref={viewerRef} onPointerMove={handlePointerMove} sx={{ width: '100%', height: '100%' }}>
			<Canvas camera={{ position: [0, 0, cameraZ], fov: 30, far: cameraZ * 1.5 }}>
				<CameraUpdater cameraZ={cameraZ} />
				<ambientLight intensity={2} />

				<Model ref={(el) => (modelRefs.current[i] = el)} url={`/test_models/model.glb`} />

				<PitchUpdater controlsRef={controlsRef} pitchRef={viewerPitchRef} />

				<OrbitControls
					ref={controlsRef}
					target={[0, -4, 0]}
					minDistance={minDist}
					maxDistance={cameraZ * 1.6}
					enablePan={false}
					enableRotate
					autoRotate
				/>
			</Canvas>
		</Box>
	);
}
