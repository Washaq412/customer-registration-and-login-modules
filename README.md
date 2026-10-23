# Customer Registration & Login — React.js

A responsive React frontend demo for the CUS-01 Customer Registration and CUS-02 Customer Login modules.

## Features
- Registration form with full name, Indian mobile number, email, password, confirm password and Terms & Conditions.
- Client-side validation and duplicate email/mobile checks.
- OTP demo with fixed code `123456`, 2-minute expiry and a maximum of 3 attempts.
- Login using registered email or mobile number and password.
- Dashboard with profile summary and sign out.
- MySQL schema for `users`, `otp_verifications`, `user_consents`, `registration_drafts`, and `registration_attempts` in `database/schema.sql`.
- Responsive UI.

## Requirements
- Node.js 18+ (recommended)
- npm

## Run locally
1. Extract the ZIP.
2. Open the project folder in VS Code or terminal.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the local URL printed by Vite (usually `http://localhost:5173`).

To check a production build:
```bash
npm run build
```

## Demo flow
1. Register with a valid name, 10-digit Indian mobile number, valid email, and password of at least 8 characters.
2. Accept Terms & Conditions.
3. Enter OTP `123456` before it expires.
4. Log in using the registered email or mobile number and password.

## Important security limitation
This is a frontend-only demonstration. It stores demo credentials in browser `localStorage` and does not implement secure authentication. Do not use real personal information or real passwords. A production app must use a backend, password hashing, server-side validation, secure sessions/tokens, rate limiting, and real OTP delivery. The browser must not connect directly to MySQL.

## Database schema
Run `database/schema.sql` in MySQL Workbench only if you want to create the proposed database structure. The React app is not connected to this database; a backend API is required for integration.