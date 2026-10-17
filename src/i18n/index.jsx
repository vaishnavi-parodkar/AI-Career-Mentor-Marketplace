import { createContext, useCallback, useContext, useMemo, useState } from "react";

// UI text for the navigation and the new feature pages. Anything missing falls back to English.
// AI answers are translated by the backend (the selected language is sent with each AI request).
const dictionary = {
  en: {
    "nav.home": "Home", "nav.careers": "Careers", "nav.mentors": "Mentors", "nav.roadmap": "Roadmap",
    "nav.progress": "Progress", "nav.jobs": "Jobs", "nav.resume": "Resume", "nav.practice": "Interview",
    "nav.sessions": "Sessions", "nav.learning": "Learning", "nav.admin": "Admin",
    "assistant.title": "AI assistant", "assistant.placeholder": "Ask about careers, skills, resumes...",
    "assistant.send": "Send", "assistant.hello": "Hi! I can help with careers, your roadmap, resume, interviews and mentors.",
    "common.loading": "Loading...", "common.search": "Search", "common.download": "Download",
    "notif.title": "Notifications", "notif.markAll": "Mark all read", "notif.empty": "You are all caught up.",
    "jobs.title": "Job listings", "jobs.fresher": "Fresher", "jobs.experienced": "Experienced", "jobs.all": "All",
    "resume.title": "Resume analysis", "mentors.title": "Find your mentor", "learning.title": "Learning and certifications",
    "sessions.title": "My mentor sessions", "next.title": "Your next best actions",
    "reports.title": "Download your progress report",
  },
};

export const LANGUAGES = [{ code: "en", label: "English" }];

const LanguageContext = createContext({ language: "en", setLanguage: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => dictionary[language]?.[key] ?? dictionary.en[key] ?? key,
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
