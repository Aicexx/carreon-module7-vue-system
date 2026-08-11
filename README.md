# MediCare Patient Management System

## Student Information

- **Name:** Aicelle Joy Basilio Carreon
- **Course and Section:** BSCS 3A
- **Subject:** Software Engineering 1
- **Module:** Module 7 - Design and Implementation

## Project Overview

MediCare Patient Management System is a responsive Vue.js frontend prototype for managing patient records in a hospital environment.

The system focuses on the **Patient** entity selected from the proposed system in Module 6. It allows users to add, view, edit, delete, and search patient records through an organized and user-friendly interface.

For Module 7, the system uses browser `localStorage` as the data layer. A backend, API, and database are not required for this prototype and may be implemented as future components.

## Connection Between Module 6 and Module 7

Module 6 provided the architectural design and long-term blueprint of the proposed system. Module 7 translates one selected functional entity from that design into a working frontend prototype.

For this implementation:

- **Module 6:** Proposed hospital information system
- **Selected Module 7 Entity:** Patient
- **Presentation Layer:** Vue.js and Tailwind CSS
- **Application Logic:** JavaScript and Vue.js CRUD functions
- **Data Layer:** Browser `localStorage`
- **Future Components:** Backend, API, and database

## Features

- Patient Registration
- View Patient Records
- Edit Patient Records
- Delete Patient Records with Confirmation
- Patient Search
- Form Validation
- Room Assignment
- Maximum of 2 patients per room
- Dashboard Statistics
- localStorage Data Persistence
- Responsive Design
- Dark/Light Mode
- Reusable Vue Components
- GitHub Actions Build Verification
- GitHub Pages Deployment

## Required Module 7 Functions

### Create

Users can add a complete patient record through the patient registration form.

After successful registration, a confirmation message is displayed and the input form is cleared.

### Read

The system displays saved patient records in an organized list.

### Update

Users can select an existing patient record, modify its information, and save the changes.

### Delete

Users can delete a patient record after confirming the deletion.

### Search

Users can search patient records using relevant information such as:

- Patient name
- Diagnosis
- Room number

### Validation

The patient form prevents incomplete required information from being submitted.

The system also prevents a room from accepting more than two patients.

### Persistence

Patient records are stored in the browser's `localStorage`. Saved records are loaded again when the application is refreshed.

## Technologies Used

- **Vue.js** - Frontend application framework
- **Vite** - Development and build tool
- **Tailwind CSS** - Responsive interface styling
- **JavaScript** - Application and CRUD logic
- **localStorage** - Browser-based prototype data persistence
- **Git** - Version control
- **GitHub** - Source code repository
- **GitHub Actions** - Continuous-integration build verification
- **GitHub Pages** - Application deployment

## Reusable Vue Components

The application is organized using reusable Vue components, including:

- `PatientForm.vue` - Handles patient registration and editing
- `PatientList.vue` - Displays patient records and patient actions
- `AppHeader.vue` - Provides the application header and navigation
- `AppFooter.vue` - Provides the application footer

## localStorage Implementation

The prototype uses browser `localStorage` instead of a backend database.

Patient records are saved using the following storage key:

```text
hospital-patients
```

The application retrieves the saved records when it loads and saves changes whenever patient records are added, updated, or deleted.

This allows patient records to remain available after refreshing the browser.

The selected theme is also stored locally using:

```text
hospital-theme
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Aicexx/carreon-module7-vue-system.git
```

Navigate to the project:

```bash
cd carreon-module7-vue-system
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the project for production:

```bash
npm run build
```

## Application Screenshots

Screenshots demonstrating the required Module 7 functions and deployment evidence are included in the project submission.

The required evidence includes:

1. Running application
2. Add/Create patient record
3. Patient record list
4. Edit/Update patient record
5. Delete confirmation
6. Search function
7. localStorage persistence
8. Responsive/mobile view
9. GitHub repository
10. Git commit history
11. Successful GitHub Actions build

## Deployment

The application is deployed using GitHub Pages.

### Live Demo

https://aicexx.github.io/carreon-module7-vue-system/

### GitHub Repository

https://github.com/Aicexx/carreon-module7-vue-system

## Known Limitations

- The current prototype does not use a backend server.
- The current prototype does not use a cloud database.
- Patient data is stored only in the browser's `localStorage`.
- Data is limited to the browser and device where the application is used.
- User authentication and role-based access control are not included in this prototype.
- The system is a frontend prototype and is not intended to replace a production hospital information system.

## Future Improvements

Future versions of the system may include:

- Backend API integration
- Database integration
- User authentication
- Role-based access control
- Secure patient data management
- Cloud data storage
- Patient history and medical records
- Appointment management
- Improved reporting and analytics
- Production-level security and data protection

## Project Status

**Completed Module 7 frontend prototype**

The application implements the required CRUD operations, search, validation, localStorage persistence, responsive interface, reusable Vue components, GitHub version control, GitHub Actions build verification, and GitHub Pages deployment.

## Author

**Aicelle Joy Basilio Carreon**

**BSCS 3A**

**Software Engineering 1 - Module 7**