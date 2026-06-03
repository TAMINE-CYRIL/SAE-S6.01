FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-eng \
    poppler-utils \
    ghostscript \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# pikepdf epingle a 8.15.1 : ocrmypdf 16.4.2 appelle pikepdf.Pdf.check(), supprime dans pikepdf >= 9.
RUN pip install --no-cache-dir flask==3.0.3 pypdf==4.3.1 ocrmypdf==16.4.2 pikepdf==8.15.1

COPY app.py .

EXPOSE 3100
CMD ["python", "app.py"]
