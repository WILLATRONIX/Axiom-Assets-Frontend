import { Fragment, useState, useEffect } from 'react';

import Snackbar from 'components/Snackbar/Notification';

import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Divider from '@mui/joy/Divider';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails, { accordionDetailsClasses } from '@mui/joy/AccordionDetails';
import AccordionSummary, { accordionSummaryClasses } from '@mui/joy/AccordionSummary';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Input from '@mui/joy/Input';
import Checkbox from '@mui/joy/Checkbox';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

const defaultSettings = {
	visibility: 'public',
	thumbnails: 'same',
	crediting: { team: [], extContributors: [] },
	theftProtection: { signAsset: false },
	monetisation: { disabled: true },
};

const UploadSettings = ({ hasBlueprint, onConfirm, defaultValue }) => {
	const [settings, setSettings] = useState(defaultSettings);

	useEffect(() => {
		if (defaultValue) {
			setSettings(defaultValue);
		}
	}, [defaultValue]);

	return (
		<Fragment>
			<Box
				sx={{
					display: 'flex',
					width: '100%',
					height: '100%',
					display: 'flex',
					gap: 6,
					alignItems: 'center',
					flexDirection: 'column',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'start',
						display: 'flex',
						mt: '10vh',
						gap: 6,
					}}
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
						<AccordionGroup
							variant="outlined"
							transition="0.2s"
							sx={(theme) => ({
								height: 'min-content',
								width: 240,
								borderRadius: 'lg',
								[`& .${accordionSummaryClasses.button}:hover`]: {
									bgcolor: 'transparent',
									borderRadius: 'lg',
								},
								[`& .${accordionDetailsClasses.content}`]: {
									boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
									[`&.${accordionDetailsClasses.expanded}`]: {
										paddingBlock: '0.75rem',
									},
								},
							})}
						>
							<Accordion defaultExpanded>
								<AccordionSummary>Visibility</AccordionSummary>
								<AccordionDetails variant="soft">
									<FormControl>
										<RadioGroup
											value={settings.visibility}
											onChange={(event) =>
												setSettings({ ...settings, visibility: event.target.value })
											}
										>
											<Radio value="public" label="Public" />
											<FormHelperText>Your asset will be visible to everyone.</FormHelperText>
											<Radio value="unlisted" label="Unlisted" />
											<FormHelperText>Anyone with a link can view your asset.</FormHelperText>
										</RadioGroup>
									</FormControl>
								</AccordionDetails>
							</Accordion>
						</AccordionGroup>
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
						{/* <AccordionGroup
							variant="outlined"
							transition="0.2s"
							sx={(theme) => ({
								height: 'min-content',
								width: 340,
								borderRadius: 'lg',
								[`& .${accordionSummaryClasses.button}:hover`]: {
									bgcolor: 'transparent',
									borderRadius: 'lg',
								},
								[`& .${accordionDetailsClasses.content}`]: {
									boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
									gap: 1.5,
									[`&.${accordionDetailsClasses.expanded}`]: {
										paddingBlock: '0.75rem',
									},
								},
							})}
						>
							<Accordion>
								<AccordionSummary>Crediting and Contributors</AccordionSummary>
								<AccordionDetails variant="soft">
									<FormControl>
										<FormLabel>Team</FormLabel>
										<Dropdown>
											<MenuButton endDecorator={<ArrowDropDown />}>Select Team</MenuButton>
											<Menu variant="plain">
												<MenuItem>
													<ListItemDecorator>
														<AddIcon />
													</ListItemDecorator>
													New Team
												</MenuItem>
												<MenuItem>
													<ListItemDecorator>
														<GroupOutlinedIcon />
													</ListItemDecorator>
													Team 1
												</MenuItem>
												<MenuItem>
													<ListItemDecorator>
														<GroupOutlinedIcon />
													</ListItemDecorator>
													Team 2
												</MenuItem>
											</Menu>
										</Dropdown>
									</FormControl>
									<FormControl>
										<FormLabel>External Contributors</FormLabel>
										<Input placeholder="e.g. BobTheBuilder" endDecorator={<Button>Add</Button>} />
									</FormControl>
								</AccordionDetails>
							</Accordion>
						</AccordionGroup> */}
						{/* <AccordionGroup
							variant="outlined"
							transition="0.2s"
							sx={(theme) => ({
								height: 'auto',
								width: 360,
								borderRadius: 'lg',
								[`& .${accordionSummaryClasses.button}:hover`]: {
									bgcolor: 'transparent',
									borderRadius: 'lg',
								},
								[`& .${accordionDetailsClasses.content}`]: {
									boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
									gap: 1.5,
									[`&.${accordionDetailsClasses.expanded}`]: {
										paddingBlock: '0.75rem',
									},
								},
							})}
						>
							<Accordion defaultExpanded>
								<AccordionSummary>Theft Protection</AccordionSummary>
								<AccordionDetails variant="soft">
									<FormControl>
										<Checkbox
											label="Sign Asset"
											checked={settings.theftProtection.signAsset}
											onChange={(event) =>
												setSettings((prev) => ({
													...prev,
													theftProtection: {
														...prev.theftProtection,
														signAsset: event.target.checked,
													},
												}))
											}
										/>
										<FormHelperText>
											Inject a unique signature into the asset file to trace its origin.
										</FormHelperText>
									</FormControl>
									<FormControl>
										<Checkbox label="Block Order" disabled />
										<FormHelperText>
											Extract the blueprint data and compare the percentage of similar blocks.
											Reqires asset monetisation.
										</FormHelperText>
									</FormControl>
									<Typography level="body-sm">
										This information can be used to assist with takedown requests.
									</Typography>
								</AccordionDetails>
							</Accordion>
						</AccordionGroup> */}
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
						{/* {hasBlueprint && (
							<AccordionGroup
								variant="outlined"
								transition="0.2s"
								sx={(theme) => ({
									height: 'min-content',
									width: 320,
									borderRadius: 'lg',
									[`& .${accordionSummaryClasses.button}:hover`]: {
										bgcolor: 'transparent',
										borderRadius: 'lg',
									},
									[`& .${accordionDetailsClasses.content}`]: {
										boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
										[`&.${accordionDetailsClasses.expanded}`]: {
											paddingBlock: '0.75rem',
										},
									},
								})}
							>
								<Accordion defaultExpanded>
									<AccordionSummary>Blueprint Thumbnail</AccordionSummary>
									<AccordionDetails variant="soft">
										<FormControl>
											<RadioGroup
												value={settings.thumbnails}
												onChange={(event) =>
													setSettings({ ...settings, thumbnails: event.target.value })
												}
											>
												<Radio value="same" label="Same" />
												<FormHelperText>Thumbnails will stay the same.</FormHelperText>
												<Radio value="upscaled" label="Upscaled" />
												<FormHelperText>
													Default thumbnails will be upscaled to improve quality.
												</FormHelperText>
												<Radio value="3d" label="3D" disabled />
												<FormHelperText>Reqires asset monetisation.</FormHelperText>
												<FormHelperText>Displays a 3D model of the blueprint.</FormHelperText>
											</RadioGroup>
										</FormControl>
									</AccordionDetails>
								</Accordion>
							</AccordionGroup>
						)} */}
						{/* <AccordionGroup
							variant="outlined"
							transition="0.2s"
							sx={(theme) => ({
								height: 'min-content',
								maxWidth: 400,
								borderRadius: 'lg',
								[`& .${accordionSummaryClasses.button}:hover`]: {
									bgcolor: 'transparent',
									borderRadius: 'lg',
								},
								[`& .${accordionDetailsClasses.content}`]: {
									boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
									[`&.${accordionDetailsClasses.expanded}`]: {
										paddingBlock: '0.75rem',
									},
								},
							})}
						>
							<Accordion>
								<AccordionSummary>Monetisation</AccordionSummary>
								<AccordionDetails variant="soft">
									<FormControl>
										<Checkbox
											label="Enable Monetisation"
											disabled={settings.monetisation.disabled}
										/>
										<FormHelperText>Requires Stripe connection.</FormHelperText>
										<Input
											placeholder="Amount"
											type="number"
											startDecorator={'Є'}
											endDecorator={
												<Fragment>
													<Divider orientation="vertical" />
													<Select
														variant="plain"
														// value={currency}
														// onChange={(_, value) => setCurrency(value)}
														slotProps={{
															listbox: {
																variant: 'outlined',
															},
														}}
														sx={{ mr: -1.5, '&:hover': { bgcolor: 'transparent' } }}
													>
														<Option value="usd">USD</Option>
														<Option value="gbp">GBP</Option>
														<Option value="eur">EUR</Option>
														<Option value="yen">YEN</Option>
													</Select>
												</Fragment>
											}
											sx={{ width: 300 }}
										/>
										<RadioGroup defaultValue="none">
											<Radio value="equal" label="Distribute Profit Equally" />
											<FormHelperText>
												Selected team members and external contributors will get an equal share
												of each sale.
											</FormHelperText>
											<Radio value="split" label="Manual" />
											<FormHelperText>Set the split percentages manually.</FormHelperText>
										</RadioGroup>
									</FormControl>
								</AccordionDetails>
							</Accordion>
						</AccordionGroup> */}
					</Box>
				</Box>
				<Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
					<Button onClick={() => onConfirm(settings)}>Next</Button>
				</Box>
			</Box>
		</Fragment>
	);
};

export default UploadSettings;
