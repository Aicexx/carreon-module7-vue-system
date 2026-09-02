*** Settings ***
Library    Browser

*** Variables ***
${URL}    http://localhost:5173

*** Test Cases ***
Active Filter Shows Only Active Patients
    New Browser    chromium    headless=False
    New Context
    New Page    ${URL}

    Evaluate JavaScript    ${None}    () => localStorage.setItem(
    ...    'medicare-current-user',
    ...    JSON.stringify({id: 999999, fullName: 'Robot Test User', email: 'robot@test.local'})
    ...    )

    Evaluate JavaScript    ${None}    () => localStorage.setItem(
    ...    'hospital-patients',
    ...    JSON.stringify([
    ...    {
    ...        id: 999001,
    ...        patientName: 'Robot Active Patient',
    ...        age: 25,
    ...        gender: 'Male',
    ...        diagnosis: 'Testing',
    ...        roomNumber: '101',
    ...        status: 'Active'
    ...    },
    ...    {
    ...        id: 999002,
    ...        patientName: 'Robot Inactive Patient',
    ...        age: 30,
    ...        gender: 'Female',
    ...        diagnosis: 'Testing',
    ...        roomNumber: '102',
    ...        status: 'Inactive'
    ...    }
    ...    ])
    ...    )

    Reload
    Wait For Elements State    role=heading[name="Patient Records"]    visible

    Click    data-testid=status-filter-active

    Get Text    data-testid=record-count    ==    1 Records

    ${page_text}=    Get Text    css=body
    Should Contain    ${page_text}    Robot Active Patient

    Close Context
    Close Browser


Inactive Filter Shows Only Inactive Patients
    New Browser    chromium    headless=False
    New Context
    New Page    ${URL}

    Evaluate JavaScript    ${None}    () => localStorage.setItem(
    ...    'medicare-current-user',
    ...    JSON.stringify({id: 999999, fullName: 'Robot Test User', email: 'robot@test.local'})
    ...    )

    Evaluate JavaScript    ${None}    () => localStorage.setItem(
    ...    'hospital-patients',
    ...    JSON.stringify([
    ...    {
    ...        id: 999001,
    ...        patientName: 'Robot Active Patient',
    ...        age: 25,
    ...        gender: 'Male',
    ...        diagnosis: 'Testing',
    ...        roomNumber: '101',
    ...        status: 'Active'
    ...    },
    ...    {
    ...        id: 999002,
    ...        patientName: 'Robot Inactive Patient',
    ...        age: 30,
    ...        gender: 'Female',
    ...        diagnosis: 'Testing',
    ...        roomNumber: '102',
    ...        status: 'Inactive'
    ...    }
    ...    ])
    ...    )

    Reload
    Wait For Elements State    role=heading[name="Patient Records"]    visible

    Click    data-testid=status-filter-inactive

    Get Text    data-testid=record-count    ==    1 Records

    ${page_text}=    Get Text    css=body
    Should Contain    ${page_text}    Robot Inactive Patient

    Close Context
    Close Browser