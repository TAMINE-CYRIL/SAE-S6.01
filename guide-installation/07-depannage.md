# Étape 7 — Dépannage

Les problèmes les plus courants et comment les régler. Cherche ton symptôme.

---

## Docker / démarrage

**« cannot connect to the Docker daemon » / les commandes `docker` échouent**
→ Docker Desktop n'est pas lancé ou pas prêt. Ouvre-le, attends que l'icône baleine soit stable, réessaie.

**Un conteneur est en `Restarting` ou `Exited`**
→ Regarde ses logs :
```powershell
docker logs <nom-du-conteneur> --tail 50
```
(remplace `<nom-du-conteneur>` par `frugalai-n8n`, `supabase-db`, etc.)

**`frugalai-ocr` est `(unhealthy)`**
→ Cosmétique : le service répond quand même. Vérifie avec `curl http://localhost:3100/health` → `{"status":"ok"}`.

---

## Scripts PowerShell

**« l'exécution de scripts est désactivée sur ce système »**
→ Autorise les scripts pour la session courante (sans risque), puis relance :
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Un script `.ps1` ne se lance pas en double-cliquant**
→ Lance-le **depuis PowerShell** (ouvre PowerShell, va dans le dossier, tape `.\nom.ps1`), pas par double-clic.

---

## Supabase / base de données

**`init_supabase.ps1` : « Conteneur 'supabase-db' introuvable »**
→ Supabase n'est pas démarré. Reviens à l'[étape 1](01-supabase.md) :
```powershell
cd supabase-local\docker ; docker compose up -d ; cd ..\..
```

**Beaucoup de `NOTICE: ... already exists, skipping`**
→ Normal si tu relances le script : les tables existent déjà, rien n'est cassé.

---

## n8n / workflows

**Le site affiche « webhook non enregistré » / « n8n a retourné une réponse vide »**
→ Le Workflow B n'est pas **activé**. Ouvre http://localhost:5678, ouvre Workflow B, active l'interrupteur (voir [étape 4.3](04-workflows-n8n.md)).

**`import_workflows.ps1` : « Aucun compte n8n trouve »**
→ Crée d'abord le compte propriétaire sur http://localhost:5678, puis relance le script.

**Les workflows ont disparu après une manip**
→ Relance simplement :
```powershell
cd backend\scripts ; .\import_workflows.ps1 ; cd ..\..
```

---

## Lenteur / timeouts des IA

**Le premier message met très longtemps (1–3 min)**
→ Normal : Ollama charge le modèle en mémoire au premier appel. Les suivants sont plus rapides.

**« Timeout — le modèle est trop lent »**
→ Le projet tourne sur **processeur** (pas de carte graphique), donc c'est lent par nature. Conseils :
- utilise **Mistral** ou **Qwen** (les plus rapides et fiables) ;
- ferme les applications gourmandes en RAM ;
- vérifie que WSL a assez de mémoire ([étape 0.5](00-prerequis.md)).

**Une IA répond en anglais / hors format**
→ Surtout DeepSeek (petit modèle). Préfère **Mistral** ou **Qwen** pour une démo fiable.

---

## RAG / PDF

**Après l'ingestion, `chunks = 0`**
→ Vérifie que des `.pdf` sont bien dans `backend/pdfs/`, puis relance le Workflow A. Regarde l'exécution dans n8n pour repérer une étape en erreur.

**L'ingestion est interminable**
→ Les PDF scannés passent par l'OCR (lent sur CPU). Laisse finir : le résultat est mis en cache (`backend/ocr_cache/`) et ne sera pas refait.

---

## Repartir de zéro (cas extrême)

Si tu veux **tout réinitialiser** côté backend (⚠️ supprime les conteneurs et données n8n, mais **pas** les modèles s'ils sont sur `OLLAMA_DATA_PATH`) :

```powershell
docker compose -f backend\docker-compose.yml down -v
```

Puis reprends à l'[étape 3](03-backend-et-modeles.md). Pour Supabase, idem dans `supabase-local\docker`.

---

Toujours bloqué ? Note le **message d'erreur exact** et l'**étape** où ça coince : c'est le plus utile pour diagnostiquer.
