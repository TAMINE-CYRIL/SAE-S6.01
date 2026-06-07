# Étape 4 — Importer les workflows n8n

n8n est utilisé pour piloter la logique applicative de Frugal AI. Après son démarrage, l'interface n8n est vide : il faut donc importer les workflows fournis avec le projet, puis activer ceux qui doivent répondre aux appels de l'interface web.

Le projet contient trois workflows principaux :

| Workflow | Rôle |
|---|---|
| Workflow A | Ingestion du corpus RAG à partir des fichiers PDF |
| Workflow B | Dialogue principal avec l'IA frugaliste, appelé par webhook |
| Workflow C | Relecture ou replay d'une session existante |

Le Workflow B est le plus important pour l'utilisation de l'interface. C'est lui qui reçoit les requêtes envoyées par le site.

## 4.1 Créer le compte propriétaire n8n

Lors du premier accès à n8n, l'application demande de créer un compte propriétaire local. Ce compte n'est pas un compte en ligne : il sert uniquement à accéder à l'instance n8n installée sur la machine.

Ouvrir l'adresse suivante dans le navigateur :

```text
http://localhost:5678
```

Remplir le formulaire avec une adresse email et un mot de passe. Ces identifiants doivent être conservés, car ils permettront de revenir dans l'interface n8n plus tard.

Cette étape doit être faite avant l'import des workflows. Sans compte propriétaire, le script d'import ne peut pas associer les workflows à un utilisateur n8n.

## 4.2 Importer les workflows

Depuis la racine du projet, lancer le script d'import :

```powershell
cd backend\scripts
.\import_workflows.ps1
cd ..\..
```

Le script effectue plusieurs opérations :

```text
- récupération du compte propriétaire n8n ;
- import des fichiers JSON présents dans backend/n8n/ ;
- application des fichiers de patch du projet ;
- redémarrage de n8n pour prendre en compte les modifications.
```

Si le message `Aucun compte n8n trouve` apparaît, cela signifie que l'étape précédente n'a pas été réalisée. Il faut alors ouvrir `http://localhost:5678`, créer le compte propriétaire, puis relancer le script.

## 4.3 Activer les workflows nécessaires

Après l'import, les workflows peuvent être présents dans n8n sans être actifs. Pour que le site puisse appeler un workflow via webhook, celui-ci doit être activé.

Dans l'interface n8n :

```text
1. Recharger la page http://localhost:5678 si nécessaire.
2. Ouvrir le Workflow B.
3. Activer l'interrupteur "Active" situé en haut à droite.
4. Faire la même opération pour le Workflow C.
```

Le Workflow A n'a pas besoin d'être activé en permanence. Il sert principalement à construire le corpus RAG et sera exécuté manuellement à l'étape suivante.

## 4.4 Tester le webhook principal

Le test suivant permet de vérifier que le Workflow B répond bien aux appels HTTP :

```powershell
curl -X POST http://localhost:5678/webhook/frugalai-frugaliste -H "Content-Type: application/json" -d '{"session_id":null,"role":"coach","message":"","tour":0,"modele_standard":"mistral"}' --max-time 240
```

Lors du premier appel, Ollama peut prendre du temps à charger le modèle en mémoire. Un délai d'une à trois minutes peut donc être normal. Le test est réussi si une réponse JSON est renvoyée, avec un champ contenant le message de la frugaliste.

Si la réponse indique que le webhook n'est pas enregistré, le Workflow B n'est probablement pas actif. Dans ce cas, retourner dans n8n et vérifier l'interrupteur d'activation.

## Suite de l'installation

Une fois les workflows importés et le Workflow B actif, l'application peut répondre aux requêtes. Il reste à construire la base documentaire utilisée par le RAG : [05-corpus-rag.md](05-corpus-rag.md).
