<script setup>
defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  menuOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'toggle-theme',
  'toggle-menu'
])
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b backdrop-blur-2xl transition duration-500"
    :class="isDark
      ? 'border-violet-500/10 bg-[#080719]/90'
      : 'border-violet-100 bg-white/90'"
  >

    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >

      <!-- BRAND -->
      <div class="flex items-center gap-3">

        <button
          @click="emit('toggle-menu')"
          class="flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
          :class="isDark
            ? 'text-white hover:bg-white/5'
            : 'text-slate-700 hover:bg-violet-50'"
          aria-label="Toggle navigation menu"
        >
          {{ menuOpen ? '✕' : '☰' }}
        </button>


        <div
          class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-lg text-white shadow-lg shadow-violet-500/20"
        >
          🏥

          <span
            class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
            :class="isDark
              ? 'border-[#080719] bg-emerald-400'
              : 'border-white bg-emerald-500'"
          ></span>
        </div>


        <div>

          <div class="flex items-center gap-2">

            <h1
              class="text-sm font-black sm:text-base"
              :class="isDark ? 'text-white' : 'text-slate-950'"
            >
              MediCare
            </h1>

            <span
              class="hidden rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest sm:inline-block"
              :class="isDark
                ? 'bg-violet-500/10 text-violet-300'
                : 'bg-violet-50 text-violet-700'"
            >
              HMS
            </span>

          </div>

          <p
            class="hidden text-[9px] sm:block"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            Patient Management System
          </p>

        </div>

      </div>


      <div class="flex items-center gap-2">

        <div
          class="hidden items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider sm:flex"
          :class="isDark
            ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-400'
            : 'border-emerald-100 bg-emerald-50 text-emerald-700'"
        >
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          Online
        </div>


        <button
          @click="emit('toggle-theme')"
          class="flex h-10 w-10 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 active:scale-90"
          :class="isDark
            ? 'border-pink-400/20 bg-pink-400/5 text-pink-300 hover:bg-pink-400/10'
            : 'border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>

      </div>

    </div>

  </header>
</template>