function createSyncChannel() {
  return new BroadcastChannel(CONFIG.CHANNEL_NAME);
}

function stripThinking(text) {
  if (!text) return '';
  let t = text;
  const lastClose = t.lastIndexOf('</think>');
  if (lastClose !== -1) {
    // Modèle de raisonnement : on ne garde que la réponse APRÈS la dernière </think>
    t = t.slice(lastClose + 8);
  } else if (/<think>/i.test(t)) {
    // <think> ouvert mais jamais fermé (génération coupée pendant le raisonnement) :
    // pas de réponse exploitable → on ne montre JAMAIS le raisonnement brut.
    t = '';
  }
  return t.replace(/<\/?think>/gi, '').trim();
}

// Retire la balise de choix [[X]] (format machine impose a l'IA standard) :
// on l'utilise pour le scoring mais on ne l'affiche jamais a l'ecran.
function stripChoiceToken(text) {
  return String(text || '').replace(/\[\[\s*[ABCD]\s*\]\]/gi, '').trim();
}

// Lit la lettre de choix de la balise [[X]] (derniere occurrence). null si absente.
function extractChoiceLetter(text) {
  const re = /\[\[\s*([ABCD])\s*\]\]/gi; let m, last = null;
  while ((m = re.exec(String(text || ''))) !== null) last = m[1].toUpperCase();
  return last;
}

function renderMarkdown(text) {
  const safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return safe
    .replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/gs, '<em>$1</em>');
}

function typeText(element, text, speed = 8) {
  if (!text) return Promise.resolve();
  return new Promise((resolve) => {
    element.textContent = '';
    element.classList.add('typing-cursor');
    // Durée totale plafonnée (~5 s) : pour un texte long on tape plusieurs
    // caractères par tick au lieu d'attendre 15 s. Court = effet machine à écrire.
    const maxDurationMs = 5000;
    const step = Math.max(1, Math.ceil((text.length * speed) / maxDurationMs));
    let i = 0;

    function tick() {
      if (i < text.length) {
        element.textContent += text.slice(i, i + step);
        i += step;
        element.scrollIntoView({ block: 'end', behavior: 'instant' });
        setTimeout(tick, speed);
      } else {
        element.classList.remove('typing-cursor');
        element.innerHTML = renderMarkdown(text);
        resolve();
      }
    }

    tick();
  });
}

function generateSessionId() {
  return crypto.randomUUID();
}

// ── Appel webhook n8n (IA frugaliste) ────────────────────────────────────────
async function callFrugaliste({ sessionId, role, message, tour, modeleStandard, history }) {
  if (CONFIG.DEMO_MODE) {
    await delay(900);
    return demoFrugalisteResponse({ sessionId, role, tour });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 720000);

  let res;
  try {
    res = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        session_id:      sessionId,
        role:            role,
        message:         message,
        tour:            tour,
        modele_standard: modeleStandard,
        history:         history || [],
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Timeout (12min) — le modèle est trop lent. Essayez Mistral ou Phi qui sont plus rapides.');
    throw e;
  }
  clearTimeout(timer);

  if (!res.ok) throw new Error(`n8n ${res.status} — vérifiez que le workflow B est actif`);
  const text = await res.text();
  if (!text || !text.trim()) throw new Error('n8n a retourné une réponse vide — le workflow a peut-être expiré ou rencontré une erreur interne');
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Réponse n8n invalide (${text.slice(0, 80)}…)`);
  }
}

// ── Appel direct Ollama (IA standard) ────────────────────────────────────────
async function callOllama(model, messages, numPredict = 280, numCtx = 2048) {
  if (CONFIG.DEMO_MODE) {
    await delay(700);
    return demoOllamaResponse(model);
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 720000);

  let res;
  try {
    res = await fetch(CONFIG.OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      // num_thread: 8 = utiliser les 8 coeurs physiques du CPU (au lieu de 6 par defaut).
      body: JSON.stringify({ model, messages, stream: false, keep_alive: '30m', options: { num_predict: numPredict, num_ctx: numCtx, num_thread: 8 } }),
    });
  } catch (e) {
    clearTimeout(t);
    if (e.name === 'AbortError') throw new Error(`Timeout (12min) sur "${model}" — essayez Mistral ou Phi qui sont plus rapides.`);
    throw e;
  }
  clearTimeout(t);

  if (!res.ok) throw new Error(`Ollama ${res.status} — vérifiez qu'Ollama tourne et que le modèle "${model}" est téléchargé`);
  const data = await res.json();
  const raw = data.message?.content || '';
  const content = stripThinking(raw);
  if (!content) throw new Error(`"${model}" a retourné une réponse vide — tokens insuffisants (phase de réflexion trop longue).`);
  // truncated : Ollama a coupé pour cause de longueur (et non parce que le modèle
  // a fini). Sert de filet : on pourra réclamer la ligne de choix manquante.
  return { content, truncated: data.done_reason === 'length' };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Réponses de démo (DEMO_MODE: true) ───────────────────────────────────────
let _demoSessionId = null;
let _demoTourCount = 0;

function demoFrugalisteResponse({ sessionId, role, tour }) {
  if (tour === 0) {
    _demoSessionId = generateSessionId();
    _demoTourCount = 0;
  }
  _demoTourCount++;

  const roleLabel = ROLES[role]?.label || role;
  const fin = _demoTourCount >= 6;

  return {
    session_id:          _demoSessionId || sessionId || generateSessionId(),
    message:             fin
      ? `[${roleLabel}] Nous avons parcouru un long chemin ensemble. Votre score final est de 48/96 — un profil "Régulation et changement de cap". La route vers la sobriété est ouverte.`
      : `[${roleLabel}] Tour ${tour || 0} — La frugalité n'est pas un sacrifice, c'est une reconquête. Qu'en pensez-vous ?`,
    score_partiel:       _demoTourCount * 4,
    questions_repondues: _demoTourCount,
    questions_restantes: 24 - _demoTourCount,
    fin_session:         fin,
  };
}

function demoOllamaResponse(model) {
  return `[${model}] Je comprends votre point de vue, mais je pense que la technologie reste notre meilleur levier pour réduire l'empreinte environnementale tout en préservant notre niveau de vie.`;
}
