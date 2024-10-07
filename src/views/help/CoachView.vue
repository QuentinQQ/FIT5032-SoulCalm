<template>
  <div class="coach-container">
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
    <div v-if="showModal" class="overlay" @click="closeRatingModal">
      <div class="modal-content" @click.stop>
        <h3>Rate {{ selectedCoach.name }}</h3>
        <star-rating v-model:rating="userRating" :star-size="30" :show-rating="false" />
        <button @click="submitRating">Submit Rating</button>
        <button @click="closeRatingModal">Cancel</button>
      </div>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="overlay" @click="closeBookingModal">
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
          <button type="submit">Submit Booking</button>
          <button @click="closeBookingModal">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Booking Success Modal -->
    <div v-if="showBookingSuccessModal" class="overlay" @click="closeBookingSuccessModal">
      <div class="modal-content" @click.stop>
        <h3>Booking Successful!</h3>
        <button @click="downloadAppointmentLetter">Download Appointment Letter</button>
        <button @click="closeBookingSuccessModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import StarRating from 'vue-star-rating'
import { useDb } from '@/firebase/firestore'
import { useAuth } from '@/firebase/authenticate'
import axios from 'axios'

const { isAuthenticated, currentUserUid } = useAuth()

const coaches = reactive([])
const showModal = ref(false)
const selectedCoach = ref({})
const userRating = ref(0)
const showBookingModal = ref(false)
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
    alert('Booking submitted successfully! Check your email for confirmation.')
    showBookingSuccessModal.value = true
    closeBookingModal()

    await handlePostBookingTasks(newAppointmentId, appointmentData)
  } catch (error) {
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
  showModal.value = true
}

const closeRatingModal = () => {
  showModal.value = false
  userRating.value = 0
}

const fetchCoaches = async () => {
  try {
    const coachesData = await useDb.getAllCoaches()
    coachesData.forEach((coach) => {
      // initialize user rating data
      coach.userHasRated = false
      coach.userRating = 0

      // logged in and user has rated this coach
      if (isAuthenticated.value && currentUserUid.value in coach.allRatings) {
        coach.userHasRated = true
        coach.userRating = coach.allRatings[currentUserUid.value]
      }

      coaches.push(coach)

      console.log('Fetched coaches:', coaches)
    })
  } catch (error) {
    console.error('Error fetching coaches from Firestore:', error)
  }
}

const submitRating = async () => {
  if (userRating.value > 0) {
    const coach = selectedCoach.value
    const userId = currentUserUid.value

    try {
      // update user's rating in Firestore
      await useDb.updateCoachRating(coach.id, userId, userRating.value)

      // update local variables
      coach.allRatings[userId] = userRating.value
      coach.totalRatings = Object.keys(coach.allRatings).length
      const totalScore = Object.values(coach.allRatings).reduce((acc, rating) => acc + rating, 0)
      coach.averageRating = totalScore / coach.totalRatings

      coach.userHasRated = true
      coach.userRating = userRating.value

      console.log(`Submitted rating: ${userRating.value} for ${coach.name}`)
      closeRatingModal()
    } catch (error) {
      console.error('Failed to update rating in Firestore:', error)
      alert('Failed to submit rating. Please try again.')
    }
  } else {
    alert('Please select a rating before submitting.')
  }
}

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
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1001; /* Ensure modal content is above the overlay */
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

.modal-content button:hover {
  background-color: #0056b3;
}

.modal-content form {
  display: flex;
  flex-direction: column;
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
</style>
