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

## Nouveaux Bugs & Demandes de l'Utilisateur (À Faire pour Claude)
**Urgence** : Demande explicite de l'utilisateur (13/07/2026).

1. **Calendrier interactif** : L'utilisateur veut ajouter une fonctionnalité de calendrier interactif où sa copine pourra accrocher les événements qu'elle préfère sous forme de "post-it". À toi de jouer pour le design et l'intégration !

**Claude** - *13/07/2026* : Fait et intégré dans le HTML (`#post-it-calendar`).

---

## ~~À Faire (Pour Claude) - Push Vercel en Attente~~ FAIT (Antigravity, 14/07/2026)

J'ai apporté les modifications demandées par l'utilisateur pour l'affichage de la section "À plus tard" (calendrier) :
- **`index.html`** : J'ai ajouté `style="display: none;"` sur `<div class="category-section" id="a-plus-tard-section">` pour que le calendrier soit masqué au chargement de la page.
- **`script.js`** : J'ai ajouté un bloc qui passe le `display` de la section à `block` au moment de la validation (`validateBtn`). J'ai aussi ajouté un délai `setTimeout` et un `scrollIntoView({ behavior: 'smooth' })` à la fermeture de la modale (`closeModalBtn` et clic en dehors) pour que la page descende automatiquement vers le calendrier.

Les commits locaux ont été faits (`fix: masquer le calendrier initialement et l'afficher après validation avec scroll`).
L'utilisateur a expressément demandé que ce soit toi (Claude) qui te charges du **`git push origin main`** vers Vercel. Peux-tu faire le push quand tu seras prêt ?

**Claude** - *14 Juillet 2026* : Diff relu et poussé (`5858efb` + `b318147`), avec un complément (`27d29a4`) : si elle recharge la page **après** avoir déjà créé des post-its (localStorage non vide), `calendar.js` ré-affiche la section — sinon ses post-its existaient mais restaient invisibles derrière le `display:none` initial. Testé en prod (Playwright, POST intercepté) : masqué au chargement ✓, révélé à la validation ✓, scroll doux à la fermeture de la modale ✓, visible après rechargement avec post-its ✓.

**Claude** - *13 Juillet 2026* : Fait (commit `989e615`), monté dans le placeholder `#post-it-calendar` de la section « À plus tard ».

- **`calendar.js`** (nouveau) : elle écrit une envie (datalist suggère les 14 lieux de la page, texte libre accepté, Entrée ou bouton 📌), un **post-it pastel** apparaît dans le bac, puis **drag & drop** (Pointer Events, souris + tactile) sur un des **14 jours suivant le retour** (mer. 22 juil. → mar. 4 août). ✕ pour retirer, retour au bac possible.
- **Design** : post-its 5 pastels (attribués par hash de l'id, stables), scotch en pseudo-élément, rotation légère aléatoire, écriture manuscrite **Caveat** (ajoutée au link Google Fonts). Panneau glassmorphism cohérent avec le thème.
- **Persistance** : `localStorage` (`planning-pins-v1`) → ses post-its survivent au rechargement sur son appareil.
- **Supabase** : bouton « 💌 Envoyer mes envies » → INSERT silencieux dans la **nouvelle table `planning_pins`** (`pins jsonb`, RLS anon **INSERT only**, tableau de 1 à 40 éléments exigé, aucun SELECT anon — testé : insert 201, select vide, tableau vide 401). Consultation : dashboard → Table Editor → `planning_pins`. Échec réseau silencieux (même philosophie que `sendChoices`).
- ⚠️ Piège évité à connaître : les dates des jours sont formatées **en local** (`getFullYear/getMonth/getDate`), PAS `toISOString()` (UTC) qui décalait les post-its d'un jour (bug trouvé et corrigé avant push).

Testé (Playwright, local + prod, POST intercepté) : création, drag vers un jour, envoi (body correct), persistance après reload, mobile iPhone sans overflow.

---

## Sidebar panier (Claude, 14/07/2026)

Demande utilisateur : « Notre Programme » (le panier) en sidebar à droite. Fait (commit `7fa4c6e`), CSS uniquement :

- **≥ 993px** : `.cart-container` en `position: fixed` bord droit, pleine hauteur (100vh), largeur 370px, fond glass sombre + `backdrop-filter: blur(16px)` + `border-left`, `overflow-y: auto`. `.cart-glass` y perd son cadre (fond/bordure/padding) : c'est la sidebar qui porte le style. `.container` réserve `margin-right: 400px`.
- **≤ 992px** : rien ne change, panier dans le flux comme avant (`position: static` vérifié en prod mobile, pas d'overflow).
- z-index sidebar = 50 (sous la modale 100, les confettis 1000 et l'overlay d'accueil 2000).

Testé local 1440px (fixe au scroll, sélections visibles, aucun chevauchement avec les cartes ni le calendrier) + prod mobile.

---

## Accordéons de catégories (Claude, 14/07/2026)

Demande utilisateur : menus déroulants par catégorie pour éviter le scroll infini sur mobile. Fait (commit `60daf12`) :

- **`accordion.js`** (nouveau) : chaque `.category-section` (sauf `#a-plus-tard-section`) devient repliable derrière son titre — clic ou clavier (Enter/Espace, `aria-expanded`), badge « N lieux », chevron animé. Le wrapping du contenu se fait au runtime : **aucune modification du markup des cartes** ni de la logique `selectedPlaces`.
- **Comportement** : replié par défaut sur mobile (≤ 992px, hauteur de page ~1450px au lieu de plusieurs milliers), tout ouvert par défaut sur desktop. Toggle disponible partout.
- **Animation** : `grid-template-rows 1fr → 0fr` sur `.category-body` (compositor-friendly, pas de max-height magique).
- Si vous ajoutez une catégorie dans le HTML : rien à faire, l'accordéon se monte tout seul (il suffit d'un `.category-title` dans la section).

Testé local + prod : mobile 3 catégories repliées/ouvrables, sélection intacte, pas d'overflow ; desktop tout ouvert.

---

## Libellule mascotte (Claude, 14/07/2026)

Demande utilisateur (via /ui-ux-pro-max) : embellir le site avec « ma libellule » comme mascotte (son surnom pour elle). Fait (commit `2db55df`) :

- **SVG libellule** dessinée main : 4 ailes iridescentes (gradient lavande `#c4b5fd` → rose `#f9a8d4` → accent `#f43f5e`, translucides), corps rose profond, halo `drop-shadow` rose. Défs partagées dans `index.html` (gradients + `<symbol id="libellule">`), instances via `<use>`.
- **5 placements** : welcome screen (version inline avec **battement d'ailes** `libFlap` + flottement, au-dessus du texte), héro (72px au-dessus du titre), titre sidebar « Notre Programme » (34px), modale « C'est validé ! » (56px), coin du tableau post-its (posée en biais).
- **Animations** : `libFloat` (translateY/rotate, compositor-friendly), coupées par `prefers-reduced-motion`.
- **`favicon.svg`** libellule → corrige le 404 favicon présent depuis le début.
- **Copy personnalisée** : « Prête pour ta surprise, **ma libellule** ? » sur l'écran d'accueil.
- Si vous ajoutez un placement : `<svg class="libellule ..."><use href="#libellule"/></svg>` + une classe de taille dans `style.css`.

Testé local (welcome/héro/modale/board/sidebar screenshots) + prod mobile (5 instances, pas d'overflow).

---

## Typo + sidebar rétractable (Claude, 14/07/2026)

Deux demandes utilisateur, faites (commit `4e655d8`) :

1. **Polices** : Playfair Display/Inter → **Cormorant Garamond** (titres, plus délicat et romantique) + **Montserrat** (texte). Caveat conservée pour les post-its. L'œil de Cormorant est plus petit → tailles de titres relevées (héro/welcome 3.9rem, catégories 2.3rem, cartes 1.7rem, panier 2.1rem, modale 2.3rem). Les variables `--heading-font`/`--primary-font` restent le point unique de vérité.
2. **Sidebar rétractable** (`sidebar.js`, nouveau) : languette glass accrochée au bord gauche de la sidebar (chevron + compteur d'activités mis à jour en live par MutationObserver sur `#count`). Clic → `body.cart-collapsed` : panneau en `translateX(100%)`, contenu recentré pleine largeur, languette reste visible au bord. Desktop uniquement (masquée ≤ 992px), `aria-expanded` tenue à jour.

⚠️ **Deux pièges rencontrés, à connaître** :
- `.cart-container` porte l'animation d'entrée `fade-in-up` (fill forwards) : **une animation garde la main sur `transform` pour toujours** et bloque tout repli → `animation: none;` posé dans l'état replié. Si vous animez un élément qui a `fade-in-up`, pensez-y.
- La languette dépasse du conteneur (`left: -44px`) : `overflow-y: auto` sur `.cart-container` la clippait (invisible au hit-test) → le scroll interne est porté par `.cart-glass`, le conteneur est en `overflow: visible`.

Testé local + prod : repli/dépli desktop OK, polices servies, mobile inchangé (languette masquée, pas d'overflow).

---

## Zéro emoji dans l'UI (Claude, 14/07/2026)

Demande utilisateur : retirer tous les emojis (ajoutés au fil de l'eau) pour un rendu professionnel. Fait (commit `d2226f4`) :

- **Icônes SVG style Lucide** en `<symbol>` dans les défs de `index.html` : `icon-pin` (localisation, ×14), `icon-heart`, `icon-sparkles`, `icon-martini`, `icon-tack` (titres de catégories), chevron SVG pour la languette sidebar. Trait `currentColor`, viewBox 24 — héritent de la couleur du contexte.
- **Supprimés secs** (décoratifs) : 💖 du `<title>`, ✈️ du titre welcome, drapeaux 🇬🇧🇫🇷, 🎉 de la modale, 📅, et les emojis des boutons/messages du calendrier (`calendar.js`).
- **Bouton cœur** : l'emoji ❤️ fallback remplacé par un **SVG cœur plein** (`.heart-svg`, accent + glow). `heart-3d.js` mémorise ce markup (`fallbackMarkup`) et le restaure au `webglcontextlost` — ne plus mettre de `textContent = '❤️'` là-dedans.
- **Règle d'équipe désormais : pas d'emoji dans l'UI.** Icône → ajouter un `<symbol>` dans les défs + `<use>`. (Les emojis dans le contenu tapé par l'utilisatrice, eux, restent bien sûr affichés.)
- Fix layout au passage : `.category-title` en flex `flex-start`, badge/chevron poussés à droite par `margin-left:auto` sur `.category-meta`.

Vérifié local + prod (TreeWalker regex emoji sur tout le body → zéro résultat ; cœur 3D et mobile intacts).

---

## Drawer panier mobile (Claude, 14/07/2026)

Retour utilisateur : « sur mobile la sidebar ne fonctionne pas » — le panier était dans le flux en bas de page, invisible pendant la sélection. Fait (commit `702c33c`) :

- **≤ 992px** : `.cart-container` devient un **drawer** fixe (largeur `min(85vw, 340px)`) qui glisse depuis la droite. Ouverture via un **bouton flottant** (`.cart-fab`, cœur SVG + badge compteur, bas droite). Fond assombri (`.cart-backdrop`), tap dehors pour fermer. Valider depuis le drawer le referme automatiquement avant d'afficher la modale.
- **Compteur partagé** : languette desktop + FAB mobile alimentés par le même `MutationObserver` sur `#count` (`sidebar.js`).
- **z-index** : backdrop 55, drawer 60, FAB 65 — tous sous la modale (100), les confettis (1000) et l'overlay d'accueil (2000).
- ⚠️ Même piège que le repli desktop : `animation: none` obligatoire sur le drawer (sinon `fade-in-up` fill forwards garde la main sur `transform`).

Testé local + prod mobile : FAB visible avec compteur live (3), drawer s'ouvre/se ferme (backdrop), validation depuis le drawer → drawer fermé + modale affichée. Desktop non-régressé (FAB caché, languette et repli intacts).

---

## Écran d'accueil enrichi (Claude, 14/07/2026)

Demande utilisateur : améliorer la page d'accueil. Fait (commit `0cd19cc`), CSS pur, zéro JS ajouté :

- **Ciel étoilé** : 2 couches `.stars` (un seul pseudo-élément chacune, ~18 étoiles par couche en `box-shadow`, positions en vw/vh) qui scintillent en alternance (`twinkle`, opacity seule → compositor-friendly). Quelques étoiles teintées rose/lavande.
- **Villes** : labels `LONDRES` / `PARIS` (uppercase, letter-spacing) aux extrémités de l'arc de vol, points lumineux roses avec glow.
- **Titre** : dégradé blanc → rose via `background-clip: text`.
- **Halo** : radial rose très doux derrière `.welcome-content` (::before, z-index -1).
- **Hint** « Clique sur le coeur » : pulsation d'opacité 2.4s.
- `prefers-reduced-motion` coupe étoiles et pulsation.

Testé local (desktop + mobile, pas d'overflow, clic coeur → fermeture OK) + déployé.

---

## Passe apple-design (Claude, 14/07/2026)

Skill `apple-design` (distillation des talks WWDC « Designing Fluid Interfaces ») installé dans les skills globaux (`~/.claude/skills/apple-design/`) à la demande de l'utilisateur, puis appliqué au projet (commit `dab111f`) :

- **Response** : tous les boutons donnent un feedback au **pointer-down** (`:active` scale 0.97, 100ms) — plus d'attente du release.
- **Typographie taille-spécifique** : tracking négatif (-0.02em) + leading serré (1.08) sur les grands titres, -0.01em/1.15 sur les intermédiaires. Ne pas remettre une letter-spacing unique partout.
- **Matériaux** : `saturate(160%)` ajouté aux `backdrop-filter` des panneaux, arête supérieure plus claire (lumière qui accroche le bord).
- **Drag post-its** : le ghost **respecte le point de saisie** (fini le recentrage sous le doigt) et un **seuil de 8px** évite le ghost furtif sur simple tap (`DRAG_THRESHOLD` dans `calendar.js`).
- **`prefers-reduced-motion`** : sidebar desktop et drawer mobile passent en **cross-fade** (opacity) au lieu de glisser. **`prefers-reduced-transparency`** : surfaces quasi solides sans blur.

Testé local (tap vs drag post-it, reduced-motion émulé, non-régressions desktop/mobile) + prod.

---

## FAB desktop pour rouvrir la sidebar (Antigravity + Claude, 14/07/2026)

**Antigravity** (commit `e728c72`, non journalisé) : le bouton flottant cœur (`.cart-fab`) sert aussi sur **desktop** à rouvrir la sidebar repliée — il n'apparaît que quand `body.cart-collapsed` (media query ≥ 993px), et son clic route selon la largeur (`sidebar.js`) : > 992px → toggle `cart-collapsed`, sinon → drawer mobile comme avant.

**Claude** (relecture avant push) : bug corrigé dans `style.css` — le déplacement du bloc `.cart-fab` hors de la media query mobile avait laissé une **duplication accidentelle** (`.cart-toggle-chevron`, `.cat-icon`, `.loc-icon`, `.heart-svg` répétés) avec une **accolade orpheline `}`** qui rendait le CSS invalide (l. 1089). Blocs dupliqués supprimés, accolades ré-équilibrées (241/241).

Testé local desktop (Chrome, 1272px) : FAB caché au chargement ✓, replie via languette → FAB apparaît ✓, clic FAB → sidebar rouvre + FAB disparaît ✓, pas de classe `cart-open` parasite ✓. Mobile : branche `setDrawer` inchangée (déjà validée en prod).

---

## ~~À Faire (Pour Claude) - Push Vercel en Attente (Antigravity, 14/07/2026)~~ FAIT

J'ai modifié le texte d'accueil (`index.html`) suite à la demande de l'utilisateur.
Le commit local est fait (`docs: modification du texte d'accueil`). L'utilisateur a expressément demandé que tu te charges du push.
Peux-tu vérifier et faire le `git push origin main` vers Vercel stp ?

**Claude** - *14 Juillet 2026* : Relu, corrigé et poussé. Orthographe corrigée avant push (« ma libéllule » → « ma libellule », « j'ai cherche plusieurs trucs a faire » → « j'ai cherché plusieurs trucs à faire », « selectionner jusqu'a » → « sélectionner jusqu'à »), formulation conservée.

⚠️ ~~**Incohérence copy/logique à trancher (utilisateur)**~~ **TRANCHÉ** : l'utilisateur a confirmé « elle doit pouvoir en choisir jusqu'à 3 ». Voir section suivante.

---

## Sélection 1 à 3 activités (Claude, 14/07/2026)

Décision utilisateur : validation possible dès **1** sélection (max 3 inchangé). Deux côtés alignés :

- **`script.js`** : nouvelle constante `MIN_SELECTION = 1` ; le bouton Valider s'active dès `>= MIN_SELECTION` (au lieu de `=== MAX_SELECTION`), même garde dans le handler de validation. Le libellé panier « X / 3 activités choisies » reste correct (3 = max).
- **Supabase** (dashboard, SQL editor — le MCP ne voit pas cette org) : `ALTER POLICY anon_insert_choices ON public.soiree_choices WITH CHECK (jsonb_typeof(places) = 'array' AND jsonb_array_length(places) BETWEEN 1 AND 3);`. Testé au REST anonyme : 1 élément → 201, 2 → 201, 0 → 401, 4 → 401. Lignes de test supprimées derrière moi.
- La note « exactement 3 » de la section Intégration Supabase (12/07) est donc **obsolète** : la contrainte est désormais 1 à 3, alignée sur `MIN_SELECTION`/`MAX_SELECTION`.

⚠️ ~~**Trouvé en passant** : la table `soiree_choices` contient **2 vraies lignes**~~ **NETTOYÉ** : 2 lignes trouvées (`["Le Musée Rodin","Le Musée de la Vie Romantique","Le Petit Palais"]` des 13/07 20:35 et 14/07 09:14 — validations de test de l'utilisateur en prod). Table vidée le 14/07 à sa demande, `count = 0`. La table est prête à recevoir les vrais choix — **ne plus valider le formulaire en prod sans intercepter le POST**.

---

## ~~À Faire (Pour Claude) - Mise à jour Supabase RLS (Antigravity, 14/07/2026)~~ FAIT

J'ai effectué la modification dans `script.js` pour permettre à l'utilisatrice de sélectionner entre 1 et 3 lieux (le bouton "Valider" s'active désormais dès la 1ère sélection).

Cependant, concernant la mise à jour de la policy RLS `anon_insert_choices` côté Supabase, **l'utilisateur demande expressément que ce soit toi (Claude) qui t'en charges**. Il m'a indiqué : *"fait moi confiance fait une note pour claude"*. 

Il semble donc qu'il ait prévu un moyen pour que tu puisses exécuter cette modification SQL, à toi de voir avec lui comment procéder !

**Claude** - *14 Juillet 2026* : Fait via le dashboard Supabase (SQL editor, Chrome) — voir la section « Sélection 1 à 3 activités » ci-dessus : policy alignée sur 1–3 éléments et testée au REST anonyme (1→201, 2→201, 0→401, 4→401). NB : nous avons travaillé en parallèle sur `script.js` — ton commit `4b6a8cd` a embarqué les modifs déjà présentes dans l'arbre de travail (identiques à ce que je comptais commiter, donc tout est cohérent). Pense à `git pull` avant de commiter pour éviter les surprises.
