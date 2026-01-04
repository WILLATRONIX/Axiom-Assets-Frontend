import { useState, Fragment, useEffect, useRef } from 'react';

import { get, post } from 'lib/network';
import { useAuth } from 'lib/auth/authContext.js';
import { useNotification } from 'lib/NotificationContext';

import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Autocomplete from '@mui/joy/Autocomplete';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Tooltip from '@mui/joy/Tooltip';
import AspectRatio from '@mui/joy/AspectRatio';
import DialogContent from '@mui/joy/DialogContent';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import Checkbox from '@mui/joy/Checkbox';

import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const itemColumnMap = {
	users: {
		uuid: { dataType: 'string', locked: true },
		username: { dataType: 'string', maxSize: 64, locked: false },
		about_me: { dataType: 'string', maxSize: 256, locked: false },
		permission_level: { dataType: 'integer', maxSize: 32767, locked: false },
		badge_value: { dataType: 'integer', maxSize: 32767, locked: true },
		google_id: { dataType: 'string', maxSize: 32, locked: true },
		image_id: { dataType: 'integer', maxSize: 32767, locked: false },
		is_creator: { dataType: 'boolean', locked: true },
		last_login: { dataType: 'string', locked: true },
		last_visit: { dataType: 'string', locked: true },
		last_interaction: { dataType: 'string', locked: true },
		date_created: { dataType: 'string', locked: true },
	},
	items: {
		uuid: { dataType: 'string', locked: true },
		type: { dataType: 'integer', locked: true },
		header: { dataType: 'string', maxSize: 256, locked: false },
		desc_value: { dataType: 'string', maxSize: 32767, locked: false },
		value: { dataType: 'string', maxSize: 512, locked: false },
		metric: { dataType: 'integer', locked: false },
		publisher: { dataType: 'string', locked: true },
		parent: { dataType: 'string', locked: true },
		downloads: { dataType: 'integer', locked: true },
		saves: { dataType: 'integer', locked: true },
		image_carousel_length: { dataType: 'integer', locked: true },
		image_aspect_ratio: { dataType: 'string', locked: false },
		visibility: { dataType: 'string', maxSize: 64, locked: false },
		date_created: { dataType: 'string', locked: true },
		last_updated: { dataType: 'string', locked: true },
	},
	reports: {
		uuid: { dataType: 'string', locked: true },
		topic: { dataType: 'string', locked: true },
		desc_value: { dataType: 'string', maxSize: 512, locked: false },
		author: { dataType: 'string', locked: true },
		target_item: { dataType: 'string', locked: true },
		report_status: { dataType: 'string', maxSize: 16, locked: false },
		date_created: { dataType: 'string', locked: true },
	},
};

const CatImageReview = ({ defaultValue, clearDefault }) => {
	const [inputTopOffset, setInputTopOffset] = useState(50);
	const [inputValue, setInputValue] = useState('');

	const [isErrored, setIsErrored] = useState(false);

	const [matchedElement, setMatchedElement] = useState('');
	const [elementType, setElementType] = useState(null);
	const [elementName, setElementName] = useState('');

	const [hideLockedColumns, setHideLockedColumns] = useState(true);

	const [userUUID, setUserUUID] = useState(null);
	const [userName, setUserName] = useState('');
	const [userPermLvl, setUserPermLvl] = useState(3);
	const [userImageID, setUserImageID] = useState(null);

	const [items, setItems] = useState([]);
	const [hasNoItems, setHasNoItems] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [index, setIndex] = useState(0);
	const [totalItemCount, setTotalItemCount] = useState(0);

	const [filterQuery, setFilterQuery] = useState({
		header: '',
		publisherData: { username: '' },
		order: [['date_created', 'DESC']],
		type: '4',
		tags: [],
		tools: [],
	});

	const fetchItemsLimit = 4;

	const { user, loading } = useAuth();
	const { notify } = useNotification();

	useEffect(() => {
		const verifyToken = async () => {
			if (user && !loading) {
				setUserUUID(user.uuid);
				setUserName(user.username);
				setUserPermLvl(user.permission_level);
				setUserImageID(user.image_id);
			}
		};

		verifyToken();
	}, [user, loading]);

	const fetchData = async (customFetchItemsLimit = fetchItemsLimit) => {
		if (isLoading || hasNoItems) return;
		setIsLoading(true);

		try {
			const res = await post('/browse/get-new-item', {
				filterQuery,
				pagination: {
					limit: customFetchItemsLimit,
					offset: index,
				},
			});

			if (!res.assetData || res.assetData.length === 0) {
				setHasNoItems(true);
				setTotalItemCount(0);
				return;
			}

			if (res.assetData.length < customFetchItemsLimit) {
				setHasNoItems(true);
			}

			setItems(res.assetData);
			setTotalItemCount(res.assetCount);
			setIsLoading(false);
		} catch (error) {
			console.error(error);
			notify('Failed to load assets', 'danger');
			setHasNoItems(true);
		}
	};

	// const handleSetStatus = async () => {
	// 	if (isLoading || hasNoItems) return;
	// 	setIsLoading(true);

	// 	try {
	// 		// const res = await post(`/cat-image/edit/${uuid}`, {
				
	// 		// });

	// 		console.log(res)
	// 	} catch (error) {
	// 		console.error(error);
	// 		notify('Failed to update status', 'danger');
	// 		setHasNoItems(true);
	// 	}
	// };

	useEffect(() => {
		fetchData();
	}, [index]);

	return (
		<Fragment>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					alignItems: 'start',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					<IconButton
						variant="outlined"
						disabled={index === 0}
						onClick={() => {
							setIndex((prev) => prev - 1);
						}}
					>
						<KeyboardArrowLeftIcon />
					</IconButton>
					<IconButton
						variant="outlined"
						disabled={(index + 1) * fetchItemsLimit >= totalItemCount}
						onClick={() => {
							setIndex((prev) => prev + 1);
						}}
					>
						<KeyboardArrowRightIcon />
					</IconButton>
					<Typography>{`${fetchItemsLimit * index + 1} - ${Math.min(
						totalItemCount,
						fetchItemsLimit * (index + 1)
					)} of ${totalItemCount}`}</Typography>
				</Box>
				{items.map((item) => {
					return (
						<Card key={item.uuid} orientation="horizontal" variant="soft" sx={{ p: 0 }}>
							<AspectRatio ratio={1} sx={{ width: 256, position: 'relative' }}>
								<img
									src={`https://cdn.axiomassets.net/defaults/profile-img/pending/${item.uuid}.webp`}
									alt=""
									draggable={false}
									style={{
										position: 'absolute',
										width: 256,
										height: 256,
										backgroundColor: 'var(--joy-palette-neutral-softBg)',
									}}
									onError={(e) => {
										e.target.src =
											'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
									}}
								/>
								<Box
									sx={{
										position: 'absolute',
										bottom: 4,
										px: 1,
										display: 'flex',
										width: '100%',
										justifyContent: 'space-between',
									}}
								>
									<Typography level="body-xs" sx={{ color: item.textColour ?? '#FFF' }}>
										{item.header}
									</Typography>
									<Typography level="body-xs" sx={{ color: item.textColour ?? '#FFF' }}>
										{`@${item.publisherData.username}`}
									</Typography>
								</Box>
							</AspectRatio>
							<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', p: 2 }}>
								<FormControl>
									<FormLabel>Cat Name</FormLabel>
									<Input defaultValue={item.header} />
								</FormControl>
								<FormControl>
									<FormLabel>Author</FormLabel>
									<Input defaultValue={item.publisherData.username} />
								</FormControl>
								<Box
									sx={{ mt: 'auto', width: '100%', display: 'flex', justifyContent: 'end', gap: 1 }}
								>
									<Button variant="plain" color="danger">
										Deny
									</Button>
									<Button>Approve</Button>
								</Box>
							</Box>
						</Card>
					);
				})}
			</Box>
		</Fragment>
	);
};

export default CatImageReview;
