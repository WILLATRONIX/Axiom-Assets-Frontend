import { useState, Fragment } from "react";
import { post } from "lib/network";
import { useNotification } from "lib/NotificationContext";

import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import ModalClose from "@mui/joy/ModalClose";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

export default function ShareItemModal({ open, setOpen, targetItem }) {
	const [copied, setCopied] = useState(false);

	const { notify } = useNotification();
	const url = `https://axiomassets.net/u/${targetItem?.publisher_user?.username}/${targetItem?.uuid}`;

	const handleClose = () => {
		setOpen(false);
	};

	const handleCopyLink = async () => {
		await navigator.clipboard.writeText(url);
		setCopied(true);
		notify("Link copied to clipboard.");
	};

	return (
		<Fragment>
			<Modal open={open} onClose={handleClose}>
				<ModalDialog sx={{ width: 480 }}>
					<ModalClose />
					<DialogTitle>Share Asset</DialogTitle>
					<Divider />
					<DialogContent sx={{ gap: "1rem" }}>
						<FormControl>
							<FormLabel>URL</FormLabel>
							<Stack direction={"row"}>
								<Input
									value={url}
									sx={{ width: "100%", mr: 1 }}
								/>
								<IconButton
									color="primary"
									variant={copied ? "plain" : "solid"}
									onClick={handleCopyLink}
								>
									<ContentCopyOutlinedIcon />
								</IconButton>
							</Stack>
						</FormControl>
					</DialogContent>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
