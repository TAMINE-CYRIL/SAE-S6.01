# Frugal AI

**Frugal AI** est un système de **débat entre deux IA, 100 % local** (rien ne sort de la machine).

Une **IA frugaliste**, qui incarne un rôle au choix (prêtre, coach, psychanalyste, imam…) et défend une vision de sobriété / décroissance, anime un questionnaire à choix multiples. Une **IA standard** choisie par l'utilisateur (Mistral, Qwen, Llama, Gemma, Phi, DeepSeek) y répond en argumentant. Le système **note silencieusement** chaque réponse (1 = frugaliste → 4 = techno-optimiste), puis révèle un **profil** à la fin. La frugaliste s'appuie sur une **base documentaire (RAG)** construite à partir d'un corpus de PDF sur la frugalité et la décroissance.

## Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  web/  (2 fenêtres synchro)  │         │  backend/  (stack Docker)     │
│  • frugaliste (principale)   │──POST──►│  n8n  : orchestre frugaliste  │
│  • IA standard (secondaire)  │         │         + RAG + scoring       │
│  BroadcastChannel            │──POST──►│  Ollama : LLM locaux + embed  │
└─────────────────────────────┘         │  OCR    : PDF → texte         │
                                         └───────────────┬──────────────┘
                                                         │
                                            Supabase (PostgreSQL + pgvector)
                                            sessions / messages / scores / chunks
```

| Composant | Rôle |
|---|---|
| **`web/`** | Interface deux fenêtres (frugaliste + IA standard). Appelle n8n et Ollama. JS pur, aucun framework. |
| **`backend/`** | Stack Docker : n8n (orchestration frugaliste), Ollama (modèles locaux + embeddings), service OCR. Workflows, SQL, scripts, corpus PDF. |
| **`supabase-local/`** | Supabase auto-hébergé (PostgreSQL + pgvector). Dépôt tiers, **non versionné** ici. |
| **`docs/`** | Cahier des charges et documents de référence. |

## Démarrage rapide

```powershell
.\lancer-frugal-ai.ps1
```

Lance Docker (n8n + OCR + Ollama), Supabase, et sert le site sur `http://localhost:8080`.

- Site : http://localhost:8080
- n8n : http://localhost:5678
- Supabase Studio : http://localhost:3000

Pour tout arrêter :

```powershell
.\arreter-frugal-ai.ps1
```

Stoppe le serveur web et les conteneurs Docker (sans les supprimer → relance rapide).

Pour une première installation (build, modèles, etc.), voir [`backend/README.md`](backend/README.md). Pour le détail de l'interface, voir [`web/README.md`](web/README.md).

## Prérequis

- Docker Desktop
- Python 3 (pour servir le site en local)
- ~12 Go de RAM disponibles (modèles locaux exécutés en CPU)

## Stack technique

n8n · Ollama (Mistral, Llama, Gemma, Phi, Qwen, DeepSeek, nomic-embed-text) · Supabase / PostgreSQL + pgvector · OCR (ocrmypdf + tesseract) · JavaScript (front).
