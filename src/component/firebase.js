// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore,collection,getDocs,addDoc,doc,updateDoc,deleteDoc,getDoc} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCl-0h25pTIQNkoYW93fGf_Kw-HiWXlLFo",
  authDomain: "printsuit-3b5fb.firebaseapp.com",
  projectId: "printsuit-3b5fb",
  storageBucket: "printsuit-3b5fb.firebasestorage.app",
  messagingSenderId: "560781385855",
  appId: "1:560781385855:web:bc1fca2d9737fc8f75df4a"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;
export {collection, getDocs, addDoc,doc,updateDoc,deleteDoc,getDoc };