# Étape 3 — Démarrer le backend et installer les modèles

Cette étape met en place les services applicatifs utilisés par Frugal AI. Le backend repose principalement sur trois composants : n8n pour l'orchestration des workflows, Ollama pour l'exécution locale des modèles d'IA, et un service OCR pour extraire le texte des PDF.

Le script `setup.ps1` automatise le démarrage des conteneurs et le téléchargement des modèles nécessaires.

## 3.1 Préparer le fichier `.env`

Le backend lit sa configuration depuis un fichier `.env`. Le projet fournit un modèle qu'il faut copier avant le premier lancement :

```powershell
Copy-Item backend\.env.example backend\.env
```

Ouvrir ensuite `backend\.env` avec un éditeur de texte, par exemple le Bloc-notes ou VS Code.

Deux points doivent être vérifiés en priorité :

| Variable | Valeur attendue |
|---|---|
| `OLLAMA_DATA_PATH` | Dossier dans lequel les modèles Ollama seront stockés. Exemple : `C:/Users/<ton-nom>/.ollama`. Il est aussi possible de laisser vide pour utiliser un volume Docker. |
| `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_KEY` | Clés issues du fichier `supabase-local/docker/.env`, notamment `ANON_KEY` et `SERVICE_ROLE_KEY`. |

Les autres variables disposent normalement de valeurs adaptées à l'installation locale. Il n'est donc pas nécessaire de les modifier, sauf besoin particulier.

## 3.2 Lancer le script de configuration

Depuis la racine du projet, exécuter :

```powershell
cd backend\scripts
.\setup.ps1
cd ..\..
```

Ce script construit l'image du service OCR, démarre les conteneurs `frugalai-n8n`, `frugalai-ollama` et `frugalai-ocr`, attend que le service Ollama soit disponible, puis télécharge les modèles nécessaires.

Le téléchargement peut être long lors de la première installation, car plusieurs modèles pèsent plusieurs gigaoctets. Il est normal que le script reste plusieurs minutes sur certaines étapes.

Les modèles installés par défaut sont :

```text
mistral
nomic-embed-text
llama3.1
gemma2:2b
phi3
qwen2.5
deepseek-r1:1.5b
```

Le modèle `nomic-embed-text` est utilisé pour générer les embeddings nécessaires au RAG.

## 3.3 Vérifier les conteneurs backend

Lorsque le script est terminé, vérifier que les services sont bien lancés :

```powershell
docker ps --filter "name=frugalai" --format "{{.Names}} : {{.Status}}"
```

Les conteneurs suivants doivent apparaître :

```text
frugalai-n8n
frugalai-ollama
frugalai-ocr
```

Ils doivent être en état `Up`. Si `frugalai-ocr` apparaît avec l'état `unhealthy`, cela peut provenir du test de santé interne du conteneur. Le service peut tout de même répondre correctement. La commande suivante permet de le vérifier :

```powershell
curl http://localhost:3100/health
```

La réponse attendue est :

```json
{"status":"ok"}
```

## 3.4 Vérifier les modèles Ollama

Pour afficher la liste des modèles installés dans le conteneur Ollama :

```powershell
docker exec frugalai-ollama ollama list
```

La liste doit contenir au minimum `mistral` et `nomic-embed-text`. Si un modèle manque, relancer le script `setup.ps1` ou télécharger le modèle manuellement depuis le conteneur Ollama.

## Suite de l'installation

Lorsque les trois conteneurs backend sont lancés et que les modèles sont présents, il faut importer les workflows n8n utilisés par l'application : [04-workflows-n8n.md](04-workflows-n8n.md).
