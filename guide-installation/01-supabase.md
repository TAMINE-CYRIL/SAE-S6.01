# Étape 1 — Lancer la base de données Supabase

**Pourquoi ?** Frugal AI a besoin d'une base de données pour stocker les sessions, les messages, les scores, et surtout les **« chunks »** (morceaux de PDF transformés en vecteurs) qui servent au RAG. On utilise **Supabase**, qui est une base PostgreSQL avec l'extension **pgvector** (recherche par similarité) — le tout auto-hébergé sur ta machine.

> ⚠️ Le dossier `supabase-local/` **n'est pas fourni dans le dépôt** : il est trop volumineux (plus d'un Go). On va le télécharger depuis le projet officiel Supabase. Bonne nouvelle : sa configuration de démo utilise **exactement les clés** que le projet attend déjà — rien à reconfigurer.

---

## 1.1 — Vérifier que Docker tourne

L'icône baleine de Docker Desktop doit être stable. Pour confirmer :

```powershell
docker info
```

Pas d'erreur rouge = c'est bon.

---

## 1.2 — Télécharger Supabase

Depuis la **racine du projet**, clone le dépôt officiel dans un dossier nommé `supabase-local` :

```powershell
git clone --depth 1 https://github.com/supabase/supabase supabase-local
```

> `--depth 1` ne récupère que la dernière version (plus rapide, moins lourd).

---

## 1.3 — Préparer la configuration

```powershell
cd supabase-local\docker
Copy-Item .env.example .env
```

Ce fichier `.env` contient les **clés de démo standard** de Supabase. Ce sont les mêmes pour toutes les installations locales — c'est normal, et c'est précisément ce que les workflows du projet utilisent.

---

## 1.4 — Démarrer Supabase

```powershell
docker compose pull
docker compose up -d
cd ..\..
```

- `docker compose pull` télécharge les images (long la première fois).
- `docker compose up -d` démarre les conteneurs en arrière-plan (`-d` = *detached*).
- `cd ..\..` te ramène à la racine du projet.

---

## 1.5 — Vérifier que Supabase tourne

```powershell
docker ps --filter "name=supabase" --format "{{.Names}} : {{.Status}}"
```

Tu dois voir plusieurs conteneurs `supabase-*` en `Up`. Les plus importants pour nous :
- **`supabase-db`** → la base PostgreSQL (étape suivante en a besoin) ;
- **`supabase-kong`** → la passerelle API sur le **port 8000** (c'est par là que n8n parlera à la base).

> 🔎 **Tableau de bord visuel (Studio)** : ouvre http://localhost:8000 dans ton navigateur. Selon la configuration, il peut aussi être sur http://localhost:3000. Ce n'est pas obligatoire pour la suite, mais pratique pour voir les données plus tard.

---

## ✅ C'est bon ?

- [ ] Les conteneurs `supabase-*` sont `Up`
- [ ] `supabase-db` est présent

Si oui, on crée les tables :
👉 **[02-base-de-donnees.md](02-base-de-donnees.md)**

> ❓ Un souci ? Voir **[07-depannage.md](07-depannage.md)**.
