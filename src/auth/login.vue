<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const emit = defineEmits(['login', 'register'])

function login() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }

  const users = JSON.parse(localStorage.getItem('medicare-users') || '[]')

  const user = users.find(
    u => u.email.toLowerCase() === email.value.toLowerCase()
  )

  if (!user) {
    error.value = 'Invalid email or password.'
    return
  }

  if (user.password !== password.value) {
    error.value = 'Invalid email or password.'
    return
  }

  localStorage.setItem(
    'medicare-current-user',
    JSON.stringify({
      name: user.name,
      email: user.email
    })
  )

  emit('login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-100 via-white to-blue-100 flex items-center justify-center p-6">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg">
          <span class="text-3xl">🏥</span>
        </div>

        <h1 class="mt-4 text-3xl font-bold text-slate-900">
          MediCare
        </h1>

        <p class="text-slate-500 mt-1">
          Patient Management System
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-violet-100 p-8">

        <h2 class="text-2xl font-bold text-slate-900">
          Welcome Back
        </h2>

        <p class="text-sm text-slate-500 mt-1 mb-6">
          Sign in to access the MediCare system.
        </p>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm"
        >
          {{ error }}
        </div>

        <!-- Email -->
        <div class="mb-5">
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
        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>

          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
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

        <!-- Login -->
        <button
          @click="login"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
        >
          Sign In
        </button>

        <!-- Register -->
        <p class="text-center text-sm text-slate-500 mt-6">
          Don't have an account?

          <button
            @click="emit('register')"
            class="font-semibold text-violet-600 hover:text-pink-500"
          >
            Create an account
          </button>
        </p>

      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        MediCare Patient Management System
      </p>

    </div>
  </div>
</template>