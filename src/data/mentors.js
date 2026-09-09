// Mock AI mentor dataset.

export const mentors = [
  {
    id: "data-analyst-mentor",
    name: "Meera",
    profession: "Data Analyst Mentor",
    avatarColor: "#0A634D",
    initials: "M",
    description:
      "Helps you break into data analytics — from SQL basics to building your first dashboard.",
    topics: [
      "Career Guidance",
      "Skill Development",
      "Project Ideas",
      "Interview Preparation",
      "Industry Insight",
    ],
  },
  {
    id: "software-developer-mentor",
    name: "Rohan",
    profession: "Software Developer Mentor",
    avatarColor: "#064C3B",
    initials: "R",
    description:
      "A senior engineer persona who guides you through DSA, system design and real-world projects.",
    topics: [
      "Career Guidance",
      "Skill Development",
      "Project Ideas",
      "Interview Preparation",
      "Industry Insight",
    ],
  },
  {
    id: "product-manager-mentor",
    name: "Ananya",
    profession: "Product Manager Mentor",
    avatarColor: "#AABF78",
    initials: "A",
    description:
      "Guides aspiring PMs on product thinking, roadmaps and cracking PM interviews.",
    topics: [
      "Career Guidance",
      "Skill Development",
      "Project Ideas",
      "Interview Preparation",
      "Industry Insight",
    ],
  },
  {
    id: "hr-mentor",
    name: "Sanya",
    profession: "HR Mentor",
    avatarColor: "#E9877B",
    initials: "S",
    description:
      "Shares insights on recruitment, workplace culture and building a career in HR.",
    topics: [
      "Career Guidance",
      "Skill Development",
      "Interview Preparation",
      "Industry Insight",
    ],
  },
  {
    id: "cybersecurity-mentor",
    name: "Kabir",
    profession: "Cybersecurity Mentor",
    avatarColor: "#20312B",
    initials: "K",
    description:
      "Walks you through ethical hacking basics, certifications and security career paths.",
    topics: [
      "Career Guidance",
      "Skill Development",
      "Project Ideas",
      "Interview Preparation",
    ],
  },
  {
    id: "hardware-engineer-mentor",
    name: "Devansh",
    profession: "Hardware Engineer Mentor",
    avatarColor: "#0A634D",
    initials: "D",
    description:
      "Guides students through embedded systems, VLSI basics and hardware career tracks.",
    topics: [
      "Career Guidance",
      "Skill Development",
      "Project Ideas",
      "Industry Insight",
    ],
  },
];

export const getMentorById = (id) => mentors.find((m) => m.id === id);

// Simple canned response generator to simulate an AI mentor reply.
export const getMockMentorReply = (mentor, userMessage) => {
  const text = userMessage.toLowerCase();
  if (text.includes("skill") || text.includes("learn")) {
    return `Great question. As a ${mentor.profession}, I'd suggest starting with the fundamentals and building one small project every 2 weeks to apply what you learn. Want a roadmap for that?`;
  }
  if (text.includes("interview")) {
    return `For interviews in this field, focus on explaining your thought process clearly, not just the final answer. Want to try a quick mock question?`;
  }
  if (text.includes("project")) {
    return `A good starter project would be something small but end-to-end — it shows recruiters you can ship, not just learn theory. Want a few ideas tailored to your level?`;
  }
  if (text.includes("salary") || text.includes("pay")) {
    return `Salaries vary by city and experience, but check the Career Market Insights page for real numbers in this field — I can help you interpret them.`;
  }
  return `That's a fair point. Tell me a bit more about where you currently stand, and I'll tailor my advice specifically for you.`;
};
