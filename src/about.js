// Section « À propos » (tirée du CV), téléchargement du CV et mini formulaire de contact.
import { t, en } from './i18n.js';

const base = import.meta.env.BASE_URL;
const cvUrl = `${base}cv/${en ? 'Miled-Cherif-Resume-EN.pdf' : 'Miled-Cherif-CV-FR.pdf'}`;
const EMAIL = 'mod.cherif@gmail.com';

const experience = [
  {
    when: t('Mai 2026 – aujourd’hui', 'May 2026 – present'),
    role: t('Analyste programmeur', 'Programmer Analyst'),
    where: t('Hôpital Montfort, Ottawa · après un stage en TI et cybersécurité', 'Montfort Hospital, Ottawa · hired after an IT and cybersecurity internship'),
    points: [
      t('Plateforme web de gestion des risques, des contrôles et de la conformité.', 'Web platform for managing risks, controls and compliance.'),
      t('Authentification, rôles et permissions, journalisation complète des activités.', 'Authentication, roles and permissions, full activity logging.'),
      t('Intégration d’API de cybersécurité : URLScan, XposedOrNot, Have I Been Pwned.', 'Cybersecurity API integrations: URLScan, XposedOrNot, Have I Been Pwned.'),
      t('Interfaces bilingues, déploiement et amélioration continue sur Windows / IIS.', 'Bilingual interfaces, deployment and continuous improvement on Windows / IIS.'),
    ],
  },
  {
    when: t('Févr. – juil. 2023', 'Feb. – July 2023'),
    role: t('Développeur junior', 'Junior Developer'),
    where: t('TimeLapse, Sousse (Tunisie)', 'TimeLapse, Sousse (Tunisia)'),
    points: [t('Développement et déploiement d’une plateforme technique, dont TrackTarget.', 'Built and deployed a technical platform, including TrackTarget.')],
  },
  {
    when: t('Été 2022', 'Summer 2022'),
    role: t('Stagiaire', 'Intern'),
    where: t('UL Upper Link, Tunisie', 'UL Upper Link, Tunisia'),
    points: [t('Documentation technique et suivi de projet en équipe.', 'Technical documentation and project tracking with the team.')],
  },
];
const education = [
  { when: '2023 – 2026', what: t('AEC, Architecture et gestion de réseaux', 'AEC, Network Architecture and Management'), where: t('Cégep de l’Outaouais, Gatineau · diplômé', 'Cégep de l’Outaouais, Gatineau · graduated') },
  { when: '2020 – 2023', what: t('Licence en informatique, génie logiciel', 'Bachelor’s in Computer Science, Software Engineering'), where: t('École Polytechnique de Sousse · projet de fin d’études mention Très bien', 'École Polytechnique de Sousse · final project with high distinction') },
];
const skills = [
  [t('Développement', 'Development'), ['Python', 'Django', 'JavaScript', 'TypeScript', 'SQL', 'HTML / CSS']],
  [t('Cybersécurité', 'Cybersecurity'), [t('Évaluation des risques', 'Risk assessment'), t('Contrôle d’accès', 'Access control'), t('Journaux d’audit', 'Audit logs'), 'NIST', 'ISO', 'HIPAA', 'PHIPA', t('RGPD', 'GDPR')]],
  [t('Réseautique', 'Networking'), ['VLAN', t('Routage inter-VLAN', 'Inter-VLAN routing'), t('Sous-réseautage', 'Subnetting'), 'DHCP', 'DNS', 'Cisco']],
  [t('Données et déploiement', 'Data and deployment'), ['PostgreSQL', 'Django ORM', 'Windows Server', 'IIS', 'Git', t('API REST', 'REST APIs')]],
];

export function mountAbout(contact) {
  // Boutons de la section contact
  const actions = contact.querySelector('.contact-actions');
  actions.innerHTML = `
    <button class="button" type="button" data-contact>${t('Me contacter', 'Get in touch')}</button>
    <a class="button ghost" href="${cvUrl}" download>${t('Télécharger mon CV', 'Download my resume')}</a>
    <a class="link" href="https://github.com/MiledCherif" target="_blank" rel="noopener">GitHub</a>`;

  const about = document.createElement('section');
  about.className = 'about';
  about.setAttribute('aria-labelledby', 'about-title');
  about.innerHTML = `
    <div class="about-head">
      <h2 id="about-title">${t('À propos', 'About me')}</h2>
      <p class="about-lead">${t(
        'Analyste programmeur en milieu hospitalier, je conçois des applications web Django qui manipulent des données sensibles : accès, journalisation, conformité et déploiement. Mon terrain préféré : là où le développement, la réseautique et la cybersécurité se rejoignent.',
        'Programmer analyst in a hospital environment, I build Django web applications that handle sensitive data: access, logging, compliance and deployment. My favourite ground: where software development, networking and cybersecurity meet.')}</p>
      <ul class="about-facts">
        <li><b>${t('Basé à', 'Based in')}</b>Gatineau, QC</li>
        <li><b>${t('Langues', 'Languages')}</b>${t('Français, anglais, arabe', 'French, English, Arabic')}</li>
        <li><b>${t('Formation', 'Education')}</b>${t('Réseaux + génie logiciel', 'Networks + software engineering')}</li>
      </ul>
      <a class="button" href="${cvUrl}" download>${t('Télécharger le CV', 'Download the resume')} <span aria-hidden="true">↓</span></a>
      <a class="about-alt" href="${base}cv/${en ? 'Miled-Cherif-CV-FR.pdf' : 'Miled-Cherif-Resume-EN.pdf'}" download>${t('English version', 'Version française')}</a>
    </div>
    <div class="about-body">
      <h3>${t('Expérience', 'Experience')}</h3>
      <ol class="timeline">${experience.map((x) => `<li><span class="when">${x.when}</span><div><b>${x.role}</b><em>${x.where}</em><ul>${x.points.map((p) => `<li>${p}</li>`).join('')}</ul></div></li>`).join('')}</ol>
      <h3>${t('Formation', 'Education')}</h3>
      <ol class="timeline">${education.map((x) => `<li><span class="when">${x.when}</span><div><b>${x.what}</b><em>${x.where}</em></div></li>`).join('')}</ol>
      <h3>${t('Compétences', 'Skills')}</h3>
      <div class="skills">${skills.map(([g, l]) => `<div><span>${g}</span><p>${l.map((s) => `<i>${s}</i>`).join('')}</p></div>`).join('')}</div>
    </div>`;
  contact.querySelector('.signature').before(about);

  // Mini formulaire
  const dlg = document.createElement('dialog');
  dlg.className = 'contact-form';
  dlg.setAttribute('aria-labelledby', 'cf-title');
  const subjects = [t('Offre d’emploi', 'Job opportunity'), t('Projet web ou SaaS', 'Web or SaaS project'), t('Cybersécurité', 'Cybersecurity'), t('Autre', 'Other')];
  dlg.innerHTML = `
    <form method="dialog" novalidate>
      <button class="cf-x" value="cancel" aria-label="${t('Fermer', 'Close')}">×</button>
      <h2 id="cf-title">${t('Écrivez-moi', 'Write to me')}</h2>
      <p class="cf-sub">${t('Je réponds en général dans la journée.', 'I usually reply within a day.')}</p>
      <div class="cf-row">
        <label>${t('Nom', 'Name')}<input name="name" autocomplete="name" required maxlength="80"></label>
        <label>${t('Courriel', 'Email')}<input name="email" type="email" autocomplete="email" required maxlength="120"></label>
      </div>
      <fieldset class="cf-chips"><legend>${t('Objet', 'Subject')}</legend>${subjects.map((s, i) => `<label><input type="radio" name="topic" value="${s}" ${i ? '' : 'checked'}><span>${s}</span></label>`).join('')}</fieldset>
      <label>${t('Message', 'Message')}<textarea name="message" rows="5" required maxlength="4000" placeholder="${t('Quelques mots sur votre besoin…', 'A few words about what you need…')}"></textarea></label>
      <input name="_honey" tabindex="-1" autocomplete="off" class="cf-hp" aria-hidden="true">
      <p class="cf-error" role="alert"></p>
      <div class="cf-actions"><button class="button" type="submit" value="send">${t('Envoyer', 'Send')}</button>
        <span>${t('ou directement', 'or directly')} <a href="mailto:${EMAIL}">${EMAIL}</a></span></div>
    </form>
    <div class="cf-done" hidden><h2>${t('Message envoyé', 'Message sent')}</h2><p>${t('Merci ! Je vous réponds très vite.', 'Thank you! I’ll get back to you soon.')}</p><button class="button" type="button" data-close>${t('Fermer', 'Close')}</button></div>`;
  document.body.append(dlg);

  const form = dlg.querySelector('form'), err = dlg.querySelector('.cf-error'), done = dlg.querySelector('.cf-done');
  const open = (e) => {
    e?.preventDefault();
    form.hidden = false; done.hidden = true; err.textContent = '';
    dlg.showModal();
    setTimeout(() => form.querySelector('input[name=name]').focus(), 50);
  };
  document.querySelectorAll('[data-contact], .bar-action').forEach((b) => b.addEventListener('click', open));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  done.querySelector('[data-close]').addEventListener('click', () => dlg.close());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (e.submitter?.value === 'cancel') { dlg.close(); return; }
    const d = Object.fromEntries(new FormData(form));
    if (d._honey) return;
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || d.message.trim().length < 5) {
      err.textContent = t('Merci de remplir votre nom, un courriel valide et un message.', 'Please fill in your name, a valid email and a message.');
      return;
    }
    const subject = `[Portfolio] ${d.topic} · ${d.name}`;
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; btn.textContent = t('Envoi…', 'Sending…'); err.textContent = '';
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: 'POST',
        // FormData + en-tête Accept seulement : requête « simple », sans pré-vérification CORS
        headers: { Accept: 'application/json' },
        body: Object.entries({ name: d.name, email: d.email, _replyto: d.email, _subject: subject, objet: d.topic, message: d.message, _template: 'table', _captcha: 'false' })
          .reduce((f, [k, v]) => (f.append(k, v), f), new FormData()),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || r.status);
      form.reset(); form.hidden = true; done.hidden = false;
    } catch (ex) {
      console.warn('Formulaire :', ex?.message);
      // Plan B : le logiciel de courriel du visiteur, déjà rempli
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${d.message}\n\n${d.name} · ${d.email}`)}`;
      err.textContent = t('L’envoi direct a échoué : votre logiciel de courriel s’ouvre avec le message prêt.', 'Direct sending failed: your email app opens with the message ready.') + (ex?.message ? ` (${String(ex.message).slice(0, 160)})` : '');
    } finally {
      btn.disabled = false; btn.textContent = t('Envoyer', 'Send');
    }
  });
}
