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

**Où sont les jacks :** **jack 1 = celui du haut**, **jack 2 = celui du milieu**, **jack 3 = celui du bas** (à côté du bouton rouge).

**Réglage d'origine :** haut = 1/16 (le tempo pour le séquenceur), milieu = Reset, bas = 1/8.

> Si ta boîte est câblée autrement, l'écran sur le Mac (section 5) sait le découvrir : le bouton « Identifier » fait battre un seul jack, et tu indiques sa place (haut, milieu, bas). La boîte s'en souvient.

---

## 3. Le menu, pas à pas

Le menu sert **uniquement** à choisir le mode de chaque jack. Il ne change ni le tempo ni le MIDI.

### Entrer dans le menu
> Le plus simple pour régler les jacks, c'est l'écran sur le Mac (section 5) : on clique sur le mode voulu. Le menu de la boîte sert quand tu n'as pas d'ordinateur sous la main.

1. La boîte doit être **à l'arrêt** (LED éteinte). Si elle tourne, appuie une fois pour l'arrêter.
2. **Appuie sur le bouton et garde-le enfoncé** environ 1,5 seconde.
3. La LED se met à clignoter : tu es dans le menu. **Tu peux lâcher le bouton.**

> Si tu lâches trop tôt, avant 1,5 s, la boîte croit à un appui court et **démarre**. Pas de souci : appuie pour l'arrêter et recommence en tenant plus longtemps.

### Ce que la LED te dit dans le menu
La LED fait toujours la même chose en deux temps :

1. **D'abord quelques éclairs rapides : c'est le numéro du jack** que tu règles.
   - 1 éclair = jack 1, celui du haut
   - 2 éclairs = jack 2, celui du milieu
   - 3 éclairs = jack 3, celui du bas
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

## 5. L'écran sur le Mac

La boîte n'a pas d'écran, mais le Mac peut en faire un : une page qui affiche tout ce qui se passe dans la boîte, en direct, et qui permet de régler les jacks à la souris.

### L'ouvrir
1. Branche la boîte au Mac avec son câble USB.
2. Ouvre le site **https://dr-john-8bits.github.io/clockbox/** dans **Google Chrome** (ou Microsoft Edge). Safari et Firefox ne savent pas parler au port USB. Sans internet, le fichier `site/index.html` du projet fait la même chose.
3. Clique **« Connecter la boîte »**. Dans la liste qui s'ouvre, choisis **« FT232R USB UART »**, puis **« Connexion »**.
4. La boîte **redémarre une seconde** (elle repasse à l'arrêt) : c'est normal, la puce USB fait ça à chaque connexion. Connecte-toi donc **avant** de jouer, pas en plein morceau.
5. L'écran s'allume et la pastille en haut passe à « Connecté ».

### Ce qu'on y voit
- **Une boîte dessinée** comme la vraie, avec un écran ajouté. Le potard tourne quand tu tournes le vrai, le bouton s'enfonce quand tu appuies, la LED clignote comme la vraie, et chaque jack s'allume quand il envoie une impulsion, avec son mode écrit dessous.
- **L'écran de la boîte dessinée** montre :
  - le **tempo** en BPM, en marche ou à l'arrêt, le temps en cours (4 points) et le numéro de mesure ;
  - quand tu **tiens le bouton**, une barre qui se remplit jusqu'à l'ouverture du menu, au bout d'1,5 s ;
  - dans le **menu**, le jack réglé, les 8 modes avec celui choisi en surbrillance, et un cadre pointillé sur la zone où pointe le potard tant qu'il n'a pas « repris la main » ;
  - « **bouge-moi** » sous le potard quand il attend que tu le bouges un peu.
- **À droite (ou en dessous sur un petit écran)** : la liste des 3 jacks, l'état détaillé et un journal de ce qui s'est passé.

### Régler les jacks à la souris
- Pour chaque jack, **clique sur le mode voulu** (24 ppqn, 1/16, 1/8…). Il est envoyé à la boîte et **enregistré tout de suite**, sans passer par le menu.
- **« Identifier »** (seulement à l'arrêt) : ce jack, et lui seul, bat à chaque temps pendant 15 s, et la LED de la boîte aussi. Branche ton câble sur un module et regarde lequel réagit. Un appui sur le bouton de la boîte, ou « Arrêter », coupe l'identification.
- **« Place »** : si un jack n'est pas là où l'écran le dit, choisis sa vraie place (haut, milieu, bas). La boîte s'en souvient.

### Se déconnecter
Clique « Déconnecter », ou ferme la page. La boîte continue de tourner normalement. **Sans la page, elle n'envoie rien de plus que d'habitude sur ses prises MIDI.**

> **Mode démo** : le bouton « Mode démo » fait tourner une boîte imaginaire, pour découvrir l'écran sans rien brancher. Clique le bouton rouge dessiné pour start/stop.

## 6. Si ça ne marche pas comme prévu

| Problème | Explication |
|---|---|
| J'appuie longtemps et la boîte démarre au lieu d'ouvrir le menu | J'ai lâché avant 1,5 s, ou la boîte tournait déjà. Il faut partir de l'arrêt, LED éteinte |
| Dans le menu, le potard ne change rien | Il faut d'abord le bouger d'un petit cran |
| Après le menu, le potard ne change pas le tempo | Même chose : bouge-le un peu, et il reprend la main |
| Mon séquenceur démarre au pas 2 au lieu du pas 1 | Certains séquenceurs gèrent mal un reset suivi d'une impulsion d'horloge. Essaie le mode **Run** à la place du Reset |
| Je ne sais plus ce que j'ai réglé | Entre dans le menu : la LED montre le mode de chaque jack |
| « Connecter la boîte » ne montre pas « FT232R » | Vérifie le câble USB. Ferme tout autre programme qui utiliserait la boîte (IDE Arduino, autre onglet de l'écran) |
| L'écran affiche « Connecté (horloge seule) » | La boîte a un ancien firmware : le tempo et le start/stop s'affichent quand même, mais pas le potard, le menu ni les réglages |

---

## 7. Avant de flasher ta propre boîte

Sauvegarde d'abord le programme qui est dedans, pour pouvoir le remettre en cas de souci. Avec l'outil `avrdude` fourni avec l'IDE Arduino, carte Nano branchée :

    avrdude -p atmega328p -c arduino -P <port série> -b 115200 -U flash:r:sauvegarde.bin:r

Avec un Nano « old bootloader », remplace `115200` par `57600`. Pour remettre la sauvegarde, utilise la même commande avec `flash:w:sauvegarde.bin:r`.
