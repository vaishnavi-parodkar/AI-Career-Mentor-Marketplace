export const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "One number (0-9)", test: (p) => /\d/.test(p) },
  { id: "sym", label: "One special symbol (e.g. ! @ # $ %)", test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];
export const validatePassword = (p = "") => {
  const failed = PASSWORD_RULES.filter((r) => !r.test(p));
  return failed.length ? "Password must have 8+ characters with an uppercase letter, lowercase letter, number and special symbol." : "";
};
