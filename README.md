# Zero Trust IAM Implementation Showcase

## Overview

This project is a web application demonstrating core Identity and Access Management (IAM) principles within a Zero Trust framework. It showcases how modern web applications can implement robust security mechanisms to protect resources and data.

Key technologies used:
*   **Frontend:** React (with Vite), `axios` for API calls, `qrcode.react` for MFA QR codes, `jwt-decode` for token inspection.
*   **Backend:** Node.js, Express.js.
*   **Authentication & Authorization:** JSON Web Tokens (JWT), Time-based One-Time Passwords (TOTP) for Multi-Factor Authentication (MFA) using `speakeasy`, Role-Based Access Control (RBAC).
*   **Security:** Password hashing with `bcryptjs`.
*   **Logging:** Detailed backend event logging with `pino`.

## Features Implemented

*   **User Registration:** Secure user creation with password hashing using `bcryptjs`.
*   **User Login:** JWT-based authentication to verify user identity and establish sessions.
*   **Multi-Factor Authentication (MFA):**
    *   Utilizes Time-based One-Time Passwords (TOTP) with `speakeasy`.
    *   QR Code generation (`qrcode.react`) and manual secret key display for easy setup with authenticator apps (e.g., Google Authenticator, Authy).
    *   MFA is enforced during the login process after initial password verification.
*   **Role-Based Access Control (RBAC):**
    *   Users are assigned roles (default: 'user'). An 'admin' role is available for privileged access.
    *   Protected routes ensure that only authenticated users can access certain resources.
    *   Admin-only routes restrict access to administrative functionalities.
*   **Secure API Endpoints:** Backend API routes are protected using JWT verification middleware.
*   **Detailed IAM Event Logging:** Comprehensive logging of important IAM events on the backend using `pino` for auditing and debugging.

## Zero Trust Principles Demonstrated

This project aims to illustrate the following Zero Trust principles:

*   **Verify Explicitly:** Every user and every access request is robustly authenticated and authorized. This is seen in:
    *   Mandatory user login for access to protected resources.
    *   JWT verification for every API request to protected endpoints.
    *   Multi-Factor Authentication (MFA) adding an extra layer of identity verification.
*   **Use Least Privilege Access:** RBAC is implemented to ensure that users only have access to the resources and functionalities necessary for their assigned roles. Regular users cannot access admin-level data or routes.
*   **(Assume Breach - Implied):** While not a direct, testable feature in this showcase, the security measures implemented are foundational to an "Assume Breach" strategy:
    *   Strong password hashing (`bcryptjs`) protects user credentials.
    *   MFA makes it significantly harder for attackers to gain access even if they compromise a user's password.
    *   Detailed logging provides visibility into IAM events, which is crucial for detecting and responding to potential breaches.

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

```
/
├── frontend/        # React Vite Application (UI)
│   ├── src/
│   │   ├── components/ # React components (Login, Register, MFASetup, AdminDashboard, etc.)
│   │   ├── App.jsx     # Main application component with routing
│   │   └── ...
│   └── ...
├── backend/         # Node.js/Express.js API (Server-side logic)
│   ├── authController.js   # Handles registration, login, MFA logic
│   ├── authMiddleware.js # JWT verification and role authorization
│   ├── adminController.js  # Logic for admin-specific routes
│   ├── userController.js   # Logic for general user-specific routes
│   ├── logger.js           # Pino logger configuration
│   ├── server.js           # Express server setup and route definitions
│   └── ...
└── README.md        # This file
```

## Setup and Running the Project

### Prerequisites

*   **Node.js and npm:** (Node.js >= 18.x recommended, as some frontend dependencies might show warnings with older versions). You can download it from [nodejs.org](https://nodejs.org/).
*   **Authenticator App:** For testing MFA (e.g., Google Authenticator, Authy, Microsoft Authenticator).

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the backend server:**
    ```bash
    # Ensure NODE_ENV=development for pretty logs during development (usually default if not set)
    # You can set it explicitly if needed: export NODE_ENV=development (Linux/macOS) or set NODE_ENV=development (Windows)
    npm start
    ```
    Alternatively, you can run `node server.js`.
4.  The backend will typically run on `http://localhost:5000`. You'll see a log message confirming this.

### Frontend Setup

1.  **Navigate to the frontend directory (from the project root):**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
4.  The frontend will usually run on `http://localhost:5173` (Vite will show the exact URL). Open this URL in your browser.

### Testing MFA

1.  **Register a new user:** Navigate to the "Register" page and fill in the details.
2.  **Set up MFA:** After successful registration, you'll be redirected to the MFA setup page.
    *   Scan the QR code displayed using your authenticator app.
    *   Alternatively, you can manually enter the provided secret key into your authenticator app.
3.  **Verify TOTP:** Enter the 6-digit Time-based One-Time Password (TOTP) from your authenticator app into the input field and click "Verify & Activate MFA".
4.  **Login:** After successful MFA setup, you'll be redirected to the login page. Log in with your credentials.
5.  **MFA Challenge:** You will be prompted to enter a TOTP code from your authenticator app after submitting your password.
6.  Upon successful TOTP verification, you'll be logged in and redirected to the protected user area.

### Testing RBAC

1.  **Default User Role:** Newly registered users are automatically assigned the 'user' role.
    *   Log in as a new user.
    *   You should be able to access the "User Data" page (or equivalent protected route for regular users).
    *   You should **not** see a link to the "Admin Dashboard" in the navigation. Attempting to navigate directly to `/admin` should ideally be blocked by the frontend (if UI logic is present) or definitely by the backend API, resulting in an error or redirection.
2.  **Admin Role Testing:**
    *   **Important:** This application uses an in-memory store for users. To test the admin role, you need to manually modify the user data on the backend.
    *   Open `backend/authController.js`.
    *   Find the `users` array (which is currently in-memory).
    *   Locate the user you want to make an admin (or register a new one and then find them).
    *   Modify their `roles` array to include 'admin'. For example:
        ```javascript
        // Inside authController.js, the users array might look like:
        // const users = [
        //   { username: 'testuser', email: 'test@example.com', hashedPassword: '...', roles: ['user'], ... },
        //   { username: 'adminuser', email: 'admin@example.com', hashedPassword: '...', roles: ['user', 'admin'], ... } // <-- Add 'admin' here
        // ];
        ```
        For a user registered as `test@example.com`, change their entry from `roles: ['user']` to `roles: ['user', 'admin']`.
    *   **Restart the backend server** for the changes to take effect (since the user store is in-memory).
    *   Log in as the user you just promoted to admin.
    *   You should now see the "Admin Dashboard" link in the navigation.
    *   You should be able to access both the "User Data" page and the "Admin Dashboard" page and see data specific to those roles.

## Future Enhancements

This project serves as a foundational showcase. Potential future enhancements include:

*   **Persistent Database:** Replace the in-memory user store with a proper database (e.g., PostgreSQL, MongoDB with Mongoose) for persistent user data.
*   **Password Policies:** Implement password complexity rules (length, character types), password history, and lockout mechanisms after failed attempts.
*   **Password Reset:** Secure password reset functionality (e.g., via email with unique tokens).
*   **Session Management:** More advanced session management, including token revocation or refresh token strategies.
*   **Granular Permissions:** Expand RBAC to include more roles and finer-grained permissions beyond simple route access.
*   **Social Logins:** Integration with third-party identity providers (IdPs) like Google, GitHub, etc., using OAuth 2.0 / OpenID Connect.
*   **Automated Tests:** Implement unit, integration, and end-to-end tests for both frontend and backend.
*   **Security Headers:** Add security-related HTTP headers (e.g., Content Security Policy, X-Frame-Options).
*   **Dockerization:** Containerize the frontend and backend applications for easier deployment.
*   **CI/CD Pipeline:** Set up a continuous integration/continuous deployment pipeline.
