# MediTrack - Medicine Reminder & Stock Management

A full-stack web application for managing medicine reminders and stock inventory. Built with React.js, Tailwind CSS, Node.js, Express.js, and MongoDB Atlas.

## Features

- **User Authentication**: JWT-based registration and login
- **Dashboard**: Overview with stats, upcoming reminders, and low stock alerts
- **Medicine Management**: Add medicines with name, quantity, dosage, and reminder times
- **Automatic Reminders**: Backend scheduler sends notifications when medicine time arrives
- **Mark as Taken**: One-click to mark medicine taken with automatic stock reduction
- **Stock Alerts**: Visual warnings when medicine quantity is low (<=3 days remaining)
- **Medicine History**: Complete tracking of all medicine intake records
- **Family Management**: Add family members and manage their medicines separately
- **Responsive UI**: Professional design that works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Tailwind CSS
- Axios
- React Toastify
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcryptjs
- node-schedule

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditrack?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### 2. MongoDB Atlas Setup
1. Go to mongodb.com and create a free account
2. Create a new cluster
3. Click Connect -> Drivers -> Node.js
4. Copy the connection string
5. Replace username, password, and cluster in your .env file
6. Add your IP address to Network Access -> IP Access List

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

The app will open at http://localhost:3000

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update profile

### Medicines
- GET /api/medicines - Get all medicines
- POST /api/medicines - Add new medicine
- GET /api/medicines/:id - Get medicine by ID
- PUT /api/medicines/:id - Update medicine
- DELETE /api/medicines/:id - Delete medicine
- POST /api/medicines/:id/take - Mark as taken
- GET /api/medicines/stats - Get dashboard stats
- GET /api/medicines/low-stock - Get low stock medicines

### Reminders
- GET /api/reminders/upcoming - Get upcoming reminders
- GET /api/reminders/today - Get today's reminders
- POST /api/reminders/:id/snooze - Snooze reminder
- POST /api/reminders/:id/dismiss - Dismiss reminder

### Family
- GET /api/family - Get family members
- POST /api/family - Add family member
- GET /api/family/:id - Get family member details
- PUT /api/family/:id - Update family member
- DELETE /api/family/:id - Delete family member

### History
- GET /api/history - Get medicine history
- GET /api/history/stats - Get history statistics

## How It Works

### Adding a Medicine
1. Go to Add Medicine page
2. Fill in medicine name, quantity, dosage per day
3. Set reminder times (e.g., 08:00, 14:00, 20:00)
4. Optionally assign to a family member
5. Submit - reminders are automatically scheduled

### Reminder System
- Backend scheduler runs every minute
- When reminder time arrives, status changes to sent
- Frontend polls for upcoming reminders
- Browser notifications can be enabled in Profile

### Stock Management
- When you mark medicine as taken, quantity reduces by dosage amount
- If quantity will last <=3 days, a low stock alert appears
- Dashboard shows all low stock medicines prominently

### Family Management
- Add family members with relationship and age
- When adding medicine, select a family member
- Medicines are filtered by family member
- Deleting a family member removes all their medicines

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Backend server port (default: 5000) |
| MONGODB_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT tokens |
| NODE_ENV | Environment (development/production) |

