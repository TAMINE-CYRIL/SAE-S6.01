# Étape 0 — Installer les prérequis

Avant de lancer le projet, quelques outils doivent être présents sur la machine. Ils permettent de faire fonctionner les services Docker, de récupérer les dépôts nécessaires et de servir l'interface web en local.

Cette étape concerne principalement Windows 10 et Windows 11. Les commandes sont à exécuter dans PowerShell. Certaines installations peuvent demander un redémarrage de la machine.

## 0.1 Installer WSL2

Docker Desktop s'appuie sur WSL2 pour exécuter les conteneurs Linux sous Windows. Il faut donc commencer par vérifier que WSL est installé et configuré en version 2.

Ouvrir PowerShell en administrateur, puis exécuter :

```powershell
wsl --install
```

Si Windows demande un redémarrage, il faut le faire avant de continuer. Une fois la machine relancée, la commande suivante permet de vérifier l'état de WSL :

```powershell
wsl --status
```

La sortie doit indiquer que la version par défaut est la version 2. Si WSL est encore configuré en version 1, il faut forcer la version 2 avec :

```powershell
wsl --set-default-version 2
```

## 0.2 Installer Docker Desktop

Docker est utilisé pour lancer les différents composants du projet : Supabase, n8n, Ollama et le service OCR. L'intérêt est d'éviter une installation manuelle de chaque outil et de garder un environnement reproductible.

Télécharger Docker Desktop depuis le site officiel :

```text
https://www.docker.com/products/docker-desktop/
```

Pendant l'installation, conserver l'option `Use WSL 2 instead of Hyper-V` lorsqu'elle est proposée. Après l'installation, ouvrir Docker Desktop et attendre que le service soit complètement démarré.

Dans les paramètres de Docker Desktop, vérifier également que l'intégration WSL est activée :

```text
Settings > Resources > WSL Integration
```

La vérification se fait ensuite dans PowerShell :

```powershell
docker --version
docker info
```

La première commande doit afficher la version de Docker. La seconde doit afficher les informations du moteur Docker. Si un message indique que le daemon Docker est inaccessible, Docker Desktop n'est probablement pas démarré ou n'a pas encore fini de se lancer.

## 0.3 Installer Python

Python est utilisé pour lancer un petit serveur web local. L'interface du projet ne doit pas être ouverte directement depuis les fichiers HTML, car certaines fonctionnalités, notamment la communication entre les fenêtres, nécessitent un serveur local.

Télécharger Python depuis :

```text
https://www.python.org/downloads/
```

Pendant l'installation, cocher l'option `Add python.exe to PATH`. Cette option permet d'utiliser la commande `python` directement depuis PowerShell.

La vérification se fait avec :

```powershell
python --version
```

Si la commande n'est pas reconnue, il faut relancer l'installation de Python en vérifiant que l'ajout au PATH est bien activé, puis rouvrir PowerShell.

## 0.4 Installer Git

Git est nécessaire pour récupérer certains dépôts, notamment le dépôt Supabase utilisé pour l'installation locale.

Télécharger Git depuis :

```text
https://git-scm.com/download/win
```

Les options par défaut conviennent pour ce projet. Une fois l'installation terminée, vérifier Git avec :

```powershell
git --version
```

Il est aussi conseillé de configurer son identité Git, même si le projet ne demande pas forcément de contribution au dépôt :

```powershell
git config --global user.name "Ton Nom"
git config --global user.email "ton.email@exemple.com"
```

## 0.5 Ajuster la mémoire disponible pour WSL

Les modèles d'IA exécutés localement consomment de la mémoire. Sur Windows, il est préférable d'indiquer explicitement combien de ressources WSL peut utiliser. Cela évite certains ralentissements ou blocages lorsque plusieurs conteneurs tournent en même temps.

Créer le fichier suivant :

```text
C:\Users\<ton-nom-windows>\.wslconfig
```

Ajouter ce contenu :

```ini
[wsl2]
memory=11GB
swap=2GB
processors=8
```

La valeur `memory` doit être adaptée à la machine. Sur un ordinateur avec 16 Go de RAM, `11GB` est un réglage raisonnable. Sur une machine avec 8 Go de RAM, il vaut mieux indiquer environ `5GB`, même si le projet sera plus lent.

Après modification, fermer WSL avec :

```powershell
wsl --shutdown
```

Docker relancera WSL automatiquement au prochain démarrage des conteneurs.

## Vérification finale

Avant de passer à la suite, exécuter les commandes suivantes :

```powershell
wsl --status
docker --version
python --version
git --version
```

Si chaque commande répond correctement, les prérequis sont installés. La prochaine étape consiste à démarrer Supabase : [01-supabase.md](01-supabase.md).
