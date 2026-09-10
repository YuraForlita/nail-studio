import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

// 1. Створи проєкт на https://console.firebase.google.com
// 2. Додай веб-застосунок (значок </>) — Firebase покаже саме такий об'єкт config.
// 3. Встав свої дані нижче (це не секретні ключі, вони призначені бути в клієнтському коді —
//    справжній захист дають Firestore Security Rules, файл firestore.rules).
// 4. В консолі увімкни Authentication → Sign-in method → Email/Password.
// 5. В консолі увімкни Firestore Database (режим production).
const firebaseConfig = {
  apiKey: "AIzaSyDB1iuGEfuEF_LNcHT_9bqIpE3TPD7HxZ8",
  authDomain: "nail-studio-5b690.firebaseapp.com",
  projectId: "nail-studio-5b690",
  storageBucket: "nail-studio-5b690.firebasestorage.app",
  messagingSenderId: "733759474973",
  appId: "1:733759474973:web:b4ce3795fe5b54f661a5f4",
  measurementId: "G-QHGSHG9KC3"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Офлайн-режим: локальний кеш Firestore (IndexedDB), синхронізація при появі мережі.
// persistentMultipleTabManager дозволяє тримати додаток відкритим у кількох вкладках одночасно.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})
