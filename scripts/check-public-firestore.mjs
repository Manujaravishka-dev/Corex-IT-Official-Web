import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection, query, where, orderBy, getDocFromServer, getDocsFromServer, terminate } from 'firebase/firestore';
loadEnvConfig(process.cwd());
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (projectId !== 'corexit-652f5') throw new Error('Unexpected Firebase project');
const app = initializeApp({ projectId, apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID });
const db = getFirestore(app);
console.log(JSON.stringify({ projectId, authenticated: getAuth(app).currentUser !== null }));
const reads = [
 ['company_highlights/main GET', () => getDocFromServer(doc(db, 'company_highlights', 'main'))],
 ['client_brands LIST isActive=true orderBy displayOrder ASC', () => getDocsFromServer(query(collection(db, 'client_brands'), where('isActive', '==', true), orderBy('displayOrder', 'asc')))],
 ['settings/company GET', () => getDocFromServer(doc(db, 'settings', 'company'))],
 ['testimonials LIST status=published orderBy createdAt DESC', () => getDocsFromServer(query(collection(db, 'testimonials'), where('status', '==', 'published'), orderBy('createdAt', 'desc')))],
 ...['hero', 'services'].map(category => [`websiteImages LIST category=${category} isActive=true orderBy sortOrder ASC`, () => getDocsFromServer(query(collection(db, 'websiteImages'), where('category', '==', category), where('isActive', '==', true), orderBy('sortOrder', 'asc')))]),
];
try {
 await Promise.all(reads.map(async ([request, read]) => {
  try { const result = await read(); console.log(JSON.stringify({request, result:'allowed', count:result.size ?? Number(result.exists())})); }
  catch(error) { console.error(JSON.stringify({request, code:error.code, message:error.message})); process.exitCode=1; }
 }));
} finally { await terminate(db); await deleteApp(app); }

