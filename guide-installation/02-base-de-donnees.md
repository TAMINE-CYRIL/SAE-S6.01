# Étape 2 — Initialiser la base de données

Après le démarrage de Supabase, la base PostgreSQL est disponible mais ne contient pas encore la structure attendue par Frugal AI. Il faut créer les tables utilisées par l'application, activer l'extension pgvector et ajouter les fonctions SQL appelées par les workflows n8n.

Cette étape est automatisée par le script `init_supabase.ps1`, situé dans `backend/scripts/`.

## 2.1 Exécuter le script d'initialisation

Depuis la racine du projet, lancer :

```powershell
cd backend\scripts
.\init_supabase.ps1
cd ..\..
```

Le script applique les fichiers SQL prévus par le projet. Il crée notamment les tables `sessions`, `messages`, `scores` et `chunks`. Il active aussi l'extension `vector`, utilisée pour stocker les représentations vectorielles des textes.

Le script est prévu pour pouvoir être relancé. S'il détecte que certains éléments existent déjà, il les ignore sans supprimer les données existantes.

## 2.2 Autoriser temporairement les scripts PowerShell

Sur certaines machines, PowerShell bloque l'exécution des scripts `.ps1`. Si un message indique que l'exécution de scripts est désactivée, lancer cette commande dans la même fenêtre PowerShell :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Cette autorisation ne vaut que pour la session PowerShell en cours. Une fois la commande exécutée, relancer le script d'initialisation :

```powershell
.\init_supabase.ps1
```

## 2.3 Résultat attendu

Le script doit indiquer que les fichiers SQL ont été appliqués. Une sortie similaire à celle-ci est attendue :

```text
Application de 01_schema.sql ...
  [OK] 01_schema.sql applique
Application de 02_functions.sql ...
  [OK] 02_functions.sql applique

[DONE] Tables : sessions, messages, scores, chunks (+ pgvector, fonctions RPC)
```

Si des messages de type `NOTICE: ... already exists, skipping` apparaissent, cela signifie simplement que certaines tables ou fonctions existaient déjà. Ce comportement est normal lorsque le script est exécuté plusieurs fois.

## 2.4 Vérifier les tables

La présence des tables peut être vérifiée directement dans le conteneur PostgreSQL :

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "\dt"
```

La liste doit contenir au minimum les tables suivantes :

```text
sessions
messages
scores
chunks
```

Pour vérifier que l'extension pgvector est bien active, utiliser :

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "SELECT extname FROM pg_extension WHERE extname='vector';"
```

La requête doit retourner une ligne contenant `vector`.

## Suite de l'installation

Une fois les tables créées et l'extension activée, la base est prête. L'étape suivante consiste à démarrer les services backend et à télécharger les modèles d'IA : [03-backend-et-modeles.md](03-backend-et-modeles.md).
