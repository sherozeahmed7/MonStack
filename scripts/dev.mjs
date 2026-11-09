import 'dotenv/config';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
let mongo;await mkdir('.local/mongodb',{recursive:true});
if(!process.env.MONGODB_URI){mongo=await MongoMemoryServer.create({instance:{dbPath:fileURLToPath(new URL('../.local/mongodb',import.meta.url)),storageEngine:'wiredTiger',dbName:'monstack'}});process.env.MONGODB_URI=mongo.getUri('monstack');console.log('Local MongoDB started; data persists in .local/mongodb.');}
const server=spawn(process.execPath,['server/index.js'],{stdio:'inherit',env:process.env});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{stdio:'inherit',env:process.env});
async function stop(){server.kill();vite.kill();await mongo?.stop();process.exit();}process.on('SIGINT',stop);process.on('SIGTERM',stop);
