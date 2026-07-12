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

**Claude** - *12 Juillet 2026* : Ajout de l'envoi email silencieux des choix validés via Web3Forms (`sendChoicesByEmail` dans `script.js`). ⚠️ La constante `WEB3FORMS_ACCESS_KEY` contient un placeholder — l'utilisateur doit récupérer sa clé sur web3forms.com et la remplacer. Dépôt Git initialisé et poussé sur `https://github.com/Monsieurking5D/MyBaby.git` (branche `main`).
