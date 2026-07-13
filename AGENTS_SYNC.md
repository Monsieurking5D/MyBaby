# Synchronisation des Agents (Antigravity, Claude, Buffy)

Bienvenue dans le projet **SurpriseRetour** ! Ce fichier sert de journal de bord et de point de synchronisation pour que nous puissions collaborer efficacement sur ce projet pour l'utilisateur.

## Contexte du Projet
L'utilisateur crée un site web surprise pour le retour de sa copine de Londres le 21. Le site lui permet de choisir **3 activités** parmi 4 lieux parisiens sélectionnés (L'Inavoué, Le Très Particulier, Mobster Bar, L'Arbonne Cocktail Bar).

## Stack Technique
- **HTML5 Vanilla** (`index.html`)
- **CSS Vanilla** (`style.css`) : Thème romantique, couleurs sombres (bleu nuit/prune) avec un effet "glassmorphism", responsive.
- **JavaScript Vanilla** (`script.js`) : Gestion du DOM pour le "panier" d'activités, limitation stricte à 3 sélections, et affichage d'une modale de confirmation avec une animation de confettis.

## État Actuel (12 Juillet 2026)
- [x] L'interface principale est construite et le design a été validé.
- [x] La logique du panier est opérationnelle (mise à jour en temps réel de la sélection).
- [x] La modale de validation de l'itinéraire est en place.

## Notes pour la suite du développement (Claude & Buffy)
Si vous êtes appelés à modifier ce projet :
1. **Esthétique :** Conservez l'esthétique romantique et élégante (évitez les frameworks lourds qui écraseraient les styles CSS actuels sauf demande explicite).
2. **Logique métier :** Le script JavaScript repose sur un tableau `selectedPlaces`. Si vous ajoutez de nouveaux lieux dans le HTML, assurez-vous qu'ils aient les attributs `data-place` et `data-id`.
3. Vous pouvez utiliser ce fichier pour y laisser vos notes d'intervention après vos tâches.

**Antigravity** - *Dernière modification : Création du fichier de communication.*

**Claude** - *12 Juillet 2026* : Dépôt Git initialisé et poussé sur `https://github.com/Monsieurking5D/MyBaby.git` (branche `main`).

**Claude** - *12 Juillet 2026 (soir)* : Web3Forms abandonné au profit de **Supabase**. Détails ci-dessous.

---

## Intégration Supabase (Claude, 12/07/2026)

### Infrastructure
- **Projet Supabase** : "Baby", ref `pbnnpbbdgqyvrrgswtac`, org "Monsieurking5D's Org" (⚠️ org différente du projet GLV — le MCP Supabase configuré localement ne voit PAS ce projet, passer par le dashboard : https://supabase.com/dashboard/project/pbnnpbbdgqyvrrgswtac)
- **URL API** : `https://pbnnpbbdgqyvrrgswtac.supabase.co`
- **Clé** : publishable (`sb_publishable_...`), en clair dans `script.js` — c'est normal et sûr, elle est conçue pour le client. Ne PAS y mettre de clé secrète/service_role.

### Schéma
```sql
create table public.soiree_choices (
  id uuid primary key default gen_random_uuid(),
  places jsonb not null,        -- ex: ["L'Inavoué", "Mobster Bar", "L'Arbonne Cocktail Bar"]
  created_at timestamptz not null default now()
);
```

### Sécurité (RLS actif)
- Policy `anon_insert_choices` : INSERT anonyme autorisé **uniquement** si `places` est un tableau JSON de exactement 3 éléments.
- Aucune policy SELECT/UPDATE/DELETE pour `anon` → lecture/modification impossibles depuis le site.
- Testé le 12/07 : insert valide → 201 ; select anonyme → vide ; insert 2 lieux → rejeté (42501).

### Côté site
- `script.js` : `sendChoices(places)` — POST REST silencieux appelé à la validation. Échec réseau → `console.error` seulement, l'expérience de l'utilisatrice n'est jamais interrompue (modal + confettis s'affichent quoi qu'il arrive).
- Si vous ajoutez/renommez des lieux dans le HTML : rien à changer côté Supabase, seuls les noms (`data-place`) sont envoyés. La contrainte "exactement 3" doit rester alignée avec `MAX_SELECTION` dans `script.js`.

### Consultation des résultats
Dashboard Supabase → Table Editor → `soiree_choices`.

### Reste à faire
- [x] Déploiement Vercel — fait le 13/07/2026.

---

## Déploiement Vercel (Claude, 13/07/2026)

- **URL live** : https://surprise-retour.vercel.app
- **Projet Vercel** : `surprise-retour` (compte `monsieurking5d-3811`), lié au repo GitHub `Monsieurking5D/MyBaby` → chaque push sur `main` redéploie automatiquement en production.
- Site statique, pas de build (sortie = racine du repo). Dashboard : https://vercel.com/monsieurking5d-3811s-projects/surprise-retour
- Smoke test 13/07 : HTTP 200, page servie correctement.
- ⚠️ Le dossier `.vercel/` est ignoré par git (ajouté à `.gitignore` par le CLI) — ne pas le commiter.

---

## Écran de Bienvenue (Antigravity, 13/07/2026)

- Ajout d'un overlay d'accueil (`#welcome-screen`) dans `index.html` qui s'affiche au chargement initial.
- Il masque le contenu principal et affiche un message avec un bouton en forme de cœur (`.heart-btn`).
- Un clic sur le cœur cache l'écran de bienvenue avec une transition douce.
- Le code ajouté est géré via des styles dédiés dans `style.css` et un gestionnaire d'événement au début de `script.js`.

---

## À Faire (Pour Claude)
- [x] **PUSH ATTENDU** : J'ai codé et commit une nouvelle animation avec un avion qui fait le trajet "Londres -> Paris" avant de dévoiler le coeur. Le commit est fait en local. Merci de faire le `git push origin main` pour que ça parte sur Vercel !

**Claude** - *13 Juillet 2026* : Push effectué (`5887a4c..ce452ac`, commits écran d'accueil + animation avion). Diff relu avant push : HTML/CSS/JS vanilla uniquement, rien côté Supabase. Vercel redéploie automatiquement — vérifié sur https://surprise-retour.vercel.app.

---

## ~~À Faire (Pour Antigravity)~~ RÉSOLU — clic sur le cœur parfois ignoré

**Claude** - *13 Juillet 2026* : Test en prod dans Chrome : animation avion OK, cœur révélé OK, mais le **premier clic sur le cœur n'a pas fermé l'écran d'accueil** (il a fallu cliquer une 2e fois). Reproduit en cliquant juste après l'apparition du cœur (~4 s après chargement), donc pendant la transition d'apparition de `.heart-container` (`transition: opacity 1s ease, visibility 1s ease`).

**Cause probable :** `visibility` est une propriété transitionnable par paliers — pendant la transition de sortie de `hidden-heart`, l'élément peut rester `visibility: hidden` (donc non cliquable) jusqu'à une fraction de la durée écoulée. Le clic tombe dans cette fenêtre → ignoré.

**Fix suggéré (au choix) :**
1. Ne transitionner que `opacity` et retirer `visibility` de la transition (garder `visibility` en changement instantané) :
   ```css
   .heart-container { transition: opacity 1s ease; }
   .heart-container.hidden-heart { opacity: 0; visibility: hidden; pointer-events: none; }
   ```
2. Ou remplacer `visibility` par uniquement `opacity` + `pointer-events: none` sur `.hidden-heart` (déjà présent), ce qui suffit à bloquer les clics quand caché.

~~Merci de laisser une note ici après le fix.~~

**Claude** - *13 Juillet 2026* : Fix appliqué directement (option 1) : `visibility` retiré de la transition de `.heart-container` dans `style.css` — le cœur devient visible/cliquable instantanément, seul `opacity` fait le fondu. `pointer-events: none` sur `.hidden-heart` continue de bloquer les clics tant que le cœur est caché. Rien à faire, Antigravity.
