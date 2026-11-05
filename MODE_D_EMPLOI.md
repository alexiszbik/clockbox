# Clockbox v2 : mode d'emploi

La boîte a un **potard**, un **bouton**, une **LED**, **2 prises MIDI** et **3 jacks** de sortie.

---

## 1. Utilisation de tous les jours

| Je veux… | Je fais… | La boîte répond… |
|---|---|---|
| Changer le tempo | Je tourne le potard | 30 BPM tout à gauche, 240 BPM tout à droite |
| Lancer | **Appui court** quand la boîte est à l'arrêt | Le départ se fait **au relâchement** du bouton. La LED se met à flasher |
| Arrêter | **Appui** pendant que ça tourne | Arrêt immédiat, dès l'appui. La LED s'éteint |

**Lire la LED :**
- **éteinte** : la boîte est à l'arrêt ;
- **un flash long, puis trois courts, et ainsi de suite** : ça tourne. Le flash long tombe sur le 1er temps de chaque mesure.

**Côté MIDI :** l'horloge MIDI sort en permanence, même à l'arrêt, pour que tes machines connaissent déjà le tempo. Le bouton envoie Start et Stop.

---

## 2. Les 3 jacks : à quoi ils servent

Chaque jack a son propre **mode**, que tu choisis dans le menu. Les 8 modes possibles :

| N° | Mode | Ce qui sort du jack | Pour quoi faire |
|---|---|---|---|
| 1 | **24 ppqn** | 24 impulsions par noire | Synchro DIN des vieilles boîtes à rythme Roland, Korg… |
| 2 | **1/16** | 4 impulsions par noire (doubles croches) | L'entrée « clock » de la plupart des séquenceurs modulaires |
| 3 | **1/8** | 2 impulsions par noire (croches) | Synchro des Korg Volca et des Pocket Operator. C'est ce que faisait l'ancien firmware |
| 4 | **1/4** | 1 impulsion par noire | Un battement par temps |
| 5 | **1/2** | 1 impulsion toutes les 2 noires | |
| 6 | **Mesure** | 1 impulsion par mesure (4 temps) | Déclencher quelque chose à chaque mesure |
| 7 | **Reset** | 1 seule impulsion courte, au moment du Start | L'entrée « reset » d'un séquenceur, pour qu'il reparte du pas 1 en même temps que tes machines MIDI |
| 8 | **Run** | Tension haute tant que ça tourne, 0 V à l'arrêt | L'entrée « run » ou « start/stop » de certains séquenceurs |

**Réglage d'origine :** jack 1 = 1/16, jack 2 = 1/8, jack 3 = Reset.

> **Quel jack est le 1, le 2, le 3 ?** On ne le sait pas encore : ça dépend de comment ton ami a câblé la boîte. Pour le trouver, entre dans le menu (voir plus bas). Dans le menu, **seul le jack en cours de réglage envoie un signal**. Branche un câble sur chaque prise vers ton modulaire, et regarde laquelle réagit pendant que tu règles le jack 1, puis le 2, puis le 3. Note-le sur la boîte une fois pour toutes.

---

## 3. Le menu, pas à pas

Le menu sert **uniquement** à choisir le mode de chaque jack. Il ne change ni le tempo ni le MIDI.

### Entrer dans le menu
1. La boîte doit être **à l'arrêt** (LED éteinte). Si elle tourne, appuie une fois pour l'arrêter.
2. **Appuie sur le bouton et garde-le enfoncé** environ 1,5 seconde.
3. La LED se met à clignoter : tu es dans le menu. **Tu peux lâcher le bouton.**

> Si tu lâches trop tôt, avant 1,5 s, la boîte croit à un appui court et **démarre**. Pas de souci : appuie pour l'arrêter et recommence en tenant plus longtemps.

### Ce que la LED te dit dans le menu
La LED fait toujours la même chose en deux temps :

1. **D'abord quelques éclairs rapides : c'est le numéro du jack** que tu règles.
   - 1 éclair = jack 1
   - 2 éclairs = jack 2
   - 3 éclairs = jack 3
2. **Ensuite, elle clignote exactement comme le jack**, c'est-à-dire au rythme du mode choisi. Tu vois donc le mode sans rien brancher :

| Mode | Ce que fait la LED |
|---|---|
| 24 ppqn | Scintille très vite, on dirait presque qu'elle est allumée en continu |
| 1/16 | Clignote vite, 4 fois par temps |
| 1/8 | 2 fois par temps |
| 1/4 | 1 fois par temps |
| 1/2 | 1 fois tous les 2 temps |
| Mesure | 1 fois par mesure (lent) |
| Reset | Un tout petit flash bref, une fois par mesure |
| Run | Allumée en continu |

Le rythme dépend du tempo que tu avais réglé avant d'entrer dans le menu. Par exemple, à 60 BPM, 1/4 donne un flash par seconde.

### Changer le mode du jack
- **Tourne le potard.** Sa course est découpée en **8 zones**, dans l'ordre du tableau : tout à gauche = 24 ppqn, puis 1/16, 1/8, 1/4, 1/2, Mesure, Reset, et tout à droite = Run.
- Repère-toi à la LED : tourne doucement jusqu'à ce qu'elle clignote comme tu veux.
- **Pourquoi rien ne bouge au début ?** En entrant dans le menu, le potard est là où tu l'avais laissé pour le tempo. Pour ne pas changer le réglage par accident, la boîte attend que **tu tournes un peu le potard** avant de le prendre en compte. Bouge-le d'un petit cran, et ensuite il répond normalement.

### Passer au jack suivant
- **Appui court** : on passe au jack suivant. La LED refait ses éclairs rapides pour annoncer le numéro (2 éclairs = jack 2), puis montre le mode de ce jack.
- Après le jack 3, on revient au jack 1.
- Là encore, tourne un peu le potard avant qu'il agisse.

### Enregistrer et sortir
- **Garde le bouton enfoncé environ 1,5 s.** La boîte enregistre les 3 réglages et sort du menu : la LED s'éteint, la boîte est à l'arrêt.
- Les réglages sont **gardés même quand on débranche la boîte**.
- **Le tempo n'a pas bougé** pendant le menu. Après la sortie, il reste celui d'avant tant que tu n'as pas tourné le potard. Dès que tu le bouges un peu, il redevient le bouton de tempo.

> Si tu débranches la boîte **pendant** le menu, sans avoir tenu le bouton pour sortir, les changements ne sont pas enregistrés. Au rebranchement, tu retrouves les réglages d'avant.

---

## 4. Exemple complet

*« Je veux : jack 1 en doubles croches vers mon séquenceur, jack 2 qui envoie un reset à ce séquenceur, et jack 3 en noires. »*

1. Boîte à l'arrêt, LED éteinte.
2. Je tiens le bouton 1,5 s et je lâche. **1 éclair** : je règle le jack 1.
3. Je bouge un peu le potard, puis je le mets vers la gauche, dans la 2e zone : la LED clignote vite, 4 fois par temps. C'est **1/16**.
4. Appui court. **2 éclairs** : jack 2.
5. Je bouge un peu le potard, puis je le mets vers la droite, dans l'avant-dernière zone : petit flash bref une fois par mesure. C'est **Reset**.
6. Appui court. **3 éclairs** : jack 3.
7. Je bouge un peu le potard, puis je le mets juste avant le milieu, dans la 4e zone : un flash par temps. C'est **1/4**.
8. Je tiens le bouton 1,5 s : enregistré, LED éteinte.
9. Je règle mon tempo au potard, puis appui court : tout démarre ensemble. Le séquenceur reçoit d'abord le reset, puis les doubles croches.

---

## 5. Si ça ne marche pas comme prévu

| Problème | Explication |
|---|---|
| J'appuie longtemps et la boîte démarre au lieu d'ouvrir le menu | J'ai lâché avant 1,5 s, ou la boîte tournait déjà. Il faut partir de l'arrêt, LED éteinte |
| Dans le menu, le potard ne change rien | Il faut d'abord le bouger d'un petit cran |
| Après le menu, le potard ne change pas le tempo | Même chose : bouge-le un peu, et il reprend la main |
| Mon séquenceur démarre au pas 2 au lieu du pas 1 | Certains séquenceurs gèrent mal un reset suivi d'une impulsion d'horloge. Essaie le mode **Run** à la place du Reset |
| Je ne sais plus ce que j'ai réglé | Entre dans le menu : la LED montre le mode de chaque jack |

---

## 6. Avant de flasher ta propre boîte

Sauvegarde d'abord le programme qui est dedans, pour pouvoir le remettre en cas de souci. Avec l'outil `avrdude` fourni avec l'IDE Arduino, carte Nano branchée :

    avrdude -p atmega328p -c arduino -P <port série> -b 115200 -U flash:r:sauvegarde.bin:r

Avec un Nano « old bootloader », remplace `115200` par `57600`. Pour remettre la sauvegarde, utilise la même commande avec `flash:w:sauvegarde.bin:r`.
