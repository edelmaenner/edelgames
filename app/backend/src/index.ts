'use strict';

import * as http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import Controller from './framework/Controller';
import serverConfiguration from './framework/util/ServerConfiguration';

const BACKEND_PORT: number = serverConfiguration.apiPort ?? 5000;
const REACT_PORT: number = serverConfiguration.reactPort ?? 3000;
const DOMAIN: string = serverConfiguration.reactDomain;

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
