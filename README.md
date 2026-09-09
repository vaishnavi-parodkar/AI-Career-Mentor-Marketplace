# Pathwise — AI Career Guidance Platform (Frontend)

Frontend-only React app for the Final Year Project: an AI-powered Career
Guidance Platform. Built with React.js (Vite), Tailwind CSS, React Router
and Lucide icons. Backend (Spring Boot + MySQL) is not part of this repo —
this app is structured so it can be plugged in later with minimal changes.

## Tech Stack
- React 19 + Vite
- Tailwind CSS 3 (custom theme: colors, fonts, shadows in `tailwind.config.js`)
- React Router v7
- lucide-react icons
- No Bootstrap / Angular / MUI / extra UI libraries

## Getting Started

```bash
npm install
npm run dev       # start local dev server (http://localhost:5173)
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Demo Login

Since there is no backend yet, auth is mocked with localStorage.

- Sign up with any email/password to create an account, **or**
- Use the demo account: `demo@pathwise.com` / `demo1234`

## Project Structure

```
src/
  components/   Reusable UI building blocks (Button, Card, Navbar, etc.)
  pages/        One file per route/screen
  data/         Mock datasets: careers, mentors, assessment questions, roadmap
  services/     api.js — the ONLY place that talks to "the backend".
                Swap the internals of each function with real fetch() calls
                to your Spring Boot endpoints; UI components never change.
  context/      AuthContext (session) and AssessmentContext (in-progress
                assessment answers/result, career comparison selection)
  App.jsx       All routes
  main.jsx      Entry point
  index.css     Tailwind directives + base styles
```

## Connecting the Real Backend Later

All mock logic lives in `src/services/api.js`, grouped by domain:
`authApi`, `profileApi`, `careerApi`, `mentorApi`, `assessmentApi`.
Each function currently resolves a Promise from local mock data /
localStorage after a small artificial delay. To connect Spring Boot:

1. Replace the body of each function with a `fetch()`/`axios` call to your
   REST endpoint, keeping the same function signature and return shape.
2. Remove the localStorage calls once real JWT-based auth is in place.
3. No component code needs to change, since components only ever import
   from `services/api.js`.

## Routes

`/`, `/signup`, `/login`, `/forgot-password`, `/reset-password`,
`/profile`, `/home`, `/assessment`, `/assessment/question`,
`/assessment/result`, `/careers`, `/careers/:career`, `/compare`,
`/mentors`, `/mentors/:mentor`, `/mentors/:mentor/chat`, `/skill-gap`,
`/roadmap`, `/mock-interview`, `/progress`, `/interview-feedback`,
`/market-insights`

## Responsive Design

Mobile-first with a hamburger menu + bottom tab bar under `lg` breakpoint,
and a full desktop navbar + multi-column layouts above it. Tested down to
320px width with no horizontal overflow.
