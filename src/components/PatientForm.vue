<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  patientToEdit: {
    type: Object,
    default: null
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'save',
  'cancel'
])

const patientName = ref('')
const age = ref('')
const gender = ref('')
const diagnosis = ref('')
const roomNumber = ref('')
const status = ref('Active')

const errors = ref({})

watch(
  () => props.patientToEdit,
  patient => {
    if (patient) {
      patientName.value = patient.patientName || ''
      age.value = patient.age ?? ''
      gender.value = patient.gender || ''
      diagnosis.value = patient.diagnosis || ''
      roomNumber.value = patient.roomNumber || ''
      status.value = patient.status || 'Active'
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function validate() {
  const newErrors = {}

  if (!patientName.value.trim()) {
    newErrors.patientName = 'Patient name is required.'
  }

  if (
    age.value === '' ||
    age.value === null ||
    age.value === undefined
  ) {
    newErrors.age = 'Age is required.'
  } else if (
    Number(age.value) < 0 ||
    Number(age.value) > 120
  ) {
    newErrors.age = 'Please enter a valid age.'
  }

  if (!gender.value) {
    newErrors.gender = 'Gender is required.'
  }

  if (!diagnosis.value.trim()) {
    newErrors.diagnosis = 'Diagnosis is required.'
  }

  if (!roomNumber.value.trim()) {
    newErrors.roomNumber = 'Room number is required.'
  }

  errors.value = newErrors

  return Object.keys(newErrors).length === 0
}

function submitForm() {
  if (!validate()) return

  emit('save', {
    patientName: patientName.value.trim(),
    age: Number(age.value),
    gender: gender.value,
    diagnosis: diagnosis.value.trim(),
    roomNumber: roomNumber.value.trim(),
    status: status.value
  })
}

function resetForm() {
  patientName.value = ''
  age.value = ''
  gender.value = ''
  diagnosis.value = ''
  roomNumber.value = ''
  status.value = 'Active'
  errors.value = {}
}

function cancelEdit() {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <section
    class="overflow-hidden rounded-[2rem] border shadow-xl transition duration-500"
    :class="isDark
      ? 'border-violet-500/15 bg-[#10102a]'
      : 'border-violet-100 bg-white'"
  >

    <!-- HEADER -->
    <div
      class="border-b p-5 sm:p-7"
      :class="isDark
        ? 'border-violet-500/10 bg-gradient-to-r from-violet-500/[0.08] via-blue-500/[0.05] to-pink-500/[0.06]'
        : 'border-violet-100 bg-gradient-to-r from-violet-50 via-blue-50/60 to-pink-50/50'"
    >

      <div class="flex items-center gap-4">

        <div
          class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-2xl text-white shadow-lg shadow-violet-500/20"
        >
          {{ patientToEdit ? '✎' : '✚' }}
        </div>

        <div>

          <div class="flex flex-wrap items-center gap-2">

            <h2
              class="text-xl font-black"
              :class="isDark ? 'text-white' : 'text-slate-950'"
            >
              {{ patientToEdit ? 'Edit Patient Record' : 'Patient Registration' }}
            </h2>

            <span
              class="rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest"
              :class="patientToEdit
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-violet-500/10 text-violet-600'"
            >
              {{ patientToEdit ? 'UPDATE' : 'CREATE' }}
            </span>

          </div>

          <p
            class="mt-1 text-xs sm:text-sm"
            :class="isDark ? 'text-slate-300' : 'text-slate-600'"
          >
            {{ patientToEdit
              ? 'Modify the selected patient information.'
              : 'Register a new patient in the hospital system.' }}
          </p>

        </div>

      </div>

    </div>


    <!-- FORM -->
    <form
      @submit.prevent="submitForm"
      class="p-5 sm:p-7"
    >

      <div class="grid gap-5 md:grid-cols-2">

        <!-- NAME -->
        <div class="md:col-span-2">

          <label
            class="mb-2 block text-xs font-black uppercase tracking-wider"
            :class="isDark ? 'text-slate-200' : 'text-slate-700'"
          >
            Patient Name
            <span class="text-pink-500">*</span>
          </label>

          <div class="relative">

            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              👤
            </span>

            <input
              v-model="patientName"
              type="text"
              placeholder="Enter patient's full name"
              class="w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm outline-none transition duration-300"
              :class="errors.patientName
                ? 'border-rose-400'
                : isDark
                  ? 'border-slate-700 bg-[#080719] text-white placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
            />

          </div>

          <p
            v-if="errors.patientName"
            class="mt-1.5 text-[11px] font-semibold text-rose-500"
          >
            {{ errors.patientName }}
          </p>

        </div>


        <!-- AGE -->
        <div>

          <label
            class="mb-2 block text-xs font-black uppercase tracking-wider"
            :class="isDark ? 'text-slate-200' : 'text-slate-700'"
          >
            Age
            <span class="text-pink-500">*</span>
          </label>

          <input
            v-model="age"
            type="number"
            min="0"
            max="120"
            placeholder="Enter age"
            class="w-full rounded-2xl border py-3.5 px-4 text-sm outline-none transition duration-300"
            :class="errors.age
              ? 'border-rose-400'
              : isDark
                ? 'border-slate-700 bg-[#080719] text-white placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10'
                : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
          />

          <p
            v-if="errors.age"
            class="mt-1.5 text-[11px] font-semibold text-rose-500"
          >
            {{ errors.age }}
          </p>

        </div>


        <!-- GENDER -->
        <div>

          <label
            class="mb-2 block text-xs font-black uppercase tracking-wider"
            :class="isDark ? 'text-slate-200' : 'text-slate-700'"
          >
            Gender
            <span class="text-pink-500">*</span>
          </label>

          <select
            v-model="gender"
            class="w-full rounded-2xl border py-3.5 px-4 text-sm outline-none transition duration-300"
            :class="errors.gender
              ? 'border-rose-400'
              : isDark
                ? 'border-slate-700 bg-[#080719] text-white focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>

          <p
            v-if="errors.gender"
            class="mt-1.5 text-[11px] font-semibold text-rose-500"
          >
            {{ errors.gender }}
          </p>

        </div>


        <!-- DIAGNOSIS -->
        <div>

          <label
            class="mb-2 block text-xs font-black uppercase tracking-wider"
            :class="isDark ? 'text-slate-200' : 'text-slate-700'"
          >
            Diagnosis
            <span class="text-pink-500">*</span>
          </label>

          <input
            v-model="diagnosis"
            type="text"
            placeholder="Enter diagnosis"
            class="w-full rounded-2xl border py-3.5 px-4 text-sm outline-none transition duration-300"
            :class="errors.diagnosis
              ? 'border-rose-400'
              : isDark
                ? 'border-slate-700 bg-[#080719] text-white placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10'
                : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
          />

          <p
            v-if="errors.diagnosis"
            class="mt-1.5 text-[11px] font-semibold text-rose-500"
          >
            {{ errors.diagnosis }}
          </p>

        </div>


        <!-- ROOM -->
        <div>

          <label
            class="mb-2 block text-xs font-black uppercase tracking-wider"
            :class="isDark ? 'text-slate-200' : 'text-slate-700'"
          >
            Room Number
            <span class="text-pink-500">*</span>
          </label>

          <input
            v-model="roomNumber"
            type="text"
            placeholder="e.g. 101"
            class="w-full rounded-2xl border py-3.5 px-4 text-sm outline-none transition duration-300"
            :class="errors.roomNumber
              ? 'border-rose-400'
              : isDark
                ? 'border-slate-700 bg-[#080719] text-white placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10'
                : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
          />

          <p
            v-if="errors.roomNumber"
            class="mt-1.5 text-[11px] font-semibold text-rose-500"
          >
            {{ errors.roomNumber }}
          </p>

        </div>


        <!-- STATUS -->
        <div>

          <label
            class="mb-2 block text-xs font-black uppercase tracking-wider"
            :class="isDark ? 'text-slate-200' : 'text-slate-700'"
          >
            Status
          </label>

          <select
            v-model="status"
            class="w-full rounded-2xl border py-3.5 px-4 text-sm outline-none transition duration-300"
            :class="isDark
              ? 'border-slate-700 bg-[#080719] text-white focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10'
              : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

      </div>


      <!-- BUTTONS -->
      <div
        class="mt-7 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end"
        :class="isDark ? 'border-slate-800' : 'border-slate-100'"
      >

        <button
          v-if="patientToEdit"
          type="button"
          @click="cancelEdit"
          class="rounded-2xl border px-5 py-3 text-sm font-bold transition active:scale-95"
          :class="isDark
            ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-pink-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
        >
          {{ patientToEdit ? '✓ Save Changes' : '+ Register Patient' }}
        </button>

      </div>

    </form>

  </section>
</template>