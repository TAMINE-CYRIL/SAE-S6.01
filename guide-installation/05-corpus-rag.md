# Étape 5 — Ajouter les PDF et construire le RAG

**Pourquoi ?** Pour que l'IA frugaliste s'appuie sur de vraies sources (et pas seulement sur ses connaissances générales), on lui fournit un **corpus de PDF** sur la frugalité / décroissance. C'est le **RAG** (*Retrieval-Augmented Generation*) : chaque PDF est lu, découpé en morceaux (**chunks**), transformé en **vecteurs**, et stocké dans Supabase. Quand la frugaliste réagit, elle récupère les morceaux les plus pertinents.

> 💡 **Pourquoi des vecteurs ?** Un vecteur est une « empreinte numérique » du sens d'un texte. Deux textes qui parlent de la même idée ont des vecteurs proches. C'est ce qui permet de retrouver les passages pertinents même si les mots exacts diffèrent.

---

## 5.1 — Déposer les PDF

Les PDF **ne sont pas dans le dépôt Git** (trop volumineux) : ils sont transférés séparément.

1. Récupère les fichiers `.pdf` du corpus.
2. Place-les dans le dossier **`backend/pdfs/`** du projet.

> Tu peux mettre tes propres PDF si tu veux : n'importe quel document sur la sobriété, la frugalité, la décroissance, etc.

---

## 5.2 — Lancer l'ingestion (Workflow A)

1. Ouvre **http://localhost:5678**.
2. Ouvre le workflow **« Frugal AI - Workflow A - Ingestion RAG »**.
3. Clique sur **« Execute workflow »** (bouton d'exécution).

Le workflow va, pour chaque PDF : extraire le texte (OCR si besoin) → découper en chunks → générer les vecteurs → insérer dans Supabase.

> ⏳ **C'est long sur certains PDF** (surtout les documents scannés, traités par OCR sur le processeur). Laisse tourner jusqu'au bout. Le texte extrait est **mis en cache** dans `backend/ocr_cache/` : si tu relances plus tard, les PDF déjà traités ne sont pas refaits.

---

## 5.3 — Vérifier que la base de connaissances est remplie

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "SELECT count(*) AS chunks, count(DISTINCT source_pdf) AS pdfs FROM chunks;"
```

Tu dois voir un nombre de `chunks` > 0 et un nombre de `pdfs` correspondant à tes fichiers. Exemple :

```
 chunks | pdfs
--------+------
    281 |   25
```

Si `chunks = 0`, l'ingestion n'a pas inséré : vérifie que des PDF sont bien dans `backend/pdfs/` et relance le Workflow A (voir aussi **[07-depannage.md](07-depannage.md)**).

---

## ✅ C'est bon ?

- [ ] PDF présents dans `backend/pdfs/`
- [ ] Workflow A exécuté
- [ ] La requête renvoie des `chunks` > 0

Si oui, dernière étape — on lance et on utilise le projet :
👉 **[06-lancer-et-utiliser.md](06-lancer-et-utiliser.md)**
