/* ============================================================
   Xona TSA — logique partagée (données factices + rôles/droits)
   Remplacer par Firebase Auth + Firestore lors du branchement.
   ============================================================ */

const COUNTRIES = ['Togo', 'Ghana', 'Bénin', 'Cameroun', "Côte d'Ivoire"];

const LEGAL_TEXTS = {
  about: "Xona TSA, une application conçue par Trillion Software en année © 2026, tous droits réservés.",
  terms: `1. Objet
Xona TSA est une application qui permet aux organisateurs événementiels de proposer et de vendre directement des tickets numériques aux participants.

2. Comptes
Chaque utilisateur crée un compte via son adresse e-mail. Le compte "Organisateur événementiel" est soumis à vérification d'identité avant activation complète.

3. Vente de tickets
Les organisateurs sont responsables de l'exactitude des informations de leurs événements (lieu, date, prix, disponibilité). Xona TSA agit comme intermédiaire technique de billetterie.

4. Paiements
Les prix affichés sont ceux définis par l'organisateur. Des frais de service peuvent s'appliquer selon les modalités en vigueur au moment de l'achat.

5. Responsabilités
L'utilisateur s'engage à fournir des informations exactes et à respecter les lois en vigueur dans son pays d'utilisation (Togo, Ghana, Bénin, Cameroun, Côte d'Ivoire).

6. Modification
Trillion Software se réserve le droit de modifier les présentes conditions à tout moment. L'utilisation continue de l'application vaut acceptation des modifications.

En créant un compte, vous confirmez avoir lu et accepté ces conditions d'utilisation.`,
  privacy: `1. Données collectées
Nom, prénom, date de naissance, pays, ville, adresse e-mail, et pour les organisateurs, pièce d'identité et justificatifs nécessaires à la vérification.

2. Utilisation des données
Ces données servent à la création et la sécurisation du compte, à la vérification des organisateurs, à la gestion des tickets et des paiements, et à l'amélioration du service.

3. Partage des données
Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec des prestataires de paiement pour le traitement des transactions.

4. Conservation
Les données sont conservées le temps nécessaire à la fourniture du service et conformément aux obligations légales applicables dans votre pays.

5. Vos droits
Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données personnelles depuis les paramètres de votre compte.

L'acceptation de cette politique de confidentialité est obligatoire pour finaliser la création de votre compte.`,
  cookies: `Xona TSA utilise des cookies et technologies similaires pour :
- assurer le bon fonctionnement de l'application (cookies essentiels, toujours actifs) ;
- mesurer l'audience et améliorer nos services (cookies de mesure) ;
- personnaliser votre expérience (cookies de préférence).

Vous pouvez accepter l'ensemble des cookies, les refuser (hors cookies essentiels), ou gérer vos préférences à tout moment depuis les paramètres de l'application, conformément à la réglementation applicable en matière de protection des données.`
};

const MOCK_EVENTS = [
  { id: 'evt_001', organizerId: 'org_demo_1', title: 'Soirée Afrobeats Live', category: 'Concert', city: 'Lomé', country: 'Togo', date: '2026-11-14T20:00:00', priceFcfa: 5000, ticketsAvailable: 300, ticketsSold: 210 },
  { id: 'evt_002', organizerId: 'org_demo_2', title: 'Salon du Numérique', category: 'Conférence', city: 'Accra', country: 'Ghana', date: '2026-10-02T09:00:00', priceFcfa: 15000, ticketsAvailable: 500, ticketsSold: 480 },
  { id: 'evt_003', organizerId: 'org_demo_1', title: 'Nuit du Stand-up', category: 'Humour', city: 'Cotonou', country: 'Bénin', date: '2026-12-05T19:00:00', priceFcfa: 3000, ticketsAvailable: 150, ticketsSold: 60 },
  { id: 'evt_004', organizerId: 'org_demo_3', title: 'Foire Entrepreneuriale', category: 'Business', city: 'Douala', country: 'Cameroun', date: '2026-11-22T08:00:00', priceFcfa: 10000, ticketsAvailable: 400, ticketsSold: 95 },
  { id: 'evt_005', organizerId: 'org_demo_2', title: 'Festival Culturel', category: 'Festival', city: 'Abidjan', country: "Côte d'Ivoire", date: '2026-12-20T16:00:00', priceFcfa: 7500, ticketsAvailable: 1000, ticketsSold: 610 }
];

const MOCK_USERS = [
  { id: 'org_demo_1', email: 'organisateur1@xonatsa.app', role: 'organizer', country: 'Togo' },
  { id: 'org_demo_2', email: 'organisateur2@xonatsa.app', role: 'organizer', country: 'Ghana' },
  { id: 'org_demo_3', email: 'organisateur3@xonatsa.app', role: 'organizer', country: 'Cameroun' },
  { id: 'part_demo_1', email: 'participant1@xonatsa.app', role: 'participant', country: 'Bénin' }
];

/* ---------- Session (à remplacer par Firebase Auth) ---------- */
const Session = {
  get user() {
    const raw = localStorage.getItem('xona_user');
    return raw ? JSON.parse(raw) : null;
  },
  set user(u) {
    localStorage.setItem('xona_user', JSON.stringify(u));
  },
  get legalAccepted() {
    return localStorage.getItem('xona_legal_accepted') === '1';
  },
  set legalAccepted(v) {
    localStorage.setItem('xona_legal_accepted', v ? '1' : '0');
  }
};

/* ---------- Droits par rôle ---------- */
const Permissions = {
  isAdmin: (u) => u && u.role === 'admin',
  isOrganizer: (u) => u && u.role === 'organizer',
  isParticipant: (u) => u && u.role === 'participant',
  // Organisateur : lecture/écriture uniquement sur ses propres événements.
  canEditEvent: (u, eventOwnerId) => {
    if (!u) return false;
    if (u.role === 'admin') return true;
    if (u.role === 'organizer') return u.id === eventOwnerId;
    return false;
  },
  // Participant : lecture + paiement de ticket.
  canPurchaseTicket: (u) => u && (u.role === 'participant' || u.role === 'admin'),
  // Admin : tous droits (lecture, écriture, modification, suppression).
  canManageAllUsers: (u) => Permissions.isAdmin(u),
  canDeleteAnything: (u) => Permissions.isAdmin(u)
};

/* ---------- Garde de route simple (client-side, démo) ---------- */
function guardRole(requiredRole) {
  const u = Session.user;
  if (!u) { window.location.href = 'auth.html'; return null; }
  if (requiredRole && u.role !== requiredRole && u.role !== 'admin') {
    window.location.href = 'profile-choice.html';
    return null;
  }
  return u;
}

/* ---------- Formatage ---------- */
function formatDateFr(iso, withTime) {
  const d = new Date(iso);
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  let s = `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
  if (withTime) {
    s += ` à ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  return s;
}
function formatFcfa(n) { return `${n.toLocaleString('fr-FR')} FCFA`; }

/* ---------- Modal légal (conditions / confidentialité / cookies / à propos) ---------- */
function openLegalModal(title, body, opts) {
  opts = opts || {};
  const overlay = document.getElementById('legal-modal-overlay');
  const sheet = overlay.querySelector('.modal-sheet');
  overlay.querySelector('.modal-title').textContent = title;
  overlay.querySelector('.modal-body').textContent = body;
  sheet.classList.toggle('blocking', !!opts.blocking);
  overlay.classList.add('open');
}
function closeLegalModal() {
  document.getElementById('legal-modal-overlay').classList.remove('open');
}

/* ---------- Bandeau cookies ---------- */
function initCookieBanner() {
  const consent = localStorage.getItem('xona_cookie_consent');
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (consent) { banner.remove(); return; }
  banner.querySelector('.accept').addEventListener('click', () => {
    localStorage.setItem('xona_cookie_consent', 'accepted');
    banner.remove();
  });
  banner.querySelector('.decline').addEventListener('click', () => {
    localStorage.setItem('xona_cookie_consent', 'declined');
    banner.remove();
  });
  const learn = banner.querySelector('.learn');
  if (learn) {
    learn.addEventListener('click', () =>
      openLegalModal('Cookies', LEGAL_TEXTS.cookies, {}));
  }
}

/* ---------- Query params ---------- */
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
