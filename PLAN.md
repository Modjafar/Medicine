# MediTrack - Full Stack Medicine Reminder & Stock Management

## Project Overview
Build a complete full-stack web application named MediTrack for managing medicine reminders and stock.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, React Router, Context API, Axios
- **Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs
- **Notifications:** Browser Notifications API + Node-schedule for backend scheduling

## Folder Structure

```
MediTrack/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── medicineController.js
│   │   ├── reminderController.js
│   │   └── familyController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   ├── Reminder.js
│   │   └── History.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── reminderRoutes.js
│   │   └── familyRoutes.js
│   ├── utils/
│   │   └── reminderScheduler.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MedicineCard.jsx
│   │   │   ├── ReminderAlert.jsx
│   │   │   ├── StockAlert.jsx
│   │   │   └── FamilyMemberCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddMedicine.jsx
│   │   │   ├── MedicineList.jsx
│   │   │   ├── MedicineHistory.jsx
│   │   │   ├── FamilyManagement.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Step-by-Step Implementation Plan

### Phase 1: Backend Setup
1. Initialize Node.js project and install dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv, node-schedule)
2. Create MongoDB Atlas connection config
3. Create Mongoose models (User, Medicine, Reminder, History)
4. Create JWT authentication middleware
5. Create controllers:
   - Auth: register, login, getProfile
   - Medicine: add, getAll, update, delete, markTaken (auto-reduces quantity)
   - Reminder: schedule, getUpcoming, snooze
   - Family: addMember, getMembers, manageMemberMedicines
6. Create Express routes
7. Create reminder scheduler utility using node-schedule
8. Create server.js entry point
9. Setup .env configuration

### Phase 2: Frontend Setup
1. Initialize React project with Create React App
2. Install and configure Tailwind CSS
3. Install dependencies (react-router-dom, axios, react-toastify)
4. Create API service with Axios interceptors for JWT
5. Create AuthContext for global state management
6. Build pages:
   - Login/Register with form validation
   - Dashboard with stats, upcoming reminders, low stock alerts
   - AddMedicine form
   - MedicineList with mark-as-taken functionality
   - MedicineHistory with date filtering
   - FamilyManagement for adding/managing family members
   - Profile page
7. Build reusable components (Navbar, Sidebar, MedicineCard, alerts)
8. Implement Browser Notifications API
9. Implement responsive design
10. Add service worker for background notifications

### Phase 3: Integration & Testing
1. Connect frontend to backend API
2. Test all CRUD operations
3. Test reminder scheduling
4. Test stock alerts
5. Test family management
6. Verify responsive design

## Key Features Implementation Details

### 1. JWT Authentication
- Register/Login with email/password
- Password hashing with bcryptjs
- JWT token stored in localStorage
- Protected routes with auth middleware

### 2. Medicine Management
- Schema: name, quantity, dosagePerDay, reminderTimes[], startDate, endDate, userId
- Add medicine with multiple reminder times
- Calculate estimated finish date: quantity / dosagePerDay

### 3. Automatic Reminders
- Backend scheduler checks every minute for upcoming reminders
- Sends push notification via Browser Notifications API
- Frontend requests notification permission on login
- Reminder snooze functionality

### 4. Mark as Taken & Auto Stock Reduction
- When user marks medicine as taken:
  - Reduce quantity by dosage amount
  - Create history record with timestamp
  - If quantity <= (dosage * 3 days), trigger low stock alert

### 5. Stock Alerts
- Dashboard shows low stock medicines
- Alert when medicine will finish in <= 3 days
- Visual indicator (red badge/warning)

### 6. Medicine History
- Separate History collection
- Records: medicineId, userId, takenAt, quantityBefore, quantityAfter
- Filter by date range and medicine

### 7. Family Management
- User can add family members (sub-profiles)
- Each family member has their own medicines
- Switch between profiles in UI
- Family member schema: name, relationship, age, userId (parent)

## Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "node-schedule": "^2.1.1",
  "nodemon": "^2.0.20"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.3.0",
  "react-toastify": "^9.1.1",
  "tailwindcss": "^3.2.0",
  "lucide-react": "^0.310.0"
}
```

## Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditrack
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## How to Run
1. Backend: `cd backend && npm install && npm run dev`
2. Frontend: `cd frontend && npm install && npm start`
3. Open http://localhost:3000

## MongoDB Atlas Setup Instructions
1. Create account at mongodb.com
2. Create new cluster (free tier)
3. Add your IP to Network Access
4. Create database user
5. Get connection string and update .env

