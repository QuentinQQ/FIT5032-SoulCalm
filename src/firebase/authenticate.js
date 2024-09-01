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
// import {
//     addDoc,
//     collection,
//     doc,
//     getDocs,
//     query,
//     where,
// } from "firebase/firestore";
import {
    useDb
} from './firestore';

const isAuthenticated = ref(false);
const currentRole = ref('');
const currentUserUid = ref('');


// const saveUserToDatabase = async (user, userRole) => {
//     try {
//         const docRef = await addDoc(collection(db, "users"), {

//             uid: user.uid,
//             email: user.email,
//             role: userRole,
//             creationTime: user.metadata.creationTime,
//         });
//         console.log("Document written with ID: ", docRef.id);
//     } catch (e) {
//         console.error("Error adding document: ", e);
//     }
// };

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


// const getAndSetCurrentUserRole = async (uid) => {
//     try {
//         const q = query(collection(db, "users"), where("uid", "==", uid));
//         const querySnapshot = await getDocs(q);

//         if (!querySnapshot.empty) {
//             querySnapshot.forEach((doc) => {
//                 const userData = doc.data();
//                 currentRole.value = userData.role;
//                 console.log(`Role for UID ${uid}: ${currentRole.value}`);
//             });
//         } else {
//             console.log("No document found with the specified UID!");
//         }
//     } catch (e) {
//         console.error("Error getting user role from Firestore:", e);
//     }
// };


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

            router.push('/login');
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