import express from 'express'
import { bootstrap } from './src/app.controller.js';
import {createServer} from 'node:http'
import { Server } from 'socket.io';
import { connectionDB } from "./src/DB/ConnectionDb.js";
import { startSocket } from './src/socket/socket.controller.js';

const port=process.env.PORT || 3000;

// open Server
const app=express()
const server=createServer(app)
const io= new Server(server,{cors:{origin:"*"}})

startSocket(io)



// connection to our database
connectionDB();
// function that handle Request 
bootstrap(app,express)

// tell the server to listen to request coming in this port 
server.listen(port,()=>{
    console.log(`the server is runing on port ${port}`)
})


