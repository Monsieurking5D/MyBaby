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
- [ ] Déploiement (Vercel évoqué) — nécessaire avant le retour du 21 juillet.
