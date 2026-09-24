// Firebase configuration

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {

    apiKey: "AIzaSyDLzi_6-wAY-rV_7SehzxebHaZGnDMOKKo",
  authDomain: "uiu-pulse-2208.firebaseapp.com",
  projectId: "uiu-pulse-2208",
  storageBucket: "uiu-pulse-2208.firebasestorage.app",
  messagingSenderId: "517364599351",
  appId: "1:517364599351:web:f8986054319d5d8bd00db2",
  measurementId: "G-1PPFHBLR84"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);