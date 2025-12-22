// config/firebase.ts - ПРАВИЛЬНАЯ КОНФИГУРАЦИЯ
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// КОНФИГУРАЦИЯ ДЛЯ REACT NATIVE
const firebaseConfig = {
    apiKey: "AIzaSyBCFbtOj1UXJboLagydl2wRDmOI0BXAxVU",
    projectId: "fallzone-9cda7",
    storageBucket: "fallzone-9cda7.firebasestorage.app",
    appId: "1:465041975512:android:35af392c86a97a78064fad",
    messagingSenderId: "465041975512"
};

console.log('🔥 Firebase Config:', {
    apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId?.substring(0, 20) + '...',
});

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Для отладки
console.log('✅ Firebase App initialized:', app.name);
console.log('✅ Firebase Auth initialized:', !!auth);
console.log('✅ Firebase Firestore initialized:', !!db);

export { auth, db };

