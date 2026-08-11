<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'

import PatientForm from './components/PatientForm.vue'
import PatientList from './components/PatientList.vue'
import AppFooter from './components/AppFooter.vue'

/* =========================================================
   APPLICATION STATE
========================================================= */

const patients = ref([])
const searchTerm = ref('')
const editingPatient = ref(null)
const formResetKey = ref(0)
const message = ref('')
const isDark = ref(false)
const menuOpen = ref(false)
const selectedPatient = ref(null)
const activities = ref([])
const activityOpen = ref(false)
const settingsOpen = ref(false)
const notificationsEnabled = ref(true)
const compactMode = ref(false)

/* =========================================================
   LOAD SAVED DATA
========================================================= */

onMounted(() => {
  try {
    const savedPatients = localStorage.getItem('hospital-patients')
    const savedTheme = localStorage.getItem('hospital-theme')
    const savedActivities = localStorage.getItem('hospital-activities')
    const savedNotifications = localStorage.getItem('hospital-notifications')
    const savedCompactMode = localStorage.getItem('hospital-compact-mode')

    if (savedPatients) {
      patients.value = JSON.parse(savedPatients)
    }

    if (savedTheme === 'dark') {
      isDark.value = true
    }

    if (savedActivities) {
      activities.value = JSON.parse(savedActivities)
    }

    if (savedNotifications !== null) {
      notificationsEnabled.value = savedNotifications !== 'false'
    }

    if (savedCompactMode !== null) {
      compactMode.value = savedCompactMode === 'true'
    }
  } catch (error) {
    console.error('Unable to load saved data:', error)
  }

  document.addEventListener('keydown', handleEscape)
})

/* =========================================================
   CLEANUP
========================================================= */

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

/* =========================================================
   MOBILE MENU SCROLL LOCK
========================================================= */

watch(menuOpen, (open) => {
  document.body.style.overflow = open || settingsOpen.value || activityOpen.value
    ? 'hidden'
    : ''
})

watch(settingsOpen, (open) => {
  document.body.style.overflow = open || menuOpen.value || activityOpen.value
    ? 'hidden'
    : ''
})

watch(activityOpen, (open) => {
  document.body.style.overflow = open || menuOpen.value || settingsOpen.value
    ? 'hidden'
    : ''
})

function handleEscape(event) {
  if (event.key === 'Escape') {
    menuOpen.value = false
    selectedPatient.value = null
    activityOpen.value = false
    settingsOpen.value = false
  }
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function savePatients() {
  localStorage.setItem(
    'hospital-patients',
    JSON.stringify(patients.value)
  )
}

/* =========================================================
   DARK / LIGHT MODE
========================================================= */

function toggleTheme() {
  isDark.value = !isDark.value

  localStorage.setItem(
    'hospital-theme',
    isDark.value ? 'dark' : 'light'
  )
}

/* =========================================================
   SYSTEM SETTINGS
========================================================= */

function toggleNotifications() {
  notificationsEnabled.value = !notificationsEnabled.value

  localStorage.setItem(
    'hospital-notifications',
    String(notificationsEnabled.value)
  )

  showMessage(
    notificationsEnabled.value
      ? 'Activity notifications enabled.'
      : 'Activity notifications disabled.'
  )
}

function toggleCompactMode() {
  compactMode.value = !compactMode.value

  localStorage.setItem(
    'hospital-compact-mode',
    String(compactMode.value)
  )

  showMessage(
    compactMode.value
      ? 'Compact dashboard mode enabled.'
      : 'Comfortable dashboard mode enabled.'
  )
}

function openSettings() {
  settingsOpen.value = true
  activityOpen.value = false
  menuOpen.value = false
}

function closeSettings() {
  settingsOpen.value = false
}

function exportPatientData() {
  const payload = {
    app: 'MediCare Patient Management System',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    patients: patients.value,
    activities: activities.value
  }

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: 'application/json' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `medicare-patient-data-${new Date().toISOString().slice(0, 10)}.json`

  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  showMessage('Patient data exported successfully.')
}

function importPatientData(event) {
  const file = event.target.files?.[0]

  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result)

      if (!Array.isArray(imported.patients)) {
        throw new Error('Invalid patient data')
      }

      const validPatients = imported.patients.filter(
        patient =>
          patient &&
          patient.id !== undefined &&
          patient.patientName !== undefined
      )

      patients.value = validPatients
      savePatients()

      if (Array.isArray(imported.activities)) {
        activities.value = imported.activities.slice(0, 12)
        saveActivities()
      }

      editingPatient.value = null
      selectedPatient.value = null

      showMessage(
        `${validPatients.length} patient record${validPatients.length === 1 ? '' : 's'} imported successfully.`
      )
    } catch (error) {
      console.error('Import error:', error)
      showMessage('Import failed. Please select a valid MediCare JSON file.')
    } finally {
      event.target.value = ''
    }
  }

  reader.readAsText(file)
}

function clearAllPatients() {
  const confirmed = window.confirm(
    'This will permanently remove ALL patient records from this browser. Continue?'
  )

  if (!confirmed) return

  patients.value = []
  editingPatient.value = null
  selectedPatient.value = null
  searchTerm.value = ''

  savePatients()

  addActivity(
    'system',
    'Patient records cleared',
    'All patient records were removed from local storage.',
    '⚠️'
  )

  showMessage('All patient records have been cleared.')
}

/* =========================================================
   MESSAGE / FEEDBACK
========================================================= */

function showMessage(text) {
  message.value = text

  setTimeout(() => {
    message.value = ''
  }, 3000)
}

/* =========================================================
   CREATE / UPDATE
========================================================= */

function normalizeRoom(room) {
  return String(room ?? '').trim().toLowerCase()
}

function roomPatientCount(room, excludeId = null) {
  const normalizedRoom = normalizeRoom(room)

  return patients.value.filter(patient => {
    return (
      normalizeRoom(patient.roomNumber) === normalizedRoom &&
      patient.id !== excludeId
    )
  }).length
}

function saveActivities() {
  localStorage.setItem(
    'hospital-activities',
    JSON.stringify(activities.value)
  )
}

function addActivity(type, title, description, icon) {
  if (!notificationsEnabled.value) return

  activities.value.unshift({
    id: Date.now() + Math.random(),
    type,
    title,
    description,
    icon,
    createdAt: new Date().toISOString()
  })

  // Keep the activity center lightweight.
  activities.value = activities.value.slice(0, 12)
  saveActivities()
}

function formatActivityTime(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
}

function toggleActivityCenter() {
  activityOpen.value = !activityOpen.value
  settingsOpen.value = false
  menuOpen.value = false

  document.body.style.overflow = activityOpen.value ? 'hidden' : ''
}

function clearActivities() {
  activities.value = []
  saveActivities()
}

function savePatient(patientData) {
  const room = normalizeRoom(patientData.roomNumber)

  // A room can contain a maximum of 2 patients.
  const excludeId = editingPatient.value?.id ?? null

  if (roomPatientCount(room, excludeId) >= 2) {
    showMessage(
      `Room ${patientData.roomNumber} is full. Maximum of 2 patients per room.`
    )
    return
  }

  if (editingPatient.value) {
    const index = patients.value.findIndex(
      patient => patient.id === editingPatient.value.id
    )

    if (index !== -1) {
      patients.value[index] = {
        ...patients.value[index],
        ...patientData,
        roomNumber: String(patientData.roomNumber).trim(),
        updatedAt: new Date().toISOString()
      }
    }

    const updatedPatient = patients.value[index]

    editingPatient.value = null

    addActivity(
      'update',
      'Patient record updated',
      `${updatedPatient?.patientName ?? 'Patient'} • Room ${updatedPatient?.roomNumber ?? '—'}`,
      '🔵'
    )

    showMessage(
      'Patient record updated successfully.'
    )
  } else {
    const newPatient = {
      id: Date.now(),
      ...patientData,
      roomNumber: String(patientData.roomNumber).trim(),
      createdAt: new Date().toISOString()
    }

    patients.value.push(newPatient)

    addActivity(
      'add',
      'Patient registered',
      `${newPatient.patientName ?? 'Patient'} • Room ${newPatient.roomNumber ?? '—'}`,
      '🟢'
    )

    // Remount the form so every input is cleared after a successful registration.
    formResetKey.value += 1

    showMessage(
      'Patient record added successfully.'
    )
  }

  savePatients()

  if (roomPatientCount(room) === 2) {
    addActivity(
      'room',
      'Room reached maximum capacity',
      `Room ${patientData.roomNumber} • 2 of 2 patients`,
      '🟠'
    )
  }
}

/* =========================================================
   EDIT
========================================================= */

function editPatient(patient) {
  editingPatient.value = {
    ...patient
  }

  menuOpen.value = false

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

/* =========================================================
   CANCEL EDIT
========================================================= */

function cancelEdit() {
  editingPatient.value = null
}

/* =========================================================
   DELETE
========================================================= */

function deletePatient(id) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this patient record?'
  )

  if (!confirmed) return

  const deletedPatient = patients.value.find(
    patient => patient.id === id
  )

  patients.value = patients.value.filter(
    patient => patient.id !== id
  )

  addActivity(
    'delete',
    'Patient record deleted',
    `${deletedPatient?.patientName ?? 'Patient'} • Room ${deletedPatient?.roomNumber ?? '—'}`,
    '🔴'
  )

  savePatients()

  showMessage(
    'Patient record deleted successfully.'
  )
}

/* =========================================================
   SEARCH
========================================================= */

const filteredPatients = computed(() => {
  const keyword = searchTerm.value
    .toLowerCase()
    .trim()

  if (!keyword) {
    return patients.value
  }

  return patients.value.filter(patient => {
    const name = String(
      patient.patientName ?? ''
    ).toLowerCase()

    const diagnosis = String(
      patient.diagnosis ?? ''
    ).toLowerCase()

    const room = String(
      patient.roomNumber ?? ''
    ).toLowerCase()

    return (
      name.includes(keyword) ||
      diagnosis.includes(keyword) ||
      room.includes(keyword)
    )
  })
})

/* =========================================================
   STATISTICS
========================================================= */

const assignedRooms = computed(() => {
  return new Set(
    patients.value
      .map(patient => patient.roomNumber)
      .filter(Boolean)
  ).size
})

const recordCount = computed(() => {
  return filteredPatients.value.length
})

/* =========================================================
   DASHBOARD ANALYTICS
========================================================= */

const malePatients = computed(() => {
  return patients.value.filter(patient =>
    String(patient.gender ?? '').toLowerCase() === 'male'
  ).length
})

const femalePatients = computed(() => {
  return patients.value.filter(patient =>
    String(patient.gender ?? '').toLowerCase() === 'female'
  ).length
})

const otherGenderPatients = computed(() => {
  return patients.value.filter(patient => {
    const gender = String(patient.gender ?? '').toLowerCase()
    return gender && gender !== 'male' && gender !== 'female'
  }).length
})

const occupiedBeds = computed(() => patients.value.length)

const roomCapacity = computed(() => assignedRooms.value * 2)

const availableBeds = computed(() => {
  return Math.max(roomCapacity.value - occupiedBeds.value, 0)
})

const occupancyPercentage = computed(() => {
  if (!roomCapacity.value) return 0
  return Math.round((occupiedBeds.value / roomCapacity.value) * 100)
})

const uniqueDiagnoses = computed(() => {
  return new Set(
    patients.value
      .map(patient => String(patient.diagnosis ?? '').trim().toLowerCase())
      .filter(Boolean)
  ).size
})

const diagnosisBreakdown = computed(() => {
  const counts = new Map()

  patients.value.forEach(patient => {
    const diagnosis = String(patient.diagnosis ?? '').trim()
    if (!diagnosis) return

    const key = diagnosis.toLowerCase()
    const existing = counts.get(key)

    if (existing) {
      existing.count += 1
    } else {
      counts.set(key, {
        label: diagnosis,
        count: 1
      })
    }
  })

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

function genderPercentage(count) {
  if (!patients.value.length) return 0
  return Math.round((count / patients.value.length) * 100)
}

/* =========================================================
   ROOM MANAGEMENT
========================================================= */

const roomStatuses = computed(() => {
  const rooms = new Map()

  patients.value.forEach(patient => {
    const room = String(patient.roomNumber ?? '').trim()

    if (!room) return

    if (!rooms.has(room)) {
      rooms.set(room, [])
    }

    rooms.get(room).push(patient)
  })

  return Array.from(rooms.entries())
    .map(([room, roomPatients]) => {
      const count = roomPatients.length
      const isFull = count >= 2

      return {
        room,
        patients: roomPatients,
        count,
        capacity: 2,
        percentage: Math.min((count / 2) * 100, 100),
        status: isFull
          ? 'Full'
          : count === 1
            ? 'Partially Occupied'
            : 'Available'
      }
    })
    .sort((a, b) => {
      const aNumber = Number(a.room)
      const bNumber = Number(b.room)

      if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
        return aNumber - bNumber
      }

      return a.room.localeCompare(b.room, undefined, { numeric: true })
    })
})

const fullRooms = computed(() => {
  return roomStatuses.value.filter(room => room.count >= 2).length
})

const partialRooms = computed(() => {
  return roomStatuses.value.filter(room => room.count === 1).length
})

function viewRoom(room) {
  searchTerm.value = room
  goToSection('records')
}

/* =========================================================
   PATIENT QUICK VIEW
========================================================= */

function viewPatient(patient) {
  selectedPatient.value = { ...patient }
  menuOpen.value = false
}

function closePatientDetails() {
  selectedPatient.value = null
}

/* =========================================================
   MOBILE MENU
========================================================= */

function closeMenu() {
  menuOpen.value = false
}

function goToSection(section) {
  closeMenu()

  setTimeout(() => {
    document
      .getElementById(section)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
  }, 100)
}
</script>


<template>

  <!-- =====================================================
       APPLICATION WRAPPER
  ====================================================== -->

  <div
    :class="[
      'relative min-h-screen overflow-x-hidden transition-colors duration-500',
      isDark
        ? 'bg-[#070816] text-slate-100'
        : 'bg-[#f8f9ff] text-slate-900'
    ]"
  >

    <!-- ===================================================
         PROFESSIONAL BACKGROUND
    ==================================================== -->

    <div
      class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true"
    >

      <!-- Premium Base -->
      <div
        class="absolute inset-0"
        :class="isDark ? 'bg-[#070816]' : 'bg-[#f8f9ff]'"
      ></div>

      <!-- Purple atmosphere -->
      <div
        class="absolute -left-48 -top-44 h-[620px] w-[620px] rounded-full blur-[120px]"
        :class="isDark ? 'bg-violet-700/25' : 'bg-violet-300/45'"
      ></div>

      <!-- Blue atmosphere -->
      <div
        class="absolute -right-48 top-[8%] h-[650px] w-[650px] rounded-full blur-[130px]"
        :class="isDark ? 'bg-blue-700/22' : 'bg-blue-300/40'"
      ></div>

      <!-- Pink atmosphere -->
      <div
        class="absolute bottom-[-250px] left-[8%] h-[600px] w-[600px] rounded-full blur-[135px]"
        :class="isDark ? 'bg-pink-700/20' : 'bg-pink-300/35'"
      ></div>

      <!-- Cyan atmosphere -->
      <div
        class="absolute bottom-[12%] right-[12%] h-[420px] w-[420px] rounded-full blur-[120px]"
        :class="isDark ? 'bg-cyan-500/12' : 'bg-cyan-200/35'"
      ></div>

      <!-- High-tech grid -->
      <div
        class="absolute inset-0"
        :class="isDark ? 'opacity-[0.07]' : 'opacity-[0.045]'"
        style="
          background-image:
            linear-gradient(rgba(124,58,237,.65) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,.65) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 92%);
        "
      ></div>

      <!-- Decorative glass rings -->
      <div
        class="absolute left-[4%] top-[22%] h-28 w-28 rounded-full border"
        :class="isDark ? 'border-violet-400/10' : 'border-violet-400/15'"
      ></div>

      <div
        class="absolute right-[5%] top-[42%] h-40 w-40 rounded-full border"
        :class="isDark ? 'border-blue-400/10' : 'border-blue-400/15'"
      ></div>

      <div
        class="absolute bottom-[14%] left-[44%] h-20 w-20 rounded-full border"
        :class="isDark ? 'border-pink-400/10' : 'border-pink-400/15'"
      ></div>

      <!-- Accent lights -->
      <div
        class="absolute left-[10%] top-[35%] h-2.5 w-2.5 rounded-full bg-violet-500/50 shadow-lg shadow-violet-500/30"
      ></div>

      <div
        class="absolute right-[15%] top-[52%] h-3 w-3 rounded-full bg-blue-500/50 shadow-lg shadow-blue-500/30"
      ></div>

      <div
        class="absolute bottom-[20%] left-[48%] h-2.5 w-2.5 rounded-full bg-pink-500/50 shadow-lg shadow-pink-500/30"
      ></div>

    </div>


    <!-- ===================================================
         MOBILE / TOP HEADER
    ==================================================== -->

    <header
      class="sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors duration-500"
      :class="isDark
        ? 'border-white/5 bg-[#090817]/85'
        : 'border-violet-100/80 bg-white/85'"
    >

      <div
        class="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >

        <!-- LEFT -->
        <div class="flex items-center gap-3">

          <!-- Hamburger -->
          <button
            @click="menuOpen = !menuOpen"
            class="flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 active:scale-90 lg:hidden"
            :class="isDark
              ? 'border-white/10 bg-white/5 text-white hover:bg-violet-500/10'
              : 'border-violet-100 bg-white text-slate-700 hover:bg-violet-50'"
            :aria-label="menuOpen
              ? 'Close navigation'
              : 'Open navigation'"
          >

            <span
              class="text-xl transition-transform duration-300"
            >
              {{ menuOpen ? '✕' : '☰' }}
            </span>

          </button>


          <!-- Logo -->
          <div
            class="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-xl text-white shadow-lg shadow-violet-500/25"
          >
            🏥

            <span
              class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
              :class="isDark
                ? 'border-[#090817] bg-emerald-400'
                : 'border-white bg-emerald-500'"
            ></span>

          </div>


          <!-- Brand -->
          <div>

            <h1
              class="text-base font-black tracking-tight sm:text-lg"
              :class="isDark
                ? 'text-white'
                : 'text-slate-950'"
            >
              MediCare
            </h1>

            <p
              class="hidden text-[10px] font-medium sm:block"
              :class="isDark
                ? 'text-slate-400'
                : 'text-slate-500'"
            >
              Patient Management System
            </p>

          </div>

        </div>


        <!-- RIGHT -->
        <div class="flex items-center gap-2">

          <!-- Activity Bell -->
          <div class="relative">
            <button
              @click="toggleActivityCenter"
              class="relative flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
              :class="isDark
                ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-pink-500/10'
                : 'border-violet-100 bg-white text-violet-600 hover:bg-pink-50'"
              aria-label="Open activity center"
              :aria-expanded="activityOpen"
            >
              🔔
              <span
                v-if="activities.length"
                class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-1 text-[9px] font-black text-white shadow-md"
              >
                {{ activities.length > 9 ? '9+' : activities.length }}
              </span>
            </button>

            <!-- Desktop Activity Dropdown -->
            <transition name="activity-pop">
              <div
                v-if="activityOpen"
                class="absolute right-0 top-14 z-[90] hidden w-[360px] overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl sm:block"
                :class="isDark
                  ? 'border-violet-500/15 bg-[#0b0a1d]/95'
                  : 'border-violet-100 bg-white/95'"
              >
                <div class="flex items-center justify-between border-b px-5 py-4"
                  :class="isDark ? 'border-white/5' : 'border-slate-100'">
                  <div>
                    <p class="text-sm font-black" :class="isDark ? 'text-white' : 'text-slate-950'">
                      Recent Activity
                    </p>
                    <p class="mt-0.5 text-[10px]" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
                      Latest system events
                    </p>
                  </div>
                  <button
                    v-if="activities.length"
                    @click="clearActivities"
                    class="rounded-lg px-2 py-1 text-[10px] font-bold"
                    :class="isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'"
                  >
                    Clear
                  </button>
                </div>

                <div class="max-h-[380px] overflow-y-auto">
                  <div v-if="!activities.length" class="px-5 py-10 text-center">
                    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/15 to-pink-500/15 text-2xl">
                      🔔
                    </div>
                    <p class="mt-3 text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">
                      No recent activity
                    </p>
                    <p class="mt-1 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
                      Your system events will appear here.
                    </p>
                  </div>

                  <div v-else>
                    <div
                      v-for="activity in activities"
                      :key="activity.id"
                      class="flex gap-3 border-b px-5 py-4 last:border-b-0"
                      :class="isDark ? 'border-white/5 hover:bg-white/[0.025]' : 'border-slate-100 hover:bg-violet-50/40'"
                    >
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 text-lg">
                        {{ activity.icon }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-black" :class="isDark ? 'text-white' : 'text-slate-900'">
                          {{ activity.title }}
                        </p>
                        <p class="mt-1 truncate text-[10px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                          {{ activity.description }}
                        </p>
                        <p class="mt-1 text-[9px] font-semibold" :class="isDark ? 'text-violet-400' : 'text-violet-600'">
                          {{ formatActivityTime(activity.createdAt) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Settings -->
          <button
            @click="openSettings"
            class="hidden h-11 w-11 items-center justify-center rounded-2xl border text-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-90 sm:flex"
            :class="isDark
              ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-violet-500/10'
              : 'border-violet-100 bg-white text-violet-600 hover:bg-violet-50'"
            aria-label="Open system settings"
          >
            ⚙️
          </button>

          <!-- Theme Button -->
          <button
            @click="toggleTheme"
            class="flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
            :class="isDark
              ? 'border-violet-400/10 bg-violet-500/10 text-yellow-300 hover:bg-violet-500/20'
              : 'border-violet-100 bg-white text-violet-600 hover:bg-violet-50'"
            :aria-label="isDark
              ? 'Switch to light mode'
              : 'Switch to dark mode'"
          >

            {{ isDark ? '☀️' : '🌙' }}

          </button>


          <!-- Online Status -->
          <div
            class="hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold sm:flex"
            :class="isDark
              ? 'border-emerald-400/10 bg-emerald-400/10 text-emerald-400'
              : 'border-emerald-100 bg-emerald-50 text-emerald-700'"
          >

            <span
              class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
            ></span>

            Online

          </div>

        </div>

      </div>

    </header>


    <!-- ===================================================
         MOBILE DRAWER
    ==================================================== -->

    <transition name="drawer">

      <div
        v-if="menuOpen"
        class="fixed inset-0 z-[100] lg:hidden"
      >

        <!-- Backdrop -->
        <div
          @click="closeMenu"
          class="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        ></div>


        <!-- Drawer -->
        <aside
          class="absolute left-0 top-0 flex h-[100dvh] w-[86%] max-w-sm flex-col overflow-hidden border-r shadow-2xl"
          :class="isDark
            ? 'border-violet-500/10 bg-[#090817]'
            : 'border-violet-100 bg-white'"
        >

          <!-- Drawer Decorative Background -->
          <div
            class="pointer-events-none absolute inset-0 overflow-hidden"
          >

            <div
              class="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-[100px]"
              :class="isDark
                ? 'bg-violet-600/20'
                : 'bg-violet-300/30'"
            ></div>

            <div
              class="absolute -right-24 top-[35%] h-72 w-72 rounded-full blur-[100px]"
              :class="isDark
                ? 'bg-blue-600/15'
                : 'bg-blue-300/25'"
            ></div>

            <div
              class="absolute bottom-[-80px] left-[20%] h-64 w-64 rounded-full blur-[100px]"
              :class="isDark
                ? 'bg-pink-600/15'
                : 'bg-pink-300/20'"
            ></div>

          </div>


          <!-- Drawer Content -->
          <div
            class="relative flex min-h-0 flex-1 flex-col"
          >

            <!-- Drawer Header -->
            <div
              class="flex h-[82px] shrink-0 items-center justify-between border-b px-5"
              :class="isDark
                ? 'border-white/5 bg-[#0b0a1d]/90'
                : 'border-violet-100 bg-white/90'"
            >

              <div class="flex items-center gap-3">

                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-xl text-white shadow-lg shadow-violet-500/20"
                >
                  🏥
                </div>

                <div>

                  <p
                    class="text-sm font-black"
                    :class="isDark
                      ? 'text-white'
                      : 'text-slate-950'"
                  >
                    MediCare
                  </p>

                  <p
                    class="text-[9px]"
                    :class="isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'"
                  >
                    Patient Management System
                  </p>

                </div>

              </div>


              <!-- Close -->
              <button
                @click="closeMenu"
                class="flex h-10 w-10 items-center justify-center rounded-xl border transition active:scale-90"
                :class="isDark
                  ? 'border-white/10 text-slate-300 hover:bg-white/5'
                  : 'border-slate-200 text-slate-600 hover:bg-violet-50'"
                aria-label="Close navigation"
              >
                ✕
              </button>

            </div>


            <!-- Scrollable Navigation -->
            <div
              class="min-h-0 flex-1 overflow-y-auto px-5 py-6"
            >

              <p
                class="mb-4 px-2 text-[10px] font-black uppercase tracking-[0.22em]"
                :class="isDark
                  ? 'text-violet-400'
                  : 'text-violet-600'"
              >
                Navigation
              </p>


              <nav class="space-y-2">

                <!-- Dashboard -->
                <button
                  @click="goToSection('dashboard')"
                  class="group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/15 text-white ring-1 ring-violet-400/10'
                    : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20'"
                >

                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-violet-500/15'
                      : 'bg-white/15'"
                  >
                    ◈
                  </span>

                  <span class="text-sm font-black">
                    Dashboard
                  </span>

                  <span class="ml-auto text-xs opacity-60">
                    →
                  </span>

                </button>


                <!-- Patient Records -->
                <button
                  @click="goToSection('records')"
                  class="group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'text-slate-300 hover:bg-violet-500/10 hover:text-white'
                    : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'"
                >

                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-violet-500/10 text-violet-300'
                      : 'bg-violet-50 text-violet-600'"
                  >
                    👥
                  </span>

                  <span class="text-sm font-bold">
                    Patient Records
                  </span>

                  <span class="ml-auto text-xs opacity-40">
                    →
                  </span>

                </button>


                <!-- Room Status -->
                <button
                  @click="goToSection('rooms')"
                  class="group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'text-slate-300 hover:bg-cyan-500/10 hover:text-white'
                    : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'"
                >

                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'bg-cyan-50 text-cyan-600'"
                  >
                    🛏
                  </span>

                  <span class="text-sm font-bold">
                    Room Status
                  </span>

                  <span class="ml-auto text-xs opacity-40">
                    →
                  </span>

                </button>


                <!-- Search -->
                <button
                  @click="goToSection('search')"
                  class="group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'text-slate-300 hover:bg-blue-500/10 hover:text-white'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'"
                >

                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-blue-500/10 text-blue-300'
                      : 'bg-blue-50 text-blue-600'"
                  >
                    🔎
                  </span>

                  <span class="text-sm font-bold">
                    Find a Patient
                  </span>

                  <span class="ml-auto text-xs opacity-40">
                    →
                  </span>

                </button>


                <!-- Analytics -->
                <button
                  @click="goToSection('analytics')"
                  class="group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'text-slate-300 hover:bg-pink-500/10 hover:text-white'
                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-pink-500/10 text-pink-300'
                      : 'bg-pink-50 text-pink-600'"
                  >
                    📊
                  </span>
                  <span class="text-sm font-bold">
                    Dashboard Analytics
                  </span>
                  <span class="ml-auto text-xs opacity-40">
                    →
                  </span>
                </button>


                <!-- Activity Center -->
                <button
                  @click="toggleActivityCenter"
                  class="group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'text-slate-300 hover:bg-pink-500/10 hover:text-white'
                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'"
                >
                  <span
                    class="relative flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-pink-500/10 text-pink-300'
                      : 'bg-pink-50 text-pink-600'"
                  >
                    🔔
                    <span
                      v-if="activities.length"
                      class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[8px] font-black text-white"
                    >
                      {{ activities.length > 9 ? '9+' : activities.length }}
                    </span>
                  </span>
                  <span class="text-sm font-bold">
                    Activity Center
                  </span>
                  <span class="ml-auto text-xs opacity-40">
                    →
                  </span>
                </button>

                <!-- Settings -->
                <button
                  @click="openSettings"
                  class="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98]"
                  :class="isDark
                    ? 'text-slate-300 hover:bg-pink-500/10 hover:text-white'
                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'"
                >

                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="isDark
                      ? 'bg-pink-500/10 text-pink-300'
                      : 'bg-pink-50 text-pink-600'"
                  >
                    ⚙
                  </span>

                  <span class="text-sm font-bold">
                    System Settings
                  </span>

                  <span class="ml-auto text-xs opacity-40">
                    →
                  </span>

                </button>

              </nav>


              <!-- Divider -->
              <div
                class="my-7 h-px"
                :class="isDark
                  ? 'bg-white/5'
                  : 'bg-slate-100'"
              ></div>


              <!-- Information Card -->
              <div
                class="rounded-2xl border p-4"
                :class="isDark
                  ? 'border-violet-500/10 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-pink-500/5'
                  : 'border-violet-100 bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50'"
              >

                <div class="flex items-center gap-3">

                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-lg"
                  >
                    ✦
                  </div>

                  <div>

                    <p
                      class="text-xs font-black"
                      :class="isDark
                        ? 'text-white'
                        : 'text-slate-900'"
                    >
                      Medical Technology
                    </p>

                    <p
                      class="mt-1 text-[9px]"
                      :class="isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'"
                    >
                      Secure patient management
                    </p>

                  </div>

                </div>

              </div>

            </div>


            <!-- System Status -->
            <div
              class="shrink-0 border-t p-5"
              :class="isDark
                ? 'border-white/5 bg-[#080718]/95'
                : 'border-violet-100 bg-white/95'"
            >

              <div
                class="rounded-2xl border p-4"
                :class="isDark
                  ? 'border-emerald-500/15 bg-emerald-500/5'
                  : 'border-emerald-100 bg-emerald-50'"
              >

                <div class="flex items-center gap-3">

                  <span class="relative flex h-3 w-3">

                    <span
                      class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50"
                    ></span>

                    <span
                      class="relative h-3 w-3 rounded-full bg-emerald-500"
                    ></span>

                  </span>

                  <div>

                    <p
                      class="text-xs font-black"
                      :class="isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-700'"
                    >
                      System Online
                    </p>

                    <p
                      class="mt-0.5 text-[9px]"
                      :class="isDark
                        ? 'text-slate-500'
                        : 'text-slate-500'"
                    >
                      All services operational
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </aside>

      </div>

    </transition>


    <!-- ===================================================
         MOBILE ACTIVITY CENTER
    ==================================================== -->

    <transition name="activity-pop">
      <div
        v-if="activityOpen"
        class="fixed inset-0 z-[95] sm:hidden"
      >
        <div
          @click="activityOpen = false"
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        ></div>

        <section
          class="absolute left-3 right-3 top-[82px] max-h-[70vh] overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl"
          :class="isDark
            ? 'border-violet-500/15 bg-[#0b0a1d]/95'
            : 'border-violet-100 bg-white/95'"
        >
          <div
            class="flex items-center justify-between border-b px-5 py-4"
            :class="isDark ? 'border-white/5' : 'border-slate-100'"
          >
            <div>
              <p class="text-sm font-black" :class="isDark ? 'text-white' : 'text-slate-950'">
                Recent Activity
              </p>
              <p class="mt-0.5 text-[10px]" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
                Latest system events
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="activities.length"
                @click="clearActivities"
                class="rounded-lg px-2 py-1 text-[10px] font-bold"
                :class="isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'"
              >
                Clear
              </button>

              <button
                @click="activityOpen = false"
                class="flex h-8 w-8 items-center justify-center rounded-lg"
                :class="isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'"
                aria-label="Close activity center"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="max-h-[calc(70vh-76px)] overflow-y-auto">
            <div v-if="!activities.length" class="px-5 py-10 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/15 to-pink-500/15 text-2xl">
                🔔
              </div>
              <p class="mt-3 text-sm font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">
                No recent activity
              </p>
              <p class="mt-1 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
                Your system events will appear here.
              </p>
            </div>

            <div v-else>
              <div
                v-for="activity in activities"
                :key="activity.id"
                class="flex gap-3 border-b px-5 py-4 last:border-b-0"
                :class="isDark ? 'border-white/5' : 'border-slate-100'"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 text-lg">
                  {{ activity.icon }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black" :class="isDark ? 'text-white' : 'text-slate-900'">
                    {{ activity.title }}
                  </p>
                  <p class="mt-1 truncate text-[10px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                    {{ activity.description }}
                  </p>
                  <p class="mt-1 text-[9px] font-semibold" :class="isDark ? 'text-violet-400' : 'text-violet-600'">
                    {{ formatActivityTime(activity.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </transition>

    <!-- ===================================================
         MAIN CONTENT
    ==================================================== -->

    <main
      class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      :class="compactMode ? 'py-5 sm:py-7' : 'py-8 sm:py-10'"
    >


      <!-- =================================================
           HERO
      ================================================== -->

      <section
        id="dashboard"
        class="scroll-mt-24"
      >

        <div
          class="mb-8 rounded-[28px] border p-6 shadow-xl backdrop-blur-xl sm:p-8 lg:p-10"
          :class="isDark
            ? 'border-violet-500/10 bg-white/[0.025] shadow-violet-950/20'
            : 'border-violet-100 bg-white/70 shadow-violet-200/20'"
        >

          <div class="max-w-3xl">

            <!-- Badge -->
            <div
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black"
              :class="isDark
                ? 'border-violet-400/15 bg-violet-500/10 text-violet-300'
                : 'border-violet-100 bg-violet-50 text-violet-700'"
            >

              <span>✦</span>

              Medical Technology Dashboard

            </div>


            <!-- Title -->
            <h2
              class="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              :class="isDark
                ? 'text-white'
                : 'text-slate-950'"
            >
              Patient Management
            </h2>


            <p
              class="mt-4 max-w-2xl text-sm leading-7 sm:text-base"
              :class="isDark
                ? 'text-slate-400'
                : 'text-slate-600'"
            >
              Manage patient information, diagnoses, and room
              assignments through one organized and secure
              interface.
            </p>


            <!-- Accent Line -->
            <div
              class="mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-500"
            ></div>

          </div>

        </div>

      </section>


      <!-- =================================================
           STATISTICS
      ================================================== -->

      <section
        class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >

        <!-- Total Patients -->
        <div
          class="group rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          :class="isDark
            ? 'border-blue-500/10 bg-white/[0.025]'
            : 'border-blue-100 bg-white/75'"
        >

          <div class="flex items-center justify-between">

            <div>

              <p
                class="text-[10px] font-black uppercase tracking-[0.15em]"
                :class="isDark
                  ? 'text-blue-300/70'
                  : 'text-blue-600/70'"
              >
                Total Patients
              </p>

              <p
                class="mt-2 text-3xl font-black"
                :class="isDark
                  ? 'text-white'
                  : 'text-slate-950'"
              >
                {{ patients.length }}
              </p>

              <p
                class="mt-1 text-xs"
                :class="isDark
                  ? 'text-slate-500'
                  : 'text-slate-500'"
              >
                Registered records
              </p>

            </div>


            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-2xl text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110"
            >
              👥
            </div>

          </div>

        </div>


        <!-- Assigned Rooms -->
        <div
          class="group rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          :class="isDark
            ? 'border-violet-500/10 bg-white/[0.025]'
            : 'border-violet-100 bg-white/75'"
        >

          <div class="flex items-center justify-between">

            <div>

              <p
                class="text-[10px] font-black uppercase tracking-[0.15em]"
                :class="isDark
                  ? 'text-violet-300/70'
                  : 'text-violet-600/70'"
              >
                Assigned Rooms
              </p>

              <p
                class="mt-2 text-3xl font-black"
                :class="isDark
                  ? 'text-white'
                  : 'text-slate-950'"
              >
                {{ assignedRooms }}
              </p>

              <p
                class="mt-1 text-xs"
                :class="isDark
                  ? 'text-slate-500'
                  : 'text-slate-500'"
              >
                Currently assigned
              </p>

            </div>


            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-2xl text-white shadow-lg shadow-violet-500/20 transition-transform duration-300 group-hover:scale-110"
            >
              🏥
            </div>

          </div>

        </div>


        <!-- Records Shown -->
        <div
          class="group rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:col-span-2 lg:col-span-1"
          :class="isDark
            ? 'border-pink-500/10 bg-white/[0.025]'
            : 'border-pink-100 bg-white/75'"
        >

          <div class="flex items-center justify-between">

            <div>

              <p
                class="text-[10px] font-black uppercase tracking-[0.15em]"
                :class="isDark
                  ? 'text-pink-300/70'
                  : 'text-pink-600/70'"
              >
                Records Shown
              </p>

              <p
                class="mt-2 text-3xl font-black"
                :class="isDark
                  ? 'text-white'
                  : 'text-slate-950'"
              >
                {{ recordCount }}
              </p>

              <p
                class="mt-1 text-xs"
                :class="isDark
                  ? 'text-slate-500'
                  : 'text-slate-500'"
              >
                Current results
              </p>

            </div>


            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-2xl text-white shadow-lg shadow-pink-500/20 transition-transform duration-300 group-hover:scale-110"
            >
              📊
            </div>

          </div>

        </div>

      </section>


      <!-- =================================================
           DASHBOARD ANALYTICS
      ================================================== -->

      <section
        id="analytics"
        class="mb-8 scroll-mt-24 rounded-[28px] border p-5 shadow-xl backdrop-blur-xl transition-colors duration-500 sm:p-7"
        :class="isDark
          ? 'border-violet-500/10 bg-white/[0.025] shadow-violet-950/20'
          : 'border-violet-100 bg-white/75 shadow-violet-200/20'"
      >

        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em]"
              :class="isDark
                ? 'border-violet-400/15 bg-violet-500/10 text-violet-300'
                : 'border-violet-100 bg-violet-50 text-violet-700'"
            >
              <span>✦</span> Live Analytics
            </div>

            <h3
              class="mt-3 text-2xl font-black tracking-tight sm:text-3xl"
              :class="isDark ? 'text-white' : 'text-slate-950'"
            >
              Patient Overview
            </h3>

            <p
              class="mt-1 text-sm"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              Real-time insights generated from your registered patient records.
            </p>
          </div>

          <div
            class="flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold"
            :class="isDark
              ? 'border-cyan-400/10 bg-cyan-500/5 text-cyan-300'
              : 'border-cyan-100 bg-cyan-50 text-cyan-700'"
          >
            <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></span>
            Live patient data
          </div>
        </div>

        <!-- Analytics Cards -->
        <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div
            class="rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            :class="isDark
              ? 'border-cyan-500/10 bg-cyan-500/[0.04]'
              : 'border-cyan-100 bg-cyan-50/60'"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-[0.14em]"
                  :class="isDark ? 'text-cyan-300/70' : 'text-cyan-700/70'"
                >
                  Occupied Beds
                </p>
                <p
                  class="mt-2 text-3xl font-black"
                  :class="isDark ? 'text-white' : 'text-slate-950'"
                >
                  {{ occupiedBeds }}
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl text-white shadow-lg shadow-cyan-500/20">
                🛏
              </div>
            </div>
            <p class="mt-3 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
              {{ roomCapacity }} total capacity in assigned rooms
            </p>
          </div>

          <div
            class="rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            :class="isDark
              ? 'border-emerald-500/10 bg-emerald-500/[0.04]'
              : 'border-emerald-100 bg-emerald-50/60'"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-[0.14em]"
                  :class="isDark ? 'text-emerald-300/70' : 'text-emerald-700/70'"
                >
                  Available Beds
                </p>
                <p
                  class="mt-2 text-3xl font-black"
                  :class="isDark ? 'text-white' : 'text-slate-950'"
                >
                  {{ availableBeds }}
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl text-white shadow-lg shadow-emerald-500/20">
                ✓
              </div>
            </div>
            <p class="mt-3 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
              Capacity remaining in assigned rooms
            </p>
          </div>

          <div
            class="rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            :class="isDark
              ? 'border-pink-500/10 bg-pink-500/[0.04]'
              : 'border-pink-100 bg-pink-50/60'"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-[0.14em]"
                  :class="isDark ? 'text-pink-300/70' : 'text-pink-700/70'"
                >
                  Room Occupancy
                </p>
                <p
                  class="mt-2 text-3xl font-black"
                  :class="isDark ? 'text-white' : 'text-slate-950'"
                >
                  {{ occupancyPercentage }}%
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-xl text-white shadow-lg shadow-pink-500/20">
                ◉
              </div>
            </div>
            <div class="mt-4 h-2 overflow-hidden rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-200'">
              <div
                class="h-full rounded-full bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 transition-all duration-700"
                :style="{ width: occupancyPercentage + '%' }"
              ></div>
            </div>
          </div>

          <div
            class="rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            :class="isDark
              ? 'border-violet-500/10 bg-violet-500/[0.04]'
              : 'border-violet-100 bg-violet-50/60'"
          >
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-[0.14em]"
                  :class="isDark ? 'text-violet-300/70' : 'text-violet-700/70'"
                >
                  Diagnoses
                </p>
                <p
                  class="mt-2 text-3xl font-black"
                  :class="isDark ? 'text-white' : 'text-slate-950'"
                >
                  {{ uniqueDiagnoses }}
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-xl text-white shadow-lg shadow-violet-500/20">
                🩺
              </div>
            </div>
            <p class="mt-3 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
              Unique diagnoses recorded
            </p>
          </div>

        </div>

        <!-- Gender + Diagnosis -->
        <div class="mt-4 grid gap-4 lg:grid-cols-2">

          <div
            class="rounded-3xl border p-5"
            :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-white/70'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <h4 class="font-black" :class="isDark ? 'text-white' : 'text-slate-950'">Gender Distribution</h4>
                <p class="mt-1 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">Patient records by gender</p>
              </div>
              <span class="text-xs font-black" :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ patients.length }} total</span>
            </div>

            <div class="mt-5 space-y-4">
              <div>
                <div class="mb-2 flex items-center justify-between text-xs font-bold">
                  <span :class="isDark ? 'text-blue-300' : 'text-blue-700'">♂ Male</span>
                  <span :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ malePatients }} · {{ genderPercentage(malePatients) }}%</span>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-100'">
                  <div class="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700" :style="{ width: genderPercentage(malePatients) + '%' }"></div>
                </div>
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between text-xs font-bold">
                  <span :class="isDark ? 'text-pink-300' : 'text-pink-700'">♀ Female</span>
                  <span :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ femalePatients }} · {{ genderPercentage(femalePatients) }}%</span>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-100'">
                  <div class="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-700" :style="{ width: genderPercentage(femalePatients) + '%' }"></div>
                </div>
              </div>

              <div v-if="otherGenderPatients">
                <div class="mb-2 flex items-center justify-between text-xs font-bold">
                  <span :class="isDark ? 'text-violet-300' : 'text-violet-700'">Other / Unspecified</span>
                  <span :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ otherGenderPatients }} · {{ genderPercentage(otherGenderPatients) }}%</span>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-100'">
                  <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700" :style="{ width: genderPercentage(otherGenderPatients) + '%' }"></div>
                </div>
              </div>

              <div v-if="!patients.length" class="rounded-2xl border border-dashed p-4 text-center text-xs" :class="isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'">
                Register a patient to populate analytics.
              </div>
            </div>
          </div>

          <div
            class="rounded-3xl border p-5"
            :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-white/70'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <h4 class="font-black" :class="isDark ? 'text-white' : 'text-slate-950'">Top Diagnoses</h4>
                <p class="mt-1 text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">Most frequently recorded conditions</p>
              </div>
              <span class="rounded-full px-3 py-1 text-[10px] font-black" :class="isDark ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-700'">Top 5</span>
            </div>

            <div v-if="diagnosisBreakdown.length" class="mt-5 space-y-4">
              <div v-for="(item, index) in diagnosisBreakdown" :key="item.label">
                <div class="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
                  <div class="flex min-w-0 items-center gap-2">
                    <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black" :class="isDark ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-700'">{{ index + 1 }}</span>
                    <span class="truncate" :class="isDark ? 'text-slate-300' : 'text-slate-700'">{{ item.label }}</span>
                  </div>
                  <span class="shrink-0" :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ item.count }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full" :class="isDark ? 'bg-white/10' : 'bg-slate-100'">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-pink-500 transition-all duration-700"
                    :style="{ width: Math.round((item.count / Math.max(patients.length, 1)) * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-else class="mt-5 rounded-2xl border border-dashed p-6 text-center" :class="isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'">
              <div class="text-2xl">🩺</div>
              <p class="mt-2 text-xs font-semibold">No diagnosis data yet.</p>
            </div>
          </div>

        </div>
      </section>


      <!-- =================================================
           ROOM STATUS
      ================================================== -->

      <section
        id="rooms"
        class="mb-8 scroll-mt-24 rounded-[28px] border p-5 shadow-xl backdrop-blur-xl transition-colors duration-500 sm:p-7"
        :class="isDark
          ? 'border-cyan-500/10 bg-white/[0.025] shadow-cyan-950/20'
          : 'border-cyan-100 bg-white/75 shadow-blue-200/20'"
      >

        <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em]"
              :class="isDark
                ? 'border-cyan-400/15 bg-cyan-500/10 text-cyan-300'
                : 'border-cyan-100 bg-cyan-50 text-cyan-700'"
            >
              <span>✦</span> Live Capacity
            </div>

            <h3
              class="mt-3 text-2xl font-black tracking-tight sm:text-3xl"
              :class="isDark ? 'text-white' : 'text-slate-950'"
            >
              Room Status
            </h3>

            <p
              class="mt-1 text-sm"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              Monitor room capacity at a maximum of 2 patients per room.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 text-xs font-bold">
            <span
              class="rounded-full border px-3 py-2"
              :class="isDark
                ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-300'
                : 'border-emerald-100 bg-emerald-50 text-emerald-700'"
            >
              ● {{ partialRooms }} Partial
            </span>

            <span
              class="rounded-full border px-3 py-2"
              :class="isDark
                ? 'border-rose-500/15 bg-rose-500/10 text-rose-300'
                : 'border-rose-100 bg-rose-50 text-rose-700'"
            >
              ● {{ fullRooms }} Full
            </span>
          </div>

        </div>


        <div
          v-if="roomStatuses.length"
          class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >

          <button
            v-for="room in roomStatuses"
            :key="room.room"
            @click="viewRoom(room.room)"
            class="group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
            :class="room.count >= 2
              ? (isDark
                ? 'border-rose-500/20 bg-rose-500/[0.06]'
                : 'border-rose-100 bg-rose-50/60')
              : (isDark
                ? 'border-violet-500/15 bg-white/[0.025]'
                : 'border-violet-100 bg-white/70')"
          >

            <div
              class="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-30"
              :class="room.count >= 2 ? 'bg-rose-500' : 'bg-cyan-500'"
            ></div>

            <div class="relative flex items-start justify-between gap-3">

              <div class="flex items-center gap-3">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white shadow-lg"
                  :class="room.count >= 2
                    ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/20'
                    : room.count === 1
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20'
                      : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/20'"
                >
                  🛏
                </div>

                <div>
                  <p
                    class="text-[10px] font-black uppercase tracking-[0.16em]"
                    :class="isDark ? 'text-slate-500' : 'text-slate-400'"
                  >
                    Room
                  </p>

                  <p
                    class="text-xl font-black"
                    :class="isDark ? 'text-white' : 'text-slate-950'"
                  >
                    {{ room.room }}
                  </p>
                </div>
              </div>

              <span
                class="rounded-full px-2.5 py-1 text-[10px] font-black"
                :class="room.count >= 2
                  ? (isDark ? 'bg-rose-500/15 text-rose-300' : 'bg-rose-100 text-rose-700')
                  : room.count === 1
                    ? (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-700')
                    : (isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700')"
              >
                {{ room.status }}
              </span>

            </div>


            <div class="relative mt-5">
              <div class="mb-2 flex items-center justify-between">
                <span
                  class="text-xs font-bold"
                  :class="isDark ? 'text-slate-300' : 'text-slate-600'"
                >
                  Occupancy
                </span>

                <span
                  class="text-xs font-black"
                  :class="isDark ? 'text-white' : 'text-slate-900'"
                >
                  {{ room.count }} / {{ room.capacity }}
                </span>
              </div>

              <div
                class="h-2 overflow-hidden rounded-full"
                :class="isDark ? 'bg-white/10' : 'bg-slate-100'"
              >
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{ width: room.percentage + '%' }"
                  :class="room.count >= 2
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                    : room.count === 1
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-400 to-cyan-500'"
                ></div>
              </div>
            </div>


            <div
              class="relative mt-4 border-t pt-3"
              :class="isDark ? 'border-white/5' : 'border-slate-100'"
            >
              <p
                v-if="room.patients.length"
                class="truncate text-xs font-semibold"
                :class="isDark ? 'text-slate-400' : 'text-slate-500'"
              >
                {{ room.patients.map(patient => patient.patientName).join(' • ') }}
              </p>

              <p
                v-else
                class="text-xs"
                :class="isDark ? 'text-slate-500' : 'text-slate-400'"
              >
                No patients assigned
              </p>
            </div>

          </button>

        </div>


        <div
          v-else
          class="mt-6 rounded-3xl border border-dashed p-8 text-center"
          :class="isDark
            ? 'border-white/10 bg-white/[0.02]'
            : 'border-violet-100 bg-violet-50/40'"
        >
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-2xl text-white shadow-lg">
            🛏
          </div>

          <p
            class="mt-3 font-black"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            No rooms assigned yet
          </p>

          <p
            class="mt-1 text-xs"
            :class="isDark ? 'text-slate-500' : 'text-slate-500'"
          >
            Register a patient to see room capacity here.
          </p>
        </div>

      </section>


      <!-- =================================================
           MESSAGE
      ================================================== -->

      <transition name="notification">

        <div
          v-if="message"
          class="mb-6 flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold shadow-lg backdrop-blur-xl"
          :class="isDark
            ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
            : 'border-emerald-200 bg-emerald-50/90 text-emerald-700'"
        >

          <div class="flex items-center gap-3">

            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white"
            >
              ✓
            </span>

            {{ message }}

          </div>


          <button
            @click="message = ''"
            class="rounded-lg px-2 py-1 transition hover:bg-emerald-500/10 active:scale-90"
            aria-label="Close notification"
          >
            ✕
          </button>

        </div>

      </transition>


      <!-- =================================================
           PATIENT FORM
      ================================================== -->

      <section
        id="form"
        class="mb-8 scroll-mt-24"
      >

        <PatientForm
          :key="formResetKey"
          :patient-to-edit="editingPatient"
          @save="savePatient"
          @cancel="cancelEdit"
        />

      </section>


      <!-- =================================================
           SEARCH
      ================================================== -->

      <section
        id="search"
        class="mb-6 scroll-mt-24 rounded-3xl border p-5 shadow-lg backdrop-blur-xl transition-colors duration-500 sm:p-6"
        :class="isDark
          ? 'border-violet-500/10 bg-white/[0.025]'
          : 'border-violet-100 bg-white/75'"
      >

        <div
          class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >

          <div class="flex items-center gap-3">

            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-xl text-white shadow-lg shadow-violet-500/20"
            >
              🔎
            </div>


            <div>

              <h3
                class="font-black"
                :class="isDark
                  ? 'text-white'
                  : 'text-slate-950'"
              >
                Find a Patient
              </h3>

              <p
                class="text-xs sm:text-sm"
                :class="isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'"
              >
                Search by name, diagnosis, or room number.
              </p>

            </div>

          </div>


          <!-- Search Input -->
          <div class="relative w-full lg:max-w-md">

            <span
              class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            >
              🔍
            </span>


            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search patient records..."
              aria-label="Search patient records"
              class="w-full rounded-2xl border py-3.5 pl-11 pr-11 text-sm outline-none transition-all duration-300"
              :class="isDark
                ? 'border-white/10 bg-black/20 text-white placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
                : 'border-violet-100 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'"
            />


            <button
              v-if="searchTerm"
              @click="searchTerm = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 transition active:scale-90"
              :class="isDark
                ? 'text-slate-400 hover:bg-white/5'
                : 'text-slate-400 hover:bg-slate-100'"
              aria-label="Clear search"
            >
              ✕
            </button>

          </div>

        </div>

      </section>


      <!-- =================================================
           PATIENT RECORDS
      ================================================== -->

      <section
        id="records"
        class="scroll-mt-24"
      >

        <PatientList
          :patients="filteredPatients"
          @edit="editPatient"
          @delete="deletePatient"
          @view="viewPatient"
        />

      </section>


    </main>


    <!-- ===================================================
         SYSTEM SETTINGS MODAL
    ==================================================== -->

    <transition name="settings-modal">
      <div
        v-if="settingsOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
        @click.self="closeSettings"
      >
        <div
          class="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          aria-hidden="true"
        ></div>

        <section
          class="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border shadow-2xl"
          :class="isDark
            ? 'border-violet-500/15 bg-[#0b0a1d] text-white'
            : 'border-violet-100 bg-white text-slate-900'"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >

          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b px-5 py-5 sm:px-7"
            :class="isDark ? 'border-white/5' : 'border-slate-100'"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-xl text-white shadow-lg shadow-violet-500/20"
              >
                ⚙️
              </div>

              <div>
                <p
                  id="settings-title"
                  class="text-lg font-black"
                >
                  System Settings
                </p>
                <p
                  class="text-[10px]"
                  :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                >
                  Customize your MediCare dashboard
                </p>
              </div>
            </div>

            <button
              @click="closeSettings"
              class="flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-90"
              :class="isDark
                ? 'text-slate-300 hover:bg-white/5'
                : 'text-slate-600 hover:bg-slate-100'"
              aria-label="Close settings"
            >
              ✕
            </button>
          </div>

          <!-- Scrollable settings -->
          <div class="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">

            <!-- Appearance -->
            <div class="mb-7">
              <p
                class="mb-3 text-[10px] font-black uppercase tracking-[0.2em]"
                :class="isDark ? 'text-violet-400' : 'text-violet-600'"
              >
                Appearance
              </p>

              <div class="space-y-3">

                <div
                  class="flex items-center justify-between gap-4 rounded-2xl border p-4"
                  :class="isDark
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-slate-100 bg-slate-50/70'"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">
                      {{ isDark ? '🌙' : '☀️' }}
                    </span>
                    <div>
                      <p class="text-sm font-black">
                        {{ isDark ? 'Dark Mode' : 'Light Mode' }}
                      </p>
                      <p
                        class="text-[10px]"
                        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                      >
                        Switch the dashboard appearance
                      </p>
                    </div>
                  </div>

                  <button
                    @click="toggleTheme"
                    class="relative h-7 w-12 shrink-0 rounded-full transition"
                    :class="isDark ? 'bg-violet-600' : 'bg-slate-300'"
                    :aria-pressed="isDark"
                    aria-label="Toggle dark mode"
                  >
                    <span
                      class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300"
                      :class="isDark ? 'left-6' : 'left-1'"
                    ></span>
                  </button>
                </div>

                <div
                  class="flex items-center justify-between gap-4 rounded-2xl border p-4"
                  :class="isDark
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-slate-100 bg-slate-50/70'"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">📐</span>
                    <div>
                      <p class="text-sm font-black">
                        Compact Dashboard
                      </p>
                      <p
                        class="text-[10px]"
                        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                      >
                        Use a more compact dashboard layout
                      </p>
                    </div>
                  </div>

                  <button
                    @click="toggleCompactMode"
                    class="relative h-7 w-12 shrink-0 rounded-full transition"
                    :class="compactMode ? 'bg-blue-600' : 'bg-slate-300'"
                    :aria-pressed="compactMode"
                    aria-label="Toggle compact dashboard"
                  >
                    <span
                      class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300"
                      :class="compactMode ? 'left-6' : 'left-1'"
                    ></span>
                  </button>
                </div>

              </div>
            </div>

            <!-- Notifications -->
            <div class="mb-7">
              <p
                class="mb-3 text-[10px] font-black uppercase tracking-[0.2em]"
                :class="isDark ? 'text-blue-400' : 'text-blue-600'"
              >
                Notifications
              </p>

              <div
                class="flex items-center justify-between gap-4 rounded-2xl border p-4"
                :class="isDark
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-slate-100 bg-slate-50/70'"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🔔</span>
                  <div>
                    <p class="text-sm font-black">
                      Activity Notifications
                    </p>
                    <p
                      class="text-[10px]"
                      :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                    >
                      Record registrations, updates, deletions, and room events
                    </p>
                  </div>
                </div>

                <button
                  @click="toggleNotifications"
                  class="relative h-7 w-12 shrink-0 rounded-full transition"
                  :class="notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'"
                  :aria-pressed="notificationsEnabled"
                  aria-label="Toggle activity notifications"
                >
                  <span
                    class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300"
                    :class="notificationsEnabled ? 'left-6' : 'left-1'"
                  ></span>
                </button>
              </div>
            </div>

            <!-- Data Management -->
            <div class="mb-7">
              <p
                class="mb-3 text-[10px] font-black uppercase tracking-[0.2em]"
                :class="isDark ? 'text-pink-400' : 'text-pink-600'"
              >
                Data Management
              </p>

              <div class="grid gap-3 sm:grid-cols-2">

                <button
                  @click="exportPatientData"
                  class="flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5"
                  :class="isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-violet-500/10'
                    : 'border-violet-100 bg-white hover:bg-violet-50'"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"
                  >
                    📤
                  </span>
                  <span>
                    <span class="block text-sm font-black">
                      Export Data
                    </span>
                    <span
                      class="block text-[10px]"
                      :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                    >
                      Save records as JSON
                    </span>
                  </span>
                </button>

                <label
                  class="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5"
                  :class="isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-blue-500/10'
                    : 'border-blue-100 bg-white hover:bg-blue-50'"
                >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"
                  >
                    📥
                  </span>
                  <span>
                    <span class="block text-sm font-black">
                      Import Data
                    </span>
                    <span
                      class="block text-[10px]"
                      :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                    >
                      Restore a JSON backup
                    </span>
                  </span>

                  <input
                    type="file"
                    accept="application/json,.json"
                    class="hidden"
                    @change="importPatientData"
                  />
                </label>

              </div>
            </div>

            <!-- Activity -->
            <div class="mb-7">
              <p
                class="mb-3 text-[10px] font-black uppercase tracking-[0.2em]"
                :class="isDark ? 'text-cyan-400' : 'text-cyan-700'"
              >
                Activity Center
              </p>

              <button
                @click="clearActivities"
                :disabled="!activities.length"
                class="flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition"
                :class="isDark
                  ? 'border-white/10 bg-white/[0.03] hover:bg-white/5 disabled:opacity-40'
                  : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100 disabled:opacity-40'"
              >
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"
                >
                  🧹
                </span>

                <span>
                  <span class="block text-sm font-black">
                    Clear Activity History
                  </span>
                  <span
                    class="block text-[10px]"
                    :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                  >
                    {{ activities.length }} saved activit{{ activities.length === 1 ? 'y' : 'ies' }}
                  </span>
                </span>
              </button>
            </div>

            <!-- Danger Zone -->
            <div>
              <p
                class="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500"
              >
                Danger Zone
              </p>

              <div
                class="rounded-2xl border p-4"
                :class="isDark
                  ? 'border-red-500/15 bg-red-500/5'
                  : 'border-red-100 bg-red-50/70'"
              >
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm font-black text-red-600">
                      Clear All Patient Records
                    </p>
                    <p
                      class="mt-1 text-[10px]"
                      :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                    >
                      Permanently removes patient data stored in this browser.
                    </p>
                  </div>

                  <button
                    @click="clearAllPatients"
                    class="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 active:scale-95"
                  >
                    Clear Records
                  </button>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div
              class="mt-7 rounded-2xl border p-4"
              :class="isDark
                ? 'border-white/5 bg-white/[0.02]'
                : 'border-slate-100 bg-slate-50/60'"
            >
              <div class="flex items-center justify-between text-[10px]">
                <span :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                  System
                </span>
                <span class="font-bold">
                  MediCare Patient Management
                </span>
              </div>

              <div class="mt-2 flex items-center justify-between text-[10px]">
                <span :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                  Version
                </span>
                <span class="font-bold">
                  v1.0
                </span>
              </div>

              <div class="mt-2 flex items-center justify-between text-[10px]">
                <span :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                  Patient Records
                </span>
                <span class="font-bold">
                  {{ patients.length }}
                </span>
              </div>
            </div>

          </div>

        </section>
      </div>
    </transition>


    <!-- ===================================================
         PATIENT DETAILS MODAL
    ==================================================== -->

    <transition name="patient-modal">
      <div
        v-if="selectedPatient"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="closePatientDetails"
      >
        <div
          class="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
          aria-hidden="true"
        ></div>

        <article
          class="relative z-10 w-full max-w-xl overflow-hidden rounded-[30px] border shadow-2xl"
          :class="isDark
            ? 'border-white/10 bg-[#0b1020] text-white shadow-black/50'
            : 'border-white/70 bg-white/95 text-slate-900 shadow-violet-200/50'"
          role="dialog"
          aria-modal="true"
          aria-label="Patient details"
        >
          <div
            class="relative overflow-hidden p-6 sm:p-8"
            :class="isDark
              ? 'bg-gradient-to-br from-violet-950/70 via-blue-950/50 to-pink-950/50'
              : 'bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50'"
          >
            <div class="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl"></div>
            <div class="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-pink-500/15 blur-3xl"></div>

            <button
              type="button"
              @click="closePatientDetails"
              class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition hover:scale-105 active:scale-95"
              :class="isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-violet-100 bg-white/80 text-slate-600 hover:bg-white'"
              aria-label="Close patient details"
            >
              ✕
            </button>

            <div class="relative flex items-center gap-4 pr-12">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-pink-500 text-2xl font-black text-white shadow-xl shadow-violet-500/20">
                {{ String(selectedPatient.patientName || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-[0.18em]" :class="isDark ? 'text-violet-300' : 'text-violet-600'">Patient Profile</p>
                <h3 class="mt-1 truncate text-2xl font-black sm:text-3xl">{{ selectedPatient.patientName }}</h3>
                <p class="mt-1 text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Patient ID #{{ selectedPatient.id }}</p>
              </div>
            </div>
          </div>

          <div class="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
            <div class="rounded-2xl border p-4" :class="isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/80'">
              <p class="text-[10px] font-black uppercase tracking-widest" :class="isDark ? 'text-slate-500' : 'text-slate-400'">Age</p>
              <p class="mt-1 text-lg font-black">{{ selectedPatient.age }}</p>
            </div>

            <div class="rounded-2xl border p-4" :class="isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/80'">
              <p class="text-[10px] font-black uppercase tracking-widest" :class="isDark ? 'text-slate-500' : 'text-slate-400'">Gender</p>
              <p class="mt-1 text-lg font-black">{{ selectedPatient.gender }}</p>
            </div>

            <div class="rounded-2xl border p-4" :class="isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/80'">
              <p class="text-[10px] font-black uppercase tracking-widest" :class="isDark ? 'text-slate-500' : 'text-slate-400'">Diagnosis</p>
              <p class="mt-1 text-lg font-black">{{ selectedPatient.diagnosis }}</p>
            </div>

            <div class="rounded-2xl border p-4" :class="isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/80'">
              <p class="text-[10px] font-black uppercase tracking-widest" :class="isDark ? 'text-slate-500' : 'text-slate-400'">Room</p>
              <p class="mt-1 text-lg font-black">{{ selectedPatient.roomNumber }}</p>
            </div>
          </div>

          <div class="border-t px-6 py-5 sm:px-8" :class="isDark ? 'border-white/10' : 'border-slate-100'">
            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                @click="editPatient(selectedPatient); closePatientDetails()"
                class="rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 active:scale-95"
              >
                ✎ Edit Patient
              </button>
              <button
                type="button"
                @click="closePatientDetails"
                class="rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-white/5"
                :class="isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'"
              >
                Close
              </button>
            </div>
          </div>
        </article>
      </div>
    </transition>


    <!-- ===================================================
         FOOTER
    ==================================================== -->

    <AppFooter />

  </div>

</template>


<style scoped>

/* =========================================================
   MOBILE DRAWER ANIMATION
========================================================= */

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-active aside,
.drawer-leave-active aside {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}


/* =========================================================
   NOTIFICATION ANIMATION
========================================================= */

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}


/* =========================================================
   DRAWER SCROLLBAR
========================================================= */

aside::-webkit-scrollbar {
  width: 5px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    #7c3aed,
    #2563eb,
    #ec4899
  );
  border-radius: 999px;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 640px) {

  main {
    padding-top: 1.5rem;
  }

}




/* =========================================================
   PATIENT DETAILS MODAL ANIMATION
========================================================= */

.patient-modal-enter-active,
.patient-modal-leave-active {
  transition: opacity 0.25s ease;
}

.patient-modal-enter-active article,
.patient-modal-leave-active article {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}

.patient-modal-enter-from,
.patient-modal-leave-to {
  opacity: 0;
}

.patient-modal-enter-from article,
.patient-modal-leave-to article {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
}

/* =========================================================
   FINAL PAGE POLISH
========================================================= */

:global(html) {
  scroll-behavior: smooth;
}

:global(body) {
  margin: 0;
  min-width: 320px;
}

:global(button),
:global(input),
:global(select),
:global(textarea) {
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 640px) {
  :global(body) {
    overflow-x: hidden;
  }

  main {
    padding-top: 1.5rem;
  }
}


/* =========================================================
   ACTIVITY CENTER ANIMATION
========================================================= */

.activity-pop-enter-active,
.activity-pop-leave-active {
  transition: all 0.22s ease;
}

.activity-pop-enter-from,
.activity-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

/* =========================================================
   SETTINGS MODAL
========================================================= */

.settings-modal-enter-active,
.settings-modal-leave-active {
  transition: opacity 0.25s ease;
}

.settings-modal-enter-active section,
.settings-modal-leave-active section {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.settings-modal-enter-from,
.settings-modal-leave-to {
  opacity: 0;
}

.settings-modal-enter-from section,
.settings-modal-leave-to section {
  transform: translateY(18px) scale(0.98);
}

</style>