import express from 'express'
import { bootstrap } from './src/app.controller.js';

const port=process.env.PORT || 3000;
// open Server
const app=express()




// function that handle Request 
bootstrap(app,express)

// tell the server to listen to request coming in this port 
app.listen(port,()=>{
    console.log(`the server is runing on port ${port}`)
})


