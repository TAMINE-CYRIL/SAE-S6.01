# Étape 6 — Lancer et utiliser le projet

Tout est installé 🎉 Voici comment **démarrer**, **utiliser**, puis **arrêter** le projet — au quotidien.

---

## 6.1 — Tout démarrer

Depuis la racine du projet :

```powershell
.\lancer-frugal-ai.ps1
```

Ce script s'occupe de tout :
1. vérifie/lance Docker Desktop ;
2. démarre la stack backend (n8n, OCR, Ollama) ;
3. démarre Supabase ;
4. sert le site web sur **http://localhost:8080** et l'ouvre dans ton navigateur.

> Une **deuxième fenêtre** s'ouvre automatiquement (l'écran de l'IA standard). Si ton navigateur la bloque, autorise les **pop-ups** pour `localhost`, puis recommence.

---

## 6.2 — Utiliser l'interface

L'écran principal (fond sombre) = l'**IA frugaliste**. La seconde fenêtre (fond clair) = l'**IA standard**.

Au clavier :
1. **Choisis un rôle** pour la frugaliste — une touche (prêtre, coach, psychanalyste…). Le bandeau du bas indique les touches.
2. **Choisis une IA standard** — une touche (Mistral, Qwen, Llama…).
3. Appuie sur **Entrée** pour lancer le débat.

Le débat s'enchaîne tout seul : la frugaliste pose une question (5 au total), l'IA standard répond et choisit une option, et à la fin la frugaliste révèle ta **note** et ton **profil**.

> 🐢 **Patience au 1er tour** : le premier appel d'un modèle le charge en mémoire (60–90 s sur CPU). Ensuite c'est plus rapide. **Mistral** et **Qwen** sont les modèles les plus fiables ; DeepSeek est le plus capricieux.

---

## 6.3 — Tout arrêter

```powershell
.\arreter-frugal-ai.ps1
```

Ce script arrête le serveur web et **met en pause** les conteneurs (il ne les supprime pas) : le prochain `lancer-frugal-ai.ps1` redémarre en quelques secondes. Docker Desktop, lui, reste ouvert (ferme-le à la main si tu veux).

---

## 6.4 — Au quotidien

Une fois l'installation faite (étapes 0 à 5), tu n'as plus que **deux commandes** à retenir :

| Pour… | Commande |
|---|---|
| Démarrer et ouvrir le site | `.\lancer-frugal-ai.ps1` |
| Tout arrêter | `.\arreter-frugal-ai.ps1` |

Tu n'as **pas** à refaire les étapes 0 à 5 : elles sont permanentes (les conteneurs, modèles, workflows et données restent stockés).

---

## ✅ Félicitations

Le projet tourne. Si quelque chose cloche un jour, va voir :
👉 **[07-depannage.md](07-depannage.md)**
