# Guide d'installation — Frugal AI

Bienvenue 👋 Ce guide t'accompagne **de zéro jusqu'à un projet qui tourne**, même si tu n'as jamais utilisé Docker, n8n ou Supabase. Chaque étape explique **ce que tu fais et pourquoi**, donne les **commandes exactes**, et te dit **comment vérifier que ça a marché** avant de passer à la suite.

> 🖥️ **Environnement** : Windows 10/11 + PowerShell + Docker Desktop (avec WSL2).
> Toutes les commandes se lancent dans **PowerShell**, depuis la **racine du projet** (le dossier qui contient ce guide), sauf indication contraire.

---

## 🧩 C'est quoi, Frugal AI ?

Un système de **débat entre deux IA, 100 % local** (rien ne sort de ta machine) :

- une **IA « frugaliste »** incarne un rôle (prêtre, coach, psychanalyste…) et pose un questionnaire ;
- une **IA « standard »** (Mistral, Qwen…) répond en argumentant ;
- le système **note** discrètement les réponses et révèle un **profil** à la fin ;
- la frugaliste s'appuie sur une **base de connaissances** (RAG) construite à partir de PDF.

Pour que tout ça fonctionne, **4 briques** doivent tourner ensemble :

```
   Toi (navigateur)                          Ta machine (Docker)
 ┌──────────────────┐                 ┌─────────────────────────────────┐
 │  Site web (2     │  ──webhook──►   │  n8n      orchestre la frugaliste │
 │  fenêtres)       │                 │  Ollama   exécute les modèles IA  │
 │  localhost:8080  │  ──API────►     │  OCR      lit les PDF             │
 └──────────────────┘                 └────────────────┬────────────────┘
                                                        │
                                          Supabase (base de données +
                                          recherche vectorielle pgvector)
```

Tu vas installer ces briques **dans l'ordre**, une étape à la fois.

---

## 🗺️ Le parcours (suis les fiches dans l'ordre)

| # | Étape | Fiche | Type | Durée ~ |
|---|---|---|---|---|
| 0 | Installer les outils de base | [00-prerequis.md](00-prerequis.md) | manuel | 30–60 min |
| 1 | Lancer la base de données Supabase | [01-supabase.md](01-supabase.md) | commandes | 15 min |
| 2 | Créer les tables | [02-base-de-donnees.md](02-base-de-donnees.md) | script | 2 min |
| 3 | Démarrer le backend + télécharger les IA | [03-backend-et-modeles.md](03-backend-et-modeles.md) | script | 30–60 min |
| 4 | Importer les workflows n8n | [04-workflows-n8n.md](04-workflows-n8n.md) | script | 10 min |
| 5 | Ajouter les PDF et construire le RAG | [05-corpus-rag.md](05-corpus-rag.md) | manuel | variable |
| 6 | Lancer et utiliser le projet | [06-lancer-et-utiliser.md](06-lancer-et-utiliser.md) | script | 2 min |
| — | En cas de problème | [07-depannage.md](07-depannage.md) | référence | — |

> ⏱️ **Compte large pour la première fois** : l'essentiel du temps, c'est le téléchargement de Docker, des images et des modèles IA (plusieurs Go). Une fois installé, le lancement quotidien prend quelques secondes.

---

## ✅ Avant de commencer : checklist matériel

- **RAM** : 12 Go minimum recommandés (les IA tournent sur le processeur).
- **Disque** : prévois ~20 Go libres (images Docker + modèles + Supabase).
- **Connexion** : les téléchargements initiaux sont lourds.

Si tu es prêt, ouvre la première fiche : **[00-prerequis.md](00-prerequis.md)**.

---

## 🛠️ Mémo des scripts (utilisés pendant le parcours)

Tous dans `backend/scripts/` :

| Script | Ce qu'il fait | Fiche |
|---|---|---|
| `init_supabase.ps1` | Crée les tables + active pgvector | étape 2 |
| `setup.ps1` | Build OCR, démarre le backend, télécharge les modèles | étape 3 |
| `import_workflows.ps1` | Importe les workflows n8n et applique les réglages | étape 4 |

Et à la racine du projet :

| Script | Ce qu'il fait |
|---|---|
| `lancer-frugal-ai.ps1` | Démarre tout et ouvre le site |
| `arreter-frugal-ai.ps1` | Arrête proprement le serveur web et les conteneurs |
