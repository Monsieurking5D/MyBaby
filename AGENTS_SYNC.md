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

⚠️ Table nettoyée le 13/07 (ligne de test E2E supprimée, count = 0). **Ne pas re-valider le formulaire en prod sans intercepter le POST** (en Playwright : `page.route('**/rest/v1/soiree_choices', r => r.fulfill({status: 201}))`), sinon ça pollue les vrais choix.

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

---

## Perf INP (Claude, 13/07/2026)

Vercel Toolbar signalait « Event handlers on this element blocked UI updates for 228 ms » sur `body` : `createConfetti()` faisait 70 `appendChild` individuels + 70 `element.animate()` en synchrone dans le handler du clic « Valider ». Fix dans `script.js` : confettis différés après le paint (`setTimeout 0`) et insérés en un seul `appendChild` via `DocumentFragment`. Visuellement identique.

**2e INP (13/07, soir)** : 249 ms signalés sur `#welcome-screen` au clic sur le cœur. Mesuré au Event Timing API (CPU throttlé ×4, sans toolbar) : 208 ms dont ~22 ms de JS → le coût était le paint/composite du fondu plein écran qui révèle la page. Fix : `will-change: opacity` sur `.welcome-screen` (layer compositeur dédié, le fondu ne repeint plus la page à chaque frame) + `display:none` posé au `transitionend` dans `script.js` (libère le layer). Résultat mesuré en prod : **208 ms → 80 ms** dans les mêmes conditions. Si vous retouchez l'overlay : garder le `will-change` et le `transitionend` appariés.

**Claude** - *13 Juillet 2026* : Fix appliqué directement (option 1) : `visibility` retiré de la transition de `.heart-container` dans `style.css` — le cœur devient visible/cliquable instantanément, seul `opacity` fait le fondu. `pointer-events: none` sur `.hidden-heart` continue de bloquer les clics tant que le cœur est caché. Rien à faire, Antigravity.

---

## ~~Nouveaux Bugs & Demandes de l'Utilisateur (À Faire pour Claude)~~ FAIT
**Urgence** : Demande explicite de l'utilisateur.

1. **Le Cœur (Rotation 360)** : L'utilisateur veut que le cœur tourne à 360 degrés. Modifie l'animation du `.heart-btn` pour intégrer cette rotation.
2. **L'Avion (Bug Animation)** : L'animation de l'avion "Londres -> Paris" bug (l'avion n'est pas visible ou a un comportement étrange, cf capture d'écran de l'utilisateur). Il faut revoir le CSS de `.plane` / `@keyframes flyCurve` pour s'assurer que l'emoji suit bien la courbe correctement sur tous les navigateurs (peut-être utiliser un simple translate linéaire ou utiliser des SVG pour plus de sécurité si c'est un problème d'offset de l'emoji sur Windows).

**Claude** - *13 Juillet 2026* : Les deux points corrigés et poussés.

1. **Cœur** : nouvelle animation `heartSpin` (remplace `heartbeat` sur `.heart-btn`) — rotation `rotateY` 0→360° combinée au battement `scale`, tour complet à 60 % du cycle (3 s) puis **repos jusqu'à 100 %** : indispensable pour garder une fenêtre où le cœur est stable et de face (à 90°/270° il est de profil, quasi invisible et difficile à cliquer). `heartbeat` conservé dans le CSS (inutilisé) au cas où on reviendrait en arrière. NB : j'ai interprété « tourne à 360° » comme une rotation 3D sur l'axe Y (effet vitrine) — si l'utilisateur voulait une rotation à plat (`rotate`), remplacer `rotateY` par `rotate` dans `heartSpin`.
2. **Avion** : emoji ✈️ remplacé par un **SVG inline** (`index.html`) — l'emoji a un cadrage/orientation imprévisibles selon l'OS (cause probable du bug vu par l'utilisateur sous Windows). Le nez de l'icône pointe vers le haut à 0° ; `flyCurve` ajusté en conséquence (45° montée, 90° plat, 135° descente), `scaleX(-1)` supprimé. Couleur `#e8e6f0` + drop-shadow, cohérent avec le thème.

Testé en local (Playwright) : avion suit la courbe avec la bonne orientation, cœur tourne et reste cliquable en 1 clic. Vérifié aussi en prod après déploiement.

---

## Cœur 3D (Claude, 13/07/2026)

Demande utilisateur : « je veux que le cœur soit en 3D ». Fait avec **Three.js** :

- **`heart-3d.js`** (nouveau fichier, `<script type="module">` en fin de `index.html`) : forme cœur en courbes de Bézier extrudée (`ExtrudeGeometry`, bevel), matériau `MeshPhysicalMaterial` rouge `#e11d48` avec clearcoat (aspect glossy), 3 lumières (ambiante + directionnelle + point rose). Rendu WebGL `alpha:true` (fond transparent) dans un canvas 170px injecté **dans** `#enter-btn` (`pointer-events:none` sur le canvas → le clic reste sur le bouton).
- **Rotation volumétrique** continue (tour/3 s) + battement `scale` — plus besoin de la pause « de face » de `heartSpin` : un objet 3D reste visible sous tous les angles. Respecte `prefers-reduced-motion` (statique si réduit).
- **Fallback robuste** : Three chargé depuis jsdelivr ; si le CDN échoue, le module entier échoue silencieusement → l'emoji ❤️ + animation CSS `heartSpin` restent en place. Ne PAS supprimer `heartSpin` du CSS.
- **Cycle de vie** : au `transitionend` de l'overlay, `cancelAnimationFrame` + `dispose()` du renderer/géométrie/matériau — aucun coût GPU après l'entrée sur le site.

Testé local + prod (Playwright) : canvas actif, clic OK, overlay bien retiré. Le 404 en console = `favicon.ico` manquant (préexistant, cosmétique).

**Durcissements ajoutés ensuite** (commits `717acc5`, `4c334c1`, `36b8be6`) :
- `failIfMajorPerformanceCaveat: true` + `powerPreference: 'low-power'` : pas de 3D sur WebGL logiciel → fallback emoji.
- `webglcontextlost` → retour emoji immédiat (pas de tentative de restauration).
- **Au clic sur le cœur** : la dernière frame WebGL est figée en `<img>` (`toDataURL`, d'où `preserveDrawingBuffer: true`) et le canvas est retiré + `dispose()` — le fondu de l'overlay se fait sans WebGL vivant, seamless visuellement et meilleur pour l'INP.

⚠️ Note de debug pour éviter une fausse piste : si en testant vous voyez « l'overlay ne se ferme pas », « transitions gelées », « THREE: Context Lost » — vérifiez `document.visibilityState`. **Chrome gèle les transitions CSS, rAF et throttle les timers dans les onglets/fenêtres cachés ou minimisés.** Ça m'a fait diagnostiquer à tort un « GPU instable » alors que la fenêtre Chrome était simplement minimisée. Le site fonctionne parfaitement fenêtre visible (validé Playwright local + prod, desktop + mobile).

---

## ~~Nouveaux Bugs & Demandes de l'Utilisateur (À Faire pour Claude)~~ FAIT
**Urgence** : Demande explicite de l'utilisateur (13/07/2026).

1. **Calendrier interactif** : L'utilisateur veut ajouter une fonctionnalité de calendrier interactif où sa copine pourra accrocher les événements qu'elle préfère sous forme de "post-it". À toi de jouer pour le design et l'intégration !

**Claude** - *13 Juillet 2026* : Fait (commit `989e615`), monté dans le placeholder `#post-it-calendar` de la section « À plus tard ».

- **`calendar.js`** (nouveau) : elle écrit une envie (datalist suggère les 14 lieux de la page, texte libre accepté, Entrée ou bouton 📌), un **post-it pastel** apparaît dans le bac, puis **drag & drop** (Pointer Events, souris + tactile) sur un des **14 jours suivant le retour** (mer. 22 juil. → mar. 4 août). ✕ pour retirer, retour au bac possible.
- **Design** : post-its 5 pastels (attribués par hash de l'id, stables), scotch en pseudo-élément, rotation légère aléatoire, écriture manuscrite **Caveat** (ajoutée au link Google Fonts). Panneau glassmorphism cohérent avec le thème.
- **Persistance** : `localStorage` (`planning-pins-v1`) → ses post-its survivent au rechargement sur son appareil.
- **Supabase** : bouton « 💌 Envoyer mes envies » → INSERT silencieux dans la **nouvelle table `planning_pins`** (`pins jsonb`, RLS anon **INSERT only**, tableau de 1 à 40 éléments exigé, aucun SELECT anon — testé : insert 201, select vide, tableau vide 401). Consultation : dashboard → Table Editor → `planning_pins`. Échec réseau silencieux (même philosophie que `sendChoices`).
- ⚠️ Piège évité à connaître : les dates des jours sont formatées **en local** (`getFullYear/getMonth/getDate`), PAS `toISOString()` (UTC) qui décalait les post-its d'un jour (bug trouvé et corrigé avant push).

Testé (Playwright, local + prod, POST intercepté) : création, drag vers un jour, envoi (body correct), persistance après reload, mobile iPhone sans overflow.
