# Pathwise: how the 32 features are implemented

## Run it
1. Backend: set the variables in `backend/.env.example`, then `cd backend && ./mvnw spring-boot:run` (Java 26, MySQL).
   Tables are created automatically (`ddl-auto=update`); mentors are seeded on first start.
2. Frontend: `npm install && npm run dev` (set `VITE_API_URL` if the backend is not on localhost:8080).
3. Sign up, or log in with the `ADMIN_EMAIL` account to see the **Admin** tab.

**The backend was written without being compiled** (the build environment had no Maven Central access).
Run `./mvnw -q compile` first; if anything fails, the error will point at one file. The frontend was built
with `npm run build` successfully.

## What changed in the architecture
| Area | What was added |
|---|---|
| Auth | Real JWT (HS256). Login/signup return a token; every `/api/**` call except auth and public career reads needs `Authorization: Bearer ...`. `ADMIN` role. Endpoints that put a user id in the URL (profile, recommendations, roadmaps, skill-gap, skill-assessment results) reject other users' ids. |
| AI gateway | `ai/AiGatewayService`: Gemini -> UnoRouter -> Hugging Face -> Cohere -> Groq. Timeouts, one retry on 5xx, cooldown on 429, 10-minute disable on bad keys, JSON-schema downgrade, response cache, usage log. The old Groq skill-gap, roadmap and mock-interview services now go through it. |
| Embeddings | `ai/EmbeddingService`: Voxell Forge -> Cohere embed -> local hashed matcher; optional Cohere rerank. Document vectors cached. |
| Data | New tables: bookings, follow_up_tasks, notifications, mentor_content, resume_analyses, interview_sessions, simulation_results, user_badges, skill_progress, ai_usage_logs. Mentor gained marketplace fields. |

## Feature map
| # | Feature | Where |
|---|---|---|
| 1 | Registration, login, profile | existing + JWT (`security/`, `AuthController`) |
| 2-4 | Assessment, results, recommendations | existing (unchanged, deterministic) |
| 5 | Market insights | `MarketInsightService`, `LiveMarket.jsx` (skill demand counted from live job listings) + existing static trends |
| 6 | Career comparison | existing |
| 7 | Skill assessment / readiness | existing |
| 8 | AI skill-gap analysis | existing, now via gateway |
| 9 | Roadmaps | existing, now via gateway |
| 10 | Readiness dashboard | `ProgressService.dashboard`, `PlatformProgress.jsx` |
| 11 | Mentor marketplace | `MarketplaceController`, `MentorSeedRunner` (6 AI mentor personas), `MentorMarketplace.jsx` |
| 12 | Smart search + semantic matching | `MentorSearchService` (filters, embeddings, rerank) |
| 13 | Match scores + explanations | same; reasons shown on `MentorCard` |
| 14 | Floating AI chat, collapsible sidebar | `FloatingAssistant.jsx` (every page), `AiChatService.assistant`; mentor chat in `MentorChat.jsx` |
| 15 | Career simulations | existing `DayInLife.jsx` (choices now saved) |
| 16 | Behavioural pattern analysis | `BehaviorAnalysisService` (counts from saved choices + assessment; AI only words it) |
| 17 | Job listings, fresher/experienced | `JobService` (Arbeitnow, Jobicy, Himalayas, The Muse, Adzuna India with keys), `Jobs.jsx` |
| 18 | Resume analysis, ATS | `ResumeService` (PDF/DOCX/TXT, local ATS scoring, AI suggestions), `ResumeAnalysis.jsx` |
| 19 | Automatic skill progress | `ProgressService.onStepChanged`, called when a roadmap step is ticked |
| 20 | Badges | `ProgressService.evaluateBadges` (12 badges, persisted, notifications) |
| 21 | Full-screen mock interview + speech-to-text | existing full-screen flow + browser Web Speech API button (Chrome/Edge) |
| 22 | Interview tracking | `InterviewHistoryService`, trend chart on Progress |
| 23 | PDF / CSV reports | `ReportService` (PDFBox + CSV, generated locally), buttons on Progress |
| 24 | Multilingual | `i18n/` (English, Hindi, Marathi UI for navigation and new pages); AI replies in the chosen language |
| 25 | Session prep, summaries, follow-up tasks | `BookingService`, `Sessions.jsx` |
| 26 | Learning resources, certifications | `LearningResourceService` + `learning-resources.json`, `Learning.jsx` |
| 27 | Mentor knowledge assistant | `MentorContent` (admin-approved) retrieved by embeddings and given to mentor chat |
| 28 | Next-best-action | `NextBestActionService`, shown on Home and Progress |
| 29 | AI fallback | `AiGatewayService` + offline replies in every AI feature |
| 30 | Persistence | interview, simulation, resume, booking, skill, badge tables |
| 31 | Notifications | `NotificationService`, bell in navbar, optional Resend email |
| 32 | Admin dashboard | `AdminController`, `Admin.jsx` (stats, AI monitoring, users/roles, mentor content, mentors, announcements) |

## Where I deliberately differed from the API shortlist
- **Google Calendar**: a real Calendar API integration needs per-user Google OAuth. Instead, each booking gives an
  "Add to Google Calendar" link and a downloadable `.ics` file. No Google credentials needed.
- **Speech-to-text**: uses the browser's built-in recognition (free). Gladia / Hugging Face Whisper were not added.
- **PDF reports**: PDFBox in the backend, not PDFMint / iLovePDF / RenderPDF.
- **Not integrated** (no confirmed public API found, or unnecessary): MessengerX.io, NLP Cloud, Eden, AI/ML API,
  Jobvetta, JOA, CV-Job-Match, Salary API, HireLayer, Careerjet, Clerk/Auth0/Neon, Square, Trello, OneSignal,
  Perspective, SearXNG. Resume parsing and matching are done locally instead.
- **Payments**: not part of your 32 features, so bookings are free. Add an India-supported gateway before charging.
- **Mentors are AI personas** (as in your original idea). Real human mentors would be added by an admin.

## Things to verify before relying on it
- Gemini `gemini-2.5-flash` and the Hugging Face / Cohere default model names can be retired or change their
  free tier; override with `GEMINI_MODEL`, `HF_MODEL`, `COHERE_CHAT_MODEL`. UnoRouter has no default model: set `UNOROUTER_MODEL`.
- Voxell, UnoRouter and Cohere endpoints were taken from their public docs/listings; confirm with one test call.
- Job boards are mostly remote/global. India coverage improves a lot with `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`.
- Older endpoints that read `userId` from the request body (assessment submit, roadmap generate) now need a valid token
  but do not yet check the body's id against the token. Say if you want that tightened.
- Learning-resource links and fees change; they are curated, not live.
- No automated tests were added.
