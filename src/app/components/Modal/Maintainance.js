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
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";

export default function MaintainenceMessage({ open, setOpen, onClose }) {
	const [secretInputValue, setSecretInputValue] = useState("");

	const handleSubmit = (event) => {
		event.preventDefault();
		if (secretInputValue === "itsmewillatronix") {
			onClose();
			setOpen(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={() => {
				setOpen(false);
			}}
		>
			<ModalDialog sx={{ width: 480 }}>
				<ModalClose />
				<DialogTitle>Shutting Down Soon...</DialogTitle>
				<Divider />

				<DialogContent
					component="form"
					onSubmit={handleSubmit}
					sx={{ gap: 1 }}
				>
					<Typography>
						The Axiom Asset Library will be permanently shut down
						soon.
					</Typography>

					<Input
						autoFocus
						sx={{
							width: 0,
							height: 0,
							p: 0,
							minHeight: 0,
							borderRadius: 0,
							my: -0.5,
						}}
						variant="plain"
						value={secretInputValue}
						onChange={(e) => setSecretInputValue(e.target.value)}
					/>

					<button type="submit" hidden />
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography level="body-sm">
							Join the{" "}
							<a href="https://discord.gg/JYMDCvmtfK">Discord</a>{" "}
							for updates.
						</Typography>
						<Button
							variant="plain"
							sx={{ my: 1 }}
							onClick={() => {
								onClose();
							}}
						>
							Don't show again
						</Button>
					</Box>
				</DialogContent>
			</ModalDialog>
		</Modal>
	);
}
