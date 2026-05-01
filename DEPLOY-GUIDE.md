# 🚀 ABC Coaching Centre — Mobile Se Publish Karo
## Railway + MongoDB Atlas — Step by Step Guide

---

## 📋 OVERVIEW — Kya Kya Karna Hai

```
MongoDB Atlas (Database) 
        ↓
Railway.app (Backend — server.js)
        ↓  
Netlify (Frontend — index.html)
        ↓
Students worldwide access kar sakte hain! 🌍
```

---

## ✅ STEP 1 — MongoDB Atlas Setup (Free)

### Mobile pe karo:

1. **Browser open karo:** `mongodb.com/cloud/atlas`

2. **"Try Free" pe tap karo**

3. **Account banao:**
   - Email aur password daalo
   - Ya Google se login karo

4. **"Build a Database" pe tap karo**

5. **FREE tier choose karo (M0 — $0/month)**

6. **Provider:** AWS, Region: Mumbai (ap-south-1)

7. **Cluster Name:** `abc-coaching` likho

8. **"Create" pe tap karo**
   - 2-3 minute wait karo

9. **"Security Quickstart" aayega:**
   - Username: `abcadmin`
   - Password: `abc123secure` (yaad rakhna!)
   - **"Create User" tap karo**

10. **"Add My Current IP" tap karo**
    - Phir **"Allow Access from Anywhere"** bhi karo
    - CIDR: `0.0.0.0/0` — sabke liye open

11. **"Finish and Close" tap karo**

12. **Connection String lena:**
    - "Connect" button tap karo
    - "Drivers" choose karo
    - Ye string copy karo:
    ```
    mongodb+srv://abcadmin:abc123secure@abc-coaching.xxxxx.mongodb.net/abc_coaching?retryWrites=true&w=majority
    ```
    ⚠️ Apna password replace karo `abc123secure` ki jagah

---

## ✅ STEP 2 — GitHub Pe Code Upload (Free)

### Mobile pe karo:

1. **`github.com`** open karo

2. **Account banao** (agar nahi hai)

3. **"+" icon → "New Repository"** tap karo

4. **Settings:**
   - Name: `abc-coaching-centre`
   - Private rakhna (optional)
   - **"Create Repository"** tap karo

5. **Files upload karo:**
   - "uploading an existing file" tap karo
   - Ye files upload karo:
     - ✅ `server.js`
     - ✅ `package.json`
     - ✅ `.env.example`
   - **"Commit changes"** tap karo

6. **`public` folder banao:**
   - "Add file → Create new file"
   - Name: `public/index.html`
   - `index.html` ka content paste karo
   - **"Commit changes"** tap karo

---

## ✅ STEP 3 — Railway Pe Backend Deploy (Free)

### Mobile pe karo:

1. **`railway.app`** open karo

2. **"Start a New Project"** tap karo

3. **GitHub se Login karo**

4. **"Deploy from GitHub repo"** tap karo

5. **`abc-coaching-centre`** repo select karo

6. **Thoda wait karo** — Railway auto-detect karega

7. **Environment Variables add karo:**
   - "Variables" tab pe tap karo
   - **"Add Variable"** tap karo — ek ek karke:

   ```
   MONGO_URI = mongodb+srv://abcadmin:abc123secure@abc-coaching.xxxxx.mongodb.net/abc_coaching?retryWrites=true&w=majority
   
   JWT_SECRET = abc_coaching_super_secret_2024_railway
   
   NODE_ENV = production
   ```

8. **"Deploy" tap karo**

9. **5-10 minute wait karo**

10. **Domain milega:**
    - Settings → Networking → Generate Domain
    - Tumhara URL: `abc-coaching-production.up.railway.app`
    
11. **Test karo:**
    - Browser mein kholo: `https://abc-coaching-production.up.railway.app/api/health`
    - Ye dikhna chahiye: `{"status":"ok"}`
    - ✅ Backend live hai!

---

## ✅ STEP 4 — index.html mein API URL Update Karo

`index.html` file mein ye line dhundho:

```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';
```

Isko badlo:

```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://abc-coaching-production.up.railway.app/api';
```

(Apna Railway URL daalo)

---

## ✅ STEP 5 — Netlify Pe Frontend Deploy (Free)

### Option A — Netlify Drop (Sabse Aasaan):

1. **`netlify.com/drop`** open karo
2. **Updated `index.html` drag & drop karo**
3. ✅ **2 minute mein live!**
4. Custom URL milega: `abc-coaching-xyz.netlify.app`

### Option B — Netlify + GitHub (Auto Deploy):

1. **`netlify.com`** pe login karo
2. **"Add new site → Import from GitHub"**
3. Repo select karo
4. Build settings:
   - Build command: (khali chhodo)
   - Publish directory: `public`
5. **Deploy!**

---

## ✅ STEP 6 — Final Test Karo

1. Netlify URL open karo
2. Register karo (naam, class, PIN)
3. Class → Subject → Chapter → Video
4. ✅ Sab MongoDB se aa raha hoga!

Admin test:
- Admin Login: `admin` / `admin123`
- Chapter add karo
- Video add karo
- ✅ Dusre phone pe bhi dikh raha hoga!

---

## 🆓 FREE TIER LIMITS

| Service | Free Limit | Kaafi Hai? |
|---------|-----------|-----------|
| MongoDB Atlas | 512MB storage | ✅ Haan, 1000s videos |
| Railway | $5/month credit | ✅ Haan, kafi hai |
| Netlify | 100GB bandwidth | ✅ Haan, bahut zyada |

---

## ❓ Common Problems & Solutions

### ❌ "MongoDB connection failed"
→ `.env` mein MONGO_URI check karo
→ Atlas mein IP `0.0.0.0/0` allow hai?

### ❌ "Invalid credentials" on admin login  
→ Server pehli baar chala? Seed hone do
→ Username: `admin`, Password: `admin123`

### ❌ Videos nahi dikh rahe
→ API URL correct hai `index.html` mein?
→ Railway deployment successful hua?

### ❌ Railway free credit khatam
→ Render.com pe migrate karo (bhi free)

---

## 📱 SIRF MOBILE SE PUBLISH — POSSIBLE HAI!

```
✅ MongoDB Atlas    → Mobile browser
✅ GitHub           → Mobile browser  
✅ Railway          → Mobile browser
✅ Netlify          → Mobile browser

Laptop ki zarurat NAHI! 🎉
```

---

## 🔗 Important Links

- MongoDB Atlas: https://mongodb.com/cloud/atlas
- GitHub: https://github.com
- Railway: https://railway.app
- Netlify: https://netlify.com

---

Total time: **30-45 minutes** (Mobile se bhi!)
Cost: **₹0 — Bilkul Free** 🎉
