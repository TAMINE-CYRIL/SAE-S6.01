const ROLES = {
  pretre:          { key: '1', label: 'Prêtre',           icon: '⛪' },
  rabbin:          { key: '2', label: 'Rabbin',           icon: '✡' },
  imam:            { key: '3', label: 'Imam',             icon: '☪' },
  coach:           { key: '4', label: 'Coach',            icon: '🏋️' },
  entraineur:      { key: '5', label: 'Entraîneur',       icon: '🏃' },
  influenceur:     { key: '6', label: 'Influenceur',      icon: '📱' },
  hypnotiseur:     { key: '7', label: 'Hypnotiseur',      icon: '🌀' },
  therapeute:      { key: '8', label: 'Thérapeute TCC',   icon: '🧠' },
  psychanalyste:   { key: '9', label: 'Psychanalyste',    icon: '🛋️' },
  prof_sup:        { key: '0', label: 'Ens. Supérieur',   icon: '🎓' },
  prof_primaire:   { key: 'a', label: 'Ens. Primaire',    icon: '🖍️' },
  prof_secondaire: { key: 'z', label: 'Ens. Secondaire',  icon: '📐' },
  parent:          { key: 'e', label: 'Parent',           icon: '👨‍👩‍👧' },
  dresseur:        { key: 'r', label: 'Dresseur',         icon: '🐾' },
  montessori:      { key: 't', label: 'Montessori',       icon: '🌱' },
};

// Réglage PAR IA (chaque modèle a un mode d'échec différent) :
// numPredict : tokens max générés (thinking inclus pour modèles R1)
// numCtx     : fenêtre de contexte en tokens (3072 sur les 7B pour garder tout le débat)
// nudge      : consigne ajoutée au prompt système, ciblée sur la faiblesse du modèle
const AIS = {
  // Fiables (FR natif, format respecté) : juste un peu de marge tokens + contexte élargi.
  mistral:  { key: 'u', label: 'Mistral',  model: 'mistral',          icon: '🌬️', numPredict: 450,  numCtx: 3072 },
  qwen:     { key: 'q', label: 'Qwen',     model: 'qwen2.5',          icon: '🀄', numPredict: 450,  numCtx: 3072 },
  // Bavard + lourd (8B) : plus de tokens pour atteindre la ligne de choix + bride anti-logorrhée.
  llama:    { key: 'i', label: 'Llama',    model: 'llama3.1',         icon: '🦙', numPredict: 600,  numCtx: 3072,
              nudge: 'Sois CONCIS : 3 à 5 phrases maximum, sans listes à rallonge.' },
  // Petit (2B), format aléatoire + bascule parfois en anglais : on verrouille langue + format.
  gemma:    { key: 'o', label: 'Gemma',    model: 'gemma2:2b',        icon: '💎', numPredict: 420,  numCtx: 2048,
              nudge: 'Réponds en français et termine IMPÉRATIVEMENT par la ligne « Mon choix final : X ».' },
  // Penche vers l'anglais : on cible uniquement la langue.
  phi:      { key: 's', label: 'Phi',      model: 'phi3',             icon: 'Φ',  numPredict: 420,  numCtx: 2048,
              nudge: 'Réponds IMPÉRATIVEMENT en français, jamais en anglais.' },
  // Modèle de raisonnement : il argumente dans son <think> (masqué) et ne laisse qu'une
  // conclusion d'une ligne → on force l'argumentation DANS la réponse visible, en français.
  deepseek: { key: 'p', label: 'DeepSeek', model: 'deepseek-r1:1.5b', icon: '🔍', numPredict: 2800, numCtx: 4096,
              nudge: 'Écris UNIQUEMENT en français, sans aucun mot anglais. Après ta réflexion interne, ta réponse VISIBLE doit développer 3 à 5 phrases d\'argumentation (pas seulement le choix), puis se terminer par la balise [[X]]. Ne re-réponds PAS aux questions précédentes.' },
};

const KEY_TO_ROLE = Object.fromEntries(
  Object.entries(ROLES).map(([id, r]) => [r.key, id])
);

const KEY_TO_AI = Object.fromEntries(
  Object.entries(AIS).map(([id, a]) => [a.key, id])
);
