# Corpus PDF (RAG)

Ce dossier contient les **PDF sources** qui alimentent la base de connaissances (RAG) de l'IA frugaliste.

Les fichiers PDF **ne sont pas versionnés sur Git** (corpus volumineux : plusieurs centaines de Mo, certains fichiers dépassent la limite GitHub de 100 Mo). Ils sont transférés séparément.

## Pour reconstituer le corpus

1. Déposer ici les fichiers `.pdf` sur la frugalité / décroissance / sobriété.
2. Lancer le **Workflow A — Ingestion RAG** dans n8n : chaque PDF est OCRisé, découpé en chunks, vectorisé (`nomic-embed-text`) puis inséré dans Supabase.

Le texte extrait est mis en cache dans `../ocr_cache/` (également non versionné) pour éviter de relancer l'OCR à chaque fois.
