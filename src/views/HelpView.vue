<template>
  <div class="help-container">
    <!-- Option 1: Mental Health Coach -->
    <div class="help-card">
      <div class="help-card-image">
        <img src="@/assets/coach.svg" alt="Mental Health Coach" />
      </div>
      <div class="help-card-content">
        <h2>Get 6 free sessions with a mental health coach</h2>
        <p>
          Stressed or overwhelmed about everyday life issues? Our NewAccess mental health coaching
          program may be right for you if you're not currently seeing a psychologist or
          psychiatrist.
        </p>
        <button class="help-card-button" @click="navigateTo('GetMentalHealthCoach')">
          Learn more about mental health coaching
        </button>
      </div>
    </div>

    <!-- Option 2: Find a Mental Health Professional -->
    <div class="help-card">
      <div class="help-card-image">
        <img src="@/assets/professional.svg" alt="Mental Health Professional" />
      </div>
      <div class="help-card-content">
        <h2>Find a mental health professional</h2>
        <p>
          Looking for ongoing mental health services? We explain what different mental health
          professionals do and how to find one near you.
        </p>
        <button class="help-card-button" @click="navigateTo('GetMentalHealthProfessional')">
          Find a mental health professional
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Navigate to different routes based on the selected option
const navigateTo = (option) => {
  router.push({ name: option })
}
</script>

<style scoped>
.help-container {
  display: flex;
  justify-content: space-around;
  padding: 40px;
}

.help-card {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 45%;
  cursor: default;
  padding: 20px;
  margin: 20px;
}

.help-card-image img {
  width: 100px;
  margin-right: 20px;
}

.help-card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.help-card-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}
</style>
