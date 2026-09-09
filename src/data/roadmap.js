export const roadmapStages = [
  {
    id: "current-level",
    title: "Current Level",
    description: "Where you stand today based on your assessment and profile.",
    status: "complete",
  },
  {
    id: "skill-development",
    title: "Skill Development",
    description: "Close skill gaps with focused, bite-sized learning.",
    status: "in-progress",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Apply your skills to real, portfolio-worthy projects.",
    status: "upcoming",
  },
  {
    id: "interview-prep",
    title: "Interview Preparation",
    description: "Practice with mock interviews and structured feedback.",
    status: "upcoming",
  },
  {
    id: "job-ready",
    title: "Job Ready",
    description: "Polished resume, portfolio and interview skills — ready to apply.",
    status: "upcoming",
  },
];

export const skillGap = {
  career: "Software Developer",
  current: [
    { name: "JavaScript", level: 70 },
    { name: "HTML/CSS", level: 80 },
    { name: "Git", level: 60 },
  ],
  required: [
    { name: "JavaScript", level: 90 },
    { name: "HTML/CSS", level: 85 },
    { name: "Git", level: 75 },
    { name: "Data Structures", level: 80 },
    { name: "System Design", level: 60 },
  ],
  recommended: [
    "Data Structures & Algorithms",
    "System Design Fundamentals",
    "React Advanced Patterns",
    "SQL & Database Design",
  ],
};

export const interviewQuestions = [
  "Tell me about yourself and why you're interested in this role.",
  "Describe a challenging problem you solved recently. How did you approach it?",
  "How do you prioritize tasks when working on multiple projects?",
  "What is your process for learning a new technology or skill quickly?",
  "Tell me about a time you disagreed with a teammate. How did you handle it?",
];
