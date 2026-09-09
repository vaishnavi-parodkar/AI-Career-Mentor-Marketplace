// Mock career dataset. Replace with API calls to Spring Boot backend later
// via services/api.js — shape should remain identical.

export const careers = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    match: 87,
    tagline: "Turn raw data into decisions",
    description:
      "Data Analysts collect, clean and interpret data sets to help organizations make informed decisions. You'll work with dashboards, statistics and storytelling through numbers.",
    skills: ["SQL", "Excel", "Python", "Data Visualization", "Statistics"],
    responsibilities: [
      "Collect and clean data from multiple sources",
      "Build dashboards and reports for stakeholders",
      "Identify trends, patterns and anomalies",
      "Present insights to non-technical teams",
    ],
    growth: "Data Analyst → Senior Analyst → Analytics Manager → Head of Analytics",
    salaryRange: "₹5 LPA – ₹14 LPA",
    market: {
      avgSalary: "₹8.2 LPA",
      demand: "Very High",
      topLocation: "Bengaluru",
      globalOpportunities: 78,
    },
    scores: { analytical: 92, technical: 70, communication: 65, leadership: 40 },
  },
  {
    id: "software-developer",
    title: "Software Developer",
    match: 97,
    tagline: "Build the products people use every day",
    description:
      "Software Developers design, build and maintain applications and systems. Strong logical thinking and continuous learning are key to thriving in this fast-moving field.",
    skills: ["JavaScript", "Java", "React", "Data Structures", "System Design"],
    responsibilities: [
      "Write clean, maintainable and efficient code",
      "Collaborate with designers and product managers",
      "Debug and optimize existing applications",
      "Participate in code reviews and testing",
    ],
    growth: "Junior Developer → Software Engineer → Senior Engineer → Tech Lead",
    salaryRange: "₹6 LPA – ₹24 LPA",
    market: {
      avgSalary: "₹11.5 LPA",
      demand: "Very High",
      topLocation: "Pune",
      globalOpportunities: 92,
    },
    scores: { analytical: 85, technical: 95, communication: 55, leadership: 50 },
  },
  {
    id: "project-manager",
    title: "Project Manager",
    match: 78,
    tagline: "Lead teams from idea to delivery",
    description:
      "Project Managers plan, coordinate and deliver projects on time and within budget. You'll balance people, priorities and timelines to keep teams moving forward.",
    skills: ["Planning", "Agile/Scrum", "Communication", "Risk Management", "Budgeting"],
    responsibilities: [
      "Define project scope, timelines and milestones",
      "Coordinate cross-functional teams",
      "Track progress and manage risks",
      "Communicate status to stakeholders",
    ],
    growth: "Associate PM → Project Manager → Program Manager → Director of PMO",
    salaryRange: "₹7 LPA – ₹20 LPA",
    market: {
      avgSalary: "₹12 LPA",
      demand: "High",
      topLocation: "Mumbai",
      globalOpportunities: 65,
    },
    scores: { analytical: 60, technical: 45, communication: 90, leadership: 88 },
  },
  {
    id: "product-manager",
    title: "Product Manager",
    match: 74,
    tagline: "Shape products people love",
    description:
      "Product Managers bridge business, design and engineering to build products that solve real user problems while meeting business goals.",
    skills: ["Product Strategy", "User Research", "Roadmapping", "Analytics", "Communication"],
    responsibilities: [
      "Define product vision and roadmap",
      "Prioritize features based on user and business value",
      "Work closely with engineering and design",
      "Analyze product metrics and user feedback",
    ],
    growth: "APM → Product Manager → Senior PM → VP of Product",
    salaryRange: "₹9 LPA – ₹28 LPA",
    market: {
      avgSalary: "₹15 LPA",
      demand: "High",
      topLocation: "Bengaluru",
      globalOpportunities: 70,
    },
    scores: { analytical: 75, technical: 60, communication: 85, leadership: 80 },
  },
  {
    id: "hr-specialist",
    title: "HR Specialist",
    match: 61,
    tagline: "Build great workplaces and teams",
    description:
      "HR Specialists manage recruitment, employee relations and workplace culture, ensuring organizations attract and retain great talent.",
    skills: ["Recruitment", "Communication", "Conflict Resolution", "Labor Law", "Empathy"],
    responsibilities: [
      "Manage hiring and onboarding processes",
      "Handle employee relations and grievances",
      "Design engagement and retention programs",
      "Ensure compliance with labor policies",
    ],
    growth: "HR Executive → HR Specialist → HR Manager → Head of HR",
    salaryRange: "₹4 LPA – ₹12 LPA",
    market: {
      avgSalary: "₹6.5 LPA",
      demand: "Moderate",
      topLocation: "Delhi NCR",
      globalOpportunities: 40,
    },
    scores: { analytical: 45, technical: 30, communication: 92, leadership: 70 },
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    match: 69,
    tagline: "Protect systems from evolving threats",
    description:
      "Cybersecurity Analysts monitor, detect and respond to security threats, keeping an organization's systems, networks and data safe.",
    skills: ["Network Security", "Ethical Hacking", "SIEM Tools", "Risk Assessment", "Linux"],
    responsibilities: [
      "Monitor networks for suspicious activity",
      "Perform vulnerability assessments",
      "Respond to and investigate security incidents",
      "Implement security policies and best practices",
    ],
    growth: "Security Analyst → Senior Analyst → Security Architect → CISO",
    salaryRange: "₹6 LPA – ₹22 LPA",
    market: {
      avgSalary: "₹10.8 LPA",
      demand: "Very High",
      topLocation: "Hyderabad",
      globalOpportunities: 85,
    },
    scores: { analytical: 88, technical: 90, communication: 50, leadership: 45 },
  },
];

export const getCareerById = (id) => careers.find((c) => c.id === id);
