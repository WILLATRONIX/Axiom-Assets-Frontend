import { Fragment, useState, memo, useMemo } from "react";

import Cropper from "react-easy-crop";

import Divider from "@mui/joy/Divider";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";
import AspectRatio from "@mui/joy/AspectRatio";
import Tooltip from "@mui/joy/Tooltip";
import IconButton from "@mui/joy/IconButton";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const UploadPreview = ({
	style,
	itemData,
	isSelected,
	onClick,
	onDelete,
	onEditClick,
}) => {
	const supressCall = () => {};

	return (
		<div style={{ ...style, marginLeft: "10px", marginTop: "10px" }}>
			<Card
				variant="outlined"
				sx={{
					width: 160,
					height: 196,
					p: 0,
					py: 0,
					position: "relative",
					"&:hover": {
						border: "1px solid var(--joy-palette-primary-500)",
					},
					border:
						isSelected === true &&
						"1px solid var(--joy-palette-primary-500)",
					outline:
						isSelected === true &&
						"2px solid var(--joy-palette-primary-500)",
				}}
			>
				<Box
					// onClick={() => onClick(itemData)}
					sx={{
						width: 160 - 2,
						height: 220 - 2,
						position: "absolute",
						zIndex: 1,
						borderRadius: "md",
						opacity: 0,
						justifyContent: "end",
						display: "flex",
						"&:hover": {
							opacity: 1,
							cursor: "pointer",
						},
					}}
				>
					<Box
						sx={{
							m: 0.5,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<IconButton
							sx={{ mb: 1, borderRadius: "0.5rem" }}
							variant="soft"
							color="primary"
							onClick={(event) => {
								event.stopPropagation();
								onEditClick(itemData);
							}}
						>
							<EditOutlinedIcon />
						</IconButton>
						<IconButton
							sx={{ borderRadius: "0.5rem" }}
							variant="soft"
							color="danger"
							onClick={(event) => {
								event.stopPropagation();
								onDelete(itemData);
							}}
						>
							<DeleteOutlineOutlinedIcon />
						</IconButton>
					</Box>
				</Box>
				<Box
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						gap: "1rem",
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<AspectRatio
							ratio="1"
							sx={{
								minWidth: "100px",
								flexGrow: 1,
								borderRadius: "8px 8px 0 0",
								position: "relative",
							}}
						>
							<Cropper
								image={
									itemData.thumbnail?.buffer ||
									itemData.thumbnail
								}
								crop={
									itemData.thumbnail.crop
										? {
												x:
													itemData.thumbnail.crop.x *
													(158 / 240),
												y:
													itemData.thumbnail.crop.y *
													(158 / 240),
											}
										: { x: 0, y: 0 }
								}
								zoom={itemData.thumbnail.zoom || 1}
								aspect={1}
								objectFit="cover"
								maxZoom={5}
								zoomSpeed={0.5}
								onCropChange={supressCall}
								onCropComplete={supressCall}
								onZoomChange={supressCall}
								showGrid={false}
								style={{
									mediaStyle: {
										backgroundColor:
											"var(--joy-palette-background-surface)",
									},
									cropAreaStyle: {
										border: "none",
										borderRadius: "0.5rem",
										boxShadow: "none",
									},
								}}
							/>
						</AspectRatio>
						<Divider />
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								flexShrink: 1,
								px: 1.5,
								mt: 0.5,
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexDirection: "row",
								}}
							>
								<Tooltip
									variant="outlined"
									placement="top"
									arrow
								>
									<Typography
										level="body-md"
										sx={{
											whiteSpace: "nowrap",
											textOverflow: "ellipsis",
											overflow: "hidden",
											maxWidth: "184px",
										}}
									>
										{itemData?.header}
									</Typography>
								</Tooltip>
							</Box>
						</Box>
					</Box>
				</Box>
			</Card>
		</div>
	);
};

export default memo(UploadPreview, (prev, next) => {
	return (
		prev.isSelected === next.isSelected && prev.itemData === next.itemData
	);
});
