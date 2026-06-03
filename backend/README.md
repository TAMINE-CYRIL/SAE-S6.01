# Frugal AI — Backend

Stack Docker local qui alimente l'IA frugaliste et le système RAG. **100 % local**, aucune donnée ne sort de la machine.

## Services (`docker-compose.yml`)

| Service | Conteneur | Port | Rôle |
|---|---|---|---|
| n8n | `frugalai-n8n` | 5678 | Orchestre l'IA frugaliste (webhook `frugalai-frugaliste`) : construit le prompt, interroge le LLM, fait le scoring, lit le RAG, écrit dans Supabase. |
| OCR | `frugalai-ocr` | 3100 | Extrait le texte des PDF (Flask + ocrmypdf + tesseract), avec cache. |
| Ollama | `frugalai-ollama` | 11434 | Modèles locaux : LLM frugaliste + IA standard + embeddings `nomic-embed-text`. |

Supabase (PostgreSQL + pgvector) tourne séparément depuis `supabase-local/` (port 8000 via Kong, Studio sur 3000).

## Arborescence

```
backend/
├── docker-compose.yml      # n8n + OCR + Ollama (nom de projet Docker : frugalai)
├── .env.example            # copier en .env et compléter
├── n8n/                    # exports des workflows (à importer dans n8n)
│   ├── workflow_A_ingestion.json   # ingestion RAG : PDF → OCR → chunks → embeddings → Supabase
│   ├── workflow_B_frugaliste.json  # cœur : webhook IA frugaliste
│   └── workflow_C_replay.json      # rejeu d'une session
├── ocr/                    # service OCR (app.py + Dockerfile)
├── sql/                    # 01_schema.sql, 02_functions.sql (tables + match_chunks)
├── scripts/                # setup.ps1 + scripts de patch des workflows n8n
│   ├── setup.ps1
│   ├── patch_workflow.js   # patche le Workflow B (prompt, scoring, personas, RAG…)
│   └── patch_workflow_A.js # patche le Workflow A (ingestion RAG)
├── pdfs/                   # corpus RAG (sources sur la frugalité / décroissance)
└── ocr_cache/              # cache du texte OCR (généré, gitignoré)
```

## Mise en route

```powershell
cd backend\scripts
.\setup.ps1        # crée .env, build l'OCR, démarre les conteneurs, télécharge les modèles
```

Puis, depuis n8n (`http://localhost:5678`) : importer les workflows de `n8n/`, et appliquer les patches :

```powershell
docker cp scripts\patch_workflow.js   frugalai-n8n:/tmp/patch_workflow.js
docker exec frugalai-n8n node /tmp/patch_workflow.js
docker cp scripts\patch_workflow_A.js frugalai-n8n:/tmp/patch_workflow_A.js
docker exec frugalai-n8n node /tmp/patch_workflow_A.js
docker restart frugalai-n8n
```

## Notes

- Les modèles Ollama sont stockés à l'emplacement `OLLAMA_DATA_PATH` du `.env` (chemin hôte), pas dans un volume Docker.
- Les workflows et patches actifs vivent dans le volume `frugalai_n8n_data` (persistant entre redémarrages).
- Inférence **CPU** par défaut (voir le bloc GPU commenté dans `docker-compose.yml`).
