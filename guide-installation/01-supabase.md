# Étape 1 — Lancer Supabase en local

Frugal AI utilise Supabase comme base de données locale. Cette base sert à stocker les sessions, les messages, les scores et les fragments de documents utilisés par le RAG. Supabase repose sur PostgreSQL et permet d'utiliser l'extension pgvector, nécessaire pour la recherche par similarité dans les textes indexés.

Le dossier `supabase-local/` n'est pas inclus directement dans le dépôt du projet, car il est volumineux. Il doit donc être récupéré depuis le dépôt officiel Supabase.

## 1.1 Vérifier que Docker est disponible

Avant de lancer Supabase, Docker Desktop doit être ouvert et opérationnel. La commande suivante permet de vérifier que le moteur Docker répond correctement :

```powershell
docker info
```

Si la commande échoue, ouvrir Docker Desktop, attendre la fin du démarrage, puis relancer la commande.

## 1.2 Télécharger le dépôt Supabase

Depuis la racine du projet, cloner le dépôt officiel Supabase dans un dossier appelé `supabase-local` :

```powershell
git clone --depth 1 https://github.com/supabase/supabase supabase-local
```

L'option `--depth 1` permet de récupérer uniquement la dernière version du dépôt. Cela réduit le temps de téléchargement et évite de récupérer tout l'historique Git.

## 1.3 Préparer le fichier de configuration

Se placer dans le dossier Docker de Supabase, puis copier le fichier d'exemple :

```powershell
cd supabase-local\docker
Copy-Item .env.example .env
```

Le fichier `.env` contient les paramètres nécessaires au démarrage local de Supabase. Les clés de démonstration présentes dans ce fichier sont celles attendues par le projet pour une installation locale.

## 1.4 Démarrer les services Supabase

Toujours depuis `supabase-local\docker`, télécharger les images Docker puis lancer les conteneurs :

```powershell
docker compose pull
docker compose up -d
cd ..\..
```

La commande `docker compose pull` récupère les images nécessaires. Elle peut être longue lors de la première installation. La commande `docker compose up -d` démarre les services en arrière-plan. Le dernier `cd ..\..` permet de revenir à la racine du projet.

## 1.5 Contrôler le démarrage

Pour vérifier que les conteneurs Supabase sont bien lancés, exécuter :

```powershell
docker ps --filter "name=supabase" --format "{{.Names}} : {{.Status}}"
```

Plusieurs conteneurs dont le nom commence par `supabase-` doivent apparaître avec l'état `Up`. Les deux plus importants pour la suite sont :

| Conteneur | Rôle |
|---|---|
| `supabase-db` | Base PostgreSQL utilisée par le projet |
| `supabase-kong` | Passerelle API exposée en local |

Le tableau de bord Supabase Studio peut généralement être consulté depuis le navigateur à l'adresse suivante :

```text
http://localhost:8000
```

Selon la configuration locale, il peut aussi être disponible sur :

```text
http://localhost:3000
```

L'accès à Studio n'est pas indispensable pour continuer, mais il peut être utile pour consulter les tables et les données.

## Suite de l'installation

Lorsque `supabase-db` est bien présent et en cours d'exécution, la base est prête à être initialisée. La prochaine étape consiste à créer les tables et les fonctions SQL : [02-base-de-donnees.md](02-base-de-donnees.md).

En cas de blocage lié à Docker ou à Supabase, consulter [07-depannage.md](07-depannage.md).
