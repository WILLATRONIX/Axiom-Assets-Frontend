'use client';

import { useState } from 'react';

import SelectUploadOption from 'components/Input/SelectUploadOption';
import UploadFile from 'components/Upload/UploadFile';
import UploadSettings from 'components/Upload/UploadSettings';
import UploadDetails from 'components/Upload/UploadDetails';
import UploadComplete from 'components/Upload/UploadComplete';

import Box from '@mui/joy/Box';
import Navbar from 'components/Navbar/Navbar';
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepButton from '@mui/joy/StepButton';
import StepIndicator from '@mui/joy/StepIndicator';

import Check from '@mui/icons-material/Check';

let steps = [
	{ name: 'Select Upload Type', complete: false, locked: false },
	{ name: 'Add Assets', complete: false, locked: false },
	{ name: 'Edit Settings', complete: false, locked: false },
	{ name: 'Set Details', complete: false, locked: false },
	{ name: 'Complete Upload', complete: false, locked: false },
];

function App({}) {
	const [activeStep, setActiveStep] = useState(0);

	const [selectedUploadType, setSelectedUploadType] = useState(null);
	const [selectedUploadItems, setSelectedUploadItems] = useState([]);
	const [selectedUploadSettings, setSelectedUploadSettings] = useState(null);
	const [selectedUploadDetails, setSelectedUploadDetails] = useState(null);

	const [uploadHasBlueprint, setUploadHasBlueprint] = useState(null);
	const [uploadHasPreset, setUploadHasPreset] = useState(null);

	const resetSubmission = () => {
		setSelectedUploadItems([]);
		setSelectedUploadSettings(null);
		setUploadHasBlueprint(null);
		setActiveStep(0);

		steps = [
			{ name: 'Select Upload Type', complete: false, locked: false },
			{ name: 'Add Assets', complete: false, locked: false },
			{ name: 'Edit Settings', complete: false, locked: false },
			{ name: 'Set Details', complete: false, locked: false },
			{ name: 'Complete Upload', complete: false, locked: false },
		];
	};

	const handleConfirmUploadType = (type) => {
		if (selectedUploadType === null) {
			setSelectedUploadType(type);
			setActiveStep((prev) => prev + 1);
			steps[0].complete = true;
			return;
		}

		if (type === selectedUploadType) {
			if (selectedUploadType === 0 && selectedUploadItems.length === 1) {
				setActiveStep(2);
				return;
			}
			setActiveStep((prev) => prev + 1);
			return;
		}

		resetSubmission();
		setSelectedUploadType(type);

		setActiveStep((prev) => prev + 1);
		steps[0].complete = true;
	};

	const handleConfirmUploadData = (itemData) => {
		setSelectedUploadItems(itemData);

		const hasBlueprint = itemData.some((item) => item.fileName?.toLowerCase().endsWith('.bp'));
		setUploadHasBlueprint(hasBlueprint);

		const hasPreset = itemData.some((item) => item.fileName?.toLowerCase().endsWith('.nbt'));
		setUploadHasPreset(hasPreset);

		if (hasPreset && selectedUploadType === 0) {
			steps = [
				{ name: 'Select Upload Type', complete: false, locked: false },
				{ name: 'Add Assets', complete: false, locked: false },
				{ name: 'Edit Settings', complete: false, locked: false },
				{ name: 'Complete Upload', complete: false, locked: false },
			];
		}

		if (selectedUploadType === 0) {
			steps[1].locked = true;
		}

		setActiveStep((prev) => prev + 1);
		steps[1].complete = true;
	};

	const handleConfirmUploadSettings = (settings) => {
		setSelectedUploadSettings(settings);

		if (selectedUploadType === 1) {
			setActiveStep((prev) => prev + 2);
		} else {
			if (uploadHasPreset && selectedUploadType === 0) {
				setActiveStep((prev) => prev + 2);
			} else {
				setActiveStep((prev) => prev + 1);
			}
		}
		steps[2].complete = true;
	};

	const handleConfirmUploadDetails = (details) => {
		setSelectedUploadDetails(details);

		setActiveStep((prev) => prev + 1);
		steps[3].complete = true;
	};

	const handleLockAllSteps = () => {
		for (const [index, step] of steps.entries()) {
			steps[index] = { ...step, locked: true, complete: true };
		}
	};

	let stepComponents = [
		<SelectUploadOption
			defaultValue={selectedUploadType}
			hasConflictingAssets={selectedUploadItems.length > 0}
			onConfirm={handleConfirmUploadType}
		/>,
		<UploadFile
			defaultValue={selectedUploadItems}
			uploadType={selectedUploadType}
			onConfirm={handleConfirmUploadData}
		/>,
		<UploadSettings
			defaultValue={selectedUploadSettings}
			hasBlueprint={uploadHasBlueprint}
			onConfirm={handleConfirmUploadSettings}
		/>,
		<UploadDetails
			defaultValue={selectedUploadDetails}
			uploadType={selectedUploadType}
			singleItem={selectedUploadItems[0]}
			hasBlueprint={uploadHasBlueprint}
			onConfirm={handleConfirmUploadDetails}
		/>,
		<UploadComplete
			uploadType={selectedUploadType}
			uploadItems={selectedUploadItems}
			uploadSettings={selectedUploadSettings}
			uploadDetails={selectedUploadDetails}
			onStartUpload={handleLockAllSteps}
		/>,
	];

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				bgcolor: 'background.surface',
				overflow: 'hidden',
				justifyContent: 'space-between',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Navbar />
			<Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>{stepComponents[activeStep]}</Box>
			<Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, p: 2, px: 8 }}>
				<Stepper sx={{ width: '100%' }}>
					{steps.map((step, index) => {
						if (selectedUploadType === 1 && index === 3) return;

						return (
							<Step
								key={step.name}
								indicator={
									<StepIndicator
										variant={activeStep <= index && !step.complete ? 'soft' : 'solid'}
										color={activeStep < index && !step.complete ? 'neutral' : 'primary'}
									>
										{!step.complete ? index + 1 : <Check />}
									</StepIndicator>
								}
								sx={{
									...(step.complete && {
										'&::after': { bgcolor: 'primary.solidBg' },
									}),
								}}
							>
								<StepButton
									sx={{
										cursor: 'default',
										...(step.complete &&
											!step.locked && {
												'&:hover': {
													bgcolor: 'var(--joy-palette-neutral-softBg)',
													borderRadius: 'sm',
													cursor: 'pointer',
												},
											}),
									}}
									onClick={() => {
										if (step.complete && !step.locked) {
											setActiveStep(index);
										}
									}}
								>
									{step.name}
								</StepButton>
							</Step>
						);
					})}
				</Stepper>
			</Box>
		</Box>
	);
}

export default App;
