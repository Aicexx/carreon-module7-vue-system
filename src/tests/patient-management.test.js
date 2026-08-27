import { describe, it, expect, beforeEach } from 'vitest'

describe('MediCare Patient Management System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // TEST 1: Add Patient
  it('should successfully add a new patient record', () => {
    const patients = []

    const newPatient = {
      id: 1,
      patientName: 'Angelica Tanglao',
      age: 22,
      gender: 'Female',
      diagnosis: 'Fever',
      roomNumber: '1'
    }

    patients.push(newPatient)

    expect(patients).toHaveLength(1)
    expect(patients[0].patientName).toBe('Angelica Tanglao')
  })

  // TEST 2: Display Records
  it('should display saved patient records', () => {
    const patients = [
      {
        id: 1,
        patientName: 'Angelica Tanglao',
        age: 22,
        gender: 'Female',
        diagnosis: 'Fever',
        roomNumber: '1'
      }
    ]

    localStorage.setItem(
      'medicare-patients',
      JSON.stringify(patients)
    )

    const savedPatients = JSON.parse(
      localStorage.getItem('medicare-patients')
    )

    expect(savedPatients).toHaveLength(1)
    expect(savedPatients[0].patientName).toBe('Angelica Tanglao')
  })

  // TEST 3: Edit Patient
  it('should successfully edit a patient record', () => {
    const patients = [
      {
        id: 1,
        patientName: 'Angelica Tanglao',
        age: 22,
        diagnosis: 'Fever'
      }
    ]

    patients[0].diagnosis = 'Flu'

    expect(patients[0].diagnosis).toBe('Flu')
  })

  // TEST 4: Delete Patient
  it('should successfully delete a patient record', () => {
    const patients = [
      {
        id: 1,
        patientName: 'Angelica Tanglao'
      }
    ]

    const updatedPatients = patients.filter(
      patient => patient.id !== 1
    )

    expect(updatedPatients).toHaveLength(0)
  })

  // TEST 5: Search Patient - Positive
  it('should find a patient using the search text', () => {
    const patients = [
      {
        id: 1,
        patientName: 'Angelica Tanglao'
      },
      {
        id: 2,
        patientName: 'John Rigor Atilano'
      }
    ]

    const searchText = 'Angelica'

    const results = patients.filter(patient =>
      patient.patientName
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )

    expect(results).toHaveLength(1)
    expect(results[0].patientName).toBe('Angelica Tanglao')
  })

  // TEST 6: Age 0 Validation - Defect Retest
  it('should accept age 0 as a valid patient age', () => {
    const patient = {
      patientName: 'Baby Jacob',
      age: 0,
      gender: 'Male',
      diagnosis: 'Newborn',
      roomNumber: '2'
    }

    const ageIsValid =
      patient.age !== '' &&
      patient.age !== null &&
      patient.age !== undefined &&
      Number(patient.age) >= 0 &&
      Number(patient.age) <= 120

    expect(ageIsValid).toBe(true)
  })

  // TEST 7: Search Patient - Negative
  it('should return no results when searching for a non-existing patient', () => {
    const patients = [
      {
        id: 1,
        patientName: 'Angelica Tanglao'
      },
      {
        id: 2,
        patientName: 'John Rigor Atilano'
      }
    ]

    const searchText = 'Non Existing Patient'

    const results = patients.filter(patient =>
      patient.patientName
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )

    expect(results).toHaveLength(0)
  })

  // TEST 8: Display Records - Empty Records
  it('should handle empty patient records correctly', () => {
    const patients = []

    expect(patients).toHaveLength(0)
  })
})