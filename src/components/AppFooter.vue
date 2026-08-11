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
    class="mt-12 border-t transition duration-500"
    :class="isDark
      ? 'border-violet-500/10 bg-[#050410]'
      : 'border-violet-100 bg-white'"
  >

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

        <div class="flex items-center gap-3">

          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-lg text-white shadow-lg"
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
              class="mt-0.5 text-[10px]"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              Patient Management System
            </p>

          </div>

        </div>


        <div class="sm:text-right">

          <p
            class="text-xs"
            :class="isDark ? 'text-slate-300' : 'text-slate-600'"
          >
            Developed by
            <span
              class="font-black"
              :class="isDark ? 'text-pink-400' : 'text-violet-600'"
            >
              Aicelle Joy B. Carreon
            </span>
          </p>

          <p
            class="mt-1 text-[10px]"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
          >
            Software Engineering 1 · BSCS3A · 2026
          </p>

        </div>

      </div>


      <div
        class="mt-7 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
        :class="isDark ? 'border-slate-800' : 'border-slate-100'"
      >

        <p
          class="text-[10px]"
          :class="isDark ? 'text-slate-400' : 'text-slate-500'"
        >
          © 2026 MediCare Hospital Management System
        </p>

        <div class="flex items-center gap-2">

          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>

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