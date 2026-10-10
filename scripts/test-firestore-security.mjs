// Isolated integration test: never connects to the production project.
// firebase emulators:exec --project demo-corexit-permissions --config firebase.test.json --only auth,firestore "node scripts/test-firestore-security.mjs"
import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, collection, query, where, orderBy, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, terminate } from 'firebase/firestore';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw new Error('Run only through the configured emulators.');
const app = initializeApp({ projectId: 'demo-corexit-permissions', apiKey: 'emulator-only', appId: 'emulator-only' });
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);
let passed = 0;
const check = async (name, run) => { await run(); passed++; console.log(`PASS ${name}`); };
const denied = run => assert.rejects(run, e => e.code === 'permission-denied');
const highlights = doc(db, 'company_highlights', 'main');
const active = doc(db, 'client_brands', 'active');
const inactive = doc(db, 'client_brands', 'inactive');
const brands = query(collection(db, 'client_brands'), where('isActive', '==', true), orderBy('displayOrder', 'asc'));
try {
 await createUserWithEmailAndPassword(auth, 'admin@example.test', 'emulator-password');
 await signOut(auth);
 await check('existing email/password admin login', () => signInWithEmailAndPassword(auth, 'admin@example.test', 'emulator-password'));
 await check('admin creates highlights and brands', async () => {
  await setDoc(highlights, { projectsCompleted: 50 });
  await setDoc(active, { name: 'Active', isActive: true, displayOrder: 1 });
  await setDoc(inactive, { name: 'Inactive', isActive: false, displayOrder: 2 });
 });
 await check('admin reads inactive brands and unfiltered brand list', async () => {
  assert.equal((await getDoc(inactive)).exists(), true);
  assert.equal((await getDocs(query(collection(db, 'client_brands'), orderBy('displayOrder')))).size, 2);
 });
 await check('admin edits brands and highlights', async () => {
  await updateDoc(active, { name: 'Edited' });
  await setDoc(highlights, { projectsCompleted: 51 }, { merge: true });
 });
 await check('admin adds and deletes brand', async () => {
  const created = await addDoc(collection(db, 'client_brands'), { name: 'Temporary', isActive: true, displayOrder: 3 });
  await deleteDoc(created);
  assert.equal((await getDoc(created)).exists(), false);
 });
 await signOut(auth);
 assert.equal(auth.currentUser, null);
 await check('logged-out highlights GET without isActive', async () => assert.equal((await getDoc(highlights)).data().projectsCompleted, 51));
 await check('logged-out active brands query sees admin edit', async () => {
  const snapshot = await getDocs(brands);
  assert.equal(snapshot.size, 1);
  assert.equal(snapshot.docs[0].data().name, 'Edited');
 });
 await check('logged-out inactive brand GET allowed', async () => assert.equal((await getDoc(inactive)).exists(), true));
 await check('logged-out unfiltered brands LIST allowed', async () => assert.equal((await getDocs(collection(db, 'client_brands'))).size >= 1, true));
 for (const [name, ref] of [['highlights', highlights], ['brand', active]]) {
  await check(`logged-out ${name} CREATE denied`, () => denied(() => setDoc(doc(db, ref.parent.path, 'forbidden'), { isActive: true })));
  await check(`logged-out ${name} UPDATE denied`, () => denied(() => updateDoc(ref, { isActive: true })));
  await check(`logged-out ${name} DELETE denied`, () => denied(() => deleteDoc(ref)));
 }
 await check('unmatched collection read/write denied', async () => {
  await denied(() => getDoc(doc(db, 'private', 'test')));
  await denied(() => setDoc(doc(db, 'private', 'test'), { test: true }));
 });
 await check('public highlights and brands onSnapshot succeed', async () => {
  for (const ref of [highlights, brands]) {
   await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { unsubscribe(); reject(new Error('Snapshot timeout')); }, 10000);
    const unsubscribe = onSnapshot(ref, () => { clearTimeout(timer); unsubscribe(); resolve(); }, error => { clearTimeout(timer); unsubscribe(); reject(error); });
   });
  }
 });
 console.log(`${passed} security checks passed`);
} finally { await terminate(db); await deleteApp(app); }
