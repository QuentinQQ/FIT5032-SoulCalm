<template>
  <h1 class="text-center">Welcome !</h1>
  <p class="text-center">Let's create your account</p>
  <form @submit.prevent="submitForm">
    <!-- username -->
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

    <!-- email -->
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

    <!-- password -->
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

    <!-- confirm password -->
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

    <!-- submit button -->
    <div class="text-center">
      <button type="submit" class="btn btn-primary">Register</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const submittedCards = ref([])

const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirmPassword(true)
  if (!errors.value.username && !errors.value.password && !errors.value.confirmPassword) {
    clearForm()
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
</script>

<script setup></script>
<style scoped>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  /* background-color: #e0bfbf; */
  border-radius: 10px;
}

/* Class selectors */
.form {
  text-align: center;
  margin-top: 50px;
}

/* ID selectors */
#username:focus,
#password:focus,
#isAustralian:focus,
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}
.list-group-item {
  padding: 10px;
}
</style>
