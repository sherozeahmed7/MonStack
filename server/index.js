import 'dotenv/config';
import mongoose from 'mongoose';
import {createApp} from './app.js';
if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required. Use npm run dev for a local development database.');
if(process.env.NODE_ENV==='production'&&!process.env.APP_ORIGIN?.startsWith('https://'))throw new Error('Set APP_ORIGIN to your HTTPS production URL.');
await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
const server=createApp().listen(process.env.PORT||3000,()=>console.log(`Monstack is ready at http://localhost:${process.env.PORT||3000}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0);}));
