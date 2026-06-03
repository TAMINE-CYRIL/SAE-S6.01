# Frugal AI — Interface web

Interface à **deux fenêtres synchronisées** qui met en scène un débat entre deux IA locales :

- **Fenêtre principale** (`index.html`, fond sombre) : l'**IA frugaliste**, qui incarne un rôle (prêtre, coach, psychanalyste…) et pose un questionnaire à choix multiples.
- **Fenêtre secondaire** (`secondary.html`, fond clair) : l'**IA standard** choisie (Mistral, Qwen, Llama…), qui argumente et répond.

Les deux fenêtres communiquent via `BroadcastChannel` (aucun serveur intermédiaire pour la synchro).

## Qui appelle quoi

```
index.html (frugaliste) ──POST──► n8n  (webhook frugalai-frugaliste, :5678)
        │                              └─ orchestre la frugaliste : prompt + RAG + scoring
        │ BroadcastChannel('frugal-ai')
        ▼
secondary.html (IA standard) ──POST──► Ollama  (/api/chat, :11434)
```

- La logique de débat vit dans `js/main.js` : il appelle n8n pour la frugaliste **et** Ollama directement pour l'IA standard.
- Le scoring est invisible : l'IA standard termine par une balise `[[X]]` (retirée avant l'affichage) que le backend lit pour calculer le profil.

## Structure

```
web/
├── index.html          # Fenêtre principale (IA frugaliste)
├── secondary.html      # Fenêtre secondaire (IA standard)
├── css/
│   ├── main.css
│   └── secondary.css
└── js/
    ├── config.js       # URL webhook n8n, URL Ollama, nom du canal
    ├── constants.js    # Rôles (15) et IA (réglages par modèle : tokens, contexte, nudge)
    ├── shared.js       # Sync, effet machine à écrire, appels n8n/Ollama, nettoyage
    ├── main.js         # Boucle de débat (fenêtre principale)
    └── secondary.js    # Affichage fenêtre secondaire
```

## Démarrage

Le site doit être **servi** (pas ouvert en `file://`) pour que `BroadcastChannel` fonctionne. Le plus simple est le script à la racine du projet :

```powershell
.\lancer-frugal-ai.ps1
```

…qui lance Docker (n8n, OCR, Ollama), Supabase, puis sert ce dossier sur `http://localhost:8080`.

Manuellement :

```powershell
cd web ; python -m http.server 8080
```

Puis ouvrir `http://localhost:8080` (la fenêtre secondaire s'ouvre automatiquement — autoriser les pop-ups).

## Contrôles

Au clavier : une touche pour le **rôle**, une touche pour l'**IA standard**, puis **Entrée** pour lancer le débat. Les associations touche → rôle / IA sont définies dans `js/constants.js`.

## Configuration (`js/config.js`)

```js
N8N_WEBHOOK_URL: 'http://localhost:5678/webhook/frugalai-frugaliste',
OLLAMA_API_URL:  'http://localhost:11434/api/chat',
DEMO_MODE: false,            // true = réponses simulées, sans backend
CHANNEL_NAME: 'frugal-ai',
```
