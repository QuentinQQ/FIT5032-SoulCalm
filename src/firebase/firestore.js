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
    updateDoc,
} from 'firebase/firestore';




/**
 * Save the user's data to Firestore
 * @param {Object} user
 * @param {ref} userRole
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
 * Get the current user's role from Firestore and update the current role ref
 * @param {string} uid
 * @param {Object} currentRoleRef
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

// Get all coaches from Firestore
const getAllCoaches = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'coaches'));
        console.log('Query snapshot:', querySnapshot)
        const coaches = [];
        console.log('Query snapshot:', querySnapshot)
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            coaches.push(data);
        });
        return coaches;
    } catch (error) {
        console.error('Error fetching coaches:', error);
        throw error;
    }
};

/**
 * Update the coach's rating in Firestore
 * @param {string} coachId - Coach ID
 * @param {string} userId - User ID
 * @param {number} rating - User's rating
 * @returns {Promise<void>}
 */
const updateCoachRating = async (coachId, userId, rating, comment) => {
    try {
        // Get the coach's document reference
        const coachRef = doc(db, 'coaches', coachId);

        // Get the current coach data
        const coachSnapshot = await getDoc(coachRef);
        if (!coachSnapshot.exists()) {
            throw new Error('Coach not found');
        }

        const coachData = coachSnapshot.data();

        const allRatings = coachData.allRatings || {};
        // Update
        allRatings[userId] = {
            rating: rating,
            comment: comment,
            timestamp: new Date()
        };

        const totalRatings = Object.keys(allRatings).length;
        const totalScore = Object.values(allRatings).reduce((acc, val) => acc + val, 0);
        const averageRating = totalScore / totalRatings;

        // Update the coach's rating
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

const getAppointmentsTimeSlotByDate = async (coachId, selectedDate) => {
    try {
        // 假设 selectedDate 为 'YYYY-MM-DD' 格式，仅比较日期部分
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
            appointmentsRef,
            where('coachId', '==', coachId),
            where('appointmentDate', '==', selectedDate) // 直接按日期匹配
        );

        const querySnapshot = await getDocs(appointmentsQuery);
        const bookedTimeSlots = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timeSlot) {
                bookedTimeSlots.push(data.timeSlot); // 收集所有已预约的 timeSlot
            }
        });

        return bookedTimeSlots;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
};

const addAppointment = async (appointmentData) => {
    try {
        const appointmentsRef = collection(db, 'appointments');
        const appointmentRef = await addDoc(appointmentsRef, {
            coachId: appointmentData.coachId,
            coachName: appointmentData.coachName,
            userName: appointmentData.userName,
            userId: appointmentData.userId,
            email: appointmentData.email,
            phone: appointmentData.phone,
            appointmentDate: appointmentData.appointmentDate,
            timeSlot: appointmentData.timeSlot,
            notes: appointmentData.notes,
            createdAt: new Date()
        });

        console.log('Appointment successfully created with ID: ', appointmentRef.id);
        return appointmentRef.id;
    } catch (error) {
        console.error('Error adding appointment: ', error);
        throw new Error('Failed to add appointment');
    }
};

const savePdfToFirestore = async (appointmentId, base64Pdf) => {
    try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        await updateDoc(appointmentRef, {
            pdfAttachment: base64Pdf
        });
        console.log('PDF saved to Firestore successfully');
    } catch (error) {
        console.error('Error saving PDF to Firestore:', error);
        throw new Error('Failed to save PDF to Firestore');
    }
};

const getConfirmationLetterPdf = async (appointmentId) => {
    try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        const appointmentDoc = await getDoc(appointmentRef);
        
        if (appointmentDoc.exists()) {
            const data = appointmentDoc.data();
            return data.pdfAttachment; // return type: base64 string
        } else {
            console.log('No such appointment document!');
            return null;
        }
    } catch (error) {
        console.error('Error getting PDF from Firestore:', error);
        throw new Error('Failed to get PDF from Firestore');
    }
};


// Export functions
export const useDb = {
    saveUserToDatabase,
    getAndSetCurrentUserRole,
    getAllCoaches,
    updateCoachRating,
    getAppointmentsTimeSlotByDate,
    addAppointment,
    savePdfToFirestore,
    getConfirmationLetterPdf
};