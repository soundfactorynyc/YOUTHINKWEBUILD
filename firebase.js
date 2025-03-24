// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCp0daxKbNiFueCh_Nfu8s88yjHnBaEh7E",
  authDomain: "youthinkwebuild-3d3ca.firebaseapp.com",
  projectId: "youthinkwebuild-3d3ca",
  storageBucket: "youthinkwebuild-3d3ca.firebasestorage.app",
  messagingSenderId: "559119798813",
  appId: "1:559119798813:web:0fe75eeb316484f6932cf4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
