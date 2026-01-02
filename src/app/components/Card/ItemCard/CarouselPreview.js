import { memo } from 'react';

import Divider from '@mui/joy/Divider';
import CardOverflow from '@mui/joy/CardOverflow';
import AspectRatio from '@mui/joy/AspectRatio';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';

import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';

const CarouselPreview = ({ itemType, itemUUID, gridView, presetValue, aspectRatio, onNextImage, carouselIndex }) => {
	if (itemType === 2) return null;

	const imageSrc =
		itemType === 1
			? `https://cdn.axiomassets.net/defaults/tool-icons/${gridView ? 288 : 192}/${presetValue}.png`
			: `https://cdn.axiomassets.net/thumbnail/${itemUUID}/${carouselIndex}.webp`;

	const imgStyle = {
		width: 288,
		height: 288,
		pointerEvents: 'none',
		userSelect: 'none',
		borderRadius: '0.5rem 0.5rem 0 0',
		backgroundColor: 'var(--joy-palette-neutral-softBg)',
	};

	const cardOverflowStyle = {
		width: 288,
	};

	const carouselButtonStyle = {
		bgcolor: 'rgba(var(--joy-palette-neutral-softBgChannel), 0.4)',
		height: '100%',
		borderRadius: 0,
		pointerEvents: 'auto',
	};

	return (
		<CardOverflow sx={cardOverflowStyle}>
			<AspectRatio ratio={aspectRatio.replace(':', '/')} sx={{ position: 'relative', height: 'auto' }}>
				<img
					src={imageSrc}
					alt=""
					draggable={false}
					style={imgStyle}
					onError={(e) => {
						e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						justifyContent: 'space-between',
						pointerEvents: 'none',
					}}
				>
					<IconButton
						sx={{ ...carouselButtonStyle, transform: 'rotate(180deg)' }}
						onClick={(event) => {
							event.stopPropagation();
							onNextImage(1);
						}}
					>
						<ArrowForwardIosOutlinedIcon />
					</IconButton>
					<IconButton
						sx={carouselButtonStyle}
						onClick={(event) => {
							event.stopPropagation();
							onNextImage(-1);
						}}
					>
						<ArrowForwardIosOutlinedIcon />
					</IconButton>
				</Box>
			</AspectRatio>
		</CardOverflow>
	);
};

export default memo(CarouselPreview, (prev, next) => {
	return prev.itemUUID === next.itemUUID && prev.gridView === next.gridView && prev.itemType === next.itemType;
});
