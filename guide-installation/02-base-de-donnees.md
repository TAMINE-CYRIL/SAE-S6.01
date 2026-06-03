# Étape 2 — Créer les tables

**Pourquoi ?** Supabase tourne, mais la base est **vide**. Il faut y créer la structure : les tables (`sessions`, `messages`, `scores`, `chunks`), activer l'extension **pgvector**, et installer les **fonctions** de recherche que les workflows utiliseront. Un script fait tout ça pour toi.

> 🛡️ Le script est **idempotent** : tu peux le relancer sans risque, il ne détruit jamais de données existantes (il crée uniquement ce qui manque).

---

## 2.1 — Lancer le script

Depuis la racine du projet :

```powershell
cd backend\scripts
.\init_supabase.ps1
cd ..\..
```

> ❓ **« .ps1 ne peut pas être exécuté car l'exécution de scripts est désactivée »** ?
> Lance une fois, dans le même PowerShell :
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```
> Cela autorise les scripts **pour cette session uniquement** (sans danger), puis relance le script.

---

## 2.2 — Ce que tu dois voir

Le script applique deux fichiers SQL et affiche, pour chacun :

```
Application de 01_schema.sql ...
  [OK] 01_schema.sql applique
Application de 02_functions.sql ...
  [OK] 02_functions.sql applique

[DONE] Tables : sessions, messages, scores, chunks (+ pgvector, fonctions RPC)
```

Des messages `NOTICE: ... already exists, skipping` peuvent apparaître si tu relances le script : **c'est normal** (les éléments existent déjà).

---

## 2.3 — Vérifier (optionnel mais rassurant)

Pour confirmer que les tables existent :

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "\dt"
```

Tu dois voir `sessions`, `messages`, `scores`, `chunks` dans la liste.

Pour confirmer que pgvector est actif :

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "SELECT extname FROM pg_extension WHERE extname='vector';"
```

La ligne `vector` doit apparaître.

---

## ✅ C'est bon ?

- [ ] `[DONE] Tables : ...` affiché
- [ ] Les 4 tables apparaissent avec `\dt`

Si oui, on démarre le backend et les modèles IA :
👉 **[03-backend-et-modeles.md](03-backend-et-modeles.md)**
