const mentorImages = {
  // DiceBear's Notionists style gives the AI personas a polished, illustrated
  // identity rather than making them look like real human coaches.
  "data-analyst-mentor": "https://api.dicebear.com/9.x/notionists/svg?seed=Meera&backgroundColor=e8eedc&radius=50",
  "software-developer-mentor": "https://api.dicebear.com/9.x/notionists/svg?seed=Rohan&backgroundColor=d7eee6&radius=50",
  "product-manager-mentor": "https://api.dicebear.com/9.x/notionists/svg?seed=Ananya&backgroundColor=f8d9d3&radius=50",
  "hr-mentor": "https://api.dicebear.com/9.x/notionists/svg?seed=Sanya&backgroundColor=f5e7bd&radius=50",
  "cybersecurity-mentor": "https://api.dicebear.com/9.x/notionists/svg?seed=Kabir&backgroundColor=dce5e8&radius=50",
  "hardware-engineer-mentor": "https://api.dicebear.com/9.x/notionists/svg?seed=Devansh&backgroundColor=e6ddf1&radius=50",
};

export const getMentorImage = (mentor) => mentorImages[mentor?.id] || mentor?.image;
