import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAJR65IYvJCBi-YuqmElpzF69huftcEkOU",
  authDomain: "looklens-e9810.firebaseapp.com",
  projectId: "looklens-e9810",
  storageBucket: "looklens-e9810.firebasestorage.app",
  messagingSenderId: "548551855520",
  appId: "1:548551855520:web:3695bcbb0185a3067728c5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };