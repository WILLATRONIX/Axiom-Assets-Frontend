import Box from '@mui/joy/Box';
import CardOverflow from '@mui/joy/CardOverflow';
import AspectRatio from '@mui/joy/AspectRatio';

const ThumbPreview = ({
	width,
	itemType,
	itemUUID,
	presetValue,
	aspectRatio,
	isCarousel,
	currentImageIndex,
	customOverride,
	themeData,
}) => {
	const getImageUrl = () => {
		if (customOverride) return customOverride;

		if (isCarousel) {
			return `https://cdn.axiomassets.net/thumbnail/${itemUUID}/${currentImageIndex}.webp`;
		} else {
			if (itemType === 1) {
				return `https://cdn.axiomassets.net/defaults/tool-icons/288/${presetValue}.png`;
			} else {
				return `https://cdn.axiomassets.net/thumbnail/${itemUUID}/thumb.webp`;
			}
		}
	};

	const cardOverflowStyle = {
		width: width,
		height: width,
		flex: 1,
	};

	const isTheme = itemType === 2;

	return (
		<CardOverflow sx={{ ...cardOverflowStyle, p: 0 }}>
			<AspectRatio
				ratio={aspectRatio.replace(':', '/')}
				sx={{
					borderRadius: 'md',
					bgcolor: 'transparent',
					'& .MuiAspectRatio-content': { bgcolor: isTheme && 'transparent' },
				}}
			>
				{!isTheme && (
					<img
						src={getImageUrl()}
						alt=""
						draggable={false}
						fetchPriority='high'
						style={{
							...cardOverflowStyle,
							pointerEvents: 'none',
							userSelect: 'none',
							borderRadius: 0,
						}}
						onError={(e) => {
							e.target.src =
								'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
						}}
					/>
				)}
			</AspectRatio>
		</CardOverflow>
	);
};

export default ThumbPreview;
