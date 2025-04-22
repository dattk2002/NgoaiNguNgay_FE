// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuX1_X3PGttD65dagMNNxQ_H-Iwt8uMps",
  authDomain: "ngoaingungay.firebaseapp.com",
  projectId: "ngoaingungay",
  storageBucket: "ngoaingungay.firebasestorage.app",
  messagingSenderId: "789756207603",
  appId: "1:789756207603:web:d90ad33418f29238983286"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
