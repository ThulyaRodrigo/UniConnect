# UniConnect

UniConnect is a comprehensive university event management and logistics platform designed for students, society administrators, and super admins. It streamlines the process of discovering events, booking tickets, managing transport logistics, and automating administrative tasks using artificial intelligence.

## 🌟 Key Features

### For Students
- **Event Discovery:** Browse and search for upcoming campus events seamlessly.
- **Secure Ticketing:** Book single or group tickets securely.
- **Transport Selection:** Automatically book shuttle transport for events on global campus routes.
- **Profile Management:** Dynamic user profiles showing verified leadership history and current administrative board roles.

### For Society Admins
- **Event Management Engine:** Create robust events with strict temporal checks, image uploads (Cloudinary), and capacity limits.
- **Transport Logistics & Manifests:** Seamlessly attach master campus routes to events. Automatically compile and download CSV passenger manifests (including attendee phone numbers for emergency routing).
- **Attendee Tracking & Exports:** Track real-time ticket sales correctly and strictly enforce event modification checks (automatically sending HTML emails to attendees on schedule/location changes).
- **Automated AI Slip Verification:** Verify student bank transfer slips using integrated Google Gemini AI OCR, drastically reducing manual review times for pending bookings.

### For Super Admins
- **Society & Board Governance:** Oversee society creation, bank configurations, and assign leadership titles to students natively.
- **Master Route Logistics:** Manage global shuttle transport routes universally available for incoming events.

## 🛠 Tech Stack

### Frontend
- **Framework:** React.js (Vite/CRA)
- **Styling:** Tailwind CSS & Material-UI (MUI) components
- **Routing:** React Router DOM
- **Icons:** Lucide-React
- **State/API:** React Hooks & Axios

### Backend
- **Environment:** Node.js & Express.js
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt.js
- **File Storage:** Cloudinary & Multer (for fast poster and slip uploads)
- **AI Integration:** Google Generative AI (Gemini Vision) for automated slip extraction.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB locally installed, or a MongoDB Atlas URI
- Cloudinary Account (for image hosting keys)
- Google Gemini API Key (for Slip verification)

### 1. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory and add the necessary environment variables:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password >> https://myaccount.google.com/apppasswords

# Gemini AI
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

Run the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Run the React development server:
```bash
npm run dev
# or
npm start
```

## 🧪 End-to-End Testing (Playwright)

UniConnect utilizes a comprehensive suite of Playwright E2E tests covering all four user personas to guarantee system integrity natively:

### 1. Database Seeding
Ensure you seed the database with the pre-defined test users and specific mock data to prevent race conditions during testing.
```bash
cd backend
node seedTestUsers.js
```

### 2. Running the E2E Tests
Tests are located inside `/frontend/e2e/`. Start your backend (`npm run dev` in `/backend`) and frontend (`npm run dev` in `/frontend`), then deploy the test runners:
```bash
cd frontend

# Run all test suites natively in headless mode:
npx playwright test

# Run a specific persona context visually:
npx playwright test e2e/persona1-malindu.spec.js --ui
```

## 🔒 Security & Validations
- **Temporal Strictness:** Rejects time-traveling date forms globally.
- **Regex Enforcement:** Sri Lankan university patterns (`ITxxxxxxxx@my.sliit.lk`) are structurally enforced out of the box natively.
- **Data Integrity:** Protects historical data actively hiding edit/delete functions for past events natively.

## 📖 License
This project is proprietary and built for University Campus environments.
