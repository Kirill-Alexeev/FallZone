// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBCFbtOj1UXJboLagydl2wRDmOI0BXAxVU",
    authDomain: "fallzone-9cda7.firebaseapp.com",
    projectId: "fallzone-9cda7",
    storageBucket: "fallzone-9cda7.firebasestorage.app",
    messagingSenderId: "465041975512",
    appId: "1:465041975512:android:35af392c86a97a78064fad"
};

// Инициализация
const app = initializeApp(firebaseConfig);

// Инициализация Auth с явной типизацией
const auth = initializeAuth(app, {
    persistence: undefined // или добавьте нужную persistence
});

const db = getFirestore(app);

export { auth, db };
