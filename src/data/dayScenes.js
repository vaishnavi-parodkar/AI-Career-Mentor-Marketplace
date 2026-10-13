// Interactive "live the day" scenes, keyed by career id (same ids as dayInLife.js).
//
// Each scene is a real moment from the day with a small decision. Every option has:
//   lean:   which way of working it reflects: "focus" (solo, deep), "collab" (people) or "learn" (study / process)
//   fx:     how it moves the three meters [energy, results, trust]
// The lunch break is shared by every career and added by buildScenes().
//
// Keep `lean` honest: the end screen compares what the person leaned toward with how the
// job really splits its day (dayInLife[id].split) and says whether the fit looks natural.

export const METERS = [
  { key: "energy", label: "Energy", hint: "How much you have left in the tank" },
  { key: "results", label: "Results", hint: "Real progress on the work" },
  { key: "trust", label: "Team trust", hint: "How much people rely on you" },
];

export const START_METERS = { energy: 80, results: 10, trust: 20 };

export const LEAN_META = {
  focus: { label: "Deep focus", short: "Focus" },
  collab: { label: "Working with people", short: "People" },
  learn: { label: "Learning & process", short: "Learning" },
};

const o = (label, lean, result, energy, results, trust) => ({ label, lean, result, fx: { energy, results, trust } });
const s = (time, title, type, setup, ping, options) => ({ time, title, type, setup, ping, options });

export const lunchScene = (time) =>
  s(time, "Lunch break", "learn",
    "Your calendar finally has a gap. Your stomach has opinions, and so does your to-do list.",
    null,
    [
      o("Walk outside, no screen", "learn", "Twenty minutes of daylight and the afternoon's problem looks half the size.", 14, 2, 0),
      o("Eat at your desk and keep going", "focus", "You clear a few things, but the afternoon starts with a foggy head.", -8, 8, 0),
      o("Lunch with teammates", "collab", "You hear what the rest of the team is wrestling with, and they hear about you.", 6, 0, 12),
    ]);

const scenes = {
  "data-analyst": [
    s("9:30 AM", "Check dashboards & alerts", "learn",
      "Coffee in hand, you open the sales dashboard. Yesterday's revenue line falls off a cliff at 3 AM.",
      { from: "Monitoring bot", text: "Orders feed: no new rows for 14 hours" },
      [
        o("Trace the pipeline yourself", "focus", "A failed nightly job and a duplicate-row bug. Fixed in 40 minutes, and the dashboard snaps back to life.", -10, 16, 0),
        o("Message the data engineer", "collab", "She was already on it and thanks you for the fast heads-up. You also learn how the pipeline hangs together.", -4, 8, 12),
        o("Read the pipeline docs first", "learn", "Slower today, but you now know how this kind of failure shows up, and you'll spot it in seconds next time.", -5, 6, 4),
      ]),
    s("10:00 AM", "Daily stand-up", "collab",
      "Marketing asks for a 'quick' report by 3 PM. Your plate is already full.",
      { from: "Priya (Marketing)", text: "Can you pull campaign numbers by 3? Should be easy 🙏" },
      [
        o("Say yes and squeeze it in", "collab", "They're thrilled. Your afternoon just got a lot tighter.", -12, 6, 14),
        o("Agree a simple version now, full one Friday", "collab", "A clear scope everyone can live with. Trust goes up because you were straight with them.", -4, 10, 10),
        o("Say you'll think about it", "focus", "You protect your focus time, but marketing feels brushed off.", 2, 3, -8),
      ]),
    s("10:30 AM", "Clean and query data", "focus",
      "Two tables disagree on the customer count by 3%. Nobody has noticed yet.",
      null,
      [
        o("Dig through the joins until it matches", "focus", "Two hours of detective work reveals customers duplicated by a CRM migration. Deeply satisfying.", -16, 18, 0),
        o("Sample 100 rows and look for the pattern", "learn", "Smart: ten minutes of eyeballing shows the duplicates. You still have energy left.", -6, 14, 0),
        o("Ask the CRM owner what changed", "collab", "One message solves what hours of querying wouldn't, and she appreciates being asked.", -3, 12, 8),
      ]),
    s("2:00 PM", "Find the story in the data", "focus",
      "Churn rose 2.1 points last month. You have three hypotheses and time to test one properly.",
      null,
      [
        o("Test the pricing-change theory in Python", "focus", "The data says pricing explains half of it. You have a real answer.", -14, 16, 0),
        o("Call two support reps who hear the complaints", "collab", "They point to a confusing onboarding step no dashboard would show you.", -6, 12, 10),
        o("Read what past churn studies found", "learn", "You narrow the field and avoid a dead end, but it's still only a hypothesis.", -5, 7, 2),
      ]),
    s("4:00 PM", "Present insights to stakeholders", "collab",
      "Before your second slide, the VP asks: 'So what should we do?'",
      { from: "VP of Growth", text: "Skip to the recommendation, please." },
      [
        o("Give a clear recommendation, with caveats", "collab", "The room nods. You said what you know, and what you don't.", -8, 14, 16),
        o("Walk through the method first", "focus", "Eyes glaze over. The recommendation lands after the meeting has run out of steam.", -10, 4, -8),
        o("Promise a deeper analysis next week", "learn", "Safe, but you read as uncertain and the decision slips a week.", -4, 2, -3),
      ]),
    s("5:30 PM", "Document and plan tomorrow", "learn",
      "You could leave now. Today's best query is still sitting undocumented in your scratch tab.",
      null,
      [
        o("Document it properly", "focus", "Future-you, and everyone who inherits this, will be grateful.", -4, 10, 6),
        o("Record a 3-minute walkthrough for a teammate", "collab", "She can reuse it tomorrow and you've shared the knowledge.", -4, 6, 12),
        o("Spend 30 minutes on a window-function tutorial", "learn", "Tomorrow's queries will be shorter and cleaner.", -3, 5, 2),
      ]),
  ],

  "software-developer": [
    s("9:30 AM", "Review pull requests", "collab",
      "Three PRs are waiting. One is from a new teammate and it's 600 lines long.",
      { from: "Sam (new hire)", text: "First big PR! Would love your thoughts 🙂" },
      [
        o("Review it line by line", "focus", "You catch a missing null check and leave kind, specific notes. Sam learns a lot.", -12, 12, 12),
        o("Pair on it over a quick call", "collab", "Twenty minutes of talking replaces an hour of comments. You both leave with a plan.", -8, 10, 16),
        o("Skim now, read the style guide on reviewing", "learn", "Quicker, but you flag the wrong things and Sam is a little confused.", -4, 4, 2),
      ]),
    s("10:00 AM", "Daily stand-up", "collab",
      "Your turn. You're blocked on an API another team owns, and it's been two days.",
      null,
      [
        o("Say it plainly in stand-up and ask for help", "collab", "Their lead unblocks you before the meeting ends.", -3, 12, 12),
        o("Build a mock of the API and keep going", "focus", "You make progress alone, with a risk that the real thing differs.", -10, 10, 0),
        o("Read their API docs in more depth", "learn", "You find the endpoint you needed buried on page 4.", -5, 8, 3),
      ]),
    s("10:30 AM", "Build a feature", "focus",
      "A new REST endpoint and its React screen. You're mid-flow when a test fails for no clear reason.",
      null,
      [
        o("Stay in the zone and debug it", "focus", "An hour later it's a timezone bug. Fixed, tested, and you feel great.", -15, 18, 0),
        o("Ask a teammate to take a look", "collab", "Fresh eyes spot it in five minutes.", -4, 12, 8),
        o("Write a smaller failing test first", "learn", "Methodical. The failing test points straight at the cause.", -7, 14, 0),
      ]),
    s("2:00 PM", "Debug a production issue", "focus",
      "Users report checkout failing for some people. Logs are noisy and the clock is ticking.",
      { from: "PagerBot", text: "Error rate on /checkout: 4.2% and rising" },
      [
        o("Reproduce it locally from the logs", "focus", "You find an edge case with a coupon code. Hotfix goes out in 35 minutes.", -16, 18, 6),
        o("Open an incident channel and pull in two people", "collab", "Parallel investigation: the fix lands faster and everyone knows what's happening.", -9, 14, 14),
        o("Check recent deploys and past incidents", "learn", "A similar incident from March gives you the answer. Process pays off.", -7, 12, 4),
      ]),
    s("4:00 PM", "Planning or design discussion", "collab",
      "The product manager wants a feature 'by Friday'. You think it's two weeks of honest work.",
      null,
      [
        o("Break it into pieces and show what fits by Friday", "collab", "A shared, realistic plan. The PM appreciates the clarity.", -6, 12, 14),
        o("Go away and write a detailed estimate", "focus", "Accurate, but the meeting ends with no decision.", -6, 8, -2),
        o("Say yes and figure it out later", "collab", "Everyone is happy today. You will not be on Thursday.", -10, -4, 6),
      ]),
    s("5:15 PM", "Learn & wrap up", "learn",
      "Code is pushed. There's a new testing library everyone keeps mentioning.",
      null,
      [
        o("Try it on a toy project", "learn", "Forty minutes in, you get it. Tomorrow's tests will be nicer.", -4, 6, 2),
        o("Write up today's bug for the team wiki", "collab", "The next person with this bug has an answer waiting.", -4, 8, 12),
        o("Finish the refactor you started", "focus", "A tidier module and a clearer head for tomorrow.", -6, 10, 0),
      ]),
  ],

  "project-manager": [
    s("9:00 AM", "Review project status", "learn",
      "The board shows two tasks overdue and a third that hasn't moved in a week. Launch is in 3 weeks.",
      null,
      [
        o("Rework the plan before anyone's in", "focus", "A clear picture and an updated critical path before the first meeting.", -8, 12, 0),
        o("Message the owners and ask what's blocking them", "collab", "Two blockers surface before stand-up. People like being asked, not chased.", -5, 10, 12),
        o("Check the risk register and past retros", "learn", "You spot the same bottleneck that hit the last project and plan around it.", -4, 8, 4),
      ]),
    s("10:00 AM", "Team stand-up", "collab",
      "A developer says, quietly, 'I'm fine' while clearly not fine. The design lead is silent too.",
      null,
      [
        o("Follow up one-to-one after stand-up", "collab", "He admits he's overloaded. You rebalance the work and he's visibly relieved.", -6, 8, 18),
        o("Ask in the group: 'Anything blocking anyone?'", "collab", "Nobody speaks up. Things stay stuck for another day.", -2, 2, 0),
        o("Add it to the risk log and watch", "learn", "Tracked, but the problem grows while you watch.", -2, 2, -4),
      ]),
    s("11:00 AM", "Resolve blockers", "collab",
      "Engineering and design want opposite things for the launch. Both say it's non-negotiable.",
      { from: "Design lead", text: "We can't ship that flow. It'll confuse people." },
      [
        o("Get both in a room and ask for the user problem", "collab", "Reframed as one problem, they find a compromise in 20 minutes.", -10, 14, 16),
        o("Decide yourself and tell them", "focus", "Fast, but one side feels steamrolled.", -6, 8, -8),
        o("Gather data on how users behave first", "learn", "Evidence settles it, but it costs a day.", -5, 10, 4),
      ]),
    s("2:00 PM", "Update plan, risks & budget", "focus",
      "Spend is 12% over budget. The numbers need to make sense before 4 PM.",
      null,
      [
        o("Rebuild the forecast line by line", "focus", "You find a duplicate vendor invoice. Budget is back in range.", -12, 16, 4),
        o("Ask finance to walk through it with you", "collab", "They spot the issue immediately and appreciate the partnership.", -5, 12, 12),
        o("Check how past projects handled overruns", "learn", "A useful template, but it doesn't fix this month's number.", -4, 6, 2),
      ]),
    s("4:00 PM", "Stakeholder update", "collab",
      "The client asks, 'Are we still on track?' The honest answer is 'mostly, with one risk.'",
      { from: "Client sponsor", text: "Quick sanity check: all good?" },
      [
        o("Tell the truth and bring a mitigation plan", "collab", "They respect the candour. The risk becomes a shared problem, not a surprise.", -8, 14, 18),
        o("Say 'on track' and handle the risk quietly", "collab", "Smooth today. If the risk lands, trust will collapse.", -4, 2, -10),
        o("Promise a detailed report tomorrow", "learn", "Safe, but they hear 'something's wrong'.", -4, 4, -2),
      ]),
    s("5:30 PM", "Plan tomorrow", "learn",
      "Everyone is leaving. Follow-up notes from today's meetings aren't written yet.",
      null,
      [
        o("Send clear action items now", "focus", "Nothing falls through the cracks overnight.", -4, 10, 8),
        o("Call the dev who seemed stretched thin", "collab", "A five-minute check-in he really needed.", -4, 4, 16),
        o("Read up on a new planning technique", "learn", "A small idea for the next retro.", -3, 4, 2),
      ]),
  ],

  "product-manager": [
    s("9:30 AM", "Check product metrics", "learn",
      "Yesterday's release was meant to lift sign-ups. The number didn't move, but activation dropped.",
      { from: "Analytics", text: "Activation −3.2% since release 4.2" },
      [
        o("Dig through funnel data yourself", "focus", "The drop is on step 3 of onboarding, which the release touched.", -10, 14, 0),
        o("Ask the engineer who shipped it what she saw", "collab", "She had a hunch. Five minutes of conversation beats an hour of charts.", -4, 12, 10),
        o("Check how similar changes performed elsewhere", "learn", "A pattern from another product helps frame your hypothesis.", -5, 8, 2),
      ]),
    s("10:30 AM", "Sprint planning / stand-up", "collab",
      "Engineering says the top-priority feature is 3 sprints of work. Sales says it can't wait.",
      null,
      [
        o("Cut scope to the smallest version that tests the idea", "collab", "Engineering can say yes, and Sales gets something to show.", -8, 14, 14),
        o("Hold the line: full feature or nothing", "focus", "You protect quality and lose goodwill.", -6, 4, -8),
        o("Ask engineers what they'd cut", "collab", "They suggest a smart split you hadn't thought of.", -5, 12, 12),
      ]),
    s("12:00 PM", "User interview", "collab",
      "A customer is describing a workaround you've never heard of. You have 10 minutes left.",
      null,
      [
        o("Ask 'why' three more times", "collab", "The real problem emerges, and it's not the one on your roadmap.", -8, 16, 8),
        o("Show her the mockup and get her reaction", "focus", "She likes it politely. You learn less than you hoped.", -4, 6, 2),
        o("Take careful notes and decode them later", "learn", "A rich record. Insight comes tomorrow instead of now.", -4, 8, 2),
      ]),
    s("2:30 PM", "Write a spec & prioritize", "focus",
      "You have 14 ideas, room for 3, and strong opinions in every direction.",
      null,
      [
        o("Score each on impact vs effort", "learn", "A clear ranking that the team can argue with, which is what you wanted.", -8, 14, 4),
        o("Write the spec for your favourite first", "focus", "A crisp spec and real momentum. You hope it's the right bet.", -12, 14, 0),
        o("Ask three teammates to rank their top 3", "collab", "A surprising consensus on #1, and buy-in from the start.", -6, 12, 14),
      ]),
    s("4:00 PM", "Design review & stakeholder sync", "collab",
      "The leadership team falls in love with a flashy idea that doesn't help users.",
      { from: "CEO", text: "Love it! Can we add it to this quarter?" },
      [
        o("Show the user data and propose a test", "collab", "You turn a 'no' into a 'prove it'. They respect that.", -8, 14, 14),
        o("Agree, then quietly deprioritize it", "focus", "Avoids conflict today, a bigger problem later.", -4, 2, -8),
        o("Come back next week with a full business case", "learn", "Thorough, but you lose the moment.", -5, 8, 0),
      ]),
    s("5:30 PM", "Plan and reflect", "learn",
      "A good day, and a long list of decisions you made on partial information.",
      null,
      [
        o("Log each decision and why", "learn", "Future-you can learn from every call, right or wrong.", -3, 8, 4),
        o("Message the team with today's decisions", "collab", "Everyone is on the same page tomorrow.", -4, 6, 14),
        o("Re-read the spec once more", "focus", "A couple of small fixes before it ships.", -5, 8, 0),
      ]),
  ],

  "hr-specialist": [
    s("9:30 AM", "Check emails & requests", "learn",
      "Forty emails: payroll queries, leave requests, and one message with the subject 'Urgent, confidential'.",
      { from: "An employee", text: "Can we talk today? It's about my manager." },
      [
        o("Reply personally and book time today", "collab", "She replies with relief. You've made it safe to speak.", -8, 10, 18),
        o("Triage everything else first", "focus", "Inbox is tidy by noon, but she felt waiting for an answer.", -4, 8, -2),
        o("Check the grievance policy before replying", "learn", "You respond with the right process and the right tone.", -4, 8, 6),
      ]),
    s("10:30 AM", "Screen candidates", "focus",
      "80 resumes for 1 role. One candidate has no degree but an impressive portfolio.",
      null,
      [
        o("Shortlist on the criteria and nothing else", "focus", "Fair and fast, though you may have missed the portfolio star.", -10, 10, 0),
        o("Flag the portfolio candidate to the hiring manager", "collab", "She agrees to interview. She turns out to be excellent.", -8, 14, 12),
        o("Revisit the job requirements for must-haves", "learn", "You realise the degree isn't actually required and widen the pool.", -5, 12, 4),
      ]),
    s("12:00 PM", "Conduct interviews", "collab",
      "A nervous candidate freezes on the first question.",
      null,
      [
        o("Slow down and ask an easier warm-up", "collab", "She relaxes and shows what she can really do.", -8, 12, 14),
        o("Stick to the script for fairness", "focus", "Consistent, but you learn little.", -4, 6, 0),
        o("Note it and move on", "learn", "Efficient and a little cold.", -3, 4, -4),
      ]),
    s("2:30 PM", "Employee support", "collab",
      "An employee tells you about a conflict with her manager, and asks you not to tell anyone.",
      null,
      [
        o("Listen, explain what you can and can't keep private", "collab", "Honest about the limits of confidentiality. She trusts you for it.", -12, 12, 18),
        o("Promise full confidentiality", "collab", "She feels safe now, until you have to escalate.", -8, 4, -6),
        o("Point her to the policy document", "learn", "Correct, but cold. She leaves unsure.", -4, 4, -6),
      ]),
    s("4:00 PM", "Onboarding & documentation", "focus",
      "A new joiner starts Monday. His documents have three small errors and his laptop isn't ordered.",
      null,
      [
        o("Fix every record carefully", "focus", "Clean paperwork. Nothing to chase later.", -8, 14, 4),
        o("Call IT and the manager to coordinate", "collab", "Laptop ordered, desk assigned, a team lunch planned.", -6, 12, 12),
        o("Build a reusable onboarding checklist", "learn", "Next hire will take half the effort.", -5, 12, 6),
      ]),
    s("5:30 PM", "Wrap up", "learn",
      "Your tracker is out of date, and tomorrow has six interviews.",
      null,
      [
        o("Update the tracker properly", "focus", "Tomorrow starts calm.", -4, 10, 4),
        o("Send each interviewer a one-line briefing", "collab", "Interviewers arrive prepared, and candidates feel it.", -4, 8, 12),
        o("Read an article on structured interviewing", "learn", "A small tweak you'll use tomorrow.", -3, 5, 2),
      ]),
  ],

  "cybersecurity-analyst": [
    s("9:30 AM", "Review overnight alerts", "focus",
      "212 alerts overnight. Most are noise. A few are not.",
      { from: "SIEM", text: "HIGH: login from new country, 03:12" },
      [
        o("Triage by severity and start at the top", "focus", "You find one real credential-stuffing attempt among the noise.", -12, 16, 4),
        o("Ask the on-call analyst what she saw", "collab", "She'd already blocked two IPs, and she hands you context for the rest.", -5, 12, 12),
        o("Tune the noisy rules first", "learn", "Fewer false alarms from tomorrow on.", -6, 10, 4),
      ]),
    s("10:30 AM", "Investigate a suspicious event", "focus",
      "That foreign login belongs to a finance employee, who is currently on a plane.",
      null,
      [
        o("Trace the session in the logs", "focus", "The attacker touched an email rule and nothing else, and you catch it in time.", -16, 18, 6),
        o("Call the employee's manager now", "collab", "You get context in two minutes, and it confirms the account is compromised.", -6, 12, 10),
        o("Look up the attacker's known techniques", "learn", "A familiar pattern: you know exactly what to check next.", -8, 12, 2),
      ]),
    s("12:00 PM", "Security stand-up", "collab",
      "The CTO asks, 'Do we need to tell customers?' The room goes quiet.",
      null,
      [
        o("Lay out what's known, unknown, and the next step", "collab", "Calm and clear. The CTO decides with confidence.", -8, 12, 18),
        o("Say it's too early to tell", "focus", "True, but nobody leaves knowing what to do.", -4, 4, -4),
        o("Quote the breach-notification rules", "learn", "Accurate and useful, but a little heavy for the moment.", -5, 8, 4),
      ]),
    s("2:00 PM", "Vulnerability scanning & patching", "focus",
      "The scan finds 40 critical issues. IT can patch maybe five this week.",
      null,
      [
        o("Rank by exploitability and exposure", "focus", "A clear top five. IT knows exactly where to start.", -10, 16, 4),
        o("Sit with IT and agree the order together", "collab", "A shared plan. They own it instead of resenting it.", -6, 12, 14),
        o("Cross-check against known active exploits", "learn", "Two 'critical' items are actually being exploited right now. You move them up.", -6, 14, 4),
      ]),
    s("4:00 PM", "Advise teams", "collab",
      "A developer asks if it's really a problem to put the API key in the repo 'just for now'.",
      null,
      [
        o("Explain with a real example of what could happen", "collab", "She moves it to a secrets manager today.", -6, 12, 14),
        o("Send her the policy link", "learn", "Correct. It also gets ignored.", -2, 4, -4),
        o("Fix it for her and rotate the key", "focus", "Safe, but she learns nothing.", -8, 8, 2),
      ]),
    s("5:00 PM", "Document & learn", "learn",
      "The incident write-up is due, and a new vulnerability is trending on security Twitter.",
      null,
      [
        o("Write the incident report properly", "focus", "Clear, factual and reusable.", -5, 12, 6),
        o("Brief the team on the new vulnerability", "collab", "They'll spot it faster if it turns up.", -4, 8, 12),
        o("Read the advisory in depth", "learn", "You'll recognise it now, and your future self thanks you.", -3, 6, 2),
      ]),
  ],
};

// Public: the scenes for a career with the shared lunch scene slotted in where the
// real schedule has it. Returns null when the career has no authored scenes.
export const buildScenes = (careerId, schedule = []) => {
  const base = scenes[careerId];
  if (!base) return null;
  const lunch = schedule.find((item) => /lunch/i.test(item.title));
  if (!lunch) return base;
  const toMinutes = (t) => {
    const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(t || "");
    if (!m) return 0;
    return ((Number(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + Number(m[2]);
  };
  const lunchAt = toMinutes(lunch.time);
  const index = base.findIndex((scene) => toMinutes(scene.time) > lunchAt);
  const merged = [...base];
  merged.splice(index === -1 ? merged.length : index, 0, lunchScene(lunch.time));
  return merged;
};
