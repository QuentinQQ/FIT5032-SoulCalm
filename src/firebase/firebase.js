// Import the functions you need from the SDKs you need
import {
    initializeApp
} from "firebase/app";
import {
    getAnalytics
} from "firebase/analytics";
import {
    getAuth
} from "firebase/auth";
import {
    getFirestore
} from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBToxyfT4YABMNZs4Eb_X_x9DH5IOU8QiY",
    authDomain: "soulcalm-1ff43.firebaseapp.com",
    projectId: "soulcalm-1ff43",
    storageBucket: "soulcalm-1ff43.appspot.com",
    messagingSenderId: "71234916179",
    appId: "1:71234916179:web:7dc1f155710adfdd9f9ba6",
    measurementId: "G-TFLN19XGE9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    db
};