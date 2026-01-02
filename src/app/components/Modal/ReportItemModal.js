import { useState, Fragment } from 'react';
import { post } from 'api/network';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Button from '@mui/joy/Button';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Divider from '@mui/joy/Divider';

export default function ReportItemModal({ open, setOpen, targetItem }) {
	const [reportReasonValue, setReportReasonValue] = useState('none');
	const [reportDescValue, setReportDescValue] = useState(null);

	const handleClose = () => {
		setOpen(false);
	};

	const confirmReport = async () => {
		try {
			await post(
				'/report',
				{
					reportData: {
						topic: reportReasonValue,
						desc_value: reportDescValue,
						targetItem: targetItem,
					},
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			handleClose();
		} catch (error) {
			console.warn('could not report item', error);
		}
	};

	return (
		<Fragment>
			<Modal open={open} onClose={handleClose}>
				<ModalDialog sx={{ width: 480 }}>
					<ModalClose />
					<DialogTitle>Report Asset</DialogTitle>
					<Divider />
					<DialogContent sx={{ gap: '1rem' }}>
						<FormControl>
							<FormLabel>Reason</FormLabel>
							<Select
								value={reportReasonValue}
								onChange={(e, newValue) => {
									setReportReasonValue(newValue);
								}}
							>
								<Option value="none" disabled>
									Select...
								</Option>
								<Option value="stolen">Stolen / Impersonation</Option>
								<Option value="nsfw">NSFW</Option>
								<Option value="discriminatory">Discriminatory Language</Option>
								<Option value="swearing">Swearing / Slurs</Option>
								<Option value="advertising">Advertising</Option>
								<Option value="spam">Spam / Misleading</Option>
								<Option value="other">Other</Option>
							</Select>
						</FormControl>
						{reportReasonValue == 'other' && (
							<Textarea
								placeholder="Describe the issue..."
								value={reportDescValue || ''}
								onChange={(e) => setReportDescValue(e.target.value)}
							/>
						)}
						<Button color="danger" disabled={reportReasonValue == 'none'} onClick={confirmReport}>
							Report
						</Button>
						<Typography sx={{ textAlign: 'center' }} level={'body-sm'}>
							An asset may only be reported once.
						</Typography>
					</DialogContent>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
