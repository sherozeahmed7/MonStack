import test from 'node:test';
import assert from 'node:assert/strict';
import {configured,importAI,research} from '../server/ai.js';
import {blankResume} from '../server/resume.js';

test('Gemini returns validated resumes and takes priority without a paid fallback',async t=>{
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  assert.match(url,/generativelanguage.googleapis.com/);
  assert.equal(options.headers['x-goog-api-key'],'test-gemini');
  assert.equal(JSON.parse(options.body).generationConfig.responseMimeType,'application/json');
  return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({...blankResume(),name:'Test'})}]}}]});
 });
 const old={...process.env};t.after(()=>{process.env=old;});
 process.env.GEMINI_API_KEY='test-gemini';process.env.OPENAI_API_KEY='test-openai';
 assert.equal(configured(),true);assert.equal((await importAI('Test resume')).name,'Test');
});

test('quota errors are actionable and do not leak provider details',async t=>{
 const old={...process.env};t.after(()=>{process.env=old;});process.env.GEMINI_API_KEY='test';
 t.mock.method(globalThis,'fetch',async()=>Response.json({error:{code:429,message:'quota exhausted for secret-project'}},{status:429}));
 await assert.rejects(importAI('Test'),e=>/quota or credits/.test(e.message)&&!e.message.includes('secret-project'));
});

test('research preserves sources and extracts skills separately',async t=>{
 const old={...process.env};t.after(()=>{process.env=old;});process.env.GEMINI_API_KEY='test';let calls=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  const body=JSON.parse(options.body);calls++;
  if(calls===1){assert.deepEqual(body.tools,[{google_search:{}}]);return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'SQL is requested.'}]},groundingMetadata:{groundingChunks:[{web:{title:'Job',uri:'https://example.com/job'}}]}}]});}
  return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'{"skills":["SQL"]}'}]}}]});
 });
 const result=await research('Analyst','US');assert.equal(calls,2);assert.deepEqual(result.skills,['SQL']);assert.equal(result.sources[0].url,'https://example.com/job');
});

test('unsourced Gemini research is rejected',async t=>{
 const old={...process.env};t.after(()=>{process.env=old;});process.env.GEMINI_API_KEY='test';
 t.mock.method(globalThis,'fetch',async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'Unverified claims'}]}}]}));
 await assert.rejects(research('Analyst','US'),/did not return web sources/);
});
