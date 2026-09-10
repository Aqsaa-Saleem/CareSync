# CareSync

**CareSync** is a responsive support platform for parents and caregivers of children with developmental or accessibility-related needs. It brings personalized activities, progress tracking, care resources, and practical guidance into one private, parent-focused experience.

> **Because Every Child's Journey Is Different.**
### Live Demo — [Try CareSync](https://caresync-woad-two.vercel.app/)

##  Features

* **Secure Authentication** — Email/password and Google Sign-In with Firebase Authentication.
* **Multiple Child Profiles** — Individual profiles with personalized support areas, avatars, and optional photos.
* **Personalized Activities** — Activities tailored to each child's age and support needs.
* **Progress Tracking** — Track completed activities, saved activities, milestones, and streaks.
* **Parent Notes** — Record observations and milestones for each child's care journey.
* **Care AI** — Gemini-powered guidance assistant with educational responses and offline fallback support.
* **Care Directories** — Browse and filter professionals and centres by location and support focus.
* **Accessibility & Localization** — English/Urdu, RTL support, font-size preferences, dark mode, responsive design, and reduced-motion support.
* **Offline Resilience** — Firestore cloud sync with IndexedDB persistence when available.

##  Technology

| Area               | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **UI**             | React 19, TypeScript, Vite                        |
| **Authentication** | Firebase Authentication                           |
| **Database**       | Cloud Firestore                                   |
| **AI**             | Google Gemini 3.5 Flash via Vercel serverless API |
| **Icons**          | Lucide React                                      |
| **Styling**        | CSS custom properties and responsive styles       |
| **Quality Checks** | TypeScript, Oxlint                                |
| **Deployment**     | Vercel                                            |

##  Getting Started

### Prerequisites

* Node.js `^20.19.0` or `>=22.12.0`
* npm `10` or later
* Firebase project with Authentication and Cloud Firestore enabled
* Google Gemini API key for Care AI

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Aqsaa-Saleem/CareSync.git
cd CareSync
npm install
```

Create your local environment file:

**Windows**

```bash
copy .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

##  Firebase Configuration

Add your Firebase web-app configuration to `.env`:

```env
VITE_FIREBASE_API_KEY=REPLACE_WITH_YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=REPLACE_WITH_YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=REPLACE_WITH_YOUR_MEASUREMENT_ID
```

In Firebase Console:

1. Enable **Email/Password** authentication.
2. Enable **Google Sign-In** if required.
3. Create a **Cloud Firestore** database.
4. Deploy the rules from `firestore.rules`.

Firestore rules restrict private user data to the authenticated owner of `users/{uid}`.

##  Gemini AI Configuration

Care AI uses **Google Gemini 3.5 Flash** through the secure `/api/ai/chat` backend endpoint.

Add the Gemini API key to `.env` for local development:

```env
GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY
```

For production, configure `GEMINI_API_KEY` as a **server-side environment variable in Vercel**.

> **Security:** Never commit `.env` files or expose the Gemini API key in frontend code.

##  Development

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

##  Project Structure

```text
CareSync/
├── api/
│   └── ai/
│       └── chat.ts
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── firebase/
│   ├── i18n/
│   ├── screens/
│   ├── App.tsx
│   ├── index.css
│   └── types.ts
│
├── public/
│   ├── avatar-boy.jpg
│   ├── avatar-girl.jpg
│   ├── avatar-other.jpg
│   ├── careai-robot.png
│   └── caresync-logo.jpg
│
├── .env.example
├── firestore.rules
├── package.json
└── README.md
```

##  Data Model

Each authenticated user's private application state is stored in:

```text
users/{firebaseAuthUid}
```

This includes:

* Child profiles
* Activity progress
* Parent notes
* Notifications
* Chat history
* Preferences
* Streak data

##  Care AI

Care AI provides educational and practical guidance related to:

* Child development
* Daily activities
* Communication strategies
* Developmental milestones

When available, the assistant can use limited child-profile context such as support needs, diagnosis status, city, and province.

If the AI service is unavailable, CareSync falls back to local guidance logic for basic offline support.

> **Disclaimer:** CareSync is not a medical service. Care AI does not diagnose or treat medical or developmental conditions and does not replace qualified professional care.

## 🔒 Privacy & Security

* Firebase Authentication manages account access.
* Firestore security rules restrict private data to the authenticated user.
* Firebase configuration is loaded through environment variables.
* Gemini API credentials remain server-side.
* `.env` files and credentials must not be committed.
* Users can manage their child profiles, photos, and notes.


##  About

CareSync is a personalized care platform designed to empower parents and caregivers with tailored activities, progress tracking, care resources, and AI-powered guidance.

### Live Demo

[Try CareSync](https://caresync-woad-two.vercel.app/)

### Repository

[View on GitHub](https://github.com/Aqsaa-Saleem/CareSync)
