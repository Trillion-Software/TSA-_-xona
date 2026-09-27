# Xona TSA — Web

Version web (HTML/CSS/JS), fichiers **à plat**, sans dossier — prête pour
un dépôt GitHub (l'upload web de GitHub ne prend que des fichiers à plat).

## Ouvrir en local

Ouvrir `index.html` dans un navigateur, ou lancer un petit serveur local :

```bash
python3 -m http.server 8000
```

puis aller sur `http://localhost:8000`.

## Pages

| Fichier | Rôle requis | Contenu |
|---|---|---|
| `index.html` | — | Démarrage (visuel fourni), redirige vers l'authentification |
| `auth.html` | — | Connexion / création de compte par e-mail |
| `profile-choice.html` | — | Choix Organisateur/Participant, pays, mentions légales (acceptation obligatoire), cookies |
| `events.html` | participant | Liste des événements (lecture, filtre par pays) |
| `event-detail.html` | participant | Détail d'un événement |
| `payment.html` | participant | Paiement du ticket (mock) |
| `organizer-dashboard.html` | organizer | Ses propres événements uniquement + profil |
| `admin.html` | admin | Gestion complète des utilisateurs et événements |
| `style.css` | — | Styles partagés (noir/blanc, bleu réservé à l'organisateur) |
| `script.js` | — | Données factices, rôles/droits (`Permissions`), légal, cookies |

## Rôles et droits (`script.js` → `Permissions`)

- **Organisateur** : lecture/écriture uniquement sur ses propres événements (tableau de bord + profil).
- **Participant** : lecture des événements + paiement de ticket.
- **Admin** : tous droits (lecture, écriture, modification, suppression) — non sélectionnable depuis la page publique, à attribuer en base.

La session (`Session.user`) est stockée en `localStorage` pour la démo — à remplacer par Firebase Authentication + Firestore, avec les mêmes règles reportées côté sécurité serveur.

## Prochaines étapes possibles

- Brancher Firebase Authentication + Firestore.
- Formulaire réel de création d'événement (organisateur).
- Prestataire de paiement réel (Mobile Money local, carte).
- Vérification d'identité organisateur.
