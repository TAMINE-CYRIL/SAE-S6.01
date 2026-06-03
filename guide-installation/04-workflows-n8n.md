# Étape 4 — Importer les workflows n8n

**Pourquoi ?** n8n tourne, mais il est **vide**. Les « workflows » sont les recettes qui font travailler l'IA frugaliste. Il y en a trois :
- **Workflow A** — Ingestion RAG : transforme les PDF en base de connaissances ;
- **Workflow B** — Frugaliste : le cœur, qui répond aux questions du site (via un *webhook*) ;
- **Workflow C** — Replay : rejoue une session.

On va les **importer** puis appliquer les **patches** (les réglages fins du projet : prompts, scoring, personnages, performances).

> 💡 **C'est quoi un webhook ?** Une URL que le site appelle pour « réveiller » un workflow. Le site parle à `…/webhook/frugalai-frugaliste` : c'est le Workflow B qui répond.

---

## 4.1 — Créer ton compte n8n (manuel, une fois)

Au tout premier démarrage, n8n demande de créer un compte propriétaire (stocké **localement**, ce n'est pas un compte en ligne).

1. Ouvre **http://localhost:5678** dans ton navigateur.
2. Remplis le formulaire (email + mot de passe). **Retiens-les.**
3. Tu arrives sur l'interface n8n (encore vide).

> Cette étape est **obligatoire** : sans compte, le script d'import ne peut pas assigner les workflows.

---

## 4.2 — Importer les workflows + appliquer les réglages (script)

```powershell
cd backend\scripts
.\import_workflows.ps1
cd ..\..
```

Ce script :
1. retrouve ton compte n8n automatiquement ;
2. importe les 3 workflows (`backend/n8n/*.json`) ;
3. applique les patches (`patch_workflow.js` et `patch_workflow_A.js`) ;
4. redémarre n8n pour tout recharger.

> ❓ S'il affiche **« Aucun compte n8n trouve »**, c'est que l'étape 4.1 n'a pas été faite : crée le compte sur http://localhost:5678, puis relance le script.

---

## 4.3 — Activer les workflows (manuel)

Importés, les workflows ne sont pas forcément **actifs**. Or le site a besoin que **B** (et **C**) soient actifs pour répondre.

1. Recharge **http://localhost:5678** (au besoin `Ctrl+F5`).
2. Tu vois les 3 workflows « Frugal AI - Workflow A / B / C ».
3. Ouvre **Workflow B**, puis bascule l'**interrupteur « Active »** (en haut à droite) sur ON. Fais de même pour **Workflow C**.
   - Le **Workflow A** n'a pas besoin d'être « actif » : on le lancera à la main pour l'ingestion (étape 5).

---

## 4.4 — Vérifier que le webhook répond

Ce petit test confirme que le Workflow B est bien en ligne :

```powershell
curl -X POST http://localhost:5678/webhook/frugalai-frugaliste -H "Content-Type: application/json" -d '{"session_id":null,"role":"coach","message":"","tour":0,"modele_standard":"mistral"}' --max-time 240
```

> ⏳ Le **premier** appel peut prendre 1 à 3 minutes (Ollama charge le modèle en mémoire pour la première fois). C'est normal. Une réponse en JSON (avec un `message`) = **succès**.
> Si tu obtiens « webhook non enregistré », c'est que le Workflow B n'est pas activé (reviens en 4.3).

---

## ✅ C'est bon ?

- [ ] Compte n8n créé
- [ ] `import_workflows.ps1` terminé sans erreur
- [ ] Workflows B et C **activés**
- [ ] Le test du webhook renvoie du JSON

Si oui, on construit la base de connaissances :
👉 **[05-corpus-rag.md](05-corpus-rag.md)**
