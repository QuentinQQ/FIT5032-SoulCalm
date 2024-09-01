import {
    ref
} from 'vue';
import router from '../router/index';
import {
    auth,
    // db
} from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import {
    useDb
} from './firestore';

const isAuthenticated = ref(false);
const currentRole = ref('');
const currentUserUid = ref('');

/**
 * 用户注册方法
 * @param {string} email - 用户的电子邮件地址
 * @param {string} password - 用户的密码
 */
const signup = (email, password) => {
    const defaultRole = ref('user');
    return createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log('User ID (uid):', user.uid);
            console.log('User Email:', user.email);
            console.log('Creation Time:', user.metadata.creationTime);
            console.log('Last Sign In Time:', user.metadata.lastSignInTime);
            isAuthenticated.value = true;

            await useDb.saveUserToDatabase(user, defaultRole);

            console.log('User signed up:', user);
            alert('User signed up successfully');
            router.push('/');
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


/**
 * 用户登录方法
 * @param {string} email - 用户的电子邮件地址
 * @param {string} password - 用户的密码
 */
const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            isAuthenticated.value = true; // update authentication status
            currentUserUid.value = user.uid; // update current user UID
            console.log('User logged in:', user);

            // update current role
            await useDb.getAndSetCurrentUserRole(user.uid, currentRole);

            router.push('/'); // push after login
            return user;
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert(error.message); //test
            throw error;
        });
};


const logout = () => {
    return signOut(auth)
        .then(() => {
            // reset authentication status
            isAuthenticated.value = false;
            // reset current role
            currentRole.value = '';
            // reset current user UID
            currentUserUid.value = '';

            console.log('User logged out');
            console.log('isAuthenticated:', isAuthenticated.value);
            console.log('currentRole:', currentRole.value);
            console.log('currentUserUid:', currentUserUid.value);

            // router.push('/login');
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
        currentRole,
        currentUserUid
    };
}