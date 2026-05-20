# <p align="center">⚡ Streamify</p>

<p align="center">
  <b>A Production-Grade Real-Time Chat & Social Platform for Language Exchange</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-production-ready-brightgreen" alt="Status"/>
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js" alt="Node"/>
  <img src="https://img.shields.io/badge/MongoDB-47a248?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Stream%20Chat-8B5CF6" alt="Stream Chat"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Authentication Flow](#-authentication-flow)
- [Real-Time Infrastructure](#-real-time-infrastructure)
- [Security Architecture](#-security-architecture)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)

---

## 🌟 Overview

**Streamify** is a full-stack, production-ready social platform purpose-built for language exchange. It connects learners worldwide through real-time messaging, video calls, and a rich social graph — all wrapped in a modern, responsive UI.

Built with a security-first mindset and scalable architecture, Streamify handles the complete user journey: **onboarding → discovery → connection → communication**. The system integrates **Stream Chat** for enterprise-grade messaging, **Web Push API** for native notifications, **Gmail SMTP** for transactional emails, and **Google OAuth** for frictionless sign-in.

---

## ✨ Features

### 🔐 Authentication & Identity
- Email/password registration with email verification (OTP-based)
- Google OAuth 2.0 single sign-on
- JWT access + refresh token rotation (httpOnly cookies)
- Multi-tier protected routing (unverified → onboarded → full access)

### 💬 Real-Time Chat
- Instant messaging powered by **Stream Chat SDK**
- Typing indicators with animated dots
- Read receipts (single ✓ / double ✓✓)
- Online/offline presence with green dot indicators
- Message search across all conversations
- Group chat creation

### 👥 Social Graph
- Friend request system (send, accept, reject) with duplicate prevention
- Recommended user discovery with language-based matching
- Profile pages with online status and last seen timestamps
- Location and language badges

### 📢 Notifications
- In-app toast notifications for new messages
- Real-time friend request alerts (polling)
- **Web Push notifications** via Service Worker + VAPID
- Stream Chat webhook → push server architecture

### 📧 Email System
- OTP verification emails with branded HTML templates
- Password reset flow with 6-digit OTP + intermediate reset token
- Welcome emails on successful verification
- Gmail SMTP integration with App Password authentication

### 📹 Video Calling
- One-click video call links shared in chat
- Powered by **Stream Video SDK**
- Full call controls (mute, end, speaker layout)

### 🎨 UI/UX
- 30+ DaisyUI themes with live theme switching
- Fully responsive (mobile → desktop)
- Loading skeletons and error states throughout
- Toast notifications for all user actions

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & HMR |
| **React Router 7** | Client-side routing |
| **TanStack Query 5** | Server state management, caching, polling |
| **Zustand** | Client state (theme) |
| **Stream Chat React 14** | Real-time chat UI components |
| **Stream Video React SDK** | Video calling UI |
| **Tailwind CSS + DaisyUI** | Utility-first styling + component library |
| **Lucide React** | Icon library |
| **react-hot-toast** | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | HTTP server & routing |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Access token generation |
| **Bcryptjs** | Password hashing (salt rounds 12) |
| **Passport + Google OAuth 2.0** | Federated authentication |
| **Nodemailer** | Transactional email delivery |
| **express-rate-limit** | API rate limiting |
| **helmet** | Security headers & CSP |

### Real-Time & Notifications

| Technology | Purpose |
|---|---|
| **Stream Chat** | WebSocket messaging infrastructure |
| **Stream Video** | WebRTC video calling |
| **Web Push API + VAPID** | Native push notifications |
| **Service Worker** | Push event handling + notification clicks |
| **Stream Webhooks** | Server-side push trigger |

---

## 🏗 Architecture

```
┌──────────────┐     ┌─────────────────────────────────┐     ┌──────────────┐
│   Browser    │────▶│         Express Server           │────▶│   MongoDB    │
│  (React SPA) │     │  JWT Auth · Rate Limit · Helmet  │     │  (Mongoose)  │
└──────┬───────┘     └──────┬──────────────┬────────────┘     └──────────────┘
       │                     │              │
       │  WebSocket          │  Webhook     │  REST
       ▼                     ▼              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Stream Chat  │     │  Push Server │     │  Gmail SMTP      │
│  Cloud  ·   │     │  (web-push)  │     │  (Nodemailer)    │
│  WebSocket   │     │              │     │  Transactional   │
│  + Video     │     │  VAPID keys  │     │  Emails          │
└──────────────┘     └──────────────┘     └──────────────────┘
```

**Request Flow:**
1. Client authenticates → receives httpOnly JWT cookies
2. All subsequent API calls include cookies (auto-refresh on expiry)
3. Stream Chat client connects via WebSocket using server-generated token
4. Messages flow through Stream Cloud → trigger webhook → push notification
5. Friend requests and user data flow through REST endpoints
6. Email OTPs sent via Gmail SMTP (dev fallback logs to console)

---

## 📁 Project Structure

```
streamify/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Entry point, middleware, graceful shutdown
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Signup, login, OTP, forgot/reset password
│   │   │   ├── user.controller.js    # Profile, friends, friend requests
│   │   │   ├── chat.controller.js    # Stream Chat token generation
│   │   │   ├── notification.controller.js  # Push subscription management
│   │   │   └── webhook.controller.js # Stream Chat webhook → push relay
│   │   ├── models/
│   │   │   ├── user.js               # User schema (OTP, verification, friends)
│   │   │   ├── FriendReq.js          # Friend request with compound indexes
│   │   │   ├── PushSubscription.js   # Web push subscription storage
│   │   │   └── RefreshToken.js       # JWT refresh token with TTL index
│   │   ├── routes/
│   │   │   ├── auth.route.js         # /api/auth/* (rate-limited)
│   │   │   ├── user.route.js         # /api/users/* (rate-limited)
│   │   │   ├── chat.route.js         # /api/chat/*
│   │   │   ├── notification.route.js # /api/notifications/*
│   │   │   └── webhook.route.js      # /api/webhooks/*
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT verification → req.user
│   │   │   └── rateLimiter.js       # Auth (20/15m) + General (200/15m) limiters
│   │   └── lib/
│   │       ├── db.js                 # MongoDB connection
│   │       ├── email.js              # Nodemailer transporter + send functions
│   │       ├── email/templates.js    # Responsive HTML email templates
│   │       ├── passport.js           # Google OAuth strategy
│   │       ├── stream.js             # Stream Chat singleton client
│   │       ├── pushHelper.js         # sendPushNotification with stale cleanup
│   │       ├── webpush.js            # VAPID web-push configuration
│   │       └── validators.js         # Input validation, XSS sanitize, OTP utils
│   ├── .env                          # Environment variables (gitignored)
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── sw.js                     # Service Worker for push notifications
│   ├── src/
│   │   ├── main.jsx                  # Entry point (QueryClient + BrowserRouter)
│   │   ├── App.jsx                   # 4-tier routing + global hooks
│   │   ├── index.css                 # Tailwind directives
│   │   ├── context/
│   │   │   └── StreamChatContext.jsx # Global Stream client, presence, unread
│   │   ├── hooks/
│   │   │   ├── useAuthUser.js        # Auth state query
│   │   │   ├── useLogin.js           # Login mutation hook
│   │   │   ├── useSignUp.js          # Signup mutation hook
│   │   │   ├── useLogout.js          # Logout mutation hook
│   │   │   ├── usePushNotifications.js  # SW registration + push subscription
│   │   │   └── useFriendRequestPoller.js  # 20s polling with retry
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Email/password + Google OAuth login
│   │   │   ├── SignUpPage.jsx        # Registration with terms agreement
│   │   │   ├── ForgotPasswordPage.jsx # 2-step: email → 6-digit OTP
│   │   │   ├── ResetPasswordPage.jsx  # Token-based password reset
│   │   │   ├── VerifyEmailPage.jsx    # OTP verification with paste support
│   │   │   ├── OnboardingPage.jsx     # Profile setup (name, bio, languages)
│   │   │   ├── HomePage.jsx           # Friend list + user recommendations
│   │   │   ├── ChatPage.jsx           # 1-on-1 chat with search + video call
│   │   │   ├── MessagesPage.jsx       # Channel list + active chat
│   │   │   ├── FriendsPage.jsx        # Friend list grid
│   │   │   ├── NotificationsPage.jsx  # Incoming + accepted friend requests
│   │   │   ├── ProfilePage.jsx        # User profile with online status
│   │   │   └── CallPage.jsx           # Video call interface
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Sidebar.jsx           # Navigation with unread badge
│   │   │   ├── Navbar.jsx            # Top nav with theme selector
│   │   │   ├── Layout.jsx            # Sidebar + Navbar wrapper
│   │   │   ├── FriendCard.jsx        # Friend display with online dot
│   │   │   ├── MessageSearchModal.jsx  # Debounced cross-channel search
│   │   │   ├── MessageWithReadReceipt.jsx  # Double-check read receipts
│   │   │   ├── TypingIndicator.jsx    # Animated typing dots
│   │   │   ├── CallButton.jsx         # Video call trigger button
│   │   │   ├── CreateGroupModal.jsx   # Group chat creation
│   │   │   ├── ThemeSelector.jsx      # 30+ theme picker dropdown
│   │   │   └── ... (loaders, empty states, etc.)
│   │   ├── lib/
│   │   │   ├── api.js                 # All API functions
│   │   │   ├── axios.js               # Axios instance + JWT refresh interceptor
│   │   │   └── utils.jsx              # formatLastSeen, getLanguageFlag
│   │   ├── store/
│   │   │   └── useThemeStore.js       # Zustand theme persistence
│   │   └── constants/
│   │       └── index.js               # Languages, themes, flag mappings
│   ├── .env                           # Vite env vars (gitignored)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Stream Chat** account ([free tier](https://getstream.io/chat/trial/))
- **Gmail** account with [App Password](https://myaccount.google.com/apppasswords)
- **Google OAuth** credentials ([console](https://console.cloud.google.com/apis/credentials))

### Clone & Install

```bash
git clone https://github.com/yourusername/streamify.git
cd streamify

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Setup

```bash
# Backend — create backend/.env
cp .env.example .env   # (or manually create)
```

```bash
# Frontend — create frontend/.env
VITE_STREAM_API_KEY=your_stream_api_key
VITE_API_URL=http://localhost:3000/api
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Run Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev     # Starts on http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm run dev     # Starts on http://localhost:5173
```

### Build for Production

```bash
cd frontend
npm run build          # Outputs to frontend/dist/

cd ../backend
NODE_ENV=production node src/server.js   # Serves SPA from backend
```

---

## 🔐 Environment Configuration

### Backend (`backend/.env`)

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGOOSE_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/streamify

# JWT
JWT_SECRET_KEY=<base64-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Gmail SMTP (App Password required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=<16-char-app-password>
SMTP_FROM="Streamify <your.email@gmail.com>"

# Stream Chat
STREAM_API_KEY=<your-stream-api-key>
STREAM_API_SECRET=<your-stream-api-secret>

# VAPID (Web Push)
VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_SUBJECT=mailto:noreply@streamify.app

# Stream Webhook Secret
STREAM_WEBHOOK_SECRET=whsec_streamify_dev_2026
```

### Frontend (`frontend/.env`)

```env
VITE_STREAM_API_KEY=<same-as-backend-stream-api-key>
VITE_API_URL=http://localhost:3000/api
VITE_VAPID_PUBLIC_KEY=<same-as-backend-vapid-public-key>
```

---

## 🔄 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Server  │     │ MongoDB  │     │  Email   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                 │                 │                 │
     │  POST /signup   │                 │                 │
     │────────────────▶│  Create user    │                 │
     │                 │────────────────▶│                 │
     │                 │  Store OTP      │                 │
     │                 │────────────────▶│                 │
     │                 │  Send OTP email │                 │
     │                 │──────────────────────────────────▶│
     │  201 + JWT      │                 │                 │
     │◀────────────────│                 │                 │
     │                 │                 │                 │
     │  POST /verify-email (OTP)         │                 │
     │────────────────▶│  Verify OTP     │                 │
     │                 │────────────────▶│                 │
     │                 │  Mark verified  │                 │
     │  200 + user     │                 │                 │
     │◀────────────────│                 │                 │
     │                 │                 │                 │
     │  POST /onboarding (profile)       │                 │
     │────────────────▶│  Update user    │                 │
     │                 │────────────────▶│                 │
     │  200 + user     │                 │                 │
     │◀────────────────│                 │                 │
```

**Token Lifecycle:**
- **Access Token** — 15 minutes, stored in httpOnly cookie (`access_token`)
- **Refresh Token** — 7 days, stored in httpOnly cookie (`refresh_token`, path: `/api/auth`)
- Auto-refresh via Axios interceptor when server responds `expired: true`
- Refresh token rotation: old token deleted, new one issued on each refresh

**Route Protection (4 tiers):**
1. **Not authenticated** → only `/login`, `/signup`, `/forgot-password`, `/reset-password/:token`
2. **Authenticated, not verified** → only `/verify-email`
3. **Verified, not onboarded** → only `/onboarding`
4. **Fully onboarded** → full application access

---

## ⚡ Real-Time Infrastructure

### Chat
- **Stream Chat** manages WebSocket connections globally
- Single `StreamChat` singleton prevents duplicate connections
- `message.new` events trigger in-app toasts (suppressed when viewing that channel)
- Channel IDs are deterministic: `sorted([user1, user2]).join("-")`
- Presence tracked via `user.presence.changed` events → `Set` → React context

### Push Notifications
```
Sender sends message
        │
        ▼
Stream Chat Cloud
        │
        ▼ (Webhook POST)
Backend /api/webhooks/stream?secret=...
        │
        ▼
Extract sender info + recipient ID
        │
        ▼
Query PushSubscription model for recipient
        │
        ▼
webpush.sendNotification() → Browser Service Worker
        │
        ▼
Show native notification → click → navigate to /chat/:senderId
```

- Stale subscriptions (410/404) automatically cleaned from DB
- Webhook secured with query parameter secret

### Polling (Friend Requests)
- `useFriendRequestPoller` runs every 20 seconds
- Shows toast only when count increases (avoids duplicate notifications)
- Retries up to 3 times on failure

---

## 🛡 Security Architecture

| Measure | Implementation |
|---|---|
| **Password Hashing** | bcrypt with salt rounds 12 |
| **JWT Storage** | httpOnly, sameSite: strict, secure in production |
| **Token Rotation** | Refresh token deleted and recreated on each use |
| **XSS Prevention** | Input sanitization (`&`, `<`, `>`, `"`, `'` → HTML entities) |
| **CSP** | Explicit Content-Security-Policy via helmet |
| **CORS** | Explicit origin, credentials: true |
| **Rate Limiting** | Auth: 20 req/15min · General: 200 req/15min |
| **Body Size Limit** | 10MB cap on JSON payloads |
| **Sensitive Data** | Stripped via Mongoose `toJSON()` + `sanitizeUser()` |
| **OTP** | 6-digit, 10-minute expiry, plain text (acceptable risk) |
| **Forgot Password** | Generic error messages (no email enumeration) |
| **Graceful Shutdown** | SIGTERM/SIGINT closes HTTP + DB connections |

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Rate Limited | Description |
|---|---|---|---|---|
| POST | `/signup` | No | Yes | Register with email + password |
| POST | `/login` | No | Yes | Login, returns JWT cookies |
| POST | `/logout` | No | No | Clears cookies, deletes refresh token |
| POST | `/refresh` | No | Yes | Rotates refresh token |
| POST | `/verify-email` | Yes | No | Verify with 6-digit OTP |
| POST | `/resend-otp` | Yes | Yes | Resend verification OTP |
| POST | `/onboarding` | Yes | No | Complete profile setup |
| GET | `/me` | Yes | No | Get current user |
| POST | `/forgot-password` | No | Yes | Send reset OTP to email |
| POST | `/verify-reset-otp` | No | Yes | Verify OTP, receive reset token |
| POST | `/reset-password/:token` | No | Yes | Set new password |
| GET | `/google` | No | No | Google OAuth redirect |
| GET | `/google/callback` | No | No | Google OAuth callback |

### Users (`/api/users`) — All require auth + rate limited
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Recommended users (paginated: `?page=1&limit=20`) |
| GET | `/friends` | Current user's friends |
| GET | `/friend-requests` | Incoming + accepted friend requests |
| GET | `/outgoing-friend-requests` | Sent pending requests |
| POST | `/friend-request/:id` | Send friend request |
| PUT | `/friend-request/:id/accept` | Accept pending request |
| PUT | `/friend-request/:id/reject` | Reject pending request |
| GET | `/:id` | Get user by ID |

### Chat (`/api/chat`) — Requires auth
| Method | Endpoint | Description |
|---|---|---|
| GET | `/token` | Generate Stream Chat token |

### Notifications (`/api/notifications`) — Requires auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/subscribe` | Save push subscription |
| POST | `/unsubscribe` | Remove push subscription |

### Webhooks (`/api/webhooks`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/stream` | Stream Chat webhook → push relay |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check (`{ status: "ok", timestamp }`) |

---

## 🌐 Deployment

### Production Build

```bash
cd frontend
npm run build
# Generates frontend/dist/ with optimized bundle + sw.js
```

The backend automatically serves the built frontend when `NODE_ENV=production`:
```js
// server.js
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}
```

### Quick Deploy (Render / Railway / Fly.io)

```yaml
# Build Command
cd frontend && npm install && npm run build && cd ../backend && npm install

# Start Command
cd backend && NODE_ENV=production node src/server.js

# Environment Variables
# Set ALL backend .env variables in the deployment dashboard
```

### Post-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `CLIENT_URL` to production frontend URL
- [ ] Generate **new** `JWT_SECRET_KEY` (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
- [ ] Configure **Stream Chat Webhook** URL: `https://yourdomain.com/api/webhooks/stream?secret=whsec_streamify_dev_2026`
- [ ] Ensure **HTTPS** is enabled (required for Push Notifications)
- [ ] Verify **CORS origin** matches production domain
- [ ] Run `curl https://yourdomain.com/api/health` to verify

---

## 🧪 Testing

```bash
# Verify backend starts without errors
cd backend && node src/server.js

# Check health endpoint
curl http://localhost:3000/api/health
# → { "status": "ok", "timestamp": "2026-05-20T..." }

# Build frontend (checks for compilation errors)
cd frontend && npm run build
```

---

## 🗺 Future Roadmap

- [ ] **Image/File sharing** in chat messages (Stream SDK supports it, UI pending)
- [ ] **Block/Report user** for safety and moderation
- [ ] **Language filter** on user recommendations
- [ ] **User activity timeline** with MongoDB change streams
- [ ] **Socket.IO** for real-time friend request updates (replaces polling)
- [ ] **Mobile push** via Firebase Cloud Messaging (FCM)
- [ ] **Redis session cache** for JWT blacklisting
- [ ] **Docker Compose** for one-command local development
- [ ] **CI/CD pipeline** with GitHub Actions
- [ ] **End-to-end tests** with Playwright

---


<p align="center">
  <sub>If you found this project useful, consider giving it a ⭐ on GitHub!</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F%20and%20%E2%98%95-red" alt="Made with love and coffee"/>
</p>
