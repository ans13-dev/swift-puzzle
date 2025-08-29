import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
      apiKey: "AIzaSyAn_IC_Jn1yb_BqdsMJW6aL3ymdtRtv0lQ",
      authDomain: "swiftpuzzle-82bf4.firebaseapp.com",
      projectId: "swiftpuzzle-82bf4",
      storageBucket: "swiftpuzzle-82bf4.firebasestorage.app",
      messagingSenderId: "1058017745626",
      appId: "1:1058017745626:web:af284c892bd0448056e3e3"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)