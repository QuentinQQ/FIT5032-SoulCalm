<template>
  <div class="coach-container">
    <!-- loading modal -->
    <LoadingModal :show="isBookingInProgress" message="Processing your booking..." />
    <LoadingModal :show="isRatingInProgress" message="Processing your rating..." />

    <div v-for="coach in coaches" :key="coach.id" class="coach-card">
      <div class="coach-info">
        <h2>{{ coach.name }}</h2>
        <p>Average Rating: {{ coach.averageRating.toFixed(1) }}</p>
        <star-rating
          :rating="Math.floor(coach.averageRating)"
          :star-size="20"
          :read-only="true"
          :show-rating="false"
        />
        <v-btn @click="openReviewsModal(coach)" color="primary">View Reviews</v-btn>

        <!-- display rate button when this user have not rated -->
        <div v-if="!coach.userHasRated">
          <button class="action-button" @click="handleRating(coach)">Rate Coach</button>
        </div>
        <!-- display user's rating when this user have rated -->
        <div v-else>
          <p>Your Rating: {{ coach.userRating }}</p>
        </div>
        <div>
          <button class="action-button" @click="openBookingModal(coach)">Booking</button>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="showRatingModal" class="overlay">
      <div class="modal-content" @click.stop>
        <h3>Rate {{ selectedCoach.name }}</h3>
        <div class="rating-section">
          <label for="rating">Your Rating:</label>
          <star-rating 
            v-model:rating="userRating" 
            :star-size="30" 
            :show-rating="false"
            id="rating"
          />
        </div>
        <div class="comment-section">
          <label for="comment">Your Comment:</label>
          <textarea 
            v-model="userComment" 
            id="comment"
            rows="4"
            placeholder="Please share your experience with this coach (optional)"
            maxlength="100"
          ></textarea>
          <div class="char-count">{{ userComment.length }}/100</div>
        </div>
        <div class="button-group">
          <button @click="submitRating" :disabled="!isRatingValid" class="primary-button">Submit Rating</button>
          <button @click="closeRatingModal" class="secondary-button">Cancel</button>
          <!-- <button @click="closeRatingModal" class="cancel-button">Cancel</button> -->
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="overlay">
      <div class="modal-content" @click.stop>
        <h3>Book Appointment with {{ selectedCoach.name }}</h3>
        <form @submit.prevent="submitBooking">
          <input v-model="bookingForm.name" placeholder="Your Name" required />
          <input v-model="bookingForm.email" type="email" placeholder="Your Email" required />
          <input v-model="bookingForm.phone" type="tel" placeholder="Your Phone" required />
          <input
            type="date"
            v-model="bookingForm.appointmentDate"
            @change="handleDateChange"
            required
          />
          <select v-if="bookingForm.appointmentDate" v-model="bookingForm.timeSlot" required>
            <option value="" disabled>Please select available time</option>
            <option
              v-for="slot in availableTimeSlots"
              :key="slot"
              :value="slot"
              :disabled="isTimeSlotBooked(slot)"
            >
              {{ slot }}
            </option>
          </select>
          <textarea v-model="bookingForm.notes" placeholder="Any notes or questions?"></textarea>
          <button type="submit" class="primary-button">Submit Booking</button>
          <button @click="closeBookingModal" class="secondary-button">Cancel</button>
          <!-- <button type="submit">Submit Booking</button>
          <button @click="closeBookingModal">Cancel</button> -->
        </form>
      </div>
    </div>

    <!-- Booking Success Modal -->
    <div v-if="showBookingSuccessModal" class="overlay" @click="closeBookingSuccessModal">
      <div class="modal-content" @click.stop>
        <h3>Booking Successful!</h3>
        <button @click="downloadAppointmentLetter" class="primary-button">Download Appointment Letter</button>
        <button @click="closeBookingSuccessModal" class="secondary-button">Close</button>
      </div>
    </div>

    <!-- Reviews Modal -->
    <div v-if="showReviewsModal" class="overlay">
      <div class="modal-content reviews-modal">
        <h3>Reviews for {{ selectedCoach.name }}</h3>
        <div class="search-section">
            <!-- <SearchOutline class="search-icon" @click="applyFilterByComments" /> -->
          <input
            v-model="searchKeywords"
            placeholder="Search By Comments"
            class="search-input"
            @keyup.enter="applyFilterByComments"
            maxlength="20"
          />
        </div>
        <div class="reviews-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>
                  Rating
                  <!-- <span @click="sortReviews('rating')" class="sort-icon">{{ getSortIcon('rating') }}</span> -->
                  <span @click="sortReviews('rating')" class="sort-icon">
                    <component :is="getSortIcon('rating')" />
                  </span>
                </th>
                <th>Comment</th>
                <th>
                  Date
                  <!-- <span @click="sortReviews('timestamp')" class="sort-icon">{{ getSortIcon('timestamp') }}</span> -->
                  <span @click="sortReviews('timestamp')" class="sort-icon">
                    <component :is="getSortIcon('timestamp')" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="review in paginatedReviews" :key="review.user">
                <td>{{ review.user }}</td>
                <td>
                  <star-rating
                    :rating="review.rating"
                    :star-size="14"
                    :read-only="true"
                    :show-rating="false"
                  />
                </td>
                <td>{{ review.comment }}</td>
                <td>{{ new Date(review.timestamp).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
        <button @click="closeReviewsModal" class="close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import StarRating from 'vue-star-rating'
import { useDb } from '@/firebase/firestore'
import { useAuth } from '@/firebase/authenticate'
import axios from 'axios'
import LoadingModal from '@/components/LoadingModal.vue';
import { ArrowUpOutline, ArrowDownOutline, SwapVerticalOutline, SearchOutline } from '@vicons/ionicons5'


const { isAuthenticated, currentUserUid } = useAuth()

const coaches = reactive([])
const showRatingModal = ref(false)
const selectedCoach = ref({})
const userRating = ref(0)

// for reviews modal
const reviews = ref([]);
const searchKeywords = ref('');
const sortCriteria = ref({ key: '', order: 'asc' });


const userComment = ref('')
const isRatingValid = computed(() => userRating.value > 0)

// modal controller
const showBookingModal = ref(false)
const showReviewsModal = ref(false);
const isBookingInProgress = ref(false);
const isRatingInProgress = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const bookingForm = reactive({
  name: '',
  email: '',
  phone: '',
  appointmentDate: '',
  notes: ''
})
const availableTimeSlots = ref([])
const bookedTimeSlots = ref([])
const showBookingSuccessModal = ref(false)
const appointmentId = ref('')

watch(isAuthenticated, (newValue, oldValue) => {
  if (oldValue && !newValue) {
    // When user logout
    fetchCoaches()
  }
})

const closeReviewsModal = () => {
  showReviewsModal.value = false;
};

const closeBookingSuccessModal = () => {
  showBookingSuccessModal.value = false
}

const openBookingModal = (coach) => {
  if (!isAuthenticated.value) {
    alert('Please log in to book an appointment.')
    return
  }
  selectedCoach.value = coach
  showBookingModal.value = true
}
const closeBookingModal = () => {
  showBookingModal.value = false
  Object.keys(bookingForm).forEach((key) => (bookingForm[key] = ''))
}

const generateTimeSlots = () => {
  const startTime = 9
  const endTime = 17
  const timeSlots = []
  for (let hour = startTime; hour < endTime; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`
    timeSlots.push(`${start}-${end}`)
  }
  return timeSlots
}

const isTimeSlotBooked = (timeSlot) => {
  return bookedTimeSlots.value.includes(timeSlot)
}

// Triggered when the date is selected, it generates the available time period on the day and excludes the reserved ones.
const handleDateChange = async () => {
  console.log('Selected date:', bookingForm.appointmentDate)
  if (bookingForm.appointmentDate) {
    const bookedSlots = await useDb.getAppointmentsTimeSlotByDate(
      selectedCoach.value.id,
      bookingForm.appointmentDate
    )
    bookedTimeSlots.value = bookedSlots
    availableTimeSlots.value = generateTimeSlots().filter((slot) => !bookedSlots.includes(slot))
  }
}

const submitBooking = async () => {
  try {
    // loading modal
    isBookingInProgress.value = true;

    const userId = currentUserUid.value
    const appointmentData = {
      coachId: selectedCoach.value.id,
      coachName: selectedCoach.value.name,
      userName: bookingForm.name,
      userId: userId,
      email: bookingForm.email,
      phone: bookingForm.phone,
      appointmentDate: bookingForm.appointmentDate,
      timeSlot: bookingForm.timeSlot,
      notes: bookingForm.notes
    }
    const newAppointmentId = await useDb.addAppointment(appointmentData)
    appointmentId.value = newAppointmentId // store the appointmentId
    console.log('Appointment created with ID:', newAppointmentId)
    console.log('Appointment data:', appointmentData)

    await handlePostBookingTasks(newAppointmentId, appointmentData)
    isBookingInProgress.value = false; // close loading modal
    closeBookingModal()
    // show booking success modal after close loading modal
    showBookingSuccessModal.value = true
    // alert('Booking submitted successfully! Check your email for confirmation.')
  } catch (error) {
    isBookingInProgress.value = false; // close loading modal
    console.error('Failed to submit booking:', error)
    alert('Failed to submit booking. Please try again.')
  }
}

const handlePostBookingTasks = async (appointmentId, appointmentData) => {
  try {
    console.log('================testing-start===========================')
    console.log('Starting post-booking tasks for appointment:', appointmentId)
    console.log('Appointment data:', appointmentData)
    console.log('================testing-end===========================')
    // Generate PDF
    const pdfResponse = await axios.post(
      'https://generatepdf-t5kfcvh67q-uc.a.run.app',
      appointmentData
    )
    console.log('=================testing-start==========================')
    console.log('PDF generation response:', pdfResponse.data)
    console.log('=================testing-end==========================')
    const pdfBase64 = pdfResponse.data.pdfBase64
    // Save PDF to Firestore
    await useDb.savePdfToFirestore(appointmentId, pdfBase64)
    console.log('PDF saved to Firestore successfully')

    // Send a confirmation email (including the generated PDF)
    const emailResponse = await axios.post(
      'https://sendconfirmationemail-t5kfcvh67q-uc.a.run.app',
      {
        email: appointmentData.email,
        name: appointmentData.userName,
        coachName: appointmentData.coachName,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: appointmentData.timeSlot,
        notes: appointmentData.notes,
        pdfBase64: pdfBase64
      }
    )
    console.log('================testing-start===========================')
    console.log('Email response:', emailResponse.data)
    console.log('================testing-end===========================')

    console.log('Confirmation email sent successfully')

    console.log('Post-booking tasks completed successfully')
  } catch (error) {
    console.error('Error in post-booking tasks:', error)
    if (error.response && error.response.status === 500) {
      alert(
        "Your booking was successful, but we couldn't send a confirmation email. Please check your booking details in your account."
      )
    } else {
      alert(
        'Your booking was successful, but we encountered an issue with some additional processes. Your booking is confirmed, and you can view the details in your account.'
      )
    }
  }
}

const downloadAppointmentLetter = async () => {
  try {
    console.log('================testing-start===========================')
    console.log('Attempting to download appointment letter for ID:', appointmentId.value);
    console.log('================testing-end===========================')
    // Get base64 string from Firestore through appointmentId
    const pdfBase64 = await useDb.getConfirmationLetterPdf(appointmentId.value);
    
    if (pdfBase64) {
      console.log('================testing-start===========================')
      console.log('PDF data retrieved successfully');
      console.log('pdfBase64:', pdfBase64);
      console.log('================testing-end===========================')
      // Convert Base64 string to Blob
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'application/pdf'});

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'appointment_confirmation.pdf';
      link.click();

      window.URL.revokeObjectURL(link.href);
      console.log('================testing-start===========================')
      console.log('PDF download initiated');
      console.log('================testing-end===========================')
    } else {
      throw new Error('PDF not found');
    }
  } catch (error) {
    console.error('Error downloading appointment letter:', error);
    alert('Failed to download appointment letter. Please try again.');
  }
};

const handleRating = (coach) => {
  if (!isAuthenticated.value) {
    // user is not logged in
    alert('Please log in to rate the coach.')
    return
  }

  openRatingModal(coach)
}

const openRatingModal = (coach) => {
  selectedCoach.value = coach
  showRatingModal.value = true
}

const closeRatingModal = () => {
  showRatingModal.value = false
  userRating.value = 0
}


const fetchCoaches = async () => {
  try {
    const coachesData = await useDb.getAllCoaches()
    coaches.length = 0 // clear
    coachesData.forEach((coach) => {
      // Initialize user rating data
      let userHasRated = false
      let userRating = 0
      let totalRating = 0
      let ratingCount = 0

      // Calculate average rating and check if current user has rated
      Object.entries(coach.allRatings).forEach(([userId, ratingData]) => {
        totalRating += ratingData.rating
        ratingCount++
        if (isAuthenticated.value && userId === currentUserUid.value) {
          userHasRated = true
          userRating = ratingData.rating
        }
      })

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

      coaches.push({
        ...coach,
        userHasRated,
        userRating,
        averageRating,
        totalRatings: ratingCount
      })
    })

    console.log('Fetched coaches:', coaches)
  } catch (error) {
    console.error('Error fetching coaches from Firestore:', error)
  }
}


const submitRating = async () => {
  if (userRating.value > 0) {
    isRatingInProgress.value = true;
    const coach = selectedCoach.value
    const userId = currentUserUid.value

    try {
      // update user's rating in Firestore
      await useDb.updateCoachRating(coach.id, userId, userRating.value, userComment.value)

      // update local variables
      coach.allRatings[userId] = {
        rating: userRating.value,
        comment: userComment.value,
        timestamp: new Date()
      }

      let totalRating = 0
      let ratingCount = 0
      Object.values(coach.allRatings).forEach(ratingData => {
        totalRating += ratingData.rating
        ratingCount++
      })
      coach.averageRating = totalRating / ratingCount
      coach.totalRatings = ratingCount

      coach.userHasRated = true
      coach.userRating = userRating.value

      console.log(`Submitted rating: ${userRating.value} for ${coach.name}`)
      closeRatingModal()
    } catch (error) {
      console.error('Failed to update rating in Firestore:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      isRatingInProgress.value = false;
    }
  } else {
    alert('Please select a rating before submitting.')
  }
}

const sortedAndFilteredReviews = computed(() => {
  let result = reviews.value;
  
  // filter
  if (searchKeywords.value) {
    const keywords = searchKeywords.value.toLowerCase();
    result = result.filter(review => 
      review.comment.toLowerCase().includes(keywords)
    );
  }
  
  // sort
  if (sortCriteria.value.key) {
    result = [...result].sort((a, b) => {
      let compareA = a[sortCriteria.value.key];
      let compareB = b[sortCriteria.value.key];
      
      if (sortCriteria.value.key === 'timestamp') {
        compareA = new Date(compareA);
        compareB = new Date(compareB);
      }
      
      if (compareA < compareB) return sortCriteria.value.order === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortCriteria.value.order === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return result;
});

const sortReviews = (key) => {
  if (sortCriteria.value.key === key) {
    sortCriteria.value.order = sortCriteria.value.order === 'asc' ? 'desc' : 'asc';
  } else {
    sortCriteria.value.key = key;
    sortCriteria.value.order = 'asc';
  }
};

const openReviewsModal = async (coach) => {
  selectedCoach.value = coach;
  showReviewsModal.value = true;
  try {
    reviews.value = await useDb.getCoachReviews(coach.id);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    alert('Failed to load reviews. Please try again.');
  }
};

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedAndFilteredReviews.value.slice(start, end);
});

const totalPages = computed(() => 
  Math.ceil(sortedAndFilteredReviews.value.length / itemsPerPage)
);

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};


const getSortIcon = (key) => {
  if (sortCriteria.value.key !== key) return SwapVerticalOutline;
  return sortCriteria.value.order === 'asc' ? ArrowUpOutline : ArrowDownOutline;
};


const appliedFilter = ref('');

const applyFilterByComments = () => {
  appliedFilter.value = searchKeywords.value.trim();
  currentPage.value = 1;
};

onMounted(fetchCoaches)
</script>

<style scoped>
.coach-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.coach-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1001;
}

.modal-content button {
  margin-top: 10px;
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.rating-section, .comment-section {
  margin-bottom: 20px;
}

.rating-section label, .comment-section label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}


.modal-content button:hover {
  background-color: #0056b3;
}

.modal-content form {
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.char-count {
  text-align: right;
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.button-group button:first-child {
  background-color: #007bff;
  color: white;
}

.button-group button:first-child:hover {
  background-color: #0056b3;
}

.button-group button:first-child:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #007bff;
}

.cancel-button:hover {
  background-color: #e2e6ea;
}


.modal-content input,
.modal-content select,
.modal-content textarea {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.action-button {
  margin-top: 10px;
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.reviews-table {
  max-height: 400px;
  overflow-y: auto;
}

.reviews-table table {
  width: 100%;
  border-collapse: collapse;
}

.reviews-table th, .reviews-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.reviews-table th {
  background-color: #f2f2f2;
  cursor: pointer;
  user-select: none;
}

.reviews-table th:hover {
  background-color: #e0e0e0;
}

.close-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-button:hover {
  background-color: #0056b3;
}

.reviews-modal {
  width: 80%;
  max-width: 800px;
}

.reviews-table th {
  position: relative;
}

.sort-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.sort-icon {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.sort-icon svg {
  width: 20px;
  height: 20px;
}

.search-section {
  margin-bottom: 15px;
}

.search-input {
  flex-grow: 1;
  padding: 10px;
  border: none;
  font-size: 16px;
  outline: none;
  margin: 0;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.primary-button {
  background-color: #007bff;
  color: white;
}

.primary-button:hover {
  background-color: #0056b3;
}

.primary-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #ff6b6b;
  color: white;
}

.secondary-button:hover {
  background-color: #ff5252;
}


.close-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-button:hover {
  background-color: #ff5252;
}
</style>
