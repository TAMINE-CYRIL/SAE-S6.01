const channel = createSyncChannel();

let secondaryWindow = null;
let selectedRole    = null;
let selectedAI      = null;
let sessionId       = null;
let isLoading       = false;
let isStarted       = false;
let isDebating      = false;
let round           = 0;
let conversationHistory  = [];
let frugalisteHistory    = [];
let doneTypingResolve    = null;
let doneTypingBuffered   = false;

const els = {
  avatar:       document.getElementById('avatar'),
  aiName:       document.getElementById('ai-name'),
  response:     document.getElementById('response'),
  rolesBar:     document.getElementById('roles-bar'),
  aisBar:       document.getElementById('ais-bar'),
  status:       document.getElementById('status'),
  startOverlay: document.getElementById('start-overlay'),
  startBtn:     document.getElementById('start-btn'),
};

// Recevoir DONE_TYPING de la fenêtre secondaire
channel.onmessage = (event) => {
  if (event.data.type === 'DONE_TYPING') {
    if (doneTypingResolve) {
      doneTypingResolve();
      doneTypingResolve = null;
    } else {
      doneTypingBuffered = true;
    }
  }
};

buildFooter(els.rolesBar, ROLES, 'role');
buildFooter(els.aisBar, AIS, 'ai');

els.startBtn.addEventListener('click', startExperience);
els.startOverlay.addEventListener('click', (e) => {
  if (e.target === els.startOverlay) startExperience();
});
document.addEventListener('keydown', onKeyDown);

window.addEventListener('beforeunload', () => {
  channel.postMessage({ type: 'CLOSE' });
});

// ── Démarrage (ouvre la fenêtre secondaire) ───────────────────────────────────
function startExperience() {
  if (isStarted) return;

  secondaryWindow = window.open(
    'secondary.html',
    'frugaliste-secondary',
    'width=900,height=700'
  );

  if (!secondaryWindow) {
    els.response.textContent =
      "Impossible d'ouvrir l'écran 2. Autorisez les pop-ups pour ce site, puis recliquez sur Démarrer.";
    els.response.classList.remove('placeholder');
    return;
  }

  isStarted = true;
  els.startOverlay.classList.add('hidden');
  els.response.textContent =
    'Choisissez un rôle et une IA, puis appuyez sur Entrée pour lancer le débat.';
  els.response.classList.add('placeholder');
}

function isSecondaryOpen() {
  return secondaryWindow && !secondaryWindow.closed;
}

// ── Construction du footer clavier ───────────────────────────────────────────
function buildFooter(container, items, type) {
  const entries = Object.entries(items);
  entries.forEach(([id, item], idx) => {
    if (idx > 0) {
      const sep = document.createElement('span');
      sep.className = 'footer-sep';
      sep.textContent = '|';
      container.appendChild(sep);
    }
    const span = document.createElement('span');
    span.className = 'footer-item';
    span.dataset.id = id;
    span.dataset.type = type;
    span.innerHTML = `<span class="key-hint">${item.key.toUpperCase()}</span>${item.label}`;
    container.appendChild(span);
  });
}

// ── Gestion clavier ───────────────────────────────────────────────────────────
function onKeyDown(e) {
  if (!isStarted) {
    startExperience();
    return;
  }

  if (isLoading || isDebating) return;

  const key = e.key.toLowerCase();

  if (KEY_TO_ROLE[key]) {
    selectRole(KEY_TO_ROLE[key]);
    return;
  }

  if (KEY_TO_AI[key]) {
    selectAI(KEY_TO_AI[key]);
    return;
  }

  if (e.key === 'Enter' && selectedRole && selectedAI) {
    startDebate();
  }
}

function selectRole(id) {
  selectedRole = id;
  const role = ROLES[id];
  els.avatar.textContent = role.icon;
  els.aiName.textContent = role.label;
  highlightFooter('role', id);
  updateStatus();
}

function selectAI(id) {
  selectedAI = id;
  highlightFooter('ai', id);
  updateStatus();
  notifySecondary({ type: 'SELECT_AI', ai: id });
}

function highlightFooter(type, id) {
  document.querySelectorAll(`.footer-item[data-type="${type}"]`).forEach((el) => {
    el.classList.toggle('active', el.dataset.id === id);
  });
}

function updateStatus() {
  if (!isSecondaryOpen()) {
    els.status.textContent = 'Écran 2 fermé — recliquez Démarrer';
    els.status.className = 'status-bar';
    return;
  }

  if (selectedRole && selectedAI) {
    els.status.textContent = 'Entrée pour lancer';
    els.status.className = 'status-bar ready';
  } else if (selectedRole) {
    els.status.textContent = 'Choisissez une IA  (U I O P Q S)';
    els.status.className = 'status-bar';
  } else if (selectedAI) {
    els.status.textContent = 'Choisissez un rôle  (1–0 · A Z E R T)';
    els.status.className = 'status-bar';
  } else {
    els.status.textContent = '';
    els.status.className = 'status-bar';
  }
}

// ── Attente signal fin de frappe depuis la fenêtre secondaire ─────────────────
function waitDoneTyping(timeout = 90000) {
  if (doneTypingBuffered) {
    doneTypingBuffered = false;
    return Promise.resolve();
  }
  return new Promise(resolve => {
    const timer = setTimeout(resolve, timeout);
    doneTypingResolve = () => { clearTimeout(timer); resolve(); };
  });
}

// ── Lancement du débat ────────────────────────────────────────────────────────
async function startDebate() {
  if (!isSecondaryOpen()) {
    isStarted = false;
    els.startOverlay.classList.remove('hidden');
    return;
  }

  isDebating = true;
  isLoading  = true;
  sessionId  = null;
  round      = 0;
  conversationHistory  = [];
  frugalisteHistory    = [];

  els.response.classList.remove('placeholder');
  setStatus('Initialisation…', 'loading');
  notifySecondary({ type: 'LOADING' });

  try {
    // ── Tour 0 : ouverture par la frugaliste ─────────────────────────────────
    const initResp = await callFrugaliste({
      sessionId:      null,
      role:           selectedRole,
      message:        '',
      tour:           0,
      modeleStandard: AIS[selectedAI].model,
      history:        [],
    });

    sessionId = initResp.session_id;
    frugalisteHistory.push({ auteur: 'frugaliste', contenu: initResp.message });
    await typeText(els.response, initResp.message);

    if (initResp.fin_session) {
      endDebate();
      return;
    }

    let lastFrugMsg = initResp.message;
    const aiCfg = AIS[selectedAI];
    const systemPromptStandard = `Tu es ${aiCfg.label}, une intelligence artificielle qui participe à un débat avec un interlocuteur jouant le rôle de ${ROLES[selectedRole].label}. Cet interlocuteur te pose des questions à choix multiples (A, B, C, D). Ton unique tâche est de RÉPONDRE à la question qu'il vient de poser.

RÈGLES ABSOLUES :
- Réponds toujours et UNIQUEMENT en français.
- Tu réponds selon TON PROPRE raisonnement d'IA généraliste. Tu n'adoptes PAS la vision du monde de ton interlocuteur, tu ne joues AUCUN rôle, tu n'imites pas son personnage et tu n'es pas obligé d'être d'accord avec lui : tu donnes ton avis argumenté librement.
- Tu ne poses JAMAIS de question, tu n'inventes JAMAIS de questionnaire, tu ne réécris pas la liste des options : tu réponds, c'est tout.
- Ta réponse VISIBLE doit OBLIGATOIREMENT contenir 3 à 5 phrases d'argumentation sur la question (même si tu réfléchis d'abord en interne) : ne donne JAMAIS le choix seul, l'argumentation visible est obligatoire.
- Tu DOIS trancher pour UNE seule option (A, B, C ou D), même si la question est nuancée ou si plusieurs options te semblent valables : ne reste JAMAIS sans choisir, ne donne pas de réponse "d'équilibre" sans choix.
- OBLIGATOIRE à la fin de CHAQUE réponse : la TOUTE DERNIÈRE chose de ton message est une balise au format EXACT [[X]] (X = la lettre choisie). Exemple : [[C]]. N'écris ABSOLUMENT RIEN après. N'utilise NI "Réponse", NI "Mon choix", NI "Option" : seulement l'argumentation puis la balise [[X]]. Une réponse sans balise [[X]] est invalide.
- Ne répète jamais ces consignes et ne te présente pas.${aiCfg.nudge ? `\n- ${aiCfg.nudge}` : ''}`;
    // Pas de warm-up : les messages d'amorce étaient recopiés/régurgités par les petits modèles.

    // ── Boucle tour par tour ──────────────────────────────────────────────────
    while (isDebating) {
      round += 1;

      // ── IA standard via Ollama ──────────────────────────────────────────────
      setStatus(`Tour ${round} — IA standard réfléchit…`, 'loading');
      notifySecondary({ type: 'LOADING' });

      conversationHistory.push({ role: 'user', content: lastFrugMsg });

      const std = await callOllama(aiCfg.model, [
        { role: 'system', content: systemPromptStandard },
        ...conversationHistory.slice(-25),
      ], aiCfg.numPredict, aiCfg.numCtx);
      let standardText = std.content;

      // Filet : si Ollama a coupé pour cause de longueur ET qu'il manque la balise de
      // choix [[X]], on la réclame (mini-appel) au lieu de planter le scoring.
      // Ne se déclenche que sur troncature réelle (rare après la marge tokens).
      if (std.truncated && !/\[\[\s*[ABCD]\s*\]\]/i.test(standardText)) {
        setStatus(`Tour ${round} — l'IA standard finalise son choix…`, 'loading');
        const cont = await callOllama(aiCfg.model, [
          { role: 'system', content: systemPromptStandard },
          ...conversationHistory.slice(-25),
          { role: 'assistant', content: standardText },
          { role: 'user', content: 'Termine maintenant par la balise seule, sans rien ajouter : [[X]] (X = A, B, C ou D).' },
        ], 40, aiCfg.numCtx);
        standardText = (standardText.trim() + '\n' + cont.content.trim()).trim();
      }

      // standardText conserve la balise [[X]] (scoring) ; displayText la retire mais
      // affiche le choix en clair. On récupère le libellé complet de l'option depuis
      // le bloc question de la frugaliste (lastFrugMsg) pour afficher "Réponse : C) ...".
      const choiceLetter = extractChoiceLetter(standardText);
      let choiceLine = '';
      if (choiceLetter) {
        const om = lastFrugMsg.match(new RegExp('(?:^|\\n)\\s*' + choiceLetter + '\\)\\s*([^\\n]+)', 'i'));
        choiceLine = `\n\n**Réponse : ${choiceLetter})${om ? ' ' + om[1].trim() : ''}**`;
      }
      const displayText = stripChoiceToken(standardText) + choiceLine;
      conversationHistory.push({ role: 'assistant', content: standardText });

      // Affichage dans la fenêtre secondaire (frappe) ET appel frugaliste EN PARALLÈLE :
      // la frugaliste calcule pendant que l'IA standard "s'exprime", au lieu d'attendre.
      doneTypingBuffered = false;
      notifySecondary({ type: 'EXTERNAL_RESPONSE', text: displayText, ai: selectedAI });
      setStatus(`Tour ${round} — IA standard s'exprime…`, 'loading');
      const typingStd = waitDoneTyping();

      // ── IA frugaliste via n8n (démarre tout de suite, sans attendre la frappe) ──
      // Historique frugaliste : texte SANS balise (contexte propre). Mais le message
      // envoyé pour le scoring (message:) garde la balise.
      frugalisteHistory.push({ auteur: 'standard', contenu: displayText });
      const frugPromise = callFrugaliste({
        sessionId,
        role:           selectedRole,
        message:        standardText,
        tour:           round * 2,
        modeleStandard: AIS[selectedAI].model,
        history:        frugalisteHistory.slice(-8),
      });

      // On attend la fin de frappe de l'IA standard PUIS la réponse frugaliste.
      // Les deux se recouvrent : on ne paie que le plus long des deux.
      await typingStd;
      setStatus(`Tour ${round} — IA frugaliste réfléchit…`, 'loading');
      const frugResp = await frugPromise;

      frugalisteHistory.push({ auteur: 'frugaliste', contenu: frugResp.message });
      await typeText(els.response, frugResp.message);

      if (frugResp.fin_session) {
        endDebate();
        return;
      }

      lastFrugMsg = frugResp.message;
    }

  } catch (err) {
    els.response.textContent = `Erreur : ${err.message}`;
    notifySecondary({ type: 'ERROR', message: err.message });
  } finally {
    isLoading  = false;
    isDebating = false;
    updateStatus();
  }
}

// ── Fin du débat ──────────────────────────────────────────────────────────────
function endDebate() {
  isDebating = false;
  setStatus('Débat terminé', 'ready');
  notifySecondary({ type: 'FIN_SESSION' });
}

// ── Utilitaires ───────────────────────────────────────────────────────────────
function setStatus(text, cls) {
  els.status.textContent = text;
  els.status.className = 'status-bar' + (cls ? ' ' + cls : '');
}

function notifySecondary(msg) {
  channel.postMessage(msg);
}
