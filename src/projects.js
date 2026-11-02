import { en } from './i18n.js';
import { zonesEn, projectsEn } from './projects.en.js';
// Contenu du portfolio : un univers = une zone du monde 3D.
const c = (p, f) => `${import.meta.env.BASE_URL}captures/${p}/${f}.webp`;

export const zones = [
  {
    id: 'cyber',
    title: 'Cybersécurité',
    tagline: 'Analyste programmeur à l’Hôpital Montfort.',
    text:
      'Je conçois les outils qui protègent les données de santé, et je travaille avec les équipes sur les analyses PIA (vie privée) et TRA (menaces et risques) des fournisseurs.',
    ground: '#062a2e', ink: '#eef7f5', accent: '#2ee6c5', onAccent: '#04201f',
    projects: ['riskeo'],
  },
  {
    id: 'saas',
    title: 'Produits SaaS',
    tagline: 'Des outils métier pensés pour les équipes.',
    text: 'Tableaux de bord, pipelines commerciaux, suivi de campagnes : des applications complètes, de la base de données à l’interface.',
    ground: '#161b24', ink: '#f2efe9', accent: '#f5a524', onAccent: '#1a1206',
    projects: ['tracktarget'],
  },
  {
    id: 'web',
    title: 'Sites web',
    tagline: 'Des plateformes en ligne, pour de vrais clients.',
    text: 'Marketplaces, applications communautaires, sites vitrines : des expériences web soignées, bilingues et prêtes pour la production.',
    ground: '#e9f0fb', ink: '#0f172a', accent: '#2563eb', onAccent: '#ffffff',
    projects: ['yourmove', 'ninjawatch', 'starryone'],
  },
  {
    id: 'games',
    title: 'Jeux',
    tagline: 'Là où je m’amuse le plus.',
    text: 'Un RPG en 3D dans le navigateur, un roguelite de pirates et un MOBA sur Roblox : des mondes, des règles et des histoires.',
    ground: '#10261a', ink: '#f4efe1', accent: '#f2b950', onAccent: '#1c1405',
    projects: ['aldera', 'pavillon', 'royalog'],
  },
];

export const projects = {
  riskeo: {
    name: 'Riskéo',
    year: 'En production',
    summary: 'Plateforme de gestion des risques liés aux tiers (TPRM) pour l’Hôpital Montfort.',
    role: 'Conception et développement de A à Z, support applicatif, accompagnement des analyses PIA / TRA.',
    body: [
      'Riskéo centralise l’évaluation de sécurité des fournisseurs de l’hôpital : invitation du fournisseur, questionnaire adapté au profil de risque, analyse par les équipes PIA et TRA, décision finale et suivi de la validité.',
      'Le score de conformité, la priorisation (impact financier, patient, opérationnel, sécurité), les incidents, l’inventaire des actifs et le journal d’audit donnent une vue complète du portefeuille fournisseurs.',
    ],
    stack: ['Python', 'Django', 'Chart.js', 'WeasyPrint (rapports PDF)', 'i18n FR / EN', 'IIS'],
    highlights: ['Workflow multi-rôles : owner, analystes PIA/TRA, fournisseurs', 'Rapports PDF générés automatiquement', 'Synchronisation de scores de sécurité externes'],
    images: [c('riskeo', '01-dashboard-owner'), c('riskeo', '03-fiche-fournisseur'), c('riskeo', '00-connexion'), c('riskeo', '02-fournisseurs'), c('riskeo', '04-inventaire'), c('riskeo', '05-calendrier')],
  },
  tracktarget: {
    name: 'TrackTarget',
    year: '2023',
    summary: 'SaaS de pilotage pour les équipes marketing et commerciales.',
    role: 'Développement complet : modèle de données, tableaux de bord, messagerie d’équipe.',
    body: [
      'TrackTarget suit tout le cycle commercial : prospects, clients, projets, transactions et campagnes marketing, avec la région et l’investissement de chaque action.',
      'Le tableau de bord calcule les ventes de la semaine et du mois, leur évolution, la répartition géographique des clients et le retour sur investissement des campagnes.',
    ],
    stack: ['Python', 'Django', 'Matplotlib', 'Bootstrap 5', 'Render'],
    highlights: ['Graphiques de ventes générés côté serveur', 'Réseau d’équipe et messagerie interne', 'Carte des clients par région'],
    images: [c('tracktarget', '01-tableau-de-bord'), c('tracktarget', '02-pipeline'), c('tracktarget', '03-transactions'), c('tracktarget', '04-campagnes')],
  },
  yourmove: {
    name: 'YourMove',
    year: '2026',
    summary: 'La marketplace qui relie les clients aux déménageurs indépendants, à Montréal, Gatineau et Ottawa.',
    role: 'Conception produit et développement full-stack.',
    body: [
      'Le client compare des déménageurs vérifiés, obtient une estimation gratuite et réserve en ligne avec un acompte sécurisé. Le déménageur gère son planning, ses zones de service, ses devis et ses avis.',
      'Un panneau d’administration vérifie les documents des professionnels et suit l’activité de la plateforme.',
    ],
    stack: ['Python', 'Django', 'PostgreSQL', 'Stripe', 'Bootstrap 5', 'FR / EN'],
    highlights: ['Paiement d’acompte avec Stripe', 'Calendrier de disponibilités des déménageurs', 'Vérification des documents professionnels'],
    images: [c('yourmove', '01-accueil'), c('yourmove', '05-dashboard-demenageur'), c('yourmove', '02-recherche'), c('yourmove', '04-dashboard-client'), c('yourmove', '03-comment'), c('yourmove', '06-panel-admin')],
  },
  starryone: {
    name: 'StarryOne',
    year: '2026',
    summary: 'Refonte du site d’une firme de cybersécurité en santé, basée à Ottawa.',
    role: 'Design et développement front-end de la refonte complète.',
    body: [
      'Le nouveau site présente l’expertise de StarryOne auprès des hôpitaux et des organismes de santé : un hero animé en forme de radar, des pages claires pour chaque service et une présentation dédiée au produit Riskéo.',
      'Rapide et responsive, il a été pensé pour inspirer confiance aux équipes de sécurité et aux directions d’établissements de santé.',
    ],
    stack: ['React 19', 'TypeScript', 'Vite', 'Animations CSS / SVG'],
    highlights: ['Hero radar animé', 'Pages produit pour Riskéo', 'Design sobre pensé pour le milieu de la santé'],
    images: [c('starryone', '01-accueil'), c('starryone', '02-riskeo'), c('starryone', '03-hopital'), c('starryone', '04-mission'), c('starryone', '05-contact')],
  },
  ninjawatch: {
    name: 'NinjaWatch',
    year: '2026',
    summary: 'Le dojo des fans d’anime : suivre ses séries, gagner de l’XP et discuter avec Kai, un compagnon IA.',
    role: 'Conception et développement full-stack, de l’API à l’assistant IA.',
    body: [
      'NinjaWatch transforme une simple watchlist en aventure : catalogue relié à AniList, bibliothèque personnelle avec progression par épisode, notes, objectifs à échéance, niveaux, XP et badges à débloquer.',
      'Kai, le compagnon IA, connaît la bibliothèque de l’utilisateur (RAG sur pgvector, modèle local avec Ollama). Il suggère quoi regarder et peut proposer des actions, que l’utilisateur confirme avant qu’elles soient appliquées.',
    ],
    stack: ['Django REST', 'React + TypeScript', 'React Query', 'PostgreSQL + pgvector', 'Ollama (IA locale)', 'API AniList'],
    highlights: ['Gamification : XP, niveaux, badges, objectifs', 'Assistant IA avec actions confirmées par l’utilisateur', 'Construit par phases, avec tests à chaque étape'],
    images: [c('ninjawatch', '02-dashboard'), c('ninjawatch', '01-landing'), c('ninjawatch', '03-catalog'), c('ninjawatch', '04-library'), c('ninjawatch', '05-goals')],
    note: 'Captures prises avec des données de démonstration (titres et affiches fictifs).',
  },
  aldera: {
    name: 'Échos d’Aldera',
    year: '2026',
    summary: 'Un action-RPG fantasy en 3D qui tourne directement dans le navigateur.',
    role: 'Conception du jeu, programmation, monde 3D et interface.',
    body: [
      'Le joueur incarne Kael dans la vallée d’Aldera : forêts, mines, village de Brumehaut, quêtes, dialogues, ennemis et attaques spéciales, le tout en temps réel avec Three.js.',
      'Au cœur du jeu, le Refuge d’Aldera : une base à reconstruire sur 5 niveaux (forge, salle d’entraînement, cuisine, alchimie, expéditions). Le jeu est bilingue, sauvegarde la partie et baisse sa qualité graphique tout seul si l’image ralentit.',
    ],
    stack: ['JavaScript', 'Three.js', 'Post-traitement (lueur, étalonnage)', 'FR / EN', 'Hors ligne'],
    highlights: ['Environ 11 600 lignes de JavaScript', 'Base évolutive sur 5 niveaux', 'Qualité graphique adaptative'],
    images: [c('aldera', '02-foret'), c('aldera', '01-titre'), c('aldera', '03-mines'), c('aldera', '04-lisiere'), c('aldera', '05-village')],
  },
  pavillon: {
    name: 'Pavillon Noir',
    year: '2026',
    summary: 'Un roguelite de piraterie dans les Caraïbes de 1715, où une roue décide de ton destin.',
    role: 'Conception du jeu, programmation et direction artistique.',
    body: [
      'Tout commence par la roue : elle crée ton capitaine, ton navire et ton équipage. Il faut ensuite traverser sept mers, entre escales, tempêtes et abordages, pour atteindre Atlantis.',
      'Chaque partie est différente, et le Coffre des Légendes garde les reliques débloquées d’une partie à l’autre. Le jeu tient dans un seul fichier et se partage en un clic avec un lien sécurisé, pour jouer sur téléphone ou entre amis.',
    ],
    stack: ['JavaScript', 'Canvas 2D', 'Un seul fichier HTML', 'Partage via Cloudflare Tunnel'],
    highlights: ['Génération aléatoire à chaque partie', 'Progression persistante (Coffre des Légendes)', 'Jouable sur ordinateur et mobile'],
    images: [c('pavillon', '02-roue'), c('pavillon', '01-accueil'), c('pavillon', '03-escale'), c('pavillon', '04-tempete'), c('pavillon', '05-relique')],
  },
  royalog: {
    name: 'RoyalOG',
    year: '2026',
    summary: 'Un MOBA 3 contre 3 sur Roblox : trois voies, des tours, une jungle et un nexus à détruire.',
    role: 'Conception du jeu et programmation complète en Luau.',
    body: [
      'Deux équipes de trois choisissent leurs héros lors d’une phase de draft, puis s’affrontent sur une carte à trois voies. Sbires par vagues, tours, camps de jungle, économie d’or et boutique de pouvoirs : toutes les règles d’un MOBA, recodées pour Roblox.',
      'Chaque héros, inspiré de grandes figures de super-héros, a son propre kit de compétences. Une IA de bots complète les équipes et une caméra spectateur suit la partie. Le jeu garde aussi un mode battle royale, son mode d’origine.',
    ],
    stack: ['Roblox Studio', 'Luau', 'Rojo', 'Architecture client / serveur'],
    highlights: ['Environ 16 000 lignes de Luau', 'IA de bots et mode spectateur', 'Draft, kits de héros et économie d’or'],
    images: [c('royalog', '01-carte'), c('royalog', '02-draft')],
    note: 'Visuels d’illustration : schéma de la carte et écran de draft.',
  },
};

// Version anglaise
if (en) {
  zones.forEach((z) => Object.assign(z, zonesEn[z.id]));
  for (const [id, p] of Object.entries(projectsEn)) Object.assign(projects[id], p);
}
