import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAJR65IYvJCBi-YuqmElpzF69huftcEkOU",
  authDomain: "looklens-e9810.firebaseapp.com",
  projectId: "looklens-e9810",
  storageBucket: "looklens-e9810.firebasestorage.app",
  messagingSenderId: "548551855520",
  appId: "1:548551855520:web:3695bcbb0185a3067728c5"
};

const app = initializeApp(firebaseConfig);
let firestore
let storage

if (typeof window !== 'undefined') {
    firestore = getFirestore(app)
    storage = getStorage(app);
}

export { app, storage, firestore };