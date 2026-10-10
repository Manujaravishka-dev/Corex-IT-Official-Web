const path = require('node:path');
const fs = require('node:fs');
const base = path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib');
const {getGlobalDefaultAccount} = require(path.join(base,'auth.js'));
const {requireAuth} = require(path.join(base,'requireAuth.js'));
const {Client} = require(path.join(base,'apiv2.js'));
const cases = [];
function add(name, collection, method, authenticated, data, expectation) {
 cases.push({name, test: {expectation, request: {path:`/databases/(default)/documents/${collection}/test`, method, auth:authenticated ? {uid:'rules-test-admin',token:{}} : null, resource:{data:{isActive:true}}},resource:{data}}});
}
for(const collection of ['company_highlights','client_brands']) {
 add(`${collection} public get`,collection,'get',false,collection==='client_brands'?{isActive:true}:{projectsCompleted:50},'ALLOW');
 for(const method of ['create','update','delete']) {
  add(`${collection} public ${method}`,collection,method,false,{isActive:true},'DENY');
  add(`${collection} admin ${method}`,collection,method,true,{isActive:false},'ALLOW');
 }
 add(`${collection} admin get`,collection,'get',true,{isActive:false},'ALLOW');
 add(`${collection} admin list`,collection,'list',true,{isActive:false},'ALLOW');
}
add('inactive brand public get','client_brands','get',false,{isActive:false},'ALLOW');
add('unmatched public create','private','create',false,{},'DENY');
add('unmatched admin create','private','create',true,{},'DENY');
(async()=>{
 await requireAuth({project:'corexit-652f5',...getGlobalDefaultAccount()});
 const client = new Client({urlPrefix:'https://firebaserules.googleapis.com',apiVersion:'v1'});
 const result = await client.post('/projects/corexit-652f5:test',{source:{files:[{name:'firestore.rules',content:fs.readFileSync('firestore.rules','utf8')}]},testSuite:{testCases:cases.map(c=>c.test)}},{skipLog:{body:true}});
 if(result.body.issues) console.log(JSON.stringify(result.body.issues));
 for(const [i,test] of (result.body.testResults||[]).entries()) {
  console.log(`${test.state} ${cases[i].name} (expected ${cases[i].test.expectation})`);
  if(test.state!=='SUCCESS'){console.log(JSON.stringify(test));process.exitCode=1;}
 }
 if(result.body.testResults?.length!==cases.length) process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
