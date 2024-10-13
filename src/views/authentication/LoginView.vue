<template>
  <div class="container">
    <LoadingModal :show="isLoading" message="Processing..." />
    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="loading-overlay">
      <div class="loading-content">
        <h3>Success!</h3>
        <div class="checkmark">✅</div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col">
        <h1 class="text-center">Login</h1>
        <p class="text-center mb-3">Welcome!</p>
        <form @submit.prevent="submitForm">
          <div class="mb-3 form-item">
            <!-- username -->
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              id="username"
              class="form-control"
              @input="() => validateName(false)"
              v-model="formData.username"
            />
            <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
          </div>
          <!-- password -->
          <div class="mb-3 form-item">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              @input="() => validatePassword(false)"
              v-model="formData.password"
            />
            <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
          </div>
          <!-- submit button -->
          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Log in</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import router from '@/router/index'
import { useAuth } from '@/firebase/authenticate'
import LoadingModal from '@/components/LoadingModal.vue';

const { isAuthenticated, login } = useAuth()

const isLoading = ref(false);
const showSuccessModal = ref(false);
const formData = ref({
  username: '',
  password: ''
})

const clearForm = () => {
  formData.value = {
    username: '',
    password: ''
  }
  errors.value = {
    username: null,
    password: null
  }
}

const errors = ref({
  username: null,
  password: null
})


const submitForm = () => {
  validateName(true)
  validatePassword(true)
  if (!errors.value.username && !errors.value.password) {
    isLoading.value = true;
    login(formData.value.username, formData.value.password)
      .then((user) => {
        console.log('Login successful:', user)
        console.log('isAuthenticated value is:', isAuthenticated.value)
        isLoading.value = false;
        showSuccessModal.value = true;
        setTimeout(() => {
          showSuccessModal.value = false;
          router.push('/')
        }, 2000);
      })
      .catch((error) => {
        console.log('Login failed:', error.message)
        console.log('isAuthenticated value is:', isAuthenticated.value)
        isLoading.value = false;
        errors.value.general = error.message;
      })
  }
}

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = 'Name must be at least 3 characters'
  } else {
    errors.value.username = null
  }
}

const validatePassword = (blur) => {
  if (formData.value.password.length < 6) {
    if (blur) errors.value.password = 'Password must be at least 6 characters long.'
  } else {
    errors.value.password = null
  }
}

watch(showSuccessModal, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
  margin: 0 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

.form-item {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.form-control {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.text-center {
  text-align: center;
}

.mb-3 {
  margin-bottom: 1rem;
}

.btn {
  margin-top: 10px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.checkmark {
  font-size: 48px;
  color: #4CAF50;
  margin-top: 10px;
}
</style>
