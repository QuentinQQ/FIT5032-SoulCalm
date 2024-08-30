import {
    ref
} from 'vue';
import router from './index';
import {
    auth
} from '../firebase/firebase';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

const isAuthenticated = ref(false);


const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            isAuthenticated.value = true; // update authentication status
            console.log('User signed up:', user);
            alert('User signed up successfully');
            router.push('/'); // push to home page
            return user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Signup error:', errorCode, errorMessage);
            alert(errorMessage);
            throw error;
        });
};


const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            isAuthenticated.value = true; // update authentication status
            console.log('User logged in:', user);
            router.push('/'); // push after login
            return user;
        })
        .catch((error) => {
            console.error('Login error:', error);
            throw error;
        });
};


const logout = () => {
    return signOut(auth)
        .then(() => {
            isAuthenticated.value = false;
            console.log('User logged out');
            router.push('/login'); // push after logout
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
};


export function useAuth() {
    return {
        isAuthenticated,
        signup,
        login,
        logout,
    };
}