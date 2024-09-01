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
          <button @click="handleRating(coach)">Rate Coach</button>
        </div>
        <!-- display user's rating when this user have rated -->
        <div v-else>
          <p>Your Rating: {{ coach.userRating }}</p>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="showModal" class="rating-modal">
      <div class="modal-content">
        <h3>Rate {{ selectedCoach.name }}</h3>
        <star-rating v-model:rating="userRating" :star-size="30" :show-rating="false" />
        <button @click="submitRating">Submit Rating</button>
        <button @click="closeRatingModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import StarRating from 'vue-star-rating'
import { useDb } from '@/firebase/firestore'
import { useAuth } from '@/firebase/authenticate'

const { isAuthenticated, currentUserUid } = useAuth()

const coaches = reactive([])
const showModal = ref(false)
const selectedCoach = ref({})
const userRating = ref(0)

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

.rating-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
