// Version anglaise : remplace les champs textuels de projects.js.
export const zonesEn = {
  cyber: { title: 'Cybersecurity', tagline: 'Programmer analyst at Hôpital Montfort.', text: 'I design the tools that protect health data, and I work with the teams on vendor PIA (privacy) and TRA (threat and risk) assessments.' },
  saas: { title: 'SaaS products', tagline: 'Business tools built for teams.', text: 'Dashboards, sales pipelines, campaign tracking: complete applications, from the database to the interface.' },
  web: { title: 'Websites', tagline: 'Online platforms, for real clients.', text: 'Marketplaces, community apps, showcase sites: polished web experiences, bilingual and production-ready.' },
  games: { title: 'Games', tagline: 'Where I have the most fun.', text: 'A 3D RPG in the browser, a pirate roguelite and a MOBA on Roblox: worlds, rules and stories.' },
};

export const projectsEn = {
  riskeo: {
    year: 'In production',
    summary: 'Third-party risk management (TPRM) platform for Hôpital Montfort.',
    role: 'Designed and built from A to Z, application support, help with PIA / TRA assessments.',
    body: [
      'Riskéo centralizes the security assessment of the hospital’s vendors: vendor invitation, a questionnaire adapted to the risk profile, review by the PIA and TRA teams, final decision and validity tracking.',
      'The compliance score, prioritization (financial, patient, operational and security impact), incidents, asset inventory and audit log give a complete view of the vendor portfolio.',
    ],
    stack: ['Python', 'Django', 'Chart.js', 'WeasyPrint (PDF reports)', 'i18n FR / EN', 'IIS'],
    highlights: ['Multi-role workflow: owner, PIA/TRA analysts, vendors', 'Automatically generated PDF reports', 'Sync of external security scores'],
  },
  tracktarget: {
    summary: 'A SaaS to steer marketing and sales teams.',
    role: 'Full development: data model, dashboards, team messaging.',
    body: [
      'TrackTarget follows the whole sales cycle: leads, clients, projects, deals and marketing campaigns, with the region and investment of each action.',
      'The dashboard computes weekly and monthly sales, their trend, the geographic spread of clients and the return on investment of campaigns.',
    ],
    highlights: ['Sales charts generated server-side', 'Team network and internal messaging', 'Client map by region'],
  },
  yourmove: {
    summary: 'The marketplace connecting clients with independent movers in Montréal, Gatineau and Ottawa.',
    role: 'Product design and full-stack development.',
    body: [
      'Clients compare verified movers, get a free estimate and book online with a secure deposit. Movers manage their schedule, service areas, quotes and reviews.',
      'An admin panel verifies professionals’ documents and monitors platform activity.',
    ],
    highlights: ['Deposit payment with Stripe', 'Movers’ availability calendar', 'Verification of professional documents'],
  },
  ninjawatch: {
    summary: 'The dojo for anime fans: track your series, earn XP and chat with Kai, an AI companion.',
    role: 'Design and full-stack development, from the API to the AI assistant.',
    body: [
      'NinjaWatch turns a plain watchlist into an adventure: a catalog connected to AniList, a personal library with per-episode progress, ratings, goals with deadlines, levels, XP and badges to unlock.',
      'Kai, the AI companion, knows the user’s library (RAG on pgvector, local model with Ollama). It suggests what to watch and can propose actions that the user confirms before they are applied.',
    ],
    stack: ['Django REST', 'React + TypeScript', 'React Query', 'PostgreSQL + pgvector', 'Ollama (local AI)', 'AniList API'],
    highlights: ['Gamification: XP, levels, badges, goals', 'AI assistant with user-confirmed actions', 'Built in phases, with tests at every step'],
    note: 'Screenshots taken with demo data (fictional titles and posters).',
  },
  starryone: {
    summary: 'Redesign of the website of a healthcare cybersecurity firm based in Ottawa.',
    role: 'Design and front-end development of the full redesign.',
    body: [
      'The new site presents StarryOne’s expertise to hospitals and healthcare organizations: an animated radar hero, clear pages for each service and a dedicated presentation of the Riskéo product.',
      'Fast and responsive, it was designed to inspire trust in security teams and healthcare leadership.',
    ],
    stack: ['React 19', 'TypeScript', 'Vite', 'CSS / SVG animations'],
    highlights: ['Animated radar hero', 'Product pages for Riskéo', 'Clean design for the healthcare sector'],
  },
  aldera: {
    summary: 'A 3D fantasy action RPG that runs right in the browser.',
    role: 'Game design, programming, 3D world and interface.',
    body: [
      'The player is Kael in the valley of Aldera: forests, mines, the village of Brumehaut, quests, dialogue, enemies and special attacks, all in real time with Three.js.',
      'At the heart of the game is the Refuge of Aldera: a base to rebuild over 5 levels (forge, training hall, kitchen, alchemy, expeditions). The game is bilingual, saves progress and lowers its graphics quality on its own when the frame rate drops.',
    ],
    stack: ['JavaScript', 'Three.js', 'Post-processing (bloom, grading)', 'FR / EN', 'Works offline'],
    highlights: ['About 11,600 lines of JavaScript', 'A base that grows over 5 levels', 'Adaptive graphics quality'],
  },
  pavillon: {
    summary: 'A pirate roguelite in the Caribbean of 1715, where a wheel decides your fate.',
    role: 'Game design, programming and art direction.',
    body: [
      'It all starts with the wheel: it creates your captain, your ship and your crew. Then you must cross seven seas, between ports of call, storms and boardings, to reach Atlantis.',
      'Every run is different, and the Chest of Legends keeps the relics unlocked from one run to the next. The game fits in a single file and can be shared in one click with a secure link, to play on a phone or with friends.',
    ],
    stack: ['JavaScript', 'Canvas 2D', 'A single HTML file', 'Sharing via Cloudflare Tunnel'],
    highlights: ['Procedural generation on every run', 'Persistent progression (Chest of Legends)', 'Playable on desktop and mobile'],
  },
  royalog: {
    summary: 'A 3v3 MOBA on Roblox: three lanes, towers, a jungle and a nexus to destroy.',
    role: 'Game design and all programming in Luau.',
    body: [
      'Two teams of three pick their heroes in a draft phase, then clash on a three-lane map. Minion waves, towers, jungle camps, a gold economy and a power shop: all the rules of a MOBA, rebuilt for Roblox.',
      'Each hero, inspired by great superhero figures, has its own skill kit. Bot AI fills the teams and a spectator camera follows the match. The game also keeps a battle royale mode, its original mode.',
    ],
    stack: ['Roblox Studio', 'Luau', 'Rojo', 'Client / server architecture'],
    highlights: ['About 16,000 lines of Luau', 'Bot AI and spectator mode', 'Draft, hero kits and gold economy'],
    note: 'Illustrative visuals: map diagram and draft screen.',
  },
};
