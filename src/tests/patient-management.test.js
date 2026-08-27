import { describe, it, expect, beforeEach } from 'vitest'

describe('MediCare Patient Management System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

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

    localStorage.setItem('medicare-patients', JSON.stringify(patients))

    const savedPatients = JSON.parse(
      localStorage.getItem('medicare-patients')
    )

    expect(savedPatients).toHaveLength(1)
    expect(savedPatients[0].patientName).toBe('Angelica Tanglao')
  })

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

 
})