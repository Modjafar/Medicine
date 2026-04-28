# Quick Fixes for Critical Issues

## 1. Fix reminderScheduler.js Module Export

**Current Issue:** `initReminderScheduler` is not exported

**File:** `backend/utils/reminderScheduler.js`

**Current code (line 76-78):**
```javascript
module.exports = {
    scheduleReminders,
```

**Fixed code:**
```javascript
module.exports = {
    scheduleReminders,
    initReminderScheduler,
    clearOldJobs,
};
```

---

## 2. Fix Auth Middleware Bug

**Current Issue:** Response headers sent twice

**File:** `backend/middleware/auth.js`

**Current code:**
```javascript
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
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
```

**Fixed code:**
```javascript
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
            return next();  // ADD RETURN HERE
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });  // ADD RETURN HERE
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });  // ADD RETURN HERE
    }
};
```

---

## 3. Fix .env File - Add MongoDB URI

**File:** `backend/.env`

**Current:**
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=meditrack_dev_secret_key_2024
NODE_ENV=development
```

**Fixed (for development):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditrack?retryWrites=true&w=majority
JWT_SECRET=meditrack_dev_secret_key_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note:** Replace `username`, `password`, and `cluster` with your MongoDB Atlas credentials

---

## 4. Create Frontend .env File

**File:** `frontend/.env.local` (NEW FILE)

**Create with:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 5. Create .gitignore File

**File:** `.gitignore` (NEW FILE in root)

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
.next
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/
```

---

## Implementation Order

1. **First:** Fix auth middleware (prevents crashes)
2. **Second:** Fix reminderScheduler exports (prevents crashes)
3. **Third:** Update .env files (enables database connection)
4. **Fourth:** Create .gitignore (prevents accidental commits)
5. **Fifth:** Create frontend .env.local (enables frontend to work)

