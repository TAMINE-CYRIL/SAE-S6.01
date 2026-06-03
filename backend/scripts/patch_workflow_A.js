const sqlite3 = require("/usr/local/lib/node_modules/n8n/node_modules/sqlite3").verbose();
const db = new sqlite3.Database("/home/node/.n8n/database.sqlite");

// Cablage correct des boucles imbriquees (SplitInBatches v3 : sortie 0 = done, sortie 1 = loop)
const CONN = {
  "Declencheur Manuel": { main: [[{ node: "Config: Constantes", type: "main", index: 0 }]] },
  "Config: Constantes": { main: [[{ node: "Lister les PDFs", type: "main", index: 0 }]] },
  "Lister les PDFs": { main: [[{ node: "Parser la Liste de Fichiers", type: "main", index: 0 }]] },
  "Parser la Liste de Fichiers": { main: [[{ node: "Traiter PDF par PDF", type: "main", index: 0 }]] },
  "Traiter PDF par PDF": { main: [
    [{ node: "Afficher Resultat", type: "main", index: 0 }],            // done
    [{ node: "HTTP: Extraire Texte OCR", type: "main", index: 0 }]      // loop
  ]},
  "HTTP: Extraire Texte OCR": { main: [[{ node: "Detection Type + Decoupage", type: "main", index: 0 }]] },
  // Plus de boucle interne (SplitInBatches imbrique buggé) : Detection emet TOUS les chunks
  // du PDF, et les noeuds HTTP les traitent item par item automatiquement.
  "Detection Type + Decoupage": { main: [[{ node: "HTTP: Embedding Ollama", type: "main", index: 0 }]] },
  "HTTP: Embedding Ollama": { main: [[{ node: "Combiner Chunk + Embedding", type: "main", index: 0 }]] },
  "Combiner Chunk + Embedding": { main: [[{ node: "HTTP: Inserer Chunk Supabase", type: "main", index: 0 }]] },
  "HTTP: Inserer Chunk Supabase": { main: [[{ node: "Traiter PDF par PDF", type: "main", index: 0 }]] }  // retour boucle PDF (externe)
};

// Nouveau code du noeud de decoupage : mode "runOnceForAllItems" (1 PDF -> N chunks)
const DECOUPE_CODE = "const items = $input.all();\n"
  + "const out = [];\n"
  + "for (const it of items) {\n"
  + "  const ocrResp = it.json || {};\n"
  + "  if (ocrResp.error) { continue; }\n"
  + "  const text = ocrResp.text || '';\n"
  + "  const meta = ocrResp.metadata || {};\n"
  + "  const ocr_used = ocrResp.ocr_used || false;\n"
  + "  const filename = ocrResp.filename || 'unknown';\n"
  + "  const words = text.split(/\\s+/).filter(w => w.length > 0);\n"
  + "  const CHUNK_SIZE = 300, OVERLAP = 40;\n"
  + "  let count = 0;\n"
  + "  for (let i = 0; i < words.length; i += CHUNK_SIZE - OVERLAP) {\n"
  + "    const w = words.slice(i, i + CHUNK_SIZE);\n"
  + "    if (w.length < 10) break;\n"
  + "    out.push({ json: { contenu: w.join(' '), source_pdf: filename, metadata: { chunk_index: count, word_start: i, ocr_used, pdf_title: meta.title || '', pdf_author: meta.author || '', pdf_pages: meta.pages || 0 } } });\n"
  + "    count++;\n"
  + "  }\n"
  + "}\n"
  + "return out;";

function patchNodes(nodesJson) {
  const nodes = JSON.parse(nodesJson);
  const dec = nodes.find(n => n.name === "Detection Type + Decoupage");
  if (dec && dec.parameters) {
    dec.parameters.mode = "runOnceForAllItems";
    dec.parameters.jsCode = DECOUPE_CODE;
    console.log("OK: Detection Type + Decoupage -> runOnceForAllItems + code robuste");
  } else {
    console.log("WARN: noeud Detection Type + Decoupage introuvable");
  }

  // Combiner Chunk + Embedding : meme bug que Detection (runOnceForEachItem + retour tableau)
  const COMBINE_CODE = "const embs = $input.all();\n"
    + "const chunks = $('Detection Type + Decoupage').all();\n"
    + "const out = [];\n"
    + "for (let i = 0; i < embs.length; i++) {\n"
    + "  const embedding = (embs[i].json || {}).embedding;\n"
    + "  const chunk = (chunks[i] && chunks[i].json) || {};\n"
    + "  if (!embedding || !Array.isArray(embedding)) { continue; }\n"
    + "  const embeddingStr = '[' + embedding.join(',') + ']';\n"
    + "  out.push({ json: { contenu: chunk.contenu, embedding: embeddingStr, source_pdf: chunk.source_pdf, metadata: chunk.metadata } });\n"
    + "}\n"
    + "return out;";
  const comb = nodes.find(n => n.name === "Combiner Chunk + Embedding");
  if (comb && comb.parameters) {
    comb.parameters.mode = "runOnceForAllItems";
    comb.parameters.jsCode = COMBINE_CODE;
    console.log("OK: Combiner Chunk + Embedding -> runOnceForAllItems + code robuste");
  } else {
    console.log("WARN: noeud Combiner Chunk + Embedding introuvable");
  }

  // OCR complet (toutes les pages) : un gros PDF scanne peut prendre de longues
  // minutes -> le node HTTP doit attendre (sinon ECONNABORTED avant la fin OCR).
  const ocrNode = nodes.find(n => n.name === "HTTP: Extraire Texte OCR");
  if (ocrNode && ocrNode.parameters) {
    ocrNode.parameters.options = ocrNode.parameters.options || {};
    ocrNode.parameters.options.timeout = 3700000; // ~1h, > OCR_TIMEOUT du service OCR
    console.log("OK: HTTP: Extraire Texte OCR -> timeout 3700000ms");
  } else {
    console.log("WARN: noeud HTTP: Extraire Texte OCR introuvable");
  }

  // Embedding tolerant aux erreurs : un chunk trop long (>2048 tokens) est saute,
  // le Combiner l'ignore (embedding absent), au lieu d'arreter tout le workflow.
  const emb = nodes.find(n => n.name === "HTTP: Embedding Ollama");
  if (emb) {
    emb.continueOnFail = true;
    emb.onError = "continueRegularOutput";
    console.log("OK: HTTP: Embedding Ollama -> continueOnFail (chunk problematique saute)");
  } else {
    console.log("WARN: noeud HTTP: Embedding Ollama introuvable");
  }

  return JSON.stringify(nodes);
}

const newConn = JSON.stringify(CONN);

db.all("SELECT id, name, nodes FROM workflow_entity WHERE name LIKE '%Workflow A%'", (err, rows) => {
  if (err || !rows || rows.length === 0) { console.log("ERR: workflow A introuvable", err && err.message); db.close(); return; }
  let done = 0;
  rows.forEach(row => {
    const newNodes = patchNodes(row.nodes);
    db.run("UPDATE workflow_entity SET connections=?, nodes=? WHERE id=?", [newConn, newNodes, row.id], function (e) {
      console.log("entity '" + row.name + "': changes=" + this.changes + (e ? " ERR " + e.message : " ok"));
      if (++done === rows.length) {
        db.all("SELECT versionId, nodes FROM workflow_history WHERE workflowId IN (SELECT id FROM workflow_entity WHERE name LIKE '%Workflow A%')", (e2, hrows) => {
          if (e2 || !hrows || hrows.length === 0) { console.log("history: aucune ligne" + (e2 ? " ERR " + e2.message : "")); db.close(); return; }
          let hd = 0;
          hrows.forEach(hr => {
            const hn = patchNodes(hr.nodes);
            db.run("UPDATE workflow_history SET connections=?, nodes=? WHERE versionId=?", [newConn, hn, hr.versionId], function (e3) {
              console.log("history " + hr.versionId + ": changes=" + this.changes + (e3 ? " ERR " + e3.message : " ok"));
              if (++hd === hrows.length) db.close();
            });
          });
        });
      }
    });
  });
});
