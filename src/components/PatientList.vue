<script setup>
import { computed } from 'vue'

const props = defineProps({
  patients: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view', 'edit', 'delete'])

const totalPatients = computed(() => props.patients.length)

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase() || '?'
}
</script>

<template>
  <section
    class="overflow-hidden rounded-[28px] border bg-white/80 shadow-xl shadow-violet-200/10 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-white/[0.025]"
  >
    <!-- HEADER -->
    <div class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-white/10">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-xl text-white shadow-lg shadow-violet-500/20">
          📋
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">Patient Records</h2>
            <span class="rounded-full bg-violet-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Live Data</span>
          </div>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">View and manage registered patient information.</p>
        </div>
      </div>

      <span class="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 dark:border-blue-400/10 dark:bg-blue-500/10 dark:text-blue-300">
        <span class="h-2 w-2 rounded-full bg-blue-500"></span>
        {{ totalPatients }} Records
      </span>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="!patients.length" class="p-10 text-center sm:p-14">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 text-2xl dark:from-violet-500/10 dark:to-blue-500/10">
        📭
      </div>
      <h3 class="mt-4 text-lg font-black text-slate-900 dark:text-white">No patient records found</h3>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Add a patient or change your search to see records.</p>
    </div>

    <!-- DESKTOP TABLE -->
    <div v-else class="hidden overflow-x-auto md:block">
      <table class="w-full min-w-[850px] text-left">
        <thead class="bg-slate-50/80 dark:bg-white/[0.02]">
          <tr class="border-b border-slate-100 dark:border-white/10">
            <th class="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Patient</th>
            <th class="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Age</th>
            <th class="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Gender</th>
            <th class="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Diagnosis</th>
            <th class="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Room</th>
            <th class="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="patient in patients"
            :key="patient.id"
            class="group border-b border-slate-100 transition-colors last:border-0 hover:bg-violet-50/40 dark:border-white/5 dark:hover:bg-white/[0.03]"
          >
            <td class="px-6 py-5">
              <button type="button" @click="emit('view', patient)" class="flex items-center gap-3 text-left">
                <div class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-black text-white shadow-md transition group-hover:scale-105">
                  {{ initials(patient.patientName) }}
                  <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900"></span>
                </div>
                <div class="min-w-0">
                  <p class="truncate font-black text-slate-900 dark:text-white">{{ patient.patientName }}</p>
                  <p class="text-[10px] text-slate-400">ID: {{ patient.id }}</p>
                </div>
              </button>
            </td>
            <td class="px-4 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">{{ patient.age }}</td>
            <td class="px-4 py-5"><span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">{{ patient.gender }}</span></td>
            <td class="max-w-[180px] truncate px-4 py-5 text-sm text-slate-600 dark:text-slate-300">{{ patient.diagnosis }}</td>
            <td class="px-4 py-5"><span class="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">🛏 Room {{ patient.roomNumber }}</span></td>
            <td class="px-6 py-5">
              <div class="flex justify-end gap-2">
                <button type="button" @click="emit('view', patient)" class="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-100 active:scale-95 dark:border-violet-400/10 dark:bg-violet-500/10 dark:text-violet-300">View</button>
                <button type="button" @click="emit('edit', patient)" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-100 active:scale-95 dark:border-amber-400/10 dark:bg-amber-500/10 dark:text-amber-300">Edit</button>
                <button type="button" @click="emit('delete', patient.id)" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 active:scale-95 dark:border-rose-400/10 dark:bg-rose-500/10 dark:text-rose-300">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARDS -->
    <div v-if="patients.length" class="space-y-3 p-4 md:hidden">
      <article
        v-for="patient in patients"
        :key="patient.id"
        class="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.025]"
      >
        <button type="button" @click="emit('view', patient)" class="flex w-full items-center gap-3 text-left">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-black text-white">{{ initials(patient.patientName) }}</div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-black text-slate-900 dark:text-white">{{ patient.patientName }}</p>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">ID: {{ patient.id }}</p>
          </div>
          <span class="text-slate-400">›</span>
        </button>

        <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><span class="block text-[9px] font-black uppercase tracking-wider text-slate-400">Age</span><b class="text-slate-800 dark:text-slate-200">{{ patient.age }}</b></div>
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><span class="block text-[9px] font-black uppercase tracking-wider text-slate-400">Gender</span><b class="text-slate-800 dark:text-slate-200">{{ patient.gender }}</b></div>
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><span class="block text-[9px] font-black uppercase tracking-wider text-slate-400">Diagnosis</span><b class="truncate text-slate-800 dark:text-slate-200">{{ patient.diagnosis }}</b></div>
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><span class="block text-[9px] font-black uppercase tracking-wider text-slate-400">Room</span><b class="text-blue-700 dark:text-blue-300">{{ patient.roomNumber }}</b></div>
        </div>

        <div class="mt-3 grid grid-cols-3 gap-2">
          <button type="button" @click="emit('view', patient)" class="rounded-xl bg-violet-600 px-2 py-2.5 text-xs font-black text-white transition active:scale-95">View</button>
          <button type="button" @click="emit('edit', patient)" class="rounded-xl bg-amber-500 px-2 py-2.5 text-xs font-black text-white transition active:scale-95">Edit</button>
          <button type="button" @click="emit('delete', patient.id)" class="rounded-xl bg-rose-500 px-2 py-2.5 text-xs font-black text-white transition active:scale-95">Delete</button>
        </div>
      </article>
    </div>
  </section>
</template>
