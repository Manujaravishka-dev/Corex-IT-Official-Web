const path = require('node:path');
const base = path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib');
const {getGlobalDefaultAccount} = require(path.join(base,'auth.js'));
const {requireAuth} = require(path.join(base,'requireAuth.js'));
const rules = require(path.join(base,'gcp/rules.js'));
(async () => {
 await requireAuth({project:'corexit-652f5', ...getGlobalDefaultAccount()});
 const releases = await rules.listAllReleases('corexit-652f5');
 const release = releases.find(r => r.name === 'projects/corexit-652f5/releases/cloud.firestore');
 console.log(JSON.stringify(release));
 if (!release) throw new Error('No default Firestore release');
 const files = await rules.getRulesetContent(release.rulesetName);
 for (const file of files) console.log(file.content);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
