<script setup>
defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <footer
    class="relative z-20 mt-12 w-full border-t transition-colors duration-500"
    :class="
      isDark
        ? 'border-violet-500/20 bg-[#050410] text-white'
        : 'border-violet-200 bg-white text-slate-900'
    "
  >
    <!-- Main Footer -->
    <div class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <!-- Top Section -->
      <div
        class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >

        <!-- Hospital Information -->
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-xl text-white shadow-lg"
          >
            🏥
          </div>

          <div>
            <p
              class="text-sm font-black"
              :class="isDark ? 'text-white' : 'text-slate-950'"
            >
              MediCare Hospital
            </p>

            <p
              class="mt-1 text-xs"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              Patient Management System
            </p>
          </div>
        </div>

        <!-- Developer Information -->
        <div class="sm:text-right">
          <p
            class="text-xs"
            :class="isDark ? 'text-slate-300' : 'text-slate-600'"
          >
            Developed by
          </p>

          <p
            class="mt-1 text-sm font-black"
            :class="isDark ? 'text-pink-400' : 'text-violet-600'"
          >
            Aicelle Joy B. Carreon
          </p>

          <p
            class="mt-1 text-[10px]"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            Software Engineering 1 · BSCS 3A · 2026
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div
        class="my-7 h-px w-full"
        :class="isDark ? 'bg-white/10' : 'bg-slate-100'"
      ></div>

      <!-- Bottom Section -->
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >

        <!-- Copyright -->
        <p
          class="text-[10px]"
          :class="isDark ? 'text-slate-400' : 'text-slate-500'"
        >
          © 2026 MediCare Hospital Management System
        </p>

        <!-- System Status -->
        <div class="flex items-center gap-2">
          <span
            class="h-2 w-2 rounded-full bg-emerald-500"
          ></span>

          <span
            class="text-[10px] font-bold"
            :class="isDark ? 'text-emerald-400' : 'text-emerald-700'"
          >
            All systems operational
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>