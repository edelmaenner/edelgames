'use strict';

import * as http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import Controller from './framework/Controller';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
	path: path.resolve(__dirname + '/./../../../.env'),
});

const PORT: number = Number.parseInt(process.env.API_HTTP_PORT) ?? 5000;
const REACT_PORT: number = Number.parseInt(process.env.REACT_HTTP_PORT) ?? 3000;
const DOMAIN: string = process.env.DOMAIN ?? 'http://localhost';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: `${DOMAIN}:${REACT_PORT}`,
	},
});

app.use(cors());

const controller = new Controller(io);

io.on('connection', controller.onConnect.bind(controller));

io.listen(PORT);
