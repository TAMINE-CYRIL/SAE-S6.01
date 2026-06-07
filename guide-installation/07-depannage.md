# Étape 7 — Dépannage

Cette page regroupe les problèmes les plus fréquents rencontrés lors de l'installation ou de l'utilisation de Frugal AI. Pour résoudre un blocage, il faut d'abord identifier l'étape concernée : Docker, Supabase, n8n, les modèles Ollama, l'OCR ou le corpus RAG.

## Docker et démarrage des conteneurs

### Docker ne répond pas

Si les commandes Docker renvoient un message du type `cannot connect to the Docker daemon`, Docker Desktop n'est probablement pas lancé ou n'a pas terminé son démarrage.

Ouvrir Docker Desktop, attendre que le moteur soit prêt, puis vérifier avec :

```powershell
docker info
```

Si l'erreur persiste, redémarrer Docker Desktop ou relancer la machine.

### Un conteneur est arrêté ou redémarre en boucle

Si un conteneur apparaît avec l'état `Exited` ou `Restarting`, consulter ses logs permet généralement d'identifier la cause :

```powershell
docker logs <nom-du-conteneur> --tail 50
```

Remplacer `<nom-du-conteneur>` par le nom réel, par exemple `frugalai-n8n`, `frugalai-ollama`, `frugalai-ocr` ou `supabase-db`.

### Le conteneur OCR apparaît comme unhealthy

Il peut arriver que `frugalai-ocr` soit indiqué comme `unhealthy` alors que le service répond correctement. Pour vérifier son état réel, lancer :

```powershell
curl http://localhost:3100/health
```

Si la réponse est :

```json
{"status":"ok"}
```

le service OCR est bien utilisable.

## Scripts PowerShell

### L'exécution des scripts est désactivée

Windows peut bloquer les fichiers `.ps1` selon la politique d'exécution PowerShell. Pour autoriser les scripts uniquement dans la session courante, lancer :

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Relancer ensuite le script souhaité dans la même fenêtre PowerShell.

### Un script ne se lance pas par double-clic

Les scripts PowerShell du projet doivent être lancés depuis un terminal. Il ne faut pas les exécuter par double-clic.

Exemple :

```powershell
cd backend\scripts
.\setup.ps1
```

## Supabase et base de données

### Le conteneur `supabase-db` est introuvable

Si `init_supabase.ps1` indique que le conteneur `supabase-db` est introuvable, Supabase n'est probablement pas démarré.

Depuis la racine du projet, relancer Supabase :

```powershell
cd supabase-local\docker
docker compose up -d
cd ..\..
```

Vérifier ensuite la présence du conteneur :

```powershell
docker ps --filter "name=supabase"
```

### Des messages `already exists` apparaissent

Lors de l'initialisation de la base, des messages comme `NOTICE: ... already exists, skipping` peuvent apparaître. Cela signifie simplement que certains éléments avaient déjà été créés lors d'une exécution précédente. Ce n'est pas une erreur.

## n8n et workflows

### Le site indique que le webhook n'est pas enregistré

Ce problème apparaît généralement lorsque le Workflow B n'est pas actif dans n8n.

Ouvrir :

```text
http://localhost:5678
```

Puis ouvrir le Workflow B et vérifier que l'interrupteur `Active` est activé. Le Workflow C doit également être activé si la fonction de replay est utilisée.

### Le script d'import ne trouve aucun compte n8n

Si `import_workflows.ps1` affiche `Aucun compte n8n trouve`, il faut créer le compte propriétaire n8n avant de relancer le script.

Procédure :

```text
1. Ouvrir http://localhost:5678.
2. Créer le compte propriétaire local.
3. Relancer backend\scripts\import_workflows.ps1.
```

### Les workflows ont disparu ou semblent mal configurés

Il est possible de relancer l'import des workflows :

```powershell
cd backend\scripts
.\import_workflows.ps1
cd ..\..
```

Après l'import, vérifier à nouveau que les workflows B et C sont actifs.

## Lenteur des modèles IA

### Le premier message prend beaucoup de temps

Au premier appel, Ollama doit charger le modèle en mémoire. Cette opération peut prendre une à trois minutes sur une machine sans carte graphique dédiée. Les appels suivants sont généralement plus rapides.

### Le modèle dépasse le délai prévu

Si un timeout apparaît, la machine est probablement trop sollicitée ou le modèle choisi est trop lourd. Les solutions les plus simples sont :

```text
- utiliser mistral ou qwen2.5 ;
- fermer les applications qui consomment beaucoup de mémoire ;
- vérifier la configuration mémoire de WSL dans .wslconfig ;
- relancer Docker Desktop si les conteneurs semblent bloqués.
```

### Une réponse est en anglais ou ne respecte pas le format attendu

Certains petits modèles peuvent être moins fiables sur les consignes de format. Pour une démonstration, il vaut mieux utiliser `mistral` ou `qwen2.5`, qui donnent en général des réponses plus régulières.

## RAG et fichiers PDF

### La table `chunks` reste vide

Si la requête de vérification indique `chunks = 0`, le corpus n'a pas été inséré dans Supabase. Les points à vérifier sont les suivants :

```text
- des fichiers .pdf sont bien présents dans backend/pdfs/ ;
- le Workflow A a été exécuté jusqu'au bout ;
- aucune étape du workflow n'est en erreur dans n8n ;
- Supabase est démarré pendant l'ingestion.
```

La requête de contrôle est :

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "SELECT count(*) AS chunks, count(DISTINCT source_pdf) AS pdfs FROM chunks;"
```

### L'ingestion des PDF est très longue

Les PDF scannés passent par l'OCR, ce qui peut être lent sur processeur. Il est préférable de laisser le workflow terminer. Les textes extraits sont ensuite conservés dans `backend/ocr_cache/`, ce qui accélère les exécutions suivantes.

## Réinitialisation complète

En dernier recours, il est possible de supprimer les conteneurs et volumes du backend. Cette opération efface les données associées aux conteneurs concernés. Elle ne supprime pas forcément les modèles si ceux-ci sont stockés dans un dossier défini par `OLLAMA_DATA_PATH`.

Depuis la racine du projet :

```powershell
docker compose -f backend\docker-compose.yml down -v
```

Pour Supabase, la réinitialisation se fait depuis le dossier `supabase-local\docker` avec une commande équivalente :

```powershell
cd supabase-local\docker
docker compose down -v
cd ..\..
```

Après une réinitialisation, reprendre l'installation à partir de l'étape concernée. Si Supabase a été supprimé, il faudra recréer les tables avec [02-base-de-donnees.md](02-base-de-donnees.md). Si n8n a été supprimé, il faudra recréer le compte local et réimporter les workflows.

## Informations utiles à relever avant de demander de l'aide

Pour diagnostiquer un problème, il faut noter précisément :

```text
- l'étape où l'erreur apparaît ;
- la commande exécutée ;
- le message d'erreur complet ;
- le nom du conteneur concerné ;
- les dernières lignes des logs si un conteneur échoue.
```

Ces informations permettent de distinguer rapidement un problème Docker, un problème de configuration, une erreur n8n ou une difficulté liée aux modèles.
