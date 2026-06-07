# Guide d'installation — Frugal AI

Ce dossier regroupe les différentes étapes nécessaires pour installer et lancer Frugal AI en local. Le projet repose sur plusieurs services qui doivent fonctionner ensemble : une interface web, des workflows n8n, des modèles d'IA exécutés avec Ollama, un service OCR et une base Supabase utilisée pour stocker les données et le corpus vectorisé.

Le guide est prévu pour une installation sur Windows 10 ou Windows 11, avec PowerShell, Docker Desktop et WSL2. Sauf indication contraire, les commandes doivent être exécutées depuis la racine du projet, c'est-à-dire le dossier qui contient ce fichier.

## Présentation du projet

Frugal AI est une application locale mettant en scène un échange entre deux intelligences artificielles. La première joue le rôle d'une IA « frugaliste » et guide l'utilisateur à travers un questionnaire. La seconde, appelée IA standard, répond aux questions et argumente ses choix. À la fin de l'échange, l'application attribue un score et affiche un profil.

L'intérêt du projet est aussi technique : l'IA frugaliste peut s'appuyer sur une base documentaire construite à partir de fichiers PDF. Ces documents sont lus, découpés en fragments, transformés en vecteurs, puis stockés dans Supabase. Ce mécanisme correspond au principe du RAG, pour *Retrieval-Augmented Generation*.

L'ensemble fonctionne localement. Les modèles sont exécutés avec Ollama, les scénarios sont orchestrés avec n8n et la base de données est hébergée sur la machine de l'utilisateur via Docker.

## Architecture générale

Le fonctionnement du projet peut se résumer de la manière suivante :

```text
Navigateur utilisateur
        |
        | accès au site local
        v
Interface web — localhost:8080
        |
        | appels webhook
        v
n8n — orchestration des workflows
        |
        | appels aux modèles et à la base
        v
Ollama — modèles IA locaux
OCR — extraction du texte des PDF
Supabase — stockage, sessions, messages, scores et vecteurs
```

Supabase repose sur PostgreSQL et utilise l'extension pgvector pour effectuer des recherches par similarité dans les documents indexés. n8n sert de couche d'orchestration : il reçoit les demandes de l'interface, interroge les modèles, récupère les passages pertinents du corpus et renvoie les réponses au site.

## Ordre d'installation

Les étapes doivent être suivies dans l'ordre, car chacune dépend de la précédente.

| Étape | Fichier | Objectif |
|---|---|---|
| 0 | [00-prerequis.md](00-prerequis.md) | Installer les outils nécessaires : WSL2, Docker Desktop, Python et Git |
| 1 | [01-supabase.md](01-supabase.md) | Télécharger et démarrer Supabase en local |
| 2 | [02-base-de-donnees.md](02-base-de-donnees.md) | Créer les tables, activer pgvector et installer les fonctions SQL |
| 3 | [03-backend-et-modeles.md](03-backend-et-modeles.md) | Démarrer n8n, Ollama, l'OCR et télécharger les modèles |
| 4 | [04-workflows-n8n.md](04-workflows-n8n.md) | Importer et activer les workflows n8n |
| 5 | [05-corpus-rag.md](05-corpus-rag.md) | Ajouter les PDF et construire la base documentaire |
| 6 | [06-lancer-et-utiliser.md](06-lancer-et-utiliser.md) | Lancer l'application et utiliser l'interface |
| 7 | [07-depannage.md](07-depannage.md) | Diagnostiquer les problèmes les plus fréquents |

La première installation peut prendre du temps, principalement à cause du téléchargement des images Docker et des modèles d'IA. Une fois les services installés, le lancement quotidien est beaucoup plus rapide.

## Configuration matérielle recommandée

Le projet peut fonctionner sur une machine classique, mais l'exécution locale des modèles d'IA demande des ressources. Il est recommandé de prévoir au minimum 12 Go de RAM et environ 20 Go d'espace disque libre. Une connexion stable est également préférable lors de la première installation, car plusieurs fichiers volumineux sont téléchargés.

Les modèles sont exécutés localement, généralement sur le processeur. Sur une machine peu puissante, les premières réponses peuvent donc être lentes, notamment au moment où Ollama charge un modèle en mémoire.

## Scripts principaux

Plusieurs scripts sont fournis pour automatiser l'installation et le lancement.

Les scripts placés dans `backend/scripts/` sont utilisés pendant l'installation :

| Script | Rôle |
|---|---|
| `init_supabase.ps1` | Initialise les tables Supabase, active pgvector et ajoute les fonctions SQL |
| `setup.ps1` | Démarre les services backend et télécharge les modèles Ollama |
| `import_workflows.ps1` | Importe les workflows n8n et applique les réglages du projet |

Deux scripts placés à la racine servent à l'utilisation courante :

| Script | Rôle |
|---|---|
| `lancer-frugal-ai.ps1` | Démarre les services et ouvre l'interface web |
| `arreter-frugal-ai.ps1` | Arrête proprement le serveur web et les conteneurs |

Après l'installation complète, il n'est normalement plus nécessaire de refaire les étapes 0 à 5. Il suffit d'utiliser les scripts de lancement et d'arrêt.
