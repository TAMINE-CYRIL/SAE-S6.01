# Étape 0 — Installer les outils de base

Avant de toucher au projet, il faut installer **4 outils** sur ta machine : WSL2, Docker Desktop, Python et Git. On installe, puis on **vérifie** chacun.

> 💡 **Comment lire ce guide** : pour chaque outil, il y a *« Pourquoi »*, *« Installer »*, *« Vérifier »*. Ne passe à l'outil suivant que si la vérification réussit.

---

## 0.1 — WSL2 (le moteur Linux de Windows)

**Pourquoi ?** Docker, sur Windows, fait tourner ses conteneurs dans une mini-machine Linux appelée **WSL2**. C'est invisible au quotidien, mais indispensable.

**Installer** — ouvre **PowerShell en administrateur** (clic droit sur le menu Démarrer → « Terminal (admin) ») et tape :

```powershell
wsl --install
```

Redémarre l'ordinateur si Windows le demande.

**Vérifier** :

```powershell
wsl --status
```

Tu dois voir « Version par défaut : 2 ». Si tu vois « Version : 1 », tape `wsl --set-default-version 2`.

---

## 0.2 — Docker Desktop (fait tourner les briques du projet)

**Pourquoi ?** Tout le « moteur » du projet (n8n, Ollama, OCR, Supabase) tourne dans des **conteneurs** Docker : des boîtes isolées qui contiennent déjà tout le nécessaire. Tu n'installes pas n8n ou Ollama à la main — Docker s'en charge.

**Installer** :
1. Télécharge Docker Desktop : https://www.docker.com/products/docker-desktop/
2. Installe-le en laissant l'option **« Use WSL 2 instead of Hyper-V »** cochée.
3. Lance Docker Desktop et **laisse-le ouvert** (l'icône baleine doit être stable dans la barre des tâches).
4. Dans Docker Desktop : **Settings → Resources → WSL Integration** → vérifie que l'intégration est activée.

**Vérifier** (dans un PowerShell **normal**, pas forcément admin) :

```powershell
docker --version
docker info
```

`docker --version` affiche un numéro (ex. « Docker version 27.x »).
`docker info` affiche plein de lignes **sans erreur** rouge. Si tu vois « cannot connect to the Docker daemon », c'est que Docker Desktop n'est pas lancé.

---

## 0.3 — Python 3 (pour servir le site web en local)

**Pourquoi ?** Le site est composé de fichiers HTML/JS. Pour qu'il fonctionne correctement (la synchro entre les 2 fenêtres), il doit être **servi par un petit serveur web**, pas ouvert directement comme un fichier. Python fournit ce serveur en une commande.

**Installer** :
- Télécharge Python : https://www.python.org/downloads/
- ⚠️ **Important** : à l'installation, coche la case **« Add python.exe to PATH »** en bas de la fenêtre.

**Vérifier** :

```powershell
python --version
```

Tu dois voir « Python 3.x ». Si la commande n'est pas reconnue, réinstalle en cochant bien « Add to PATH », ou redémarre PowerShell.

---

## 0.4 — Git (pour récupérer le code)

**Pourquoi ?** Git sert à cloner le projet et la base Supabase depuis GitHub.

**Installer** : https://git-scm.com/download/win (laisse les options par défaut).

**Vérifier puis configurer ton identité** :

```powershell
git --version
git config --global user.name "Ton Nom"
git config --global user.email "ton.email@exemple.com"
```

---

## 0.5 — Donner assez de mémoire à WSL (recommandé)

**Pourquoi ?** Les modèles IA sont gourmands en RAM. Par défaut, WSL peut s'en allouer trop peu et tout devient très lent (ou plante). On lui réserve une part fixe.

**Faire** : crée le fichier `C:\Users\<ton-nom-windows>\.wslconfig` avec ce contenu :

```ini
[wsl2]
memory=11GB
swap=2GB
processors=8
```

> Adapte `memory` à ta machine : laisse au moins 4 Go à Windows. Sur 16 Go de RAM, `11GB` est un bon réglage. Sur 8 Go, mets `5GB` (le projet sera plus lent).

Puis applique en fermant WSL (Docker le relancera tout seul) :

```powershell
wsl --shutdown
```

---

## ✅ Récapitulatif — tout doit répondre

Lance ces 4 commandes à la suite ; chacune doit afficher une version :

```powershell
wsl --status
docker --version
python --version
git --version
```

Si les 4 répondent, **les prérequis sont prêts**. Passe à l'étape suivante :
👉 **[01-supabase.md](01-supabase.md)**
