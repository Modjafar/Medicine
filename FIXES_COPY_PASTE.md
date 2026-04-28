# Critical Code Fixes - Copy & Paste Solutions

## Fix #1: reminderScheduler.js - Missing Exports

**File:** `backend/utils/reminderScheduler.js`

**Find this at the end of the file (around line 76):**
```javascript
module.exports = {
    scheduleReminders,
```

**Replace with:**
```javascript
module.exports = {
    scheduleReminders,
    initReminderScheduler,
    clearOldJobs,
};
```

---

## Fix #2: auth.js - Response Headers Bug

**File:** `backend/middleware/auth.js`

**Replace the entire file with:**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next();  // ← ADD RETURN
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });  // ← ADD RETURN
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });  // ← ADD RETURN
    }
};

module.exports = { protect };
```

---

## Fix #3: .env - Add Missing Variables

**File:** `backend/.env`

**Replace entire file with:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditrack?retryWrites=true&w=majority
JWT_SECRET=meditrack_dev_secret_key_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

⚠️ **IMPORTANT:** Replace `username`, `password`, and `cluster` with your MongoDB Atlas credentials

---

## Fix #4: Create Frontend .env.local

**File:** `frontend/.env.local` (NEW FILE - create this)

**Content:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Steps to create:**
1. Open terminal in `frontend/` directory
2. Run: `touch .env.local` (Linux/Mac) or create file manually (Windows)
3. Paste the content above
4. Save and restart React dev server

---

## Fix #5: Create Root .gitignore

**File:** `.gitignore` (NEW FILE in root directory)

**Content:**
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment
.env
.env.local
.env.development
.env.test
.env.production

# Build outputs
/build
/dist
/frontend/build
backend/node_modules/
frontend/node_modules/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache
```

---

## Verification Steps

After applying fixes, verify:

### 1. Backend Server Starts
```bash
cd backend
npm run dev
```
✅ Should see: "MongoDB Connected" and "Reminder scheduler initialized"

### 2. Frontend Can Connect
```bash
cd frontend
npm start
```
✅ Should see: No console errors about API connection

### 3. Can Register/Login
- Go to http://localhost:3000
- Try to register a new user
- ✅ Should succeed without errors

### 4. Can Add Medicine
- After login, click "Add Medicine"
- Fill in details and submit
- ✅ Should see medicine in list immediately

---

## Common Issues After Fixes

### Issue: "Cannot set headers after they are sent"
**Solution:** Verify all fixes in `auth.js` were applied with `return` statements

### Issue: "initReminderScheduler is not a function"
**Solution:** Verify `module.exports` in `reminderScheduler.js` includes all functions

### Issue: Frontend can't connect to API
**Solution:** Check that `.env.local` exists in frontend with correct `REACT_APP_API_URL`

### Issue: "MONGODB_URI is undefined"
**Solution:** Add MongoDB Atlas connection string to `backend/.env`

### Issue: Still using in-memory database
**Solution:** If no MongoDB URI, add one to `.env` - check it's not empty

---

## Next Steps After Critical Fixes

1. **Add Input Validation** - Prevents bad data from entering database
2. **Add Error Handling** - Better error messages for debugging
3. **Add Rate Limiting** - Protects API from abuse
4. **Add Logging** - Track what's happening on server
5. **Add Tests** - Ensure everything works as expected

See `IMPLEMENTATION_CHECKLIST.md` for detailed next steps.

