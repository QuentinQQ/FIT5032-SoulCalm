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
        <h1 class="text-center">Welcome !</h1>
        <p class="text-center mb-3">Let's create your account</p>
        <form @submit.prevent="submitForm">
          <!-- username -->
          <div class="mb-3 form-item">
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              class="form-control"
              id="username"
              @blur="() => validateName(true)"
              @input="() => validateName(false)"
              v-model="formData.username"
            />
            <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
          </div>
          <!-- email -->
          <div class="mb-3 form-item">
            <label for="email" class="form-label">Email address</label>
            <input
              type="text"
              class="form-control"
              id="email"
              @blur="() => validateEmail(true)"
              @input="() => validateEmail(false)"
              v-model="formData.email"
            />
            <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
          </div>
          <!-- password -->
          <div class="mb-3 form-item">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              @blur="() => validatePassword(true)"
              @input="() => validatePassword(false)"
              v-model="formData.password"
            />
            <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
          </div>
          <!-- confirm password -->
          <div class="mb-3 form-item">
            <label for="confirm-password" class="form-label">Confirm password</label>
            <input
              type="password"
              class="form-control"
              id="confirm-password"
              @blur="() => validateConfirmPassword(true)"
              v-model="formData.confirmPassword"
            />
            <div v-if="errors.confirmPassword" class="text-danger">
              {{ errors.confirmPassword }}
            </div>
          </div>
          <!-- role -->
          <div class="mb-3 form-item">
            <label for="role" class="form-label">Role</label>
            <select
              class="form-control"
              id="role"
              v-model="formData.role"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <!-- submit button -->
          <div class="text-center">
            <button type="submit" class="btn btn-primary">Register</button>
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

const { signup } = useAuth()
// loading and success modal
const isLoading = ref(false);
const showSuccessModal = ref(false);

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const submittedCards = ref([])

const submitForm = () => {
  validateName(true)
  validateEmail(true)
  validatePassword(true)
  validateConfirmPassword(true)

  if (
    !errors.value.username &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    formData.value.role !== ''
  ) {
    // show loading modal
    isLoading.value = true;
    // create user
    signup(formData.value.email, formData.value.password, formData.value.role)
      .then((user) => {
        console.log('Registration successful:', user)
        isLoading.value = false;
        showSuccessModal.value = true;
        setTimeout(() => {
          showSuccessModal.value = false;
          clearForm();
          router.push('/login');
        }, 2000);
      })
      .catch((error) => {
        console.error('Registration failed:', error)
        isLoading.value = false;
        errors.value.email = error.message
      })
  }
}

const clearForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
  errors.value = {
    username: null,
    email: null,
    password: null,
    confirmPassword: null
  }
}

const errors = ref({
  username: null,
  email: null,
  password: null,
  confirmPassword: null
})

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = 'Name must be at least 3 characters'
  } else {
    errors.value.username = null
  }
}

const validateEmail = (blur) => {
  const email = formData.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    if (blur) errors.value.email = 'Invalid email address'
  } else {
    errors.value.email = null
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) errors.value.password = 'Password must contain at least one uppercase letter.'
  } else if (!hasLowercase) {
    if (blur) errors.value.password = 'Password must contain at least one lowercase letter.'
  } else if (!hasNumber) {
    if (blur) errors.value.password = 'Password must contain at least one number.'
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = 'Password must contain at least one special character.'
  } else {
    errors.value.password = null
  }
}

const validateConfirmPassword = (blur) => {
  if (formData.value.confirmPassword !== formData.value.password) {
    if (blur) errors.value.confirmPassword = 'Passwords do not match'
  } else {
    errors.value.confirmPassword = null
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

.form-label {
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