import { PublicClientApplication } from '@azure/msal-browser';

const isDev = process.env.NODE_ENV === 'development';
const redirectUri = isDev
  ? 'http://localhost:3000/'
  : 'https://axiomassets.net/';

export const msalConfig = {
	auth: {
		clientId: process.env.NEXT_PUBLIC_AZURE_AUTH_CLIENT_ID,
		authority: 'https://login.microsoftonline.com/common',
		redirectUri,
	  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const initializeMsal = async () => {
	await msalInstance.initialize();
};
