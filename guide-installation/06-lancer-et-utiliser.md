# Étape 6 — Lancer et utiliser Frugal AI

Une fois les étapes d'installation terminées, le projet peut être lancé à l'aide du script prévu à la racine. Ce script démarre les services nécessaires et ouvre l'interface web locale.

## 6.1 Démarrer le projet

Depuis la racine du projet, exécuter :

```powershell
.\lancer-frugal-ai.ps1
```

Le script effectue les actions suivantes :

```text
- vérification de Docker Desktop ;
- démarrage des services backend ;
- démarrage de Supabase ;
- lancement du serveur web local ;
- ouverture de l'interface dans le navigateur.
```

L'interface principale est servie à l'adresse :

```text
http://localhost:8080
```

Une seconde fenêtre peut s'ouvrir automatiquement pour afficher l'écran de l'IA standard. Si le navigateur bloque cette fenêtre, autoriser les fenêtres contextuelles pour `localhost`, puis relancer le script.

## 6.2 Utilisation de l'interface

L'application utilise deux fenêtres :

| Fenêtre | Rôle |
|---|---|
| Écran principal | Affiche l'IA frugaliste et le déroulement du questionnaire |
| Seconde fenêtre | Affiche l'IA standard et ses réponses |

Le choix des paramètres se fait au clavier. Le bandeau affiché dans l'interface indique les touches disponibles.

Le déroulement général est le suivant :

```text
1. Choisir le rôle de l'IA frugaliste.
2. Choisir le modèle utilisé pour l'IA standard.
3. Appuyer sur Entrée pour lancer l'échange.
```

Le débat s'enchaîne ensuite automatiquement. La frugaliste pose plusieurs questions, l'IA standard répond, puis l'application calcule un score et affiche le profil obtenu.

Le premier échange peut être lent, surtout si le modèle choisi n'a pas encore été chargé par Ollama. Les modèles `mistral` et `qwen2.5` sont généralement les plus stables pour une démonstration locale. `deepseek-r1:1.5b` peut être moins régulier selon les réponses attendues.

## 6.3 Arrêter le projet

Pour arrêter proprement les services, utiliser le script suivant depuis la racine :

```powershell
.\arreter-frugal-ai.ps1
```

Ce script arrête le serveur web et met les conteneurs en pause sans supprimer les données. Les modèles, les workflows et le contenu de la base restent donc disponibles pour les prochains lancements.

Docker Desktop reste ouvert après l'arrêt. Il peut être fermé manuellement si le projet n'est plus utilisé.

## 6.4 Commandes à retenir

Après la première installation, l'utilisation quotidienne se limite principalement à deux commandes :

| Action | Commande |
|---|---|
| Démarrer le projet | `.\lancer-frugal-ai.ps1` |
| Arrêter le projet | `.\arreter-frugal-ai.ps1` |

Les étapes d'installation n'ont pas besoin d'être répétées, sauf en cas de réinitialisation volontaire ou de modification importante de la configuration.

## En cas de problème

Si l'interface ne répond pas, si un webhook est introuvable ou si un modèle met trop longtemps à répondre, consulter la page de dépannage : [07-depannage.md](07-depannage.md).
