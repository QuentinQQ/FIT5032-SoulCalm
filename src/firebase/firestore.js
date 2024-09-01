// firestore.js

import {
    db
} from '../firebase/firebase';
import {
    addDoc,
    collection,
    getDocs,
    getDoc,
    query,
    where,
    doc,
    updateDoc
} from 'firebase/firestore';

/**
 * 保存用户到 Firestore 的 "users" 集合
 * @param {Object} user - Firebase 用户对象
 * @param {ref} userRole - 用户角色
 */
const saveUserToDatabase = async (user, userRole) => {
    try {
        const docRef = await addDoc(collection(db, 'users'), {
            uid: user.uid,
            email: user.email,
            role: userRole.value,
            creationTime: user.metadata.creationTime,
        });
        console.log('Document written with ID: ', docRef.id);
    } catch (e) {
        console.error('Error adding document: ', e);
    }
};

/**
 * 获取并设置当前用户的角色
 * @param {string} uid - 用户 UID
 * @param {Object} currentRoleRef - Vue 的 ref 用于更新当前角色
 */
const getAndSetCurrentUserRole = async (uid, currentRoleRef) => {
    try {
        const q = query(collection(db, 'users'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                currentRoleRef.value = userData.role;
                console.log(`Role for UID ${uid}: ${currentRoleRef.value}`);
            });
        } else {
            console.log('No document found with the specified UID!');
        }
    } catch (e) {
        console.error('Error getting user role from Firestore:', e);
    }
};

// 获取所有教练数据
const getAllCoaches = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'coaches'));
        const coaches = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id; // 将文档 ID 添加到数据中
            coaches.push(data);
        });
        return coaches;
    } catch (error) {
        console.error('Error fetching coaches:', error);
        throw error;
    }
};

/**
 * 更新 Firestore 中的教练评分数据
 * @param {string} coachId - 教练的 ID
 * @param {string} userId - 用户 ID
 * @param {number} rating - 用户的评分
 * @returns {Promise<void>}
 */
const updateCoachRating = async (coachId, userId, rating) => {
    try {
        // 获取教练的文档引用
        const coachRef = doc(db, 'coaches', coachId);

        // 获取当前教练数据
        const coachSnapshot = await getDoc(coachRef);
        if (!coachSnapshot.exists()) {
            throw new Error('Coach not found');
        }

        const coachData = coachSnapshot.data();

        const allRatings = coachData.allRatings || {};
        // 更新用户的评分
        allRatings[userId] = rating;

        const totalRatings = Object.keys(allRatings).length;
        const totalScore = Object.values(allRatings).reduce((acc, val) => acc + val, 0);
        const averageRating = totalScore / totalRatings;

        // 更新 Firestore 中的教练文档
        await updateDoc(coachRef, {
            allRatings,
            totalRatings,
            averageRating
        });

        console.log('Rating updated successfully in Firestore');
    } catch (e) {
        console.error('Error updating coach rating:', e);
        throw e;
    }
};

// 将所有 Firestore 函数一起打包导出
export const useDb = {
    saveUserToDatabase,
    getAndSetCurrentUserRole,
    getAllCoaches,
    updateCoachRating
};