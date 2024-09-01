<template>
  <div class="container">
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
import { ref } from 'vue'
import router from '@/router/index'
import { useAuth } from '@/firebase/authenticate'

const { isAuthenticated, login } = useAuth()

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
    login(formData.value.username, formData.value.password)
      .then((user) => {
        console.log('Login successful:', user)
        console.log('isAuthenticated value is:', isAuthenticated.value)
        alert('Login successful!')
        router.push('/')
      })
      .catch((error) => {
        console.log('Login failed:', error.message)
        console.log('isAuthenticated value is:', isAuthenticated.value)
        alert('Login failed: ' + error.message)
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
</style>
