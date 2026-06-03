const channel = createSyncChannel();

const els = {
  avatar:   document.getElementById('avatar'),
  aiName:   document.getElementById('ai-name'),
  response: document.getElementById('response'),
};

channel.onmessage = async (event) => {
  const msg = event.data;

  switch (msg.type) {
    case 'SELECT_AI':
      if (msg.ai) updateAIHeader(msg.ai);
      break;

    case 'LOADING':
      els.response.textContent = 'Réflexion en cours…';
      els.response.classList.add('placeholder');
      break;

    case 'EXTERNAL_RESPONSE':
      updateAIHeader(msg.ai);
      els.response.classList.remove('placeholder');
      await typeText(els.response, msg.text);
      channel.postMessage({ type: 'DONE_TYPING' });
      break;

    case 'FIN_SESSION':
      els.response.textContent = 'Débat terminé.';
      els.response.classList.add('placeholder');
      break;

    case 'ERROR':
      els.response.textContent = `Erreur : ${msg.message}`;
      els.response.classList.add('placeholder');
      break;

    case 'CLOSE':
      window.close();
      break;
  }
};

function updateAIHeader(aiId) {
  const ai = AIS[aiId];
  if (!ai) return;
  els.avatar.textContent = ai.icon;
  els.aiName.textContent = ai.label;
}
