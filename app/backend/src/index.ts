'use strict';

import * as http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as path from 'path';
import Controller from './framework/Controller';

dotenv.config({
	path: path.resolve(__dirname + '/./../.env'),
});

const BACKEND_PORT: number =
	(Number.parseInt(process.env.API_HTTP_PORT) || undefined) ?? 5000;
const REACT_PORT: number =
	(Number.parseInt(process.env.REACT_HTTP_PORT) || undefined) ?? 3000;
const DOMAIN: string = process.env.REACT_APP_DOMAIN || 'http://localhost';

// setup server
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: `${DOMAIN}:${REACT_PORT}`,
	},
});

const controller = new Controller(io);

io.on('connection', controller.onConnect.bind(controller));
io.listen(BACKEND_PORT);
