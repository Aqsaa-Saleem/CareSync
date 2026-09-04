# CareSync

CareSync is a responsive support platform for parents and caregivers of children with developmental or accessibility-related needs. It brings personalized activities, progress tracking, care resources, and practical guidance into one private, parent-focused experience.

> **Because Every Child's Journey Is Different.**
> 
###Live Demo

> [**Try CareSync**]
> 
> caresync-woad-two.vercel.app
> 
## Highlights

- **Secure accounts** — Email/password and Google Sign-In through Firebase Authentication.
- **Multiple child profiles** — Manage individual profiles, gender-based avatars, optional photo uploads, and personalized support areas.
- **Personalized activities** — Activity recommendations tailored to each child's age and support needs.
- **Progress tracking** — Track completed activities, saved activities, milestones, and streaks.
- **Parent Notes** — Record observations and milestones for each family's care journey.
- **Care AI** — An in-app guidance interface with suggested questions and educational responses.
- **Care directories** — Browse and filter professionals and centres by area and support focus.
- **Accessibility and localization** — English/Urdu language support, RTL layout support, font-size preferences, dark mode, responsive mobile design, and reduced-motion support.
- **Cloud sync with offline resilience** — User data is stored in Firestore and uses IndexedDB persistence when available.

## Technology

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript, Vite |
| Authentication | Firebase Authentication |
| Data | Cloud Firestore |
| Icons | Lucide React |
| Styling | CSS custom properties and responsive inline component styles |
| Quality checks | TypeScript build and Oxlint |

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8)
- npm 10 or later
- A Firebase project with **Authentication** and **Cloud Firestore** enabled

### Installation

```bash
# Clone the repository and enter the application directory
cd caresync

# Install dependencies
npm install

# Create your local environment file
copy .env.example .env
```

On macOS or Linux, use this command instead:

```bash
cp .env.example .env
```

### Firebase Configuration

Add your Firebase web-app values to `.env`:

```env
VITE_FIREBASE_API_KEY=REPLACE_WITH_YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=REPLACE_WITH_YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=REPLACE_WITH_YOUR_FIREBASE_MEASUREMENT_ID
```

In the Firebase Console:

1. Enable the **Email/Password** provider under Authentication.
2. Enable the **Google** provider if Google Sign-In is required.
3. Create a **Cloud Firestore** database.
4. Publish the rules in [`firestore.rules`](./firestore.rules).

The supplied rules restrict each document in `users/{uid}` to its matching authenticated Firebase user.

### Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### Production Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint. |

## Project Structure

```text
src/
├── components/       # Shared UI elements, navigation, avatar, and Care AI button
├── context/          # Application state, navigation history, Firebase synchronization
├── data/             # Static activities, professionals, centres, and care tips
├── firebase/          # Firebase app, Auth, and Firestore services
├── i18n/             # English and Urdu translations with RTL support
├── screens/          # Feature screens and Care AI interface
├── App.tsx           # Screen routing and application shell
├── index.css         # Theme tokens, layout rules, and animations
└── types.ts          # Shared TypeScript models

public/
├── avatar-boy.jpg
├── avatar-girl.jpg
├── avatar-other.jpg
├── careai-robot.png
└── caresync-logo.jpg
```

## Data Model

CareSync stores each signed-in user's private application state in one Firestore document:

```text
users/{firebaseAuthUid}
```

That document includes child profiles, activity status, notes, notifications, chat history, preferences, and streak data. Child photo uploads are optional and stored as part of the relevant child profile data.

## Care AI

The current Care AI experience is an educational, in-app guidance interface. Its responses are generated locally from predefined guidance logic in [`src/screens/CareAI.tsx`](./src/screens/CareAI.tsx); it does **not** use a Gemini, Google AI, or other external generative-AI API key.

CareSync is not a medical service and does not diagnose, treat, or replace qualified professional care. Parents and caregivers should consult appropriate professionals for medical or developmental concerns.

## Privacy and Security

- Firebase Authentication manages account access.
- Firestore security rules restrict private data to the authenticated owner of `users/{uid}`.
- Firebase configuration values are loaded from `.env`; do not commit private environment files.
- Users can edit child profiles, remove optional photos, and manage notes in the app.

## Contributing

1. Create a focused branch for your change.
2. Keep changes aligned with the existing responsive CareSync design system.
3. Run `npm run build` and `npm run lint` before submitting changes.
4. Do not commit `.env` files or other credentials.

## Support

For product guidance, use the in-app **Help & Support**, **About CareSync**, and **Privacy** screens.
