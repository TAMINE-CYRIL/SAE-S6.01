import os
import tempfile
import subprocess
import json
from flask import Flask, request, jsonify
import pypdf

app = Flask(__name__)
PDF_FOLDER = "/data/pdfs"
# Dossier de cache (volume rw) : on y stocke le texte extrait pour ne JAMAIS
# refaire l'OCR (coûteux) d'un PDF déjà traité lors d'une relance du RAG.
CACHE_FOLDER = os.environ.get("OCR_CACHE_FOLDER", "/data/cache")

# Timeout OCR par PDF. L'OCR couvre désormais TOUTES les pages → on laisse
# largement le temps (1h) à un gros document scanné. Ajustable via OCR_TIMEOUT.
OCR_TIMEOUT = int(os.environ.get("OCR_TIMEOUT", "3600"))


def _cache_path(filename, filepath):
    """Clé de cache = nom + taille du fichier (invalide le cache si le PDF change)."""
    try:
        size = os.path.getsize(filepath)
    except OSError:
        size = 0
    safe = filename.replace("/", "_").replace("\\", "_")
    return os.path.join(CACHE_FOLDER, "%s.%d.json" % (safe, size))


def read_cache(filename, filepath):
    try:
        p = _cache_path(filename, filepath)
        if os.path.isfile(p):
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return None


def write_cache(filename, filepath, text, ocr_used):
    try:
        os.makedirs(CACHE_FOLDER, exist_ok=True)
        with open(_cache_path(filename, filepath), "w", encoding="utf-8") as f:
            json.dump({"text": text, "ocr_used": ocr_used}, f, ensure_ascii=False)
    except Exception:
        pass


def extract_metadata(reader):
    meta = reader.metadata or {}
    return {
        "title":   str(meta.get("/Title",   "") or ""),
        "author":  str(meta.get("/Author",  "") or ""),
        "subject": str(meta.get("/Subject", "") or ""),
        "pages":   len(reader.pages),
    }


def extract_text_native(filepath):
    """Extraction texte via pdftotext (PDFs textuels)."""
    result = subprocess.run(
        ["pdftotext", "-layout", filepath, "-"],
        capture_output=True, text=True, timeout=60
    )
    return result.stdout.strip()


def extract_text_ocr(filepath):
    """OCR via ocrmypdf + tesseract (PDFs scannés) — TOUTES les pages.

    Parallelise (-j 4) et desactive l'optimisation (--optimize 0) pour limiter
    le coût CPU. Pas de limite de pages : le document entier est OCRisé.
    """
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmppath = tmp.name
    try:
        subprocess.run(
            ["ocrmypdf", "--force-ocr",
             "-j", "4", "--optimize", "0", "--language", "fra+eng",
             "--output-type", "pdf", filepath, tmppath],
            capture_output=True, timeout=OCR_TIMEOUT
        )
        result = subprocess.run(
            ["pdftotext", "-layout", tmppath, "-"],
            capture_output=True, text=True, timeout=300
        )
        return result.stdout.strip()
    finally:
        if os.path.exists(tmppath):
            os.unlink(tmppath)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/extract", methods=["POST"])
def extract():
    data = request.get_json(force=True)
    filename = data.get("filename", "")
    filepath = os.path.join(PDF_FOLDER, filename)

    if not os.path.isfile(filepath):
        return jsonify({"error": f"Fichier introuvable : {filepath}"}), 404

    try:
        reader = pypdf.PdfReader(filepath, strict=False)
        metadata = extract_metadata(reader)
    except Exception as e:
        return jsonify({"error": f"Lecture PDF échouée : {e}"}), 500

    # Cache : ce PDF (même taille) a déjà été extrait → on saute l'OCR coûteux.
    cached = read_cache(filename, filepath)
    if cached is not None:
        return jsonify({
            "text":     cached.get("text", ""),
            "metadata": metadata,
            "ocr_used": cached.get("ocr_used", False),
            "filename": filename,
            "cached":   True,
        })

    # Essai extraction texte native
    text = extract_text_native(filepath)
    ocr_used = False

    # Si moins de 100 caractères alphanumériques → PDF scanné → OCR (toutes les pages)
    alnum_count = sum(1 for c in text if c.isalnum())
    if alnum_count < 100:
        try:
            text = extract_text_ocr(filepath)
            ocr_used = True
        except Exception as e:
            return jsonify({"error": f"OCR échoué : {e}"}), 500

    write_cache(filename, filepath, text, ocr_used)

    return jsonify({
        "text":     text,
        "metadata": metadata,
        "ocr_used": ocr_used,
        "filename": filename,
        "cached":   False,
    })


@app.route("/list", methods=["GET"])
def list_pdfs():
    try:
        files = [f for f in os.listdir(PDF_FOLDER) if f.lower().endswith(".pdf")]
        return jsonify({"files": sorted(files)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3100, debug=False)
