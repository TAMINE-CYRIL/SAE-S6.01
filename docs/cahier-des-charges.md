# Frugal AI — Cahier des charges v6.0

---

## 1. Présentation du projet

Frugal AI est un système de débat automatisé **100% local** entre deux intelligences artificielles. Une IA dite **frugaliste**, orchestrée via n8n avec un système RAG sur un corpus PDF, débat avec une **IA standard** au choix de l'utilisateur parmi une liste de modèles open-weight.

Le débat est structuré autour d'un questionnaire de 24 questions sur les positions écologiques et technologiques, administré de façon fluide et naturelle par l'IA frugaliste dans le cours de la conversation. Au fur et à mesure que l'IA standard répond aux questions, l'IA frugaliste calcule et renvoie un **score intermédiaire** mis à jour à chaque tour.

Un **site web externe orchestre l'intégralité du débat tour par tour** : il appelle l'IA frugaliste (via le webhook n8n) et l'IA standard (directement via Ollama), fait circuler les messages de l'une à l'autre, affiche la conversation et le score intermédiaire.

**L'ensemble du système fonctionne sans aucune connexion internet ni service cloud.** Tous les modèles utilisés sont des modèles open-weight exécutés localement via Ollama.

---

## 2. Séparation des responsabilités (point central de l'architecture)

C'est le point le plus important du projet. Trois acteurs, trois rôles strictement distincts.

### 2.1 Le site web (développement externe) — l'orchestrateur

Le site web est le **chef d'orchestre unique** de la conversation. C'est lui, et lui seul, qui fait dialoguer les deux IA. Concrètement :

- Il propose à l'utilisateur de choisir un **rôle** pour l'IA frugaliste et une **IA standard** dans la liste
- Il initialise la session en appelant le webhook n8n de l'IA frugaliste
- À chaque tour, il prend le message produit par une IA et l'envoie à l'autre :
  - Message de l'IA frugaliste → envoyé à l'IA standard (Ollama)
  - Réponse de l'IA standard → envoyée au webhook n8n de l'IA frugaliste
- Il reçoit et affiche le **score intermédiaire** renvoyé par l'IA frugaliste à chaque tour
- Il affiche la conversation en alternance
- Il permet de consulter les sessions passées (replay)

Le site web **ne contient aucune logique de RAG, de scoring ou de prompt**. Toute cette intelligence vit dans n8n (pour la frugaliste) ou dans le modèle Ollama appelé (pour la standard).

### 2.2 n8n — uniquement l'IA frugaliste

n8n est dédié **exclusivement** à l'IA frugaliste. Il n'a aucune connaissance de l'IA standard et ne l'appelle jamais. Son périmètre :

- Exposer **un seul webhook** : celui de l'IA frugaliste
- À chaque appel : aller chercher dans Supabase les informations frugalistes pertinentes via RAG (recherche vectorielle), récupérer l'historique de la conversation et l'état du questionnaire
- Composer le prompt et appeler le LLM local (Ollama)
- Calculer le score intermédiaire et le persister
- Renvoyer au site le message frugaliste + le score intermédiaire mis à jour

**n8n = IA frugaliste, point final.**

### 2.3 L'IA standard — appelée directement par le site web

L'IA standard est appelée **directement par le site web** via l'API locale d'Ollama (`http://localhost:11434`). Elle ne transite jamais par n8n.

L'utilisateur choisit, au lancement de la session, l'un des **6 modèles open-weight** disponibles :

| Nom affiché | Modèle Ollama | Créateur | Points forts |
|---|---|---|---|
| Mistral | `mistral` | Mistral AI | Efficace, léger, bon en français |
| Llama | `llama3.1` | Meta | Polyvalent, excellent rapport qualité/taille |
| Gemma | `gemma2` | Google | Compact et performant pour sa taille |
| DeepSeek | `deepseek-v2` | DeepSeek | Fort en raisonnement et code |
| Qwen | `qwen2.5` | Alibaba | Excellent en multilingue, fort en raisonnement |
| Phi | `phi3` (ou `phi4`) | Microsoft | Très performant pour des petites tailles |

Ces six modèles sont tous téléchargés localement via Ollama et exécutés sans connexion internet. Le choix de la taille de chaque modèle (paramètres en milliards) dépend des capacités de la machine et est laissé à l'appréciation de l'utilisateur. Cette partie reste **hors périmètre n8n** dans tous les cas.

---

## 3. Architecture générale

```
┌───────────────────────────────────────────────────────────────────┐
│                          SITE WEB (externe)                       │
│                      ORCHESTRATEUR DU DÉBAT                        │
│                                                                   │
│   Boucle de débat, tour par tour :                                │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  A. Appel IA FRUGALISTE                                  │    │
│   │     POST webhook n8n                                     │    │
│   │     { session_id, role, message, tour }                 │    │
│   │     ← { message, score_partiel, questions_restantes }   │    │
│   └─────────────────────────────────────────────────────────┘    │
│                          │                                        │
│                          ▼                                        │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  B. Appel IA STANDARD (Ollama direct)                   │    │
│   │     POST http://localhost:11434/api/chat                │    │
│   │     { model, messages }                                 │    │
│   │     ← { message }                                       │    │
│   └─────────────────────────────────────────────────────────┘    │
│                          │                                        │
│              (retour en A avec le nouveau message)                │
│                                                                   │
└─────────┬──────────────────────────────────────────┬────────────┘
          │                                           │
          │ webhook (frugaliste uniquement)           │ API Ollama directe
          ▼                                           ▼
┌─────────────────────────────────┐      ┌──────────────────────────┐
│            n8n  :5678          │      │   IA STANDARD (Ollama)   │
│       (IA FRUGALISTE SEULE)    │      │                          │
│                                │      │   Modèle choisi parmi :  │
│  1. Récup. historique          │      │   - Mistral              │
│  2. RAG → Supabase pgvector    │◄──┐  │   - Llama                │
│  3. Récup. état questionnaire  │   │  │   - Gemma                │
│  4. Construction prompt        │   │  │   - DeepSeek             │
│  5. Appel Ollama (LLM local)   │◄┐ │  │   - Qwen                 │
│  6. Scoring + score partiel    │ │ │  │   - Phi                  │
│  7. Persistance Supabase       │ │ │  │                          │
│  8. Réponse webhook            │ │ │  └────────────┬─────────────┘
└─────────────────────────────────┘ │ │               │
                                     │ │               │
              ┌──────────────────────┘ │               │
              ▼                        ▼               ▼
      ┌──────────────┐         ┌──────────────┐  ┌──────────────┐
      │   Supabase   │         │   Ollama     │  │   Ollama     │
      │   :5432      │         │   :11434     │  │   :11434     │
      │  + pgvector  │         │ LLM frug.    │  │ LLM standard │
      │              │         │ + embeddings │  │              │
      └──────────────┘         └──────────────┘  └──────────────┘
       (même instance Ollama sert frugaliste + standard + embeddings)
```

---

## 4. Infrastructure locale

### 4.1 Services, ports et technologies

| Service | Technologie | Port local | URL d'accès |
|---|---|---|---|
| Orchestration IA frugaliste | n8n (Docker) | 5678 | http://localhost:5678 |
| Base de données | Supabase local (Docker) — Studio | 3000 | http://localhost:3000 |
| API REST Supabase | PostgREST | 8000 | http://localhost:8000 |
| PostgreSQL | PostgreSQL + pgvector | 5432 | localhost:5432 |
| Inférence LLM (frugaliste + standard + embeddings) | Ollama | 11434 | http://localhost:11434 |

> Une **seule instance Ollama** sert trois usages : le LLM de l'IA frugaliste (appelé par n8n), les modèles de l'IA standard (appelés par le site), et le modèle d'embedding pour le RAG (appelé par n8n).

### 4.2 Résolution réseau inter-services

n8n s'exécute dans un conteneur Docker isolé. Pour qu'il puisse joindre Ollama et Supabase qui tournent sur la machine hôte, tous les appels internes depuis n8n utilisent l'hôte `host.docker.internal` au lieu de `localhost`.

- Appel Ollama depuis n8n : `http://host.docker.internal:11434`
- Appel Supabase API depuis n8n : `http://host.docker.internal:8000`

Le site web, lui, tourne hors Docker et appelle Ollama via `http://localhost:11434`.

La résolution de `host.docker.internal` est assurée par la directive `extra_hosts: host.docker.internal:host-gateway` dans le `docker-compose.yml` de n8n.

### 4.3 Persistance des données

| Service | Mécanisme |
|---|---|
| n8n | Volume Docker `n8n_data` (workflows, credentials, logs) |
| Supabase | Volumes Docker du stack officiel |
| Ollama | Dossier local monté en volume (modèles téléchargés) |

### 4.4 Modèles Ollama requis

**Pour l'IA frugaliste (appelés par n8n) :**

| Modèle | Usage | Dimension vecteur |
|---|---|---|
| `mistral` (ou autre) | LLM principal de l'IA frugaliste | — |
| `nomic-embed-text` | Embedding pour le RAG | 768 |

**Pour l'IA standard (appelés par le site web) :**

| Modèle Ollama | Nom affiché |
|---|---|
| `mistral` | Mistral |
| `llama3.1` | Llama |
| `gemma2` | Gemma |
| `deepseek-v2` | DeepSeek |
| `qwen2.5` | Qwen |
| `phi3` | Phi |

La dimension 768 de `nomic-embed-text` doit être cohérente avec la colonne `embedding VECTOR(768)` dans Supabase.

---

## 5. Base de données Supabase

### 5.1 Extension requise

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 5.2 Schéma complet

#### Table `sessions`

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique de session |
| role | TEXT | NOT NULL | Rôle adopté par l'IA frugaliste |
| modele_standard | TEXT | NOT NULL | IA standard choisie par l'utilisateur |
| date_debut | TIMESTAMPTZ | DEFAULT NOW() | Horodatage d'ouverture |
| date_fin | TIMESTAMPTZ | NULLABLE | Horodatage de clôture (NULL si en cours) |
| score_final | INTEGER | NULLABLE | Score total sur 96 (NULL si en cours) |
| statut | TEXT | DEFAULT 'en_cours' | `en_cours` ou `terminee` |

#### Table `messages`

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| session_id | UUID | FK → sessions(id) | Session parente |
| tour | INTEGER | NOT NULL | Numéro du tour (commence à 1) |
| auteur | TEXT | CHECK IN ('frugaliste','standard') | Auteur du message |
| contenu | TEXT | NOT NULL | Contenu textuel |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Horodatage |

#### Table `scores`

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| session_id | UUID | FK → sessions(id) | Session parente |
| question_id | INTEGER | NOT NULL, CHECK BETWEEN 1 AND 24 | Numéro de question |
| reponse | TEXT | NULLABLE | Réponse détectée |
| points | INTEGER | CHECK BETWEEN 1 AND 4 | Points attribués |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Horodatage de détection |

#### Table `chunks`

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| contenu | TEXT | NOT NULL | Texte du fragment |
| embedding | VECTOR(768) | NOT NULL | Vecteur nomic-embed-text |
| source_pdf | TEXT | NULLABLE | Fichier PDF source |
| metadata | JSONB | NULLABLE | Page, position, métadonnées |

#### Index vectoriel

```sql
CREATE INDEX ON chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 6. Workflows n8n (IA frugaliste uniquement)

n8n contient exactement **deux workflows** : un workflow utilitaire d'ingestion (exécuté hors session) et le workflow principal du webhook frugaliste (exécuté à chaque tour). Aucun workflow ne concerne l'IA standard.

### 6.1 Workflow A — Ingestion RAG (utilitaire)

**Déclencheur :** manuel ou surveillance d'un dossier local
**Fréquence :** une fois à la constitution du corpus, puis à chaque ajout de PDF
**Responsabilité :** transformer les PDFs frugalistes en chunks vectorisés stockés dans Supabase

#### Étapes

1. **Lecture du PDF** — nœud Read Binary File ou Watch Folder
2. **Détection du type (nœud Code)** — comptage des caractères alphanumériques extraits ; si < 100, le PDF est scanné → branche OCR ; sinon → extraction directe
   ```javascript
   const text = $json.text || "";
   const alphanumeric = text.replace(/[^a-zA-Z0-9]/g, "").length;
   return [{ json: { isScanned: alphanumeric < 100, text } }];
   ```
3a. **Branche texte ancré** — extraction directe via nœud PDF natif n8n
3b. **Branche scanné** — OCR Tesseract via nœud Execute Command
4. **Chunking (Text Splitter)** — fragments de 500 tokens, overlap 50 tokens, métadonnées (source, page) conservées
5. **Embedding** — POST vers `http://host.docker.internal:11434/api/embeddings`, modèle `nomic-embed-text`, vecteur dim. 768
6. **Insertion Supabase** — INSERT dans `chunks` (contenu, embedding, source_pdf, metadata)

---

### 6.2 Workflow B — Webhook IA frugaliste (principal)

**URL exposée :** `POST http://localhost:5678/webhook/Frugal AI-frugaliste`
**Responsabilité :** produire une réponse frugaliste dans le rôle configuré, en s'appuyant **systématiquement** sur le RAG Supabase, administrer le questionnaire naturellement, calculer le score intermédiaire et le renvoyer à chaque tour.

#### Payload d'entrée

```json
{
  "session_id": "uuid ou null si tour=0",
  "role": "prêtre",
  "message": "contenu du message de l'IA standard",
  "tour": 0
}
```

Quand `tour = 0`, c'est l'initialisation : n8n crée la session, génère le `session_id` et produit le message d'ouverture de l'IA frugaliste (sans message standard en entrée).

#### Étapes détaillées

**Étape 1 — Validation et routing (nœud Code)**
Si `tour = 0` → branche initialisation : INSERT dans `sessions`, génération du `session_id`. Sinon → branche tour normal.

**Étape 2 — Récupération de l'historique (Supabase SELECT)**
```sql
SELECT tour, auteur, contenu
FROM messages
WHERE session_id = '{{session_id}}'
ORDER BY tour ASC
```
Alimente le contexte conversationnel du LLM.

**Étape 3 — Récupération de l'état du questionnaire (Supabase SELECT)**
```sql
SELECT question_id, points
FROM scores
WHERE session_id = '{{session_id}}'
ORDER BY question_id ASC
```
Permet de connaître les questions déjà posées/scorées et de déterminer la prochaine à intégrer.

**Étape 4 — Embedding du message entrant (HTTP → Ollama)**
POST vers `http://host.docker.internal:11434/api/embeddings`. Produit le vecteur de la requête pour la recherche RAG.

**Étape 5 — Recherche RAG (Supabase SELECT) — SYSTÉMATIQUE À CHAQUE TOUR**
```sql
SELECT contenu, source_pdf
FROM chunks
ORDER BY embedding <=> '{{vecteur_requete}}'
LIMIT 5
```
**À chaque tour sans exception**, l'IA frugaliste va chercher dans sa base de connaissances Supabase les 5 fragments les plus pertinents pour argumenter. C'est ce qui garantit qu'elle s'appuie toujours sur le corpus RAG et jamais uniquement sur les connaissances générales du modèle.

**Étape 6 — Construction du prompt (nœud Code)**
Injecte : rôle, chunks RAG, historique complet, liste des questions déjà posées, texte de la prochaine question, questionnaire complet de référence.

**Étape 7 — Appel LLM frugaliste (HTTP → Ollama)**
POST vers `http://host.docker.internal:11434/api/chat`, modèle de l'IA frugaliste. Produit le message de l'IA frugaliste.

**Étape 8 — Détection et scoring (HTTP → Ollama)**
Appel secondaire de classification : le LLM analyse le message de l'IA standard et détermine si une réponse à une question du questionnaire est présente. Retourne un JSON structuré `{ question_id, points }` ou `{ question_id: null }`.

**Étape 9 — Calcul du score intermédiaire (nœud Code)**
Somme des points enregistrés dans `scores` pour la session + le point éventuellement détecté à ce tour. Ce **score intermédiaire** est recalculé et renvoyé **à chaque tour**, qu'une nouvelle question ait été scorée ou non.

**Étape 10 — Persistance (Supabase INSERT)**
- INSERT du message frugaliste dans `messages`
- INSERT dans `scores` si une question a été détectée et scorée

**Étape 11 — Détection fin de session (nœud Code)**
Si le nombre de questions scorées = 24, active le mode fin de session.

**Étape 12 — Message de fin (conditionnel, HTTP → Ollama)**
Calcule le score total, détermine le profil, génère le message final (révélation du score + conseils frugalistes dans le rôle). UPDATE de `sessions` : `statut = 'terminee'`, `score_final`, `date_fin`.

**Étape 13 — Réponse webhook (Respond to Webhook)**

#### Payload de sortie (renvoyé à CHAQUE tour)

```json
{
  "session_id": "uuid",
  "message": "réponse de l'IA frugaliste",
  "score_partiel": 14,
  "questions_repondues": 6,
  "questions_restantes": 18,
  "derniere_question_scoree": 6,
  "fin_session": false
}
```

Le champ `score_partiel` est le **score intermédiaire cumulé**, mis à jour et renvoyé à chaque tour pour que le site l'affiche en temps réel.

---

## 7. Prompts système

### 7.1 Prompt système — IA frugaliste (tour normal)

```
Tu es une intelligence artificielle dont la vision du monde est profondément
frugaliste et décroissante. Toutes tes réponses s'ancrent dans cette conviction
sans jamais en dévier.

Tu incarnes le rôle suivant : {{role}}.
Tu t'exprimes exclusivement depuis ce rôle, avec son vocabulaire, ses références
culturelles, sa posture et sa façon d'interpeller l'interlocuteur.
Tu ne sors jamais de ce rôle, quelles que soient les provocations.

Voici des extraits de ta base de connaissances frugaliste que tu DOIS utiliser
pour argumenter. Tu t'appuies systématiquement sur ces références :
{{chunks_rag}}

Tu es en débat avec une autre IA dont tu challenges les positions de façon
argumentée, naturelle et fluide. Tu ne te présentes jamais comme une IA ni ne
mentionnes le système technique dans lequel tu opères.

Au fil de la conversation, tu fais passer le questionnaire suivant, une question
à la fois, intégrée naturellement dans le flux du débat.
Règles absolues :
- Jamais deux questions dans le même message
- Ne jamais annoncer qu'il y a un questionnaire
- Ne jamais évoquer les scores, points ou évaluation
- Intégrer chaque question comme si elle découlait du débat
- Attendre la réponse avant de passer à la question suivante

Questionnaire complet de référence :
{{questionnaire_24_questions_complet}}

Questions déjà posées (ne pas reposer) : {{liste_ids_questions_posees}}
Prochaine question à intégrer : {{prochaine_question_texte}}

Historique complet de la conversation :
{{historique_complet}}
```

### 7.2 Prompt de fin de session

```
Tu as mené la conversation jusqu'à son terme. Ton interlocuteur a répondu à
l'ensemble du questionnaire.

Résultat :
- Score total : {{score_final}}/96
- Profil : {{libelle_profil}}
- Description : {{description_profil}}

Dans ton rôle de {{role}}, tu vas :
1. Révéler ce résultat de façon naturelle et bienveillante, sans jamais
   mentionner qu'il s'agissait d'un questionnaire noté
2. Proposer des pistes concrètes pour évoluer vers plus de frugalité, en
   t'appuyant sur ta base de connaissances et en restant dans ton personnage

Extraits de ta base de connaissances pour guider tes conseils :
{{chunks_rag}}
```

### 7.3 Prompt de classification pour le scoring

```
Tu es un système d'analyse. Ton seul rôle est de déterminer si un message
contient une réponse identifiable à une question d'un questionnaire.

Message à analyser :
{{message_standard}}

Questionnaire de référence (24 questions, réponses et points) :
{{questionnaire_complet}}

Questions déjà scorées (ne pas rescorer) :
{{questions_deja_scorees}}

Détermine si le message exprime une position correspondant clairement à l'une
des réponses d'une question pas encore scorée. Si oui, laquelle et combien de points.

Réponds UNIQUEMENT en JSON, sans texte autour :
{"question_id": 3, "points": 2, "reponse_detectee": "résumé"}
ou si rien n'est détectable :
{"question_id": null}
```

---

## 8. Questionnaire intégré

### Barème
- **1 point** : position frugaliste radicale / décroissante
- **4 points** : position techno-optimiste / statu quo
- **Minimum** : 24 points · **Maximum** : 96 points

### Profils de résultat

| Plage | Profil | Description |
|---|---|---|
| 24 – 42 | Souveraineté et sobriété radicales | Rejet de la technologie comme solution, transformation profonde des modes de vie, décroissance et relocalisation |
| 43 – 60 | Régulation et changement de cap | Technologie comme outil subordonné à une sobriété forte, régulation et planification écologique prioritaires |
| 61 – 78 | Pragmatisme et mix équilibré | Mix technologie + évolutions sociétales, approche tous azimuts |
| 79 – 96 | Confiance technologique et innovation | Forte confiance dans le progrès technique pour découpler prospérité et impact |

### Les 24 questions (scoring figé)

**Q1 — IA et gestion des ressources**
- Automatiser des processus à grande échelle → 4pts
- Contribuer à de nouvelles formes de régulation → 3pts
- Effets inattendus sur l'organisation sociale → 2pts
- Encourager d'autres priorités de gestion → 1pt

**Q2 — Agriculture de précision / drones**
- Oui, optimiser via technologie → 4pts
- Oui, si accompagné d'agroécologie → 3pts
- Non, agriculture industrielle est le problème → 2pts
- Non, circuits courts et local → 1pt

**Q3 — Villes intelligentes / IoT**
- Oui, optimiser trafic/éclairage via tech → 4pts
- Oui, mais espaces verts et mobilité douce → 3pts
- Non, décroissance planifiée nécessaire → 2pts
- Non, architecture durable d'abord → 1pt

**Q4 — Fusion nucléaire**
- Oui, source illimitée et propre → 4pts
- Oui, mais sobriété immédiate en attendant → 3pts
- Non, délais trop longs, détourne des solutions → 2pts
- Non, remettre en cause la croissance infinie → 1pt

**Q5 — Fast fashion / économie circulaire**
- Oui, l'économie circulaire perpétue ce modèle à faible impact → 4pts
- Oui, mais il faut aussi acheter moins → 3pts
- Non, il faut produire et acheter beaucoup moins → 2pts
- Non, ce modèle doit être démantelé, pas "verdi" → 1pt

**Q6 — Carburants verts / avion**
- Oui, maintenir la mobilité aérienne sans culpabilité → 4pts
- Oui, mais technologies chères et rares, réduisant le trafic → 3pts
- Non, taxe kérosène et réduction des vols maintenant → 2pts
- Non, voyager moins et moins loin → 1pt

**Q7 — Sobriété vs efficacité**
- Non, l'efficacité réduit l'impact sans toucher au confort → 4pts
- Les deux sont complémentaires → 3pts
- Oui, sans sobriété les gains d'efficacité sont annulés → 2pts
- Oui, l'efficacité est un leurre, seule la réduction drastique compte → 1pt

**Q8 — Choix individuels vs collectif**
- Oui, le marché répondra aux consommateurs éclairés → 4pts
- Oui, mais amplifiée par des politiques publiques fortes → 3pts
- Non, la responsabilité est collective et politique → 2pts
- Non, c'est un piège qui occulte le pouvoir des entreprises → 1pt

**Q9 — Taxe billets d'avion**
- Non, développer d'abord avions à hydrogène/électriques → 4pts
- Non, cela limiterait la liberté de mouvement → 3pts
- Oui, mais si les recettes financent des alternatives → 2pts
- Oui, moyen efficace de réduire les émissions → 1pt

**Q10 — Interdiction voitures thermiques 2030**
- Non, développer d'abord carburants synthétiques/hydrogène → 4pts
- Non, cela pénaliserait les ménages modestes → 3pts
- Oui, mais si alternatives accessibles proposées → 2pts
- Oui, mesure forte pour réduire la pollution → 1pt

**Q11 — Subventions recherche technologies vertes**
- Oui, seul moyen d'accélérer la transition → 4pts
- Oui, mais en ciblant les technologies prometteuses → 3pts
- Non, réduire d'abord la consommation et changer les modes de vie → 2pts
- Non, le marché doit décider → 1pt

**Q12 — Interdiction pub produits polluants**
- Non, éduquer plutôt qu'interdire → 4pts
- Non, atteinte à la liberté d'expression et d'entreprise → 3pts
- Oui, mais seulement pour les produits les plus émetteurs → 2pts
- Oui, la publicité encourage la surconsommation → 1pt

**Q13 — Mobilité partagée**
- Oui, optimise l'utilisation des véhicules → 4pts
- Oui, mais avec réduction de la demande → 3pts
- Non, peut encourager plus d'usage → 2pts
- Non, réduire la dépendance automobile d'abord → 1pt

**Q14 — Capture carbone DAC**
- Oui, capture le CO2 directement de l'atmosphère → 4pts
- Oui, mais développée durablement → 3pts
- Non, coûteuse et énergivore → 2pts
- Non, réduire les émissions à la source d'abord → 1pt

**Q15 — Course techno détourne l'attention**
- Non, innovations essentielles sans changer nos comportements → 4pts
- Non, maintenir la croissance tout en réduisant les émissions → 3pts
- Oui, mais certaines technologies utiles en complément → 2pts
- Oui, illusion que la tech résout tout → 1pt

**Q16 — Nanotechnologies et climat**
- Oui, solutions innovantes pour capturer le carbone → 4pts
- Oui, mais développées de manière responsable → 3pts
- Non, risques pour l'environnement et la santé → 2pts
- Non, réduire la consommation énergétique d'abord → 1pt

**Q17 — Transports doux (vélo, marche)**
- Non, la rapidité est essentielle → 4pts
- Non, améliorer plutôt les transports motorisés via la tech → 3pts
- Oui, mais intégré dans une politique multimodale → 2pts
- Oui, écologiques et favorisent la santé → 1pt

**Q18 — Renoncer aux conforts modernes**
- Non, le progrès ne doit pas être remis en question → 4pts
- Non, rendre ces conforts plus écologiques via la tech → 3pts
- Oui, mais progressivement et équitablement → 2pts
- Oui, le confort matériel a un coût environnemental élevé → 1pt

**Q19 — Plateformes numériques et conso responsable**
- Oui, mieux informer et orienter les consommateurs → 4pts
- Oui, mais transparentes et régulées → 3pts
- Non, incitent à la surconsommation → 2pts
- Non, réduire leur usage, privilégier les circuits courts → 1pt

**Q20 — Investissements startups climatiques**
- Oui, agiles et innovantes, transforment les secteurs → 4pts
- Oui, mais encadrées contre les dérives commerciales → 3pts
- Non, motivées par le profit plus que l'écologie → 2pts
- Non, transition portée par le public et le collectif → 1pt

**Q21 — Géo-ingénierie**
- Oui, nécessaire pour compenser les émissions résiduelles → 4pts
- Oui, mais uniquement comme solution d'appoint → 3pts
- Non, trop risqué et incertain → 2pts
- Non, fuite en avant qui détourne de la réduction réelle → 1pt

**Q22 — IA et transition écologique**
- Oui, optimise production, transports, consommation → 4pts
- Oui, mais si l'IA est elle-même sobre en énergie → 3pts
- Non, augmente la consommation d'énergie et de ressources → 2pts
- Non, priorités sociales et comportementales avant tout → 1pt

**Q23 — Comportements individuels / impact réel**
- Oui, chaque geste compte et entraîne un changement collectif → 4pts
- Oui, mais soutenus par des politiques publiques ambitieuses → 3pts
- Non, marginaux face à l'empreinte industrielle → 2pts
- Non, distraction du vrai problème structurel → 1pt

**Q24 — Smart cities**
- Oui, réduit gaspillages et améliore l'efficacité énergétique → 4pts
- Oui, si les technologies servent citoyens et environnement → 3pts
- Non, ne s'attaque pas à la surconsommation ni à l'artificialisation → 2pts
- Non, illusion technologique qui perpétue le modèle → 1pt

---

## 9. Rôles disponibles (15)

| Rôle | Registre |
|---|---|
| Prêtre | Spirituel catholique, sacré, sobriété chrétienne |
| Rabbin | Spirituel juif, sagesse talmudique, justice sociale |
| Imam | Spirituel islamique, responsabilité de la création |
| Coach | Motivationnel, objectifs, performance durable |
| Entraîneur | Sportif, discipline, effort, long terme |
| Influenceur | Réseaux sociaux, tendances, communauté |
| Hypnotiseur | Suggestif, métaphores, suggestions indirectes |
| Thérapeute cognitivo-comportemental | Biais cognitifs, restructuration |
| Psychanalyste | Inconscient, résistances |
| Enseignant supérieur | Académique, références scientifiques |
| Enseignant primaire | Pédagogie simplifiée, exemples concrets |
| Enseignant secondaire | Pédagogie intermédiaire, esprit critique |
| Parent | Familial, responsabilité intergénérationnelle |
| Dresseur | Comportemental, conditionnement, récompenses |
| Enseignant Montessori | Autonomie, environnement préparé, découverte |

Le rôle est choisi par l'utilisateur au lancement et transmis à n8n dans le payload d'initialisation (tour=0).

---

## 10. Contrat d'interface

Le site web communique avec **deux destinations distinctes**, toutes deux locales : le webhook n8n (IA frugaliste) et l'API Ollama (IA standard).

### 10.1 Côté n8n — webhook IA frugaliste

**Initialisation (tour=0)**
```
POST http://localhost:5678/webhook/Frugal AI-frugaliste
{
  "session_id": null,
  "role": "prêtre",
  "message": "",
  "tour": 0
}
→
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Message d'ouverture de l'IA frugaliste",
  "score_partiel": 0,
  "questions_repondues": 0,
  "questions_restantes": 24,
  "fin_session": false
}
```

**Tour normal**
```
POST http://localhost:5678/webhook/Frugal AI-frugaliste
{
  "session_id": "550e8400-...",
  "role": "prêtre",
  "message": "Réponse de l'IA standard au tour précédent",
  "tour": 2
}
→
{
  "session_id": "550e8400-...",
  "message": "Réponse de l'IA frugaliste",
  "score_partiel": 6,
  "questions_repondues": 2,
  "questions_restantes": 22,
  "derniere_question_scoree": 2,
  "fin_session": false
}
```

### 10.2 Côté IA standard — appel direct Ollama par le site (hors n8n)

Le site appelle directement Ollama avec le modèle choisi par l'utilisateur.
```
POST http://localhost:11434/api/chat
{
  "model": "llama3.1",
  "messages": [
    { "role": "system", "content": "Tu es une IA généraliste qui débat librement." },
    { "role": "user", "content": "Message de l'IA frugaliste" }
  ],
  "stream": false
}
→
{
  "message": { "role": "assistant", "content": "Réponse de l'IA standard" }
}
```

Le champ `model` prend l'une des six valeurs : `mistral`, `llama3.1`, `gemma2`, `deepseek-v2`, `qwen2.5`, `phi3`. Le site maintient l'historique de la conversation et le renvoie à chaque appel dans le tableau `messages`.

### 10.3 Boucle d'orchestration (logique du site web)

```
1. Site → n8n (tour=0)            → reçoit message d'ouverture frugaliste + session_id
2. Site → Ollama (IA standard)    → envoie le message frugaliste, reçoit la réponse standard
3. Site → n8n (tour=2)            → envoie la réponse standard, reçoit message + score_partiel
4. Site → Ollama (IA standard)    → ... et ainsi de suite
5. Répéter jusqu'à fin_session=true
6. Affichage du score final + conseils (contenus dans le dernier message frugaliste)
```

À chaque passage par l'étape n8n, le site reçoit le `score_partiel` mis à jour et l'affiche en temps réel.

### 10.4 Replay de session

```
GET http://localhost:5678/webhook/Frugal AI-replay?session_id=uuid
→
{
  "session": { ...données sessions... },
  "messages": [ ...liste ordonnée par tour... ],
  "score_final": 42,
  "profil": "Régulation et changement de cap"
}
```

---

## 11. Périmètre du document

### Dans le périmètre
- Infrastructure locale 100% hors-ligne (Docker, Supabase, Ollama, n8n)
- Schéma base de données et index vectoriel
- Workflows n8n : ingestion RAG + webhook IA frugaliste (uniquement)
- RAG systématique à chaque tour
- Score intermédiaire renvoyé à chaque tour
- Prompts système et logique de scoring
- Questionnaire complet figé et profils
- Rôles disponibles
- Contrat d'interface (webhook frugaliste + replay + appel Ollama standard)

### Hors périmètre
- Développement du site web (externe)
- Téléchargement / configuration des 6 modèles open-weight de l'IA standard
- Corpus PDF frugaliste (fourni)
- Design et UX de l'interface

---

*Frugal AI — Cahier des charges v6.0 — Document de référence technique — système 100% local*
