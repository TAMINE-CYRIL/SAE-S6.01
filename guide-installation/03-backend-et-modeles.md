# Étape 3 — Démarrer le backend + télécharger les IA

**Pourquoi ?** C'est ici qu'on lance le cœur du projet :
- **n8n** : l'outil qui orchestre l'IA frugaliste (construit les questions, calcule le score, interroge le RAG) ;
- **Ollama** : le moteur qui fait tourner les modèles d'IA **en local** ;
- **OCR** : un petit service qui extrait le texte des PDF.

Et on **télécharge les modèles** d'IA (Mistral, etc.) dont Ollama a besoin.

---

## 3.1 — Configurer le fichier `.env` du backend

**Pourquoi ?** Le backend lit ses réglages (clés, chemins) dans un fichier `.env`. On part du modèle fourni.

```powershell
Copy-Item backend\.env.example backend\.env
```

Ouvre `backend\.env` (avec le Bloc-notes ou VS Code) et vérifie ces deux lignes :

| Variable | Quoi mettre |
|---|---|
| `OLLAMA_DATA_PATH` | Le dossier où stocker les modèles téléchargés. Mets `C:/Users/<ton-nom>/.ollama` (avec des `/`). Laisse vide pour utiliser un volume Docker dédié. |
| `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_KEY` | Les clés de démo, copiées depuis `supabase-local/docker/.env` (cherche `ANON_KEY` et `SERVICE_ROLE_KEY`). Ce sont les clés standard. |

> 💡 Les autres variables (mot de passe Postgres, modèle frugaliste = `mistral`, etc.) ont déjà de bonnes valeurs par défaut. Tu peux ne pas y toucher.

---

## 3.2 — Lancer le script de setup

Ce script fait **tout** : il construit l'image OCR, démarre les 3 conteneurs, attend qu'Ollama soit prêt, puis télécharge les modèles un par un.

```powershell
cd backend\scripts
.\setup.ps1
cd ..\..
```

> ⏳ **C'est l'étape la plus longue** : les modèles pèsent plusieurs Go au total. Laisse tourner. C'est normal de voir « Telechargement mistral... » puis chaque modèle défiler.

Les modèles installés : `mistral`, `nomic-embed-text` (pour le RAG), `llama3.1`, `gemma2:2b`, `phi3`, `qwen2.5`, `deepseek-r1:1.5b`.

---

## 3.3 — Vérifier

**Les 3 conteneurs tournent ?**

```powershell
docker ps --filter "name=frugalai" --format "{{.Names}} : {{.Status}}"
```

Tu dois voir `frugalai-n8n`, `frugalai-ollama`, `frugalai-ocr` en `Up`.

> ℹ️ Si `frugalai-ocr` affiche `(unhealthy)`, ce n'est **pas grave** : le service répond quand même (son test de santé interne est juste cosmétique).

**Les modèles sont téléchargés ?**

```powershell
docker exec frugalai-ollama ollama list
```

Tu dois voir la liste des modèles (au moins `mistral` et `nomic-embed-text`).

**Le service OCR répond ?**

```powershell
curl http://localhost:3100/health
```

Réponse attendue : `{"status":"ok"}`.

---

## ✅ C'est bon ?

- [ ] `frugalai-n8n`, `frugalai-ollama`, `frugalai-ocr` sont `Up`
- [ ] `ollama list` montre les modèles
- [ ] `/health` répond `ok`

Si oui, on configure les workflows n8n :
👉 **[04-workflows-n8n.md](04-workflows-n8n.md)**
