# VICS Appointment App

A modern, full-featured mobile application for the Vehicle Inspection & Certification System (VICS) of Punjab, Pakistan. This app enables users to register, book vehicle inspections, manage certificates, and more, with support for both English and Urdu.

---

## Table of Contents

- [Features](#features)
- [App Flow & Navigation](#app-flow--navigation)
- [Screens & Functionality](#screens--functionality)
- [Per-Screen Deep Breakdown](#per-screen-deep-breakdown)
- [Logic & Data Flow](#logic--data-flow)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [UX & Accessibility](#ux--accessibility)
- [Setup & Installation](#setup--installation)
- [Development Scripts](#development-scripts)
- [Known Issues & Warnings](#known-issues--warnings)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Registration & Login** (with T-PIN and OTP)
- **Vehicle Appointment Booking** (multi-step, with audio guidance)
- **Service Provider/Distributor/Manufacturer Registration**
- **Station Registration** (for workshops)
- **View & Download Certificates**
- **Booking & Inspection History**
- **Account Settings & Profile Management**
- **Multilingual Support** (English/Urdu toggle)
- **Modern UI/UX** (React Native Paper, custom theming)
- **Accessibility** (audio prompts, clear navigation)
- **Demo Data** for easy testing

---

## App Flow & Navigation

The app uses file-based routing via `expo-router` and a stack/tab navigation structure:

1. **Splash Screen**: App entry point, branding, and loading.
2. **Authentication**: Login or Register (with OTP and T-PIN).
3. **Main Dashboard**: After login, users access the main features via tabs:
   - Home (vehicle verification, info, quick actions)
   - Book Appointment
   - Bookings/History
   - Certificates
   - Account Settings
4. **Service Provider/Distributor/Manufacturer/Station Registration**: Accessible from dashboard or menu.
5. **Guide & Help**: Step-by-step instructions for inspections.

**Navigation is managed by a combination of stack and tab navigators, with a custom theme provider and authentication context at the root.**

---

## Screens & Functionality

See [Per-Screen Deep Breakdown](#per-screen-deep-breakdown) for detailed logic and API suggestions.

---

## Per-Screen Deep Breakdown

### 1. SplashScreen
- **Purpose:** Shows branding and loading animation. Navigates to main app after a timeout.
- **Logic:** On mount, start a timer (e.g., 4 seconds). After timer, redirect to `/` (home or login).
- **UI/UX:** Centered logo/animation. No user interaction.

### 2. LoginScreen
- **Purpose:** Authenticate user via mobile number and T-PIN. Support "Forgot PIN" with OTP flow. Language toggle (English/Urdu).
- **Logic:**
  - Formik form with Yup validation.
  - On submit, call `POST /api/auth/login` with `{ mobile, pin }`.
  - If success, store token/user and redirect to dashboard.
  - If fail, show error.
  - "Forgot PIN" flow: Step 1: Enter mobile, call `POST /api/auth/request-otp`. Step 2: Enter OTP, call `POST /api/auth/verify-otp`. Step 3: Enter new PIN, call `POST /api/auth/reset-pin`.
- **UI/UX:** Mobile and PIN fields. "Forgot PIN?" link. Stepper/modal for OTP flow. Language toggle button.
- **API Example:**
```json
POST /api/auth/login
{ "mobile": "string", "pin": "string" }
→ { "token": "string", "user": { ... } }
```

### 3. RegisterScreen
- **Purpose:** Multi-step user registration.
- **Logic:**
  - Step 1: Enter mobile, CNIC.
  - Step 2: Upload CNIC image.
  - Step 3: Enter OTP (from SMS).
  - Step 4: Set T-PIN.
  - Each step validates input before proceeding.
  - On final submit, call `POST /api/auth/register`.
- **UI/UX:** Stepper UI. Camera/file upload for CNIC. OTP input. Language toggle.
- **API Example:**
```json
POST /api/auth/register
{ "mobile": "string", "cnic": "string", "otp": "string", "pin": "string", "cnicImage": "file" }
→ { "token": "string", "user": { ... } }
```

### 4. Home (Index)
- **Purpose:** Vehicle verification. Info cards and quick actions.
- **Logic:** Enter vehicle number, call `GET /api/vehicles/{regNo}`. Show vehicle info or error. Quick links to appointment, service provider registration, etc.
- **UI/UX:** Vehicle number input. Info cards (VICS, benefits, etc.). Action buttons.
- **API Example:**
```json
GET /api/vehicles/ABC-1234
→ { "make": "...", "model": "...", ... }
```

### 5. AppointmentScreen
- **Purpose:** Book vehicle inspection appointment (multi-step).
- **Logic:**
  - Step 1: Enter vehicle number, validate.
  - Step 2: Select city and station (`GET /api/stations?city=...`).
  - Step 3: Select date and time slot (`GET /api/stations/{id}/slots?date=...`).
  - Step 4: Confirm details, call `POST /api/appointments`.
  - On success, generate and show PSID.
- **UI/UX:** Stepper with progress. Audio prompt buttons. Calendar and time slot picker. Confirmation summary.
- **API Example:**
```json
POST /api/appointments
{ "vehicle": "ABC-1234", "stationId": 1, "date": "2024-06-01", "timeSlot": "10:00" }
→ { "appointmentId": 123, "psid": "PSID123456" }
```

### 6. BookingsScreen
- **Purpose:** Show upcoming and past bookings.
- **Logic:** Fetch bookings: `GET /api/appointments?userId=...`. Tabs for upcoming/history. Status indicators.
- **UI/UX:** Card list with booking details. Status chips (Paid, Pending, etc.).

### 7. CertificationScreen
- **Purpose:** View/download inspection certificate.
- **Logic:** Enter vehicle number, call `GET /api/certificates/{regNo}`. Show certificate details and download option.
- **UI/UX:** Input for vehicle number. Certificate card/modal. Download button.

### 8. MyCertificates
- **Purpose:** List all user certificates.
- **Logic:** Fetch: `GET /api/certificates?userId=...`. Show status (Active/Expired).
- **UI/UX:** List view. Download/view buttons.

### 9. History
- **Purpose:** List/filter all past bookings/inspections.
- **Logic:** Fetch: `GET /api/appointments/history?userId=...`. Filter by status.
- **UI/UX:** Filter controls. List with status and download links.

### 10. AccountSettingsScreen
- **Purpose:** View/edit user info.
- **Logic:** Fetch user: `GET /api/users/me`. Update: `PUT /api/users/me`.
- **UI/UX:** Editable fields. Save/cancel buttons.

### 11. GuideScreen
- **Purpose:** Show step-by-step inspection guide.
- **Logic:** Static content, possibly fetched from `GET /api/guides/inspection`.
- **UI/UX:** Stepper or accordion.

### 12. Distributor/Manufacturer/Station Registration
- **Purpose:** Register as a business/service provider.
- **Logic:** Multi-step form. File/image uploads. On submit: `POST /api/service-providers` or similar.
- **UI/UX:** Stepper. File upload fields. Urdu/English toggle.

---

## Logic & Data Flow

- **Authentication:** Managed via a global AuthContext. Login and registration use Formik/Yup for validation. OTP and T-PIN flows are simulated for demo purposes.
- **Appointment Booking:** Multi-step, with vehicle lookup, station/date/time selection, and PSID generation. Audio guidance at each step.
- **Certificate Management:** Users can view/download certificates by entering a vehicle number. Demo data is used for certificate details and download simulation.
- **Service Provider/Distributor/Manufacturer Registration:** Multi-step forms with validation and file uploads. Urdu/English toggle for all fields.
- **Navigation & Theming:** Root layout provides theme and authentication context. Navigation is handled by stack and tab navigators, with custom screen options. Theme adapts to light/dark mode.
- **Audio & Accessibility:** Audio prompts are played at key steps using `expo-av`. All flows are designed to be accessible, with clear step indicators and error handling.

---

## Project Structure

```
app/
  _layout.tsx                # Navigation stack and theme provider
  index.tsx                  # Home/dashboard
  (tabs)/                    # Tabbed screens (appointment, etc.)
  screens/                   # All main screens (login, register, etc.)
  context/                   # Auth and other providers
  theme/                     # Theme and style files
  components/                # Reusable UI components
  assets/                    # Images, audio, fonts
constants/
  Colors.ts, ColorsAdapter.ts
```

- **app/**: Main application code, including navigation, screens, and business logic.
- **components/**: Reusable UI components (e.g., OTP input, custom tab button).
- **context/**: Global providers (e.g., authentication).
- **theme/**: Centralized theme and style definitions.
- **assets/**: Images, audio files for prompts, and fonts.
- **constants/**: Color palettes and adapters for theming.

---

## Tech Stack

- **React Native** (Expo)
- **expo-router** (file-based navigation)
- **React Native Paper** (UI components)
- **Formik & Yup** (forms and validation)
- **expo-av** (audio playback)
- **expo-image-picker, expo-document-picker** (media uploads)
- **TypeScript** (type safety)
- **Multilingual** (manual translation toggles)

---

## UX & Accessibility

- **Multistep Forms:** All registration and booking flows are broken into clear, manageable steps.
- **Audio Guidance:** Key steps in appointment booking have audio prompts for accessibility.
- **Demo Data:** Vehicle lookup, certificates, and history use demo data for easy testing.
- **Error Handling:** All forms and flows provide clear error messages and validation.
- **Responsive Design:** Layouts adapt to different device sizes and orientations.
- **Multilingual:** All major screens and forms support both English and Urdu, with a toggle.

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd VICS_Appointment_App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the app:**
   ```bash
   npx expo start
   ```
   - Use the QR code to open in Expo Go, or run on an emulator/simulator.

4. **Reset the project (optional):**
   ```bash
   npm run reset-project
   ```

---

## Development Scripts

- `npm start` — Start Expo development server
- `npm run android` — Run on Android emulator
- `npm run ios` — Run on iOS simulator
- `npm run web` — Run on web
- `npm run lint` — Lint the codebase
- `npm run reset-project` — Reset to a blank starter

---

## Known Issues & Warnings

- **Demo Data:** The app uses hardcoded demo data for vehicle and certificate lookups. Replace with real API integration for production.
- **Audio Files:** Audio prompts are stored locally; ensure correct paths and formats for web compatibility.
- **File Uploads:** Image and document uploads are simulated; adapt for web as needed.
- **Navigation:** File-based routing is Expo-specific; adapt to React Router or Next.js for web.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

---

## License

[MIT License](LICENSE)

---

# Web Migration Notes

## General Logic & Structure
- **State Management:** Use React Context for auth/user, local state or Redux for forms and data.
- **Routing:** Use React Router (web) for stack/tab navigation.
- **Forms:** Use Formik/Yup for validation.
- **Audio:** Use HTML5 Audio for prompts.
- **Accessibility:** Use ARIA roles, keyboard navigation, and clear error messages.
- **Multilingual:** Use i18n libraries (e.g., react-i18next).

## Suggested API Endpoints
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-pin`
- `GET /api/vehicles/{regNo}`
- `GET /api/stations?city=...`
- `GET /api/stations/{id}/slots?date=...`
- `POST /api/appointments`
- `GET /api/appointments?userId=...`
- `GET /api/appointments/history?userId=...`
- `GET /api/certificates/{regNo}`
- `GET /api/certificates?userId=...`
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/service-providers`
- `GET /api/guides/inspection`

## UI/UX Wireframe Suggestions
- **Stepper for all multi-step flows.**
- **Tabs for dashboard navigation.**
- **Cards for bookings, certificates, and info.**
- **Modals for confirmation and downloads.**
- **Language toggle always visible.**
- **Audio buttons next to key instructions.**

---

**This README provides a deep, structured analysis of the app's logic, flows, and architecture, suitable for guiding an AI or developer to build a web version from scratch.**
