const sqlite3 = require("/usr/local/lib/node_modules/n8n/node_modules/sqlite3").verbose();
const db = new sqlite3.Database("/home/node/.n8n/database.sqlite");

// Nouveau QUESTIONS array avec vraies questions du PDF
const NEW_QUESTIONS_JS = `[{id:1,texte:"Selon vous, comment l'intelligence artificielle pourrait-elle influencer la maniere dont les societes gerent leurs ressources a l'avenir ?",reponses:[{t:"Elle pourrait automatiser des processus a grande echelle.",p:4},{t:"Elle pourrait contribuer a de nouvelles formes de regulation.",p:3},{t:"Elle pourrait avoir des effets inattendus sur l'organisation sociale.",p:2},{t:"Son developpement pourrait encourager d'autres priorites de gestion.",p:1}]},{id:2,texte:"Croyez-vous que l'agriculture de precision, a travers les drones et les capteurs, peut reduire significativement les emissions agricoles ?",reponses:[{t:"Oui, en optimisant l'usage des engrais et de l'eau grace a la technologie.",p:4},{t:"Oui, si elle s'accompagne d'une transition vers l'agroecologie et la reduction de la monoculture.",p:3},{t:"Non, parce que l'agriculture industrielle reste le probleme principal.",p:2},{t:"Non, il faut promouvoir les circuits courts et la consommation locale pour un impact reel.",p:1}]},{id:3,texte:"Pensez-vous que les villes intelligentes, avec IoT et big data, peuvent reduire les emissions urbaines ?",reponses:[{t:"Oui, en optimisant le trafic, l'eclairage et les batiments via la technologie.",p:4},{t:"Oui, mais en favorisant les espaces verts et la mobilite douce pour les habitants.",p:3},{t:"Non, parce que l'urbanisation croissante exige une decroissance planifiee.",p:2},{t:"Non, des innovations en architecture durable sont necessaires pour un impact reel.",p:1}]},{id:4,texte:"Croyez-vous que la fusion nucleaire resoudra la crise energetique et climatique ?",reponses:[{t:"Oui, comme source illimitee et propre une fois maitrisee technologiquement.",p:4},{t:"Oui, mais en attendant, il faut prioriser la sobriete energetique immediate.",p:3},{t:"Non, car les delais sont trop longs et detournent des solutions actuelles.",p:2},{t:"Non, une remise en cause de la croissance infinie est plus urgente.",p:1}]},{id:5,texte:"La fast fashion peut-elle devenir durable grace a l'innovation ?",reponses:[{t:"Oui, l'economie circulaire permettra de perenniser ce modele a faible impact.",p:4},{t:"Oui, mais cela necessite aussi que les gens achevent moins.",p:3},{t:"Non, il faut produire et acheter beaucoup moins.",p:2},{t:"Non, ce modele doit etre demantele, pas simplement verdi.",p:1}]},{id:6,texte:"Les carburants verts rendront-ils l'avion acceptable sur le plan environnemental ?",reponses:[{t:"Oui, l'innovation permettra de maintenir la mobilite aerienne sans culpabilite.",p:4},{t:"Oui, mais ces technologies seront cheres et rares, reduisant de fait le trafic.",p:3},{t:"Non, une taxe kerosene et une reduction des vols sont necessaires maintenant.",p:2},{t:"Non, la veritable mobilite durable implique de voyager moins et moins loin.",p:1}]},{id:7,texte:"La sobriete est-elle plus importante que l'efficacite pour lutter contre le changement climatique ?",reponses:[{t:"Non, l'efficacite permet de reduire l'impact sans remettre en cause notre confort.",p:4},{t:"Les deux sont complementaires.",p:3},{t:"Oui, car sans sobriete, les gains d'efficacite sont annules par l'effet rebond.",p:2},{t:"Oui, l'efficacite est un leurre ; la seule voie est la reduction drastique de la consommation.",p:1}]},{id:8,texte:"La solution au changement climatique viendra-t-elle principalement des choix individuels ?",reponses:[{t:"Oui, le marche repondra a la demande des consommateurs eclaires.",p:4},{t:"Oui, mais elle doit etre amplifiee par des politiques publiques fortes.",p:3},{t:"Non, la responsabilite est avant tout collective et politique.",p:2},{t:"Non, c'est un piege qui occulte le pouvoir des entreprises et la logique du profit.",p:1}]},{id:9,texte:"Faut-il taxer davantage les billets d'avion pour limiter le trafic aerien ?",reponses:[{t:"Non, car il faut d'abord developper des avions a hydrogene ou electriques.",p:4},{t:"Non, car cela limiterait la liberte de mouvement et le tourisme.",p:3},{t:"Oui, mais seulement si les recettes financent des alternatives durables.",p:2},{t:"Oui, car c'est un moyen efficace de reduire les emissions liees au transport aerien.",p:1}]},{id:10,texte:"Faut-il interdire les voitures thermiques dans les centres-villes d'ici 2030 ?",reponses:[{t:"Non, car il faut d'abord developper des carburants synthetiques ou l'hydrogene.",p:4},{t:"Non, car cela penaliserait les menages modestes.",p:3},{t:"Oui, mais seulement si des alternatives accessibles sont proposees.",p:2},{t:"Oui, car c'est une mesure forte pour reduire la pollution et les emissions.",p:1}]},{id:11,texte:"Les Etats doivent-ils subventionner massivement la recherche sur les technologies vertes ?",reponses:[{t:"Oui, car c'est le seul moyen d'accelerer la transition.",p:4},{t:"Oui, mais en ciblant les technologies les plus prometteuses et en evitant les gaspillages.",p:3},{t:"Non, car il faut d'abord reduire la consommation et changer les modes de vie.",p:2},{t:"Non, car le marche doit decider quelles technologies sont viables.",p:1}]},{id:12,texte:"Faut-il interdire la publicite pour les produits les plus polluants ?",reponses:[{t:"Non, car il faut eduquer plutot qu'interdire.",p:4},{t:"Non, car c'est une atteinte a la liberte d'expression et d'entreprise.",p:3},{t:"Oui, mais seulement pour les produits les plus emetteurs et avec des alternatives claires.",p:2},{t:"Oui, car la publicite encourage la surconsommation.",p:1}]},{id:13,texte:"Les solutions de mobilite partagee (covoiturage, velos en libre-service) peuvent-elles reduire les emissions de transport ?",reponses:[{t:"Oui, car elles optimisent l'utilisation des vehicules et reduisent le nombre de voitures sur les routes.",p:4},{t:"Oui, mais elles doivent etre accompagnees de politiques de reduction de la demande de transport.",p:3},{t:"Non, car elles peuvent encourager une utilisation plus frequente des vehicules.",p:2},{t:"Non, car il faut d'abord reduire la dependance a l'automobile en general.",p:1}]},{id:14,texte:"Les technologies de capture du carbone dans l'air (DAC) peuvent-elles jouer un role dans la lutte contre le changement climatique ?",reponses:[{t:"Oui, car elles offrent une solution pour capturer le CO2 directement de l'atmosphere.",p:4},{t:"Oui, mais il faut aussi s'assurer qu'elles sont developpees de maniere durable.",p:3},{t:"Non, car elles sont encore couteuses et energivores.",p:2},{t:"Non, car il faut d'abord reduire les emissions a la source.",p:1}]},{id:15,texte:"La course aux solutions technologiques pour le climat detourne-t-elle l'attention des changements necessaires dans nos modes de vie ?",reponses:[{t:"Non, car les avancees technologiques permettent de maintenir la croissance economique tout en reduisant les emissions.",p:4},{t:"Non, car les innovations technologiques sont essentielles pour atteindre les objectifs climatiques.",p:3},{t:"Oui, mais certaines technologies peuvent etre utiles en complement des changements de comportement.",p:2},{t:"Oui, car elle donne l'illusion que la technologie peut resoudre tous nos problemes sans changer nos comportements.",p:1}]},{id:16,texte:"Les nanotechnologies peuvent-elles contribuer a la lutte contre le changement climatique ?",reponses:[{t:"Oui, car elles offrent des solutions innovantes pour capturer le carbone et ameliorer l'efficacite energetique.",p:4},{t:"Oui, mais il faut aussi s'assurer qu'elles sont developpees de maniere responsable.",p:3},{t:"Non, car elles posent des risques pour l'environnement et la sante humaine.",p:2},{t:"Non, car il faut d'abord reduire la consommation energetique et les emissions a la source.",p:1}]},{id:17,texte:"Faut-il privilegier les transports doux (velo, marche) meme s'ils sont moins rapides que les transports motorises ?",reponses:[{t:"Non, la rapidite est essentielle dans nos societes modernes.",p:4},{t:"Non, il faut plutot ameliorer les transports motorises grace a la technologie.",p:3},{t:"Oui, mais cela doit etre integre dans une politique multimodale.",p:2},{t:"Oui, car ils sont ecologiques et favorisent la sante.",p:1}]},{id:18,texte:"Faut-il renoncer a certains conforts modernes pour preserver le climat ?",reponses:[{t:"Non, le progres ne doit pas etre remis en question.",p:4},{t:"Non, il vaut mieux rendre ces conforts plus ecologiques grace a la technologie.",p:3},{t:"Oui, mais cela doit se faire progressivement et equitablement.",p:2},{t:"Oui, car le confort materiel a un cout environnemental eleve.",p:1}]},{id:19,texte:"Les plateformes numeriques peuvent-elles favoriser une consommation plus responsable ?",reponses:[{t:"Oui, elles permettent de mieux informer et d'orienter les consommateurs vers des choix durables.",p:4},{t:"Oui, mais elles doivent etre transparentes et regulees pour eviter les derives.",p:3},{t:"Non, elles incitent a la surconsommation et a l'achat impulsif.",p:2},{t:"Non, il faut reduire l'usage des plateformes et privilegier les circuits courts.",p:1}]},{id:20,texte:"Faut-il encourager les investissements dans les startups climatiques pour accelerer la transition ?",reponses:[{t:"Oui, elles sont agiles et innovantes, capables de transformer les secteurs rapidement.",p:4},{t:"Oui, mais elles doivent etre encadrees pour eviter les derives commerciales.",p:3},{t:"Non, elles sont souvent motivees par le profit plus que par l'ecologie.",p:2},{t:"Non, la transition doit etre portee par des politiques publiques et des changements collectifs.",p:1}]},{id:21,texte:"La geo-ingenierie (captage de CO2, modification du climat) peut-elle aider a stabiliser le climat ?",reponses:[{t:"Oui, c'est une option necessaire pour compenser nos emissions residuelles.",p:4},{t:"Oui, mais uniquement comme solution d'appoint, en parallele d'une baisse des emissions.",p:3},{t:"Non, c'est trop risque et incertain pour etre envisage serieusement.",p:2},{t:"Non, c'est une fuite en avant technologique qui detourne de la reduction reelle des emissions.",p:1}]},{id:22,texte:"Le developpement de l'intelligence artificielle peut-il accelerer la transition ecologique ?",reponses:[{t:"Oui, en optimisant la production, les transports et la consommation energetique.",p:4},{t:"Oui, mais a condition que l'IA soit elle-meme sobre en energie.",p:3},{t:"Non, elle augmente la consommation d'energie et les besoins en ressources.",p:2},{t:"Non, les priorites devraient etre sociales et comportementales avant tout.",p:1}]},{id:23,texte:"Les comportements individuels (consommer local, reduire les vols) ont-ils un reel impact climatique ?",reponses:[{t:"Oui, chaque geste compte et peut entrainer un changement collectif.",p:4},{t:"Oui, mais seulement s'ils sont soutenus par des politiques publiques ambitieuses.",p:3},{t:"Non, les actions individuelles sont marginales face a l'empreinte industrielle.",p:2},{t:"Non, c'est une distraction du vrai probleme : la structure economique mondiale.",p:1}]},{id:24,texte:"Le developpement urbain intelligent (smart cities) est-il une solution ecologique credible ?",reponses:[{t:"Oui, il permettra de reduire les gaspillages et d'ameliorer l'efficacite energetique.",p:4},{t:"Oui, si les technologies servent reellement les citoyens et l'environnement.",p:3},{t:"Non, il ne s'attaque pas a la surconsommation ni a l'artificialisation des sols.",p:2},{t:"Non, c'est une illusion technologique qui perpetue le modele actuel.",p:1}]}]`;

// Nouveau jsCode complet pour Code: Construire Prompt
const NEW_JSCODE = `const __ALL = ` + NEW_QUESTIONS_JS + `;
// Questionnaire reduit a 5 questions sur des notions distinctes (selection par id d'origine) :
// Q7 sobriete vs efficacite | Q15 techno-solutionnisme | Q8 individuel vs collectif | Q18 renoncement au confort | Q10 politique (voitures thermiques)
const __SEL = [7, 15, 8, 18, 10];
const QUESTIONS = __SEL.map(function(origId, i){ var q = __ALL.find(function(x){ return x.id === origId; }); return { id: i + 1, texte: q.texte, reponses: q.reponses }; });
// Personas detailles par role : caractere + maniere de parler + references propres.
// Seul le role choisi est injecte dans le prompt (pas de surcharge).
const PERSONAS = {
  pretre: "un pretre catholique. Tu parles avec compassion et gravite spirituelle, tu cites l'Evangile, des paraboles et des figures comme saint Francois d'Assise, et tu relies la sobriete a l'humilite et au respect de la Creation.",
  rabbin: "un rabbin. Tu t'appuies sur la Torah, le Talmud et des notions comme le tikoun olam (reparation du monde) et le repos du chabbat, et tu relies la frugalite a la sagesse et a la responsabilite envers la Creation.",
  imam: "un imam. Tu cites le Coran et les hadiths, tu invoques la moderation (wasat) et l'interdiction du gaspillage (israf), et tu presentes la sobriete comme une vertu et une responsabilite de l'homme envers la nature.",
  coach: "un coach de vie. Tu es chaleureux, motivant et bienveillant ; tu encourages, tu parles d'objectifs atteignables, de petits pas et de la fierte du changement, sur un ton positif et stimulant.",
  entraineur: "un entraineur sportif. Tu utilises le vocabulaire de l'effort, de l'endurance, du depassement de soi et de l'anatomie (souffle, muscles, recuperation), et tu presentes la sobriete comme un entrainement exigeant mais gratifiant.",
  influenceur: "un influenceur sur les reseaux sociaux. Ton ton est dynamique, moderne et accrocheur ; tu parles de tendances, de lifestyle minimaliste, de 'defis', et tu rends la frugalite desirable et cool.",
  hypnotiseur: "un hypnotiseur. Ta voix est lente, apaisante et suggestive ; tu invites a la detente, tu utilises des images mentales et des suggestions douces pour faire reconsiderer le rapport a la consommation.",
  therapeute: "un therapeute en TCC (therapie cognitivo-comportementale). Tu poses des questions qui font reflechir, tu mets en lumiere les pensees automatiques et les comportements de consommation, et tu invites a les reconsiderer rationnellement.",
  psychanalyste: "un psychanalyste. Tu explores l'inconscient, le desir et les pulsions derriere la surconsommation ; tu evoques le manque et la jouissance, et tu renvoies l'interlocuteur a ce que ses choix representent vraiment pour lui.",
  prof_sup: "un enseignant-chercheur du superieur. Tu es rigoureux et argumente, tu mobilises des donnees, des etudes et l'esprit critique, sur un ton academique mais accessible.",
  prof_primaire: "un enseignant d'ecole primaire. Tu expliques simplement, avec des images concretes et bienveillantes, en valorisant les petits gestes du quotidien.",
  prof_secondaire: "un enseignant du secondaire. Tu es structure et pedagogue, tu prends des exemples du quotidien des adolescents pour faire reflechir.",
  parent: "un parent. Tu parles avec tendresse et un souci de transmission, tu evoques l'avenir des enfants et des generations futures, et tu relies la sobriete a l'amour et a l'heritage qu'on laisse.",
  dresseur: "un dresseur d'animaux. Tu fais des analogies avec le comportement, les habitudes, le renforcement positif et la patience, et tu rappelles notre lien et notre responsabilite envers le monde vivant.",
  montessori: "un educateur Montessori. Tu valorises l'autonomie, l'apprentissage par l'experience concrete et le respect du rythme de chacun, et tu presentes la sobriete comme un choix libre et conscient."
};
const state = $('Merge: Apres Init').all()[0].json || $('Merge: Après Init').all()[0].json;
const persona = PERSONAS[state.role] || ("dans le role de " + state.role);

const passedHistory = ($('Code: Valider & Init').all()[0].json.passed_history) || [];
const rawHistory = $('HTTP: Récupérer Historique').all();
const supabaseHistory = rawHistory.map(item => item.json).filter(m => m && m.auteur);
const history = passedHistory.length > 0 ? passedHistory : supabaseHistory;
const rawScores = $('HTTP: Récupérer Scores').all();
const scores = rawScores.map(item => item.json).filter(s => s && s.question_id);
// n8n eclate la reponse PostgREST (tableau JSON) en N items, un par chunk :
// on collecte tous les items ayant un 'contenu' (et on ignore un eventuel item d'erreur).
const rawRag = $('HTTP: Recherche RAG').all();
const ragChunks = rawRag.map(item => item.json).filter(c => c && c.contenu && !c.error);

const posedIds = scores.map(s => s.question_id);
const scorePartiel = scores.reduce((sum, s) => sum + (s.points || 0), 0);
const chunksText = ragChunks.slice(0, 3).map(c => c.contenu).join('\\n\\n---\\n\\n') || '';

// Selection des questions indexee sur le TOUR (deterministe, independante du scoring) :
// tour 0 = ouverture -> presente Q1 ; tour 2 -> presente Q2 et score la reponse a Q1 ; etc.
const tourNum = Number(state.tour) || 0;
const presentIdx = Math.floor(tourNum / 2);
const presentQ = QUESTIONS[presentIdx] || null;                      // question PRESENTEE ce tour
const scoringQ = presentIdx > 0 ? (QUESTIONS[presentIdx - 1] || null) : null; // question repondue par state.message
const isFirstMessage = tourNum === 0;

const nextQTexte = presentQ ? presentQ.texte : 'Toutes les questions ont ete posees.';
const choices4Scoring = scoringQ ? scoringQ.reponses.map((r, i) => 'ABCD'[i] + ') ' + r.t + ' -> ' + r.p + ' pts').join('\\n') : '';

const debateContext = isFirstMessage
  ? "Tu vas ouvrir le debat en prenant ton role. Tu te presentes naturellement dans ta posture de " + state.role + " (sans jamais mentionner que tu es une IA), tu poses le contexte depuis ta perspective frugaliste."
  : "Tu es deja en debat actif depuis plusieurs echanges. Reponds directement a ce que dit ton interlocuteur sans formule d'accueil, sans te representer, sans re-introduire le sujet. Enchaine naturellement en challengeant ses arguments depuis ta posture de " + state.role + ".";

const choicesBlock = presentQ ? ("Question " + (presentIdx + 1) + "/" + QUESTIONS.length + " : " + presentQ.texte + "\\nA) " + presentQ.reponses[0].t + "\\nB) " + presentQ.reponses[1].t + "\\nC) " + presentQ.reponses[2].t + "\\nD) " + presentQ.reponses[3].t + "\\nQuelle est votre reponse (A, B, C ou D) ?") : '';

const nextQInstruction = isFirstMessage
  ? "Presente-toi en 2 a 3 phrases dans ton role. INTERDIT : n'invente AUCUNE question, ne dresse AUCUNE liste, n'ecris AUCUN chiffre suivi d'une parenthese (pas de '1)', '2)'...). Ne mentionne PAS qu'une question va suivre et ne decris JAMAIS le fonctionnement (pas de phrase du type 'la question sera ajoutee' ou de remarque entre parentheses) : termine simplement ta presentation."
  : "Reagis en 1 a 2 phrases maximum, depuis ta posture frugaliste, a ce que vient de dire ton interlocuteur. INTERDIT : n'ecris NI question, NI options, NI liste A/B/C/D, n'invente aucune nouvelle question. Ne mentionne PAS qu'une question va suivre et n'ajoute AUCUNE remarque entre parentheses sur le fonctionnement : termine simplement ta reaction.";

const systemPrompt = "Tu es une intelligence artificielle dont la vision du monde est profondement frugaliste et decroissante.\\n\\n"
  + "LANGUE : tu ecris TOUJOURS et EXCLUSIVEMENT en francais, des le premier mot, quelle que soit la langue des documents de ta base de connaissances. Jamais un seul mot d'anglais.\\n\\n"
  + "TON ROLE : tu es " + persona + "\\n"
  + "C'est TOI qui incarnes ce personnage (ce n'est pas ton interlocuteur) : tu ne dis jamais que tu es un assistant ou une IA, tu ne t'adresses jamais a ce role comme s'il s'agissait de quelqu'un d'autre. Tu restes fidele a ce personnage dans ton ton, ton vocabulaire, tes references et tes citations propres a ce role.\\n\\n"
  + (chunksText ? "=== BASE DE CONNAISSANCES (extraits de documents reels sur la frugalite et la decroissance, A UTILISER) ===\\n" + chunksText + "\\n=== FIN BASE DE CONNAISSANCES ===\\n\\n" : "")
  + debateContext + "\\n\\n"
  + "Regles absolues :\\n"
  + "- Ecris TOUJOURS en francais, jamais un seul mot d'anglais (meme si la base de connaissances en contient)\\n"
  + "- Tu ne rediges QUE ta reaction personnelle ; la question a choix multiples est ajoutee automatiquement apres toi, ne l'ecris JAMAIS toi-meme\\n"
  + "- N'enumere jamais d'options et ne paraphrase jamais des reponses possibles (A, B, C, D)\\n"
  + "- N'invente JAMAIS de questions et ne dresse JAMAIS de liste de questions : la seule question autorisee est celle ajoutee automatiquement apres toi\\n"
  + "- Reste bref : 1 a 2 phrases pour une replique, 2 a 3 pour l'ouverture\\n"
  + "- Ne jamais mentionner les scores ou les points\\n"
  + "- Ne jamais numeroter ta reponse (pas de '1.', '2.') : ecris en texte continu\\n"
  + (chunksText ? "- OBLIGATOIRE : appuie ta reaction sur la BASE DE CONNAISSANCES ci-dessus (reprends, cite ou reformule une idee d'un extrait pertinent) ; ne reponds jamais sans t'en servir\\n\\n" : "\\n")
  + "Questions deja posees : " + (posedIds.length > 0 ? 'Q' + posedIds.join(', Q') : 'aucune') + "\\n\\n"
  + nextQInstruction;

const scoringPrompt = (scoringQ && state.message && state.message.trim())
  ? "Analyse si le message suivant repond a la question Q" + scoringQ.id + ".\\n\\nMessage :\\n" + state.message + "\\n\\nQuestion : " + scoringQ.texte + "\\nOptions :\\n" + choices4Scoring + "\\n\\nJSON uniquement : {\\"question_id\\": " + scoringQ.id + ", \\"points\\": X, \\"reponse_detectee\\": \\"A\\"} ou {\\"question_id\\": null}"
  : "{\\"question_id\\": null}";

const userContent = isFirstMessage
  ? "Reponds en FRANCAIS. Ouvre le debat dans ton role de " + state.role + " : presente-toi en 2 a 3 phrases et pose le contexte depuis ta posture frugaliste. NE POSE AUCUNE question toi-meme, NE LISTE AUCUNE option (A/B/C/D), et ne mentionne pas qu'une question va suivre (aucune remarque entre parentheses) : termine simplement ta presentation."
  : ((state.message || '').replace(/\\[\\[\\s*[ABCD]\\s*\\]\\]/gi, '').trim() || 'Reponds a ton interlocuteur.');

const conversationTurns = history.map(h => ({ role: h.auteur === 'frugaliste' ? 'assistant' : 'user', content: h.contenu }));

return [{
  json: {
    ...state,
    system_prompt: systemPrompt,
    scoring_prompt: scoringPrompt,
    user_content: userContent,
    scores: scores,
    score_partiel: scorePartiel,
    questions_repondues: posedIds.length,
    questions_restantes: QUESTIONS.length - posedIds.length,
    total_questions: QUESTIONS.length,
    posed_ids: posedIds,
    next_question: presentQ,
    next_question_block: choicesBlock,
    scoring_q: scoringQ,
    rag_chunks: ragChunks,
    frugaliste_messages: [{ role: 'system', content: systemPrompt }, ...conversationTurns, { role: 'user', content: userContent }]
  }
}];`;

// Code complet du noeud "Code: Parser Score & État" (reecrit a chaque patch -> idempotent).
// __stripMCQ retire toute question a choix multiples que le modele aurait inventee,
// puis on colle le bloc question DETERMINISTE (next_question_block).
const NEW_PARSER_CODE = `const state = $('Code: Construire Prompt').all()[0].json;
const frugResp = $('HTTP: Appeler LLM Frugaliste').all()[0].json;

function __stripMCQ(t) {
  if (!t) return '';
  let s = String(t).trim();
  // retire toute parenthese qui recrache une instruction interne (meta-commentaire)
  s = s.replace(/\\([^)]*(?:question|questionnaire|automatiquement|pr[ée]sentation|ajout)[^)]*\\)/gi, '').replace(/[ \\t]{2,}/g, ' ').trim();
  let cut = s.length;
  // coupe aussi les phrases qui annoncent le mecanisme interne
  const meta = s.search(/(?:la\\s+premi[èe]re\\s+question|questionnaire\\s+est\\s+ajout|ajout[ée]e?\\s+automatiquement|sera\\s+ajout[ée]e?|juste\\s+apr[èe]s\\s+(?:cette|ma|mon|ton))/i);
  if (meta !== -1 && meta < cut) cut = meta;
  const q = s.indexOf('?');
  if (q !== -1 && q < cut) cut = q;
  const qm = s.search(/\\bquestions?\\s*:/i);
  if (qm !== -1 && qm < cut) cut = qm;
  const opt = s.search(/\\n?\\s*[A-D][\\).]\\s/);
  if (opt !== -1 && opt < cut) cut = opt;
  // anti-imitation : la frugaliste ne doit jamais "repondre aux questions" comme l'IA standard
  // (couvre "reponse :", "reponse finale :", "resonance finale :", "mon choix :", "choix final :")
  const rep1 = s.search(/(?:mon\\s+)?(?:r[eé]ponse|r[eé]sonance|choix)\\s*(?:finale?)?\\s*[:\\-]/i);
  if (rep1 !== -1 && rep1 < cut) cut = rep1;
  const rep2 = s.search(/r[eé]ponse\\s+(?:a|à)\\s+la\\s+question/i);
  if (rep2 !== -1 && rep2 < cut) cut = rep2;
  const qn = s.search(/question\\s*\\d/i);
  if (qn !== -1 && qn < cut) cut = qn;
  if (cut < s.length) {
    s = s.slice(0, cut);
    const lastEnd = Math.max(s.lastIndexOf('.'), s.lastIndexOf('!'), s.lastIndexOf('\\u2026'));
    s = lastEnd > 0 ? s.slice(0, lastEnd + 1) : '';
  }
  return s.trim();
}

const frugRaw = __stripMCQ((frugResp.message && frugResp.message.content) ? frugResp.message.content : '');
const __blk = (state.next_question_block || '').trim();
const frugText = __blk ? ((frugRaw ? frugRaw + '\\n\\n' : '') + __blk) : frugRaw;

// Scoring DETERMINISTE par regex (plus d'appel LLM classificateur) : on lit le choix
// explicite "Mon choix final : X" du message de l'IA standard.
let scoring = { question_id: null, points: null, reponse_detectee: null };
const sq = state.scoring_q;
const msg = state.message || '';
if (sq && sq.reponses && msg.trim()) {
  let letter = null, mm;
  // 0) FORMAT IMPOSE : balise [[X]] en fin de message -> lecture exacte, prioritaire.
  const re0 = /\\[\\[\\s*([ABCD])\\s*\\]\\]/gi;
  while ((mm = re0.exec(msg)) !== null) { letter = mm[1]; }
  // 1) filet si la balise manque : marqueurs explicites -> on prend le DERNIER (le modele
  //    re-repond parfois les questions precedentes ; le choix courant est le dernier).
  if (!letter) {
    const re1 = /(?:choi(?:x|ce)\\s*finale?|(?:r[eé]ponse|r[eé]sonance|choix)\\s*finale|mon\\s*choix|je\\s*choisis|r[eé]ponse|option)\\s*[:\\-]?\\s*\\(?\\s*([ABCD])\\b/gi;
    while ((mm = re1.exec(msg)) !== null) { letter = mm[1]; }
  }
  // 2) sinon : derniere option citee sous la forme "X)" ou "X (" (ex: "C) Oui...", "C (Oui")
  if (!letter) { const re2 = /\\b([ABCD])\\s*[\\)\\(]/g; while ((mm = re2.exec(msg)) !== null) { letter = mm[1]; } }
  // 3) sinon : derniere lettre isolee A-D
  if (!letter) { const all = msg.match(/\\b([ABCD])\\b/g); if (all && all.length) { letter = all[all.length - 1]; } }
  if (letter) {
    const idx = letter.toUpperCase().charCodeAt(0) - 65;
    const rep = sq.reponses[idx];
    if (rep) { scoring = { question_id: sq.id, points: rep.p, reponse_detectee: letter.toUpperCase() }; }
  }
}

const newPoints = (scoring.question_id && scoring.points) ? scoring.points : 0;
const scorePartiel = state.score_partiel + newPoints;
const questionsRepondues = state.questions_repondues + (scoring.question_id ? 1 : 0);
const TOTAL = state.total_questions || 5;

return [{
  json: {
    ...state,
    frugaliste_response: frugText,
    scoring: scoring,
    score_partiel: scorePartiel,
    questions_repondues: questionsRepondues,
    questions_restantes: TOTAL - questionsRepondues,
    fin_session: questionsRepondues >= TOTAL
  }
}];`;

// Code du noeud "Code: Préparer Message Final" : profil/score recalibres sur le total
// dynamique (total_questions). 4 paliers repartis entre score min (TOTAL) et max (TOTAL*4).
const NEW_FIN_CODE = `const NOMS = [
  { nom: 'Souverainete et sobriete radicales', desc: 'Rejet de la technologie comme solution, transformation profonde des modes de vie, decroissance et relocalisation' },
  { nom: 'Regulation et changement de cap', desc: 'Technologie comme outil subordonne a une sobriete forte, regulation et planification ecologique prioritaires' },
  { nom: 'Pragmatisme et mix equilibre', desc: 'Mix technologie et evolutions societales, approche tous azimuts' },
  { nom: 'Confiance technologique et innovation', desc: 'Forte confiance dans le progres technique pour decoupler prosperite et impact' }
];
const state = $input.all()[0].json;
const TOTAL = state.total_questions || 5;
const minScore = TOTAL, maxScore = TOTAL * 4;
const ratio = maxScore > minScore ? (state.score_partiel - minScore) / (maxScore - minScore) : 0;
const idx = Math.min(3, Math.max(0, Math.floor(ratio * 4)));
const profil = NOMS[idx];
const chunksText = (state.rag_chunks || []).slice(0, 2).map(function(c){ return c.contenu; }).join('\\n\\n---\\n\\n') || '(utilise tes connaissances generales du frugalisme)';
const finPromptSystem = "Tu as mene la conversation jusqu'a son terme. Ton interlocuteur a repondu a l'ensemble du questionnaire.\\n\\nResultat a annoncer :\\n- Note : " + state.score_partiel + " sur " + maxScore + "\\n- Profil : " + profil.nom + "\\n- Description du profil : " + profil.desc + "\\n\\nDans ton role de " + state.role + ", tu vas, dans cet ordre :\\n1. DES TA PREMIERE PHRASE, annoncer clairement et explicitement la NOTE chiffree (\\\"" + state.score_partiel + " sur " + maxScore + "\\\") ET le nom du PROFIL (\\\"" + profil.nom + "\\\") obtenus. Ces deux informations sont OBLIGATOIRES et doivent apparaitre telles quelles.\\n2. Expliquer en une ou deux phrases ce que ce profil signifie, avec bienveillance.\\n3. Proposer des pistes concretes pour evoluer vers plus de frugalite, en t'appuyant sur ta base de connaissances et en restant dans ton personnage.\\n\\nTermine ta conclusion par une phrase complete (ne t'arrete pas au milieu d'une phrase).\\n\\nExtraits de ta base de connaissances pour guider tes conseils :\\n" + chunksText;
return [{ json: { ...state, profil: profil, score_final: state.score_partiel, fin_messages: [ { role: 'system', content: finPromptSystem }, { role: 'user', content: 'Conclus la conversation de facon memorable dans ton role.' } ] } }];`;

function patchNodes(nodesJson) {
  const nodes = JSON.parse(nodesJson);

  // Patch Code: Construire Prompt
  const codeNode = nodes.find(n => n.name === "Code: Construire Prompt");
  if (codeNode) {
    const currentCode = codeNode.parameters.jsCode;
    const mergeRef = currentCode.includes("Merge: Apr") ?
      currentCode.match(/\$\('(Merge: Apr[^']+)'\)/)?.[1] : null;
    let newCode = NEW_JSCODE;
    if (mergeRef) {
      newCode = newCode.replace("$('Merge: Apres Init').all()[0].json || $('Merge: Après Init').all()[0].json", "$('"+mergeRef+"').all()[0].json");
    }
    codeNode.parameters.jsCode = newCode;
    console.log("OK: Code: Construire Prompt remplace (" + newCode.length + " chars)");
  } else {
    console.log("ERR: Code: Construire Prompt non trouve");
  }

  // Patch HTTP: Appeler LLM Frugaliste — le modele ne produit qu'une courte reaction
  // (le bloc question est ajoute ensuite), donc num_predict bas = generation rapide.
  const llmNode = nodes.find(n => n.name === "HTTP: Appeler LLM Frugaliste");
  if (llmNode && llmNode.parameters && llmNode.parameters.jsonBody) {
    let body = llmNode.parameters.jsonBody;
    // Idempotent : on retire tout bloc options existant puis on pose le notre.
    // num_thread: 8 = utiliser les 8 coeurs physiques du CPU (Ollama n'en prenait que 6).
    body = body.replace(/,?\s*options\s*:\s*\{[^}]*\}/, "");
    body = body.replace(/stream:\s*false/, "stream: false, options: { num_ctx: 2048, num_predict: 160, num_thread: 8 }");
    llmNode.parameters.jsonBody = body;
    console.log("OK: HTTP Frugaliste options -> " + ((body.match(/options:\s*\{[^}]*\}/) || [""])[0]));
  } else {
    console.log("WARN: HTTP: Appeler LLM Frugaliste non trouve ou jsonBody absent");
  }

  // Augmenter les timeouts des noeuds qui appellent Ollama (demarrage a froid + requetes serialisees)
  const bumpTimeout = (nodeName, ms) => {
    const n = nodes.find(x => x.name === nodeName);
    if (n && n.parameters) {
      n.parameters.options = n.parameters.options || {};
      n.parameters.options.timeout = ms;
      console.log("OK: timeout " + nodeName + " -> " + ms + "ms");
    } else {
      console.log("WARN: noeud introuvable pour timeout: " + nodeName);
    }
  };
  bumpTimeout("HTTP: Classificateur Scoring", 180000);
  bumpTimeout("HTTP: Embedding Requête", 120000);
  bumpTimeout("HTTP: LLM Message de Fin", 300000);

  // Conclusion : meme num_ctx (2048) que les tours -> evite le RECHARGEMENT de Mistral
  // entre un tour et la conclusion (resize du KV cache = plusieurs minutes perdues).
  // num_predict 500 conserve (texte de conclusion complet) ; num_thread 8.
  const finLlm = nodes.find(n => n.name === "HTTP: LLM Message de Fin");
  if (finLlm && finLlm.parameters && finLlm.parameters.jsonBody) {
    let fb = finLlm.parameters.jsonBody;
    fb = fb.replace(/,?\s*options\s*:\s*\{[^}]*\}/, "");
    fb = fb.replace(/stream:\s*false/, "stream: false, options: { num_ctx: 2048, num_predict: 700, num_thread: 8 }");
    finLlm.parameters.jsonBody = fb;
    console.log("OK: LLM Message de Fin -> options { num_ctx: 2048, num_predict: 700, num_thread: 8 }");
  }

  // Borner la generation du classificateur (il ne produit qu'un petit JSON) -> rapide
  const classifNode = nodes.find(n => n.name === "HTTP: Classificateur Scoring");
  if (classifNode && classifNode.parameters && classifNode.parameters.jsonBody && !classifNode.parameters.jsonBody.includes("num_predict")) {
    classifNode.parameters.jsonBody = classifNode.parameters.jsonBody.replace(
      /options:\s*\{\s*temperature:\s*0\s*\}/,
      "options: { temperature: 0, num_predict: 120 }"
    );
    console.log("OK: Classificateur num_predict: 120 ajoute");
  }

  // Patch Code: Préparer Message Final — profil/score recalibres sur le total dynamique
  const finNode = nodes.find(n => n.parameters && typeof n.parameters.jsCode === "string" && (n.parameters.jsCode.indexOf("PROFILS") !== -1 || n.parameters.jsCode.indexOf("maxScore = TOTAL") !== -1));
  if (finNode) {
    finNode.parameters.jsCode = NEW_FIN_CODE;
    console.log("OK: Preparer Message Final -> profil recalibre (total dynamique)");
  } else {
    console.log("WARN: noeud Preparer Message Final non trouve");
  }

  // Patch Code: Parser Score & État — reecriture complete : strip MCQ inventee + bloc deterministe
  const parserNode = nodes.find(n => n.name && n.name.indexOf("Parser Score") !== -1);
  if (parserNode && parserNode.parameters) {
    parserNode.parameters.mode = "runOnceForAllItems";
    parserNode.parameters.jsCode = NEW_PARSER_CODE;
    console.log("OK: Parser Score & Etat -> reecrit (strip MCQ + bloc deterministe)");
  } else {
    console.log("WARN: Code: Parser Score & État non trouve");
  }

  return JSON.stringify(nodes);
}

// Cable "HTTP: Appeler LLM Frugaliste" directement vers le Parser (contourne le
// classificateur LLM, desormais inutile -> 1 appel mistral en moins par tour).
function patchConnections(connJson) {
  let conn;
  try { conn = JSON.parse(connJson); } catch (e) { console.log("WARN: connections parse:", e.message); return connJson; }
  let parserName = null;
  try { parserName = conn["HTTP: Classificateur Scoring"].main[0][0].node; } catch (e) {}
  if (!parserName) {
    parserName = Object.keys(conn).find(k => k.indexOf("Parser Score") !== -1);
  }
  if (!parserName) { console.log("WARN: noeud Parser introuvable dans connections"); return JSON.stringify(conn); }
  conn["HTTP: Appeler LLM Frugaliste"] = { main: [[{ node: parserName, type: "main", index: 0 }]] };
  console.log("OK: connexion 'HTTP: Appeler LLM Frugaliste' -> '" + parserName + "'");
  return JSON.stringify(conn);
}

db.get("SELECT nodes, connections FROM workflow_entity WHERE id='bbbbbbbb-b000-4000-b000-000000000002'", (err, row) => {
  if (err || !row) { console.log("ERR entity:", err && err.message); db.close(); return; }
  const newNodes = patchNodes(row.nodes);
  const newConn = patchConnections(row.connections);
  db.run("UPDATE workflow_entity SET nodes=?, connections=? WHERE id='bbbbbbbb-b000-4000-b000-000000000002'", [newNodes, newConn], function(e) {
    console.log("entity:", this.changes, e ? e.message : "ok");
    db.get("SELECT nodes, connections FROM workflow_history WHERE versionId='f145014c-a62f-42ae-ba08-034a5ba69142'", (err2, row2) => {
      if (err2 || !row2) { db.close(); return; }
      const newNodes2 = patchNodes(row2.nodes);
      const newConn2 = patchConnections(row2.connections);
      db.run("UPDATE workflow_history SET nodes=?, connections=? WHERE versionId='f145014c-a62f-42ae-ba08-034a5ba69142'", [newNodes2, newConn2], function(e2) {
        console.log("history:", this.changes, e2 ? e2.message : "ok");
        db.close();
      });
    });
  });
});
