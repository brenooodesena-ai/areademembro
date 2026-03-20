import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const fbApp = initializeApp(firebaseConfig);
const firestore = getFirestore(fbApp);

async function check() {
    process.stdout.write('--- MODULES ---\n');
    const snap = await getDocs(collection(firestore, 'modules'));
    process.stdout.write(`Size: ${snap.size}\n`);
    snap.forEach(doc => {
        process.stdout.write(`ID: ${doc.id} | Title: ${doc.data().title}\n`);
    });
    process.stdout.write('--- END ---\n');
}

check().catch(console.error);
