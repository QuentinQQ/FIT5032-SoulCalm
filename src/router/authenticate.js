import {
    ref
} from 'vue';
import router from './index';
import {
    auth,
    db
} from '../firebase/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    where,
} from "firebase/firestore";


const isAuthenticated = ref(false);
const currentRole = ref('');

// const signup = (email, password) => {
//     return createUserWithEmailAndPassword(auth, email, password)
//         .then((userCredential) => {
//             const user = userCredential.user;
//             isAuthenticated.value = true; // update authentication status
//             console.log('User signed up:', user);
//             alert('User signed up successfully');
//             router.push('/'); // push to home page
//             return user;
//         })
//         .catch((error) => {
//             const errorCode = error.code;
//             const errorMessage = error.message;
//             console.error('Signup error:', errorCode, errorMessage);
//             alert(errorMessage);
//             throw error;
//         });
// };

const saveUserToDatabase = async (user, userRole) => {
    try {
        const docRef = await addDoc(collection(db, "users"), {

            uid: user.uid,
            email: user.email,
            role: userRole,
            creationTime: user.metadata.creationTime,
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

// 注册用户并保存用户信息
const signup = (email, password, username) => {
    const defaultRole = 'user';
    return createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log('User ID (uid):', user.uid);
            console.log('User Email:', user.email);
            console.log('Email Verified:', user.emailVerified);
            console.log('Display Name:', user.displayName);
            console.log('Photo URL:', user.photoURL);
            console.log('Phone Number:', user.phoneNumber);
            console.log('Provider ID:', user.providerId);
            console.log('Creation Time:', user.metadata.creationTime);
            console.log('Last Sign In Time:', user.metadata.lastSignInTime);
            isAuthenticated.value = true;

            await saveUserToDatabase(user, defaultRole);

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


const getAndSetCurrentUserRole = async (uid) => {
    try {
        // 使用 Firestore 的查询方法，根据 `uid` 字段查找用户文档
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                currentRole.value = userData.role;
                console.log(`Role for UID ${uid}: ${currentRole.value}`);
            });
        } else {
            console.log("No document found with the specified UID!");
        }
    } catch (e) {
        console.error("Error getting user role from Firestore:", e);
    }
};
const login = (email, password, currentRole) => {
    return signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            isAuthenticated.value = true; // update authentication status
            console.log('User logged in:', user);

            // update current role
            await getAndSetCurrentUserRole(user.uid);

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
        currentRole
    };
}