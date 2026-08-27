<script setup>
import { ref, computed } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const showPassword = ref(false)

const emit = defineEmits(['login', 'registered'])

const passwordStrength = computed(() => {
  const value = password.value
  let score = 0

  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[a-z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  return score
})

const passwordIsStrong = computed(() => {
  return passwordStrength.value === 5
})

function register() {
  error.value = ''
  success.value = ''

  // Basic validation
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please complete all required fields.'
    return
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  // Strong password validation
  if (!passwordIsStrong.value) {
    error.value =
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.'
    return
  }

  // Confirm password
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  const users = JSON.parse(
    localStorage.getItem('medicare-users') || '[]'
  )

  // Prevent duplicate accounts
  const existingUser = users.find(
    user => user.email.toLowerCase() === email.value.toLowerCase()
  )

  if (existingUser) {
    error.value = 'An account with this email already exists.'
    return
  }

  // Save account
  users.push({
    id: Date.now(),
    name: name.value.trim(),
    email: email.value.toLowerCase().trim(),
    password: password.value
  })

  localStorage.setItem('medicare-users', JSON.stringify(users))

  success.value = 'Account created successfully! You can now sign in.'

  // Clear form
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-violet-100 via-white to-blue-100 flex items-center justify-center p-6"
  >
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg"
        >
          <span class="text-3xl">🏥</span>
        </div>

        <h1 class="mt-4 text-3xl font-bold text-slate-900">
          MediCare
        </h1>

        <p class="text-slate-500 mt-1">
          Patient Management System
        </p>
      </div>

      <!-- Register Card -->
      <div
        class="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-violet-100 p-8"
      >

        <h2 class="text-2xl font-bold text-slate-900">
          Create Account
        </h2>

        <p class="text-sm text-slate-500 mt-1 mb-6">
          Register to access the MediCare system.
        </p>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm"
        >
          {{ error }}
        </div>

        <!-- Success -->
        <div
          v-if="success"
          class="mb-5 rounded-xl bg-green-50 border border-green-200 text-green-600 px-4 py-3 text-sm"
        >
          {{ success }}
        </div>

        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            Full Name
          </label>

          <input
            v-model="name"
            type="text"
            placeholder="Enter your full name"
            autocomplete="name"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            Email Address
          </label>

          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <!-- Password -->
        <div class="mb-2">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>

          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a strong password"
              autocomplete="new-password"
              class="w-full px-4 py-3 pr-14 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-600"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <!-- Password Requirements -->
        <div class="text-xs text-slate-500 mb-4 space-y-1">
          <p :class="password.length >= 8 ? 'text-green-600' : ''">
            ✓ At least 8 characters
          </p>

          <p :class="/[A-Z]/.test(password) ? 'text-green-600' : ''">
            ✓ One uppercase letter
          </p>

          <p :class="/[a-z]/.test(password) ? 'text-green-600' : ''">
            ✓ One lowercase letter
          </p>

          <p :class="/[0-9]/.test(password) ? 'text-green-600' : ''">
            ✓ One number
          </p>

          <p :class="/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''">
            ✓ One special character
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            Confirm Password
          </label>

          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autocomplete="new-password"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <!-- Register -->
        <button
          @click="register"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
        >
          Create Account
        </button>

        <!-- Login -->
        <p class="text-center text-sm text-slate-500 mt-6">
          Already have an account?

          <button
            @click="emit('login')"
            class="font-semibold text-violet-600 hover:text-pink-500"
          >
            Sign In
          </button>
        </p>

      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        MediCare Patient Management System
      </p>

    </div>
  </div>
</template>