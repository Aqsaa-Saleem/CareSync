CareSync

CareSync is a responsive support platform for parents and caregivers of children with developmental or accessibility-related needs. It brings personalized activities, progress tracking, care resources, and practical guidance into one private, parent-focused experience.

Because Every Child's Journey Is Different.

Live Demo: Try CareSync

Highlights
Secure accounts — Email/password and Google Sign-In through Firebase Authentication.
Multiple child profiles — Manage individual profiles, gender-based avatars, optional photo uploads, and personalized support areas.
Personalized activities — Activity recommendations tailored to each child's age and support needs.
Progress tracking — Track completed activities, saved activities, milestones, and streaks.
Parent Notes — Record observations and milestones for each family's care journey.
Care AI — A Gemini-powered AI guidance assistant with suggested questions and educational responses, with an offline fallback when the AI service is unavailable.
Care directories — Browse and filter professionals and centres by area and support focus.
Accessibility and localization — English/Urdu language support, RTL layout support, font-size preferences, dark mode, responsive mobile design, and reduced-motion support.
Cloud sync with offline resilience — User data is stored in Firestore and uses IndexedDB persistence when available.
Technology
Area	Technology
UI	React 19, TypeScript, Vite
Authentication	Firebase Authentication
Data	Cloud Firestore
AI	Google Gemini 3.5 Flash via a secure Vercel serverless API
Icons	Lucide React
Styling	CSS custom properties and responsive inline component styles
Quality checks	TypeScript build and Oxlint
Getting Started
Prerequisites
Node.js ^20.19.0 or >=22.12.0
npm 10 or later
A Firebase project with Authentication and Cloud Firestore enabled
A Google Gemini API key for Care AI
Installation
# Clone the repository and enter the application directory
cd caresync

# Install dependencies
npm install

# Create your local environment file
copy .env.example .env

On macOS or Linux, use:

cp .env.example .env
Firebase Configuration

Add your Firebase web-app values to .env:

VITE_FIREBASE_API_KEY=REPLACE_WITH_YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=REPLACE_WITH_YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=REPLACE_WITH_YOUR_FIREBASE_MEASUREMENT_ID

In the Firebase Console:

Enable the Email/Password provider under Authentication.
Enable the Google provider if Google Sign-In is required.
Create a Cloud Firestore database.
Publish the rules in firestore.rules.

The supplied rules restrict each document in users/{uid} to its matching authenticated Firebase user.

Gemini AI Configuration

Care AI uses Google Gemini 3.5 Flash through the secure /api/ai/chat backend endpoint.

For local development, add your Gemini API key to .env:

GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY

For production deployment, configure GEMINI_API_KEY as a server-side environment variable in Vercel.

Do not commit .env files or expose the Gemini API key in frontend code.

Run Locally
npm run dev

Open the local Vite URL shown in the terminal.

Production Build
npm run build
npm run preview
Lint
npm run lint
Available Scripts
Command	Description
npm run dev	Start the Vite development server.
npm run build	Type-check the project and create a production build.
npm run preview	Preview the production build locally.
npm run lint	Run Oxlint.
Project Structure
api/
└── ai/
    └── chat.ts          # Secure Gemini API endpoint

src/
├── components/          # Shared UI elements, navigation, avatar, and Care AI button
├── context/             # Application state, navigation history, Firebase synchronization
├── data/                # Static activities, professionals, centres, and care tips
├── firebase/            # Firebase app, Auth, and Firestore services
├── i18n/                # English and Urdu translations with RTL support
├── screens/             # Feature screens and Care AI interface
├── App.tsx              # Screen routing and application shell
├── index.css            # Theme tokens, layout rules, and animations
└── types.ts             # Shared TypeScript models

public/
├── avatar-boy.jpg
├── avatar-girl.jpg
├── avatar-other.jpg
├── careai-robot.png
└── caresync-logo.jpg
Data Model

CareSync stores each signed-in user's private application state in one Firestore document:

users/{firebaseAuthUid}

That document includes child profiles, activity status, notes, notifications, chat history, preferences, and streak data. Child photo uploads are optional and stored as part of the relevant child profile data.

Care AI

Care AI is an AI-powered educational guidance assistant built into CareSync. It uses Google Gemini 3.5 Flash through the secure /api/ai/chat backend endpoint to provide conversational, practical guidance about child development, daily activities, communication strategies, and developmental milestones.

When available, Care AI sends the user's question along with limited child-profile context such as support need, diagnosis status, city, and province. The Gemini API key is kept server-side and is never exposed in the frontend.

If the AI service is unreachable, CareSync falls back to its existing local guidance logic so the Care AI experience can still provide basic offline support.

CareSync is not a medical service and Care AI does not diagnose, treat, or replace qualified professional care. Parents and caregivers should consult appropriate professionals for medical or developmental concerns.

Privacy and Security
Firebase Authentication manages account access.
Firestore security rules restrict private data to the authenticated owner of users/{uid}.
Firebase configuration values and the Gemini API key are loaded from environment variables; do not commit .env files or expose server-side secrets.
Users can edit child profiles, remove optional photos, and manage notes in the app.
Contributing
Create a focused branch for your change.
Keep changes aligned with the existing responsive CareSync design system.
Run npm run build and npm run lint before submitting changes.
Do not commit .env files or other credentials.
Support

For product guidance, use the in-app Help & Support, About CareSync, and Privacy screens.

About

A personalized care platform empowering parents and caregivers with tailored activities, progress tracking, care resources, and AI-powered guidance for children with developmental and accessibility-related needs.

CareSync Live Demo

Resources
Readme
Activity
Releases

No releases published

Deployments

Production deployments are available through the CareSync Vercel deployment.

Contributors
Aqsaa-Saleem
wardabscs-a
Languages
TypeScript
CSS
HTML
