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
    orderBy,
    limit,
    startAfter,
    getCountFromServer,
    Timestamp
} from 'firebase/firestore';


const getUserInfo = async (uid) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.data();
      } else {
        console.log('No user found with the given UID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
};

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
            role: userRole,
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
        // selectedDate: 'YYYY-MM-DD'
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
            appointmentsRef,
            where('coachId', '==', coachId),
            where('appointmentDate', '==', selectedDate) //Match directly by date
        );

        const querySnapshot = await getDocs(appointmentsQuery);
        const bookedTimeSlots = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timeSlot) {
                bookedTimeSlots.push(data.timeSlot); // collect all booked timeSlot
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


const getCoachReviews = async (coachId) => {
    try {
      const coachRef = doc(db, 'coaches', coachId);
      const coachDoc = await getDoc(coachRef);
      
      if (coachDoc.exists()) {
        const coachData = coachDoc.data();
        const allRatings = coachData.allRatings || {};
        
        return Object.entries(allRatings).map(([userId, ratingData], index) => ({
          user: `User ${index + 1}`,
          rating: ratingData.rating,
          comment: ratingData.comment,
          timestamp: ratingData.timestamp.toDate()
        }));
      } else {
        console.log('No such coach document!');
        return [];
      }
    } catch (error) {
      console.error('Error getting coach reviews:', error);
      throw new Error('Failed to get coach reviews');
    }
};


const getAllAppointments = async () => {
    try {
        // initialize the appointments collection to store
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsSnapshot = await getDocs(appointmentsRef);
        return appointmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate()
        }));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }
};
  

const getUniqueCoachNames = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coaches'));
      const coaches = querySnapshot.docs.map(doc => doc.data().name);
      return [...new Set(coaches)]; // Remove duplicates
    } catch (error) {
      console.error('Error fetching unique coaches:', error);
      throw error;
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
    getConfirmationLetterPdf,
    getCoachReviews,
    getAllAppointments,
    getUniqueCoachNames,
    getUserInfo
};