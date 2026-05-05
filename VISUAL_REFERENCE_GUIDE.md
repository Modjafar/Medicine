# MediTrack Reminder System - Visual Reference Guide

## 📊 Component Tree

```
App.jsx
├── ToastContainer (react-toastify)
├── Router
│   └── PrivateRoute: Dashboard
│       └── Layout
│           └── Dashboard.jsx ⭐ MAIN
│               ├── useReminder() Hook
│               │   ├── State: reminders, loading, error
│               │   ├── Actions: markAsTaken, snoozeReminder, dismissReminder
│               │   └── Effects: Auto-fetch every 30s
│               ├── Stats Cards
│               ├── Low Stock Alerts
│               └── ReminderAlert Component ⭐
│                   ├── Popup Notification
│                   ├── Alarm Controls
│                   └── Action Buttons
│                       ├── ✅ Taken Button
│                       ├── 🔔 Snooze Button
│                       ├── ❌ Dismiss Button
│                       └── 🔇 Stop Sound Button
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│                   (Dashboard.jsx)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │   useReminder Hook     │
        │   (Custom React Hook)  │
        └────────┬───────────────┘
                 │
         ┌───────┴──────────┐
         ↓                  ↓
    ┌─────────────┐   ┌──────────────────┐
    │ API Service │   │ Alarm Service    │
    │ (axios)     │   │ (Audio playback) │
    └────┬────────┘   └──────────────────┘
         │
    ┌────────────────────────────────────┐
    │        REST API (HTTP)             │
    ├────────────────────────────────────┤
    │ GET    /reminders/upcoming         │
    │ POST   /reminders/:id/taken        │
    │ POST   /reminders/:id/snooze       │
    │ POST   /reminders/:id/dismiss      │
    └────────┬─────────────────────────┬─┘
             │                         │
         ┌───┴──┐              ┌──────┴────┐
         ↓      ↓              ↓           ↓
      ┌──────────────────────────────────────────┐
      │       BACKEND (Express.js)               │
      ├──────────────────────────────────────────┤
      │    reminderController.js                 │
      │    • getUpcomingReminders()              │
      │    • markReminderAsTaken()               │
      │    • snoozeReminder()                    │
      │    • dismissReminder()                   │
      └────────────┬─────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         ↓                    ↓
      ┌──────────────┐   ┌─────────────┐
      │ Reminder     │   │ Scheduler   │
      │ Collection   │   │ (node-cron) │
      │ (MongoDB)    │   │             │
      └──────────────┘   └─────────────┘
```

## 📋 State Management

```
useReminder Hook State:
┌─────────────────────────────────────────┐
│ reminders: []                           │
│ ├─ _id: ObjectId                        │
│ ├─ medicine: { name, instructions }     │
│ ├─ scheduledTime: Date                  │
│ ├─ status: 'sent' | 'snoozed'          │
│ └─ snoozeCount: 0-3                     │
│                                         │
│ loading: boolean                        │
│ error: string | null                    │
└─────────────────────────────────────────┘
```

## 🎬 Sequence Diagram: Reminder Workflow

```
User                 Frontend              Backend              Database
 │                      │                    │                    │
 │  Add Medicine         │                    │                    │
 ├──────────────────────→│                    │                    │
 │                       │ POST /medicines   │                    │
 │                       ├───────────────────→│                    │
 │                       │                    │ Create reminders   │
 │                       │                    ├───────────────────→│
 │                       │                    │ (next 7 days)      │
 │                       │← Success Response  │                    │
 │                       │←───────────────────┤                    │
 │← Success Toast        │                    │                    │
 └───────────────────────┤                    │                    │
                         │ useReminder Hook   │                    │
                         │ (every 30s)        │                    │
                         │ GET /reminders/    │                    │
                         ├───────────────────→│                    │
                         │                    │ Query pending→sent │
                         │                    ├───────────────────→│
                         │                    │← Get reminders     │
                         │← Get reminders     │                    │
                         │←───────────────────┤                    │
                         │                    │                    │
                    [Time = 08:00]            │                    │
                         │                    │                    │
                    [Popup displays]          │                    │
                    [Alarm plays]             │                    │
                         │                    │                    │
 │  Click "Taken"        │                    │                    │
 ├──────────────────────→│                    │                    │
 │                       │ POST /reminders/   │                    │
 │                       │ :id/taken          │                    │
 │                       ├───────────────────→│                    │
 │                       │                    │ Update reminder    │
 │                       │                    ├───────────────────→│
 │                       │                    │ Update medicine    │
 │                       │                    ├───────────────────→│
 │                       │← Success Response  │                    │
 │                       │←───────────────────┤                    │
 │← Success Toast        │                    │                    │
 │← Quantity Updated     │                    │                    │
 └───────────────────────┤                    │                    │
```

## 🎯 User Interaction Flow

```
                    ┌─────────────────────┐
                    │  Reminder Triggered │
                    │  (Popup + Alarm)    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ↓              ↓              ↓
            ┌────────┐    ┌─────────┐   ┌──────────┐
            │ TAKEN  │    │ SNOOZE  │   │ DISMISS  │
            │   ✅    │    │   🔔    │   │    ❌     │
            └────┬───┘    └────┬────┘   └────┬─────┘
                 │             │             │
                 ↓             ↓             ↓
           ┌──────────┐  ┌──────────┐  ┌──────────┐
           │ Status:  │  │ Status:  │  │ Status:  │
           │ 'taken'  │  │'snoozed' │  │ 'missed' │
           │ Qty↓     │  │ Count+1  │  │ History  │
           │ History+ │  │ Wait 5m  │  │ Log      │
           └──────────┘  │ Max 3x   │  └──────────┘
                         └──────────┘
```

## 🔊 Audio Playback Flow

```
ReminderAlert Component
         │
         ├─ useEffect [reminders]
         │
         ├─ Reminders exist?
         │  ├─ YES: alarmService.play()
         │  │        └─ Create Audio element
         │  │        └─ Set loop = true
         │  │        └─ Set volume = 0.7
         │  │        └─ Play audio
         │  │
         │  └─ NO: alarmService.stop()
         │         └─ Pause audio
         │         └─ Reset currentTime = 0
         │
         ├─ Render Buttons
         │
         └─ User clicks "Stop Sound"
            └─ stopAlarm()
               └─ alarmService.stop()
```

## 🔄 API Response Cycles

### Get Upcoming Reminders
```
Frontend Call:
GET /api/reminders/upcoming
Header: Authorization: Bearer TOKEN

Backend Processing:
1. Verify user authenticated
2. Query DB: 
   - user = req.user._id
   - status IN ['pending', 'sent', 'snoozed']
   - scheduledTime >= now AND <= tomorrow 23:59:59
3. Populate medicine details
4. Sort by scheduledTime ascending

Response:
200 OK
{
  "data": [
    {
      "_id": "...",
      "medicine": { "name": "Aspirin", ... },
      "scheduledTime": "2024-01-15T08:00:00Z",
      "status": "sent"
    }
  ],
  "success": true,
  "message": "Upcoming reminders retrieved"
}
```

### Mark as Taken
```
Frontend Call:
POST /api/reminders/:id/taken
Body: {} (empty)
Header: Authorization: Bearer TOKEN

Backend Processing:
1. Verify user owns reminder
2. Update Reminder:
   - status = 'taken'
   - sentAt = now
3. Populate medicine
4. Return updated reminder

Frontend After Response:
1. Remove from display (filter out)
2. Show success toast
3. Call markAsTaken(medicineId)
4. Update medicine quantity
5. Refetch reminders
```

## 📊 Reminder Status State Machine

```
         ┌─────────────┐
         │   PENDING   │
         │ (Just added)│
         └──────┬──────┘
                │
        [Backend Cron 1min]
                │
                ↓
         ┌─────────────┐
         │    SENT     │
         │(Notification)
         └─┬───────┬───┘
           │       │
    [User Action] │
           │       │
      ┌────┴─┐  ┌──┴────┐
      ↓      ↓  ↓       ↓
   ┌──────┐ ┌──────────┐
   │TAKEN │ │ SNOOZED  │
   └──────┘ └────┬─────┘
                 │
          [After 5 minutes]
                 │
                 ↓
         ┌─────────────┐
         │    SENT     │ (Again)
         └─┬───────────┘
           │ (Or MISSED if user dismisses)
           ↓
         ┌─────────────┐
         │  MISSED     │
         │ (Logged)    │
         └─────────────┘
```

## 🎨 UI Component Breakdown

```
ReminderAlert Component
│
├─ Outer Container (fixed top-right)
│  ├─ space-y-3 (gap between multiple reminders)
│  └─ z-50 (above all content)
│
├─ Reminder Card (for each reminder)
│  ├─ Header Section
│  │  ├─ Icon Container
│  │  │  ├─ bg-gradient (orange→red)
│  │  │  ├─ Bell Icon (animated pulse)
│  │  │  └─ animate-bounce
│  │  └─ Text Content
│  │     ├─ "⏰ Medicine Time!"
│  │     ├─ Medicine Name
│  │     └─ Scheduled Time
│  │
│  ├─ Instructions (if exists)
│  │  └─ bg-white/10 small text
│  │
│  ├─ Action Buttons (grid-cols-3)
│  │  ├─ Taken (green)
│  │  ├─ Snooze (blue)
│  │  └─ Dismiss (red)
│  │
│  └─ Stop Sound Button
│     ├─ Full width
│     ├─ VolumeX icon
│     └─ Semi-transparent background
```

## 📱 Mobile Responsiveness

```
Desktop (lg):
┌─────────────────────────────────────┐
│                            ┌──────────────────┐
│                            │ Reminder Popup   │
│                            │ Fixed top-right  │
│                            │ max-w-sm         │
│                            │ p-6              │
│                            └──────────────────┘
│                                               │
└─────────────────────────────────────┘

Mobile (sm):
┌──────────────┐
│              │
│  ┌─────────┐ │
│  │Reminder │ │
│  │Popup    │ │
│  │Full W   │ │
│  │Top-Right│ │
│  └─────────┘ │
│              │
└──────────────┘

Grid Buttons:
Desktop: grid-cols-3 (3 buttons in a row)
Mobile:  grid-cols-3 (stacks naturally)
```

## 🔐 Security Flow

```
Request Arrives
    │
    ├─ Has Authorization Header?
    │  ├─ NO: Return 401 Unauthorized
    │  └─ YES: Continue
    │
    ├─ Token Valid & Not Expired?
    │  ├─ NO: Return 401 Token Expired
    │  └─ YES: Continue
    │
    ├─ User ID from Token
    │  └─ Store in req.user._id
    │
    └─ Database Query with User Filter
       ├─ All queries: { user: req.user._id }
       └─ Prevents cross-user access
```

---

**This visual guide helps understand the complete system architecture and data flow!**
