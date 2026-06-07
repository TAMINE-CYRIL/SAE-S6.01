# Étape 5 — Ajouter le corpus PDF et construire le RAG

Le projet Frugal AI peut s'appuyer sur un corpus documentaire pour produire des réponses plus contextualisées. Ce corpus est constitué de fichiers PDF portant sur la frugalité, la sobriété ou la décroissance. Les documents sont extraits, découpés en fragments, vectorisés, puis stockés dans Supabase.

Ce mécanisme correspond au RAG, pour *Retrieval-Augmented Generation*. Au moment de générer une réponse, le workflow peut rechercher dans la base les passages les plus proches de la question posée et les fournir au modèle comme contexte.

## 5.1 Ajouter les fichiers PDF

Les fichiers PDF ne sont pas inclus directement dans le dépôt Git, car ils peuvent être volumineux. Ils doivent être ajoutés manuellement dans le dossier prévu par le projet :

```text
backend/pdfs/
```

Il suffit de copier les fichiers `.pdf` dans ce dossier. Le corpus peut contenir les documents fournis avec le projet ou d'autres fichiers portant sur les thèmes étudiés. Plus les documents sont nombreux ou volumineux, plus l'ingestion peut prendre du temps.

## 5.2 Exécuter le Workflow A

L'ingestion du corpus se fait depuis n8n.

Ouvrir l'interface :

```text
http://localhost:5678
```

Puis ouvrir le workflow nommé :

```text
Frugal AI - Workflow A - Ingestion RAG
```

Lancer ensuite l'exécution avec le bouton `Execute workflow`.

Pour chaque PDF, le workflow effectue les opérations suivantes :

```text
- extraction du texte ;
- passage par l'OCR si le PDF est scanné ;
- découpage du texte en chunks ;
- génération des embeddings ;
- insertion des fragments et des vecteurs dans Supabase.
```

Les PDF scannés peuvent ralentir fortement l'ingestion, car l'OCR demande plus de calcul. Le texte extrait est mis en cache dans `backend/ocr_cache/`, ce qui évite de refaire le même traitement lors d'une exécution ultérieure.

## 5.3 Vérifier le contenu de la table `chunks`

Une fois le workflow terminé, vérifier que des fragments ont bien été insérés dans Supabase :

```powershell
docker exec supabase-db psql -U postgres -d postgres -c "SELECT count(*) AS chunks, count(DISTINCT source_pdf) AS pdfs FROM chunks;"
```

La colonne `chunks` doit être supérieure à zéro. La colonne `pdfs` indique le nombre de fichiers PDF différents présents dans la base.

Exemple de résultat :

```text
 chunks | pdfs
--------+------
    281 |   25
```

Si le nombre de chunks est égal à zéro, il faut d'abord vérifier que des fichiers `.pdf` sont bien présents dans `backend/pdfs/`. Il faut ensuite consulter l'exécution du Workflow A dans n8n pour identifier l'étape qui a échoué.

## Suite de l'installation

Lorsque le corpus est indexé, l'installation principale est terminée. Il reste à lancer l'application et à vérifier son fonctionnement depuis l'interface web : [06-lancer-et-utiliser.md](06-lancer-et-utiliser.md).
