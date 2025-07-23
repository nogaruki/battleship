# 🎮 Sploosh Sploosh KABOOM – README

*(Français d’abord – English below)*

---

## Présentation 🇫🇷

Sploosh Sploosh KABOOM est un mini-battleship multijoueur **full stack** Next.js 14
(App Router + Server Components) propulsé par MongoDB.
Aucune inscription : un simple pseudo, et c’est parti !

### Fonctionnalités

| Bloc                             | Détails                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentification ultra-light** | Pseudo ➜ stocké localStorage ➜ session instantanée                                                                                     |
| **Éditeur de flotte**            | Placement drag-click (H/V) + règles officielles (1×5 / 1×4 / 2×3 / 1×2, interdiction de contact) + génération aléatoire + bouton Clear |
| **Lobby temps réel**             | Création de partie • Liste auto-rafraîchie (poll 2 s) • Rejoindre • Suppression (avec contrôle d’auteur)                               |
| **Reprise & historique**         | Section « Mes parties en cours » + tableau des parties terminées (victoires/défaites)                                                  |
| **Gameplay live**                | Tirs tour par tour, grille ennemie masquée, victoire quand 17 cases coulées                                                            |
| **Sons & musique**               | hit / miss / win / lose (+ boucle 8-bit) • Mute SFX • Mute musique                                                                     |
| **Toasts**                       | Succès/erreurs centrés (react-hot-toast)                                                                                               |
| **Design responsive**            | Logo + mises en page mobile < 640 px                                                                                                   |
| **Stack**                        | Next.js 14 • Tailwind 4 • TypeScript • MongoDB (Mongoose) • react-hot-toast                                                            |

### Installation

```bash
git clone https://github.com/votre-compte/battleship.git
cd battleship
cp .env.example .env      # ajoutez votre URI MongoDB
npm install
npm run dev               # http://localhost:3000
```

`MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/battleship`

### Scripts utiles

| commande                     | effet                       |
| ---------------------------- | --------------------------- |
| `npm run dev`                | serveur Next + Tailwind JIT |
| `npm run build && npm start` | build prod                  |
| `npm run lint`               | ESLint / TypeScript         |

### Architecture

```
app/
 ├─ api/          # route handlers REST
 ├─ components/   # UI réutilisable
 ├─ lib/          # hooks & helpers (auth, sound, theme…)
 ├─ stores/       # Zustand (useAuth)
 ├─ page.tsx      # lobby + login
 ├─ Game.tsx      # écran in-game
public/
 ├─ sounds/       # *.mp3
 └─ logo.svg
```

### Crédit

Projet démo codé par **Johann Avramov**.
Police : *Geist* (Vercel).

 ### Crédit audio
Effets hit / miss / win / lose et musique d’ambiance extraits du jeu
***The Legend of Zelda: The Wind Waker*** © Nintendo.
Les fichiers sont fournis exclusivement à des fins de démonstration/portfolio
(usage non-commercial, fair-use). Remplacez-les si vous publiez le projet.

---

## Overview 🇬🇧

Sploosh Sploosh KABOOM is a **full-stack battleship game** built with Next.js 14
(App Router) and MongoDB. No sign-up, just pick a nickname and play!

### Features

* **One-click auth** (nickname → localStorage)
* **Fleet builder** with official 5-4-3-3-2 ships, auto-random, clear, rule
  validation (no diagonal/contact)
* **Real-time lobby** – create, auto-refresh list, join, delete (creator only)
* **Resume & history** sections (ongoing / finished games)
* **Turn-based gameplay** – hidden enemy board, 17 hits to win
* **Sounds** (hit / miss / win / lose) + ambient loop, independent mute buttons
* **Animated Dark/Light switch** ☀️/🌙 (Tailwind 4 `dark:`)
* **Toast notifications** (react-hot-toast)
* **Responsive layout** with logo header
* **Tech**: Next.js 14, Tailwind CSS 4, TypeScript, MongoDB + Mongoose

### Quick start

```bash
git clone https://github.com/your-account/battleship.git
cd battleship
cp .env.example .env        # put your Mongo connection string
npm install
npm run dev                 # open http://localhost:3000
```

Environment:

```
MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/battleship
```

### Useful scripts

| command                      | action                    |
| ---------------------------- | ------------------------- |
| `npm run dev`                | dev server + Tailwind JIT |
| `npm run build && npm start` | production build          |
| `npm run lint`               | ESLint + ts-checks        |

### Folder structure

```
app/
  api/             REST route handlers
  components/      reusable UI
  lib/             hooks & helpers (auth, sound, theme…)
  stores/          Zustand store (useAuth)
  page.tsx         login + lobby
  Game.tsx         in-game screen
public/
  sounds/          *.mp3
  logo.svg         app logo
```

### Credit

Demo project by **Johann Avramov**.
Fonts : *Geist*.

### Audio credits
SFX hit / miss / win / lose and ambient loop are taken from
***The Legend of Zelda: The Wind Waker*** © Nintendo.
They are included for demo purposes only (non-commercial / fair-use).
Please swap them out if you redistribute the project.

> Pull requests / suggestions welcome — have fun sinking ships! ⚓️💥
