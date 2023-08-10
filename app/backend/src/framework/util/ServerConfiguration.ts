import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
	path: path.resolve(__dirname + '/./../.env'),
});

const server = {
	apiPort: Number.parseInt(process.env.API_HTTP_PORT) || undefined,
	reactPort: Number.parseInt(process.env.REACT_HTTP_PORT) || undefined,
	reactDomain: process.env.REACT_APP_DOMAIN || 'http://localhost',
	apiDisconnectTimeoutSec:
		Number.parseInt(process.env.API_DISCONNECT_TIMEOUT) || 60,
};
export default server;
