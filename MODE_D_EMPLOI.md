# Clockbox v2 : mode d'emploi

La boîte a un **potard**, un **bouton**, une **LED**, **2 prises MIDI** et **3 jacks** de sortie.
Tout se règle aussi depuis **l'écran dans le navigateur** : https://dr-john-8bits.github.io/clockbox/ (section 5).

---

## 1. Utilisation de tous les jours

| Je veux… | Je fais… | La boîte répond… |
|---|---|---|
| Changer le tempo | Je tourne le potard | 30 BPM tout à gauche, 240 BPM tout à droite |
| Lancer | **Appui court** quand la boîte est à l'arrêt | Le départ se fait **au relâchement** du bouton. La LED se met à flasher |
| Arrêter | **Appui** pendant que ça tourne | Arrêt immédiat, dès l'appui. La LED s'éteint |

**Lire la LED :**
- **éteinte** : la boîte est à l'arrêt ;
- **un flash long, puis des flashs courts** : ça tourne. Le flash long tombe sur le 1er temps de chaque mesure, les courts sur les autres temps ;
- **un petit clignotement lent** (tous les 2 temps) : la boîte est **en pause** (voir plus bas).

**Côté MIDI :** l'horloge MIDI sort en permanence, même à l'arrêt, pour que tes machines connaissent déjà le tempo (c'est réglable). Juste avant chaque Start, la boîte envoie aussi la **position de départ** (« Song Position »), pour que les séquenceurs et les logiciels repartent bien du début.

### Pause et reprise (option)
Si tu coches « Le bouton met en pause » sur l'écran (section 5) :

| Je veux… | Je fais… |
|---|---|
| Mettre en pause | **Appui** pendant que ça tourne : tout s'arrête, mais la boîte retient où on en était |
| Reprendre là où on s'était arrêté | **Appui court** pendant la pause : la boîte envoie « Reprendre » (Continue) à tes machines MIDI |
| Revenir au début | **Tenir 1,5 s** pendant la pause : la boîte repasse à l'arrêt, prête à repartir du début |

Sans cette option, le bouton fait simplement Start et Stop, comme avant.

---

## 2. Les 3 jacks : à quoi ils servent

**Où sont les jacks :** **jack 1 = celui du haut**, **jack 2 = celui du milieu**, **jack 3 = celui du bas** (à côté du bouton rouge).

**Réglage d'origine :** haut = 1/16 (le tempo pour le séquenceur), milieu = Reset, bas = 1/8.

Chaque jack a son propre **mode**. Voici tous les modes, dans l'ordre où ils défilent sous le potard dans le menu (de gauche à droite) :

| Mode | Ce qui sort du jack | Pour quoi faire |
|---|---|---|
| **24 ppqn** | 24 impulsions par noire | Synchro DIN des vieilles boîtes à rythme Roland, Korg… |
| **1/16** | 4 impulsions par noire (doubles croches) | L'entrée « clock » de la plupart des séquenceurs modulaires |
| **1/16 triolet** | 6 impulsions par noire | Rythmes ternaires rapides |
| **1/8** | 2 impulsions par noire (croches) | Synchro des Korg Volca et des Pocket Operator |
| **1/8 triolet** | 3 impulsions par noire | Shuffle, rythmes ternaires |
| **1/8 pointée** | 1 impulsion toutes les 3 doubles croches | Contretemps, délais rythmiques |
| **1/4** | 1 impulsion par noire | Un battement par temps |
| **1/2** | 1 impulsion toutes les 2 noires | |
| **Mesure** | 1 impulsion par mesure | Déclencher quelque chose à chaque mesure (la mesure se choisit : 4/4, 3/4…) |
| **Reset** | 1 seule impulsion courte, au moment du Start | L'entrée « reset » d'un séquenceur, pour qu'il reparte du pas 1 en même temps que tes machines MIDI |
| **Run** | Tension haute tant que ça tourne, 0 V à l'arrêt ou en pause | L'entrée « run » ou « start/stop » de certains séquenceurs |
| **Euclide A, B, C** | Le rythme euclidien A, B ou C (section 4) | Déclencher une enveloppe, un module de percussion… |

### La probabilité
Chaque jack a aussi une **probabilité**, de 0 à 100 %, réglable sur l'écran (section 5), sous les modes du jack :
- **100 %** (réglage d'origine) : toutes les impulsions partent, comme d'habitude ;
- **en dessous** : chaque impulsion a cette chance de partir. À 50 %, environ une sur deux saute, **au hasard**. Le rythme respire et change un peu à chaque mesure : pratique pour donner de la vie à un charleston ou à une séquence ;
- **Reset** et **Run** ne sont jamais aléatoires, quelle que soit la probabilité.

> Si ta boîte est câblée autrement, l'écran (section 5) sait le découvrir : le bouton « Identifier » fait battre un seul jack, et tu indiques sa place (haut, milieu, bas). La boîte s'en souvient.

---

## 3. Le menu de la boîte, pas à pas

> Le plus simple, c'est l'écran (section 5) : on clique sur ce qu'on veut. Le menu de la boîte sert quand tu n'as pas d'ordinateur sous la main, par exemple en concert.

Le menu a **4 pages** : **jack 1**, **jack 2**, **jack 3**, puis **préréglage**.

### Entrer dans le menu
1. La boîte doit être **à l'arrêt** (LED éteinte). Si elle tourne, appuie une fois pour l'arrêter.
2. **Appuie sur le bouton et garde-le enfoncé** environ 1,5 seconde.
3. La LED se met à clignoter : tu es dans le menu. **Tu peux lâcher le bouton.**

> Si tu lâches trop tôt, avant 1,5 s, la boîte croit à un appui court et **démarre**. Pas de souci : appuie pour l'arrêter et recommence en tenant plus longtemps.

### Ce que la LED te dit dans le menu
1. **D'abord quelques éclairs rapides : c'est le numéro de la page.**
   - 1 éclair = jack 1, celui du haut
   - 2 éclairs = jack 2, celui du milieu
   - 3 éclairs = jack 3, celui du bas
   - 4 éclairs = page des préréglages
2. **Sur les pages des jacks, la LED clignote ensuite exactement comme le jack**, au rythme du mode choisi. Tu vois donc le mode sans rien brancher. Par exemple : 1/16 clignote vite (4 fois par temps), 1/4 une fois par temps, Mesure lentement, Reset fait un tout petit flash par mesure, Run reste allumée, et un rythme euclidien clignote… selon son rythme.
3. **Sur la page des préréglages**, la LED fait autant de clignotements lents que le numéro du préréglage choisi (1 à 4), en boucle.

Le jack que tu règles est **le seul qui envoie un signal** pendant le menu : branché sur un module, tu entends ou vois tout de suite le résultat.

### Changer le réglage
- **Tourne le potard.** Sur une page de jack, sa course est découpée en zones, une par mode, dans l'ordre du tableau de la section 2 : tout à gauche = 24 ppqn, tout à droite = Euclide C. Sur la page des préréglages, il y a 4 zones : 1, 2, 3, 4.
- **Pourquoi rien ne bouge au début ?** En entrant dans le menu, le potard est là où tu l'avais laissé pour le tempo. Pour ne pas changer le réglage par accident, la boîte attend que **tu tournes un peu le potard** avant de le prendre en compte. Bouge-le d'un petit cran, et ensuite il répond normalement.

### Passer à la page suivante
- **Appui court** : page suivante (jack 1 → jack 2 → jack 3 → préréglage → jack 1…). La LED refait ses éclairs rapides pour annoncer le numéro.
- Là encore, tourne un peu le potard avant qu'il agisse.

### Enregistrer et sortir
- **Garde le bouton enfoncé environ 1,5 s.** La boîte enregistre et sort du menu : la LED s'éteint, la boîte est à l'arrêt.
- **Si tu as choisi un préréglage** sur la 4e page (en tournant le potard), c'est **ce préréglage qui est chargé** en sortant. Sinon, ce sont tes changements de jacks qui sont enregistrés.
- Les réglages sont **gardés même quand on débranche la boîte**.
- **Le tempo n'a pas bougé** pendant le menu. Après la sortie, il reste celui d'avant tant que tu n'as pas tourné le potard.

> Si tu débranches la boîte **pendant** le menu, sans avoir tenu le bouton pour sortir, les changements ne sont pas enregistrés.

### Exemple
*« Je veux : jack 1 en doubles croches vers mon séquenceur, jack 2 qui envoie un reset à ce séquenceur, et jack 3 en noires. »*

1. Boîte à l'arrêt, LED éteinte. Je tiens le bouton 1,5 s et je lâche. **1 éclair** : jack 1.
2. Je bouge un peu le potard, puis je le mets presque tout à gauche, dans la 2e zone : la LED clignote vite. C'est **1/16**.
3. Appui court. **2 éclairs** : jack 2. Je tourne vers la droite jusqu'à un tout petit flash par mesure : c'est **Reset**.
4. Appui court. **3 éclairs** : jack 3. Je tourne vers le milieu jusqu'à un flash par temps : c'est **1/4**.
5. Je tiens le bouton 1,5 s : enregistré, LED éteinte.
6. Appui court : tout démarre ensemble. Le séquenceur reçoit d'abord le reset, puis les doubles croches.

---

## 4. Les rythmes euclidiens

Un rythme euclidien répartit un nombre de **coups** le plus régulièrement possible sur un nombre de **pas**. C'est une façon très simple de fabriquer des rythmes qui sonnent tout de suite « juste » :

| Coups / pas | Ce que ça donne |
|---|---|
| 3 / 8 | le tresillo (rythme de base de la musique cubaine) |
| 5 / 8 | le cinquillo |
| 4 / 16 | un coup sur chaque temps (« four on the floor ») |
| 5 / 16 | une bossa nova |
| 7 / 16 | une samba |

La boîte a **3 rythmes : A, B et C**. Chacun se règle **sur l'écran** (section 5), carte « Rythmes euclidiens » :
- **Pas** : la longueur du rythme (1 à 32) ;
- **Coups** : combien de coups dedans ;
- **Rotation** : décale le rythme, pour commencer ailleurs que sur le premier coup ;
- **Probabilité** : la chance (0 à 100 %) que chaque coup soit vraiment joué. À 100 %, le rythme est toujours le même ; en dessous, des coups sautent au hasard, sur le jack comme en MIDI. Sur le cercle, les coups pâlissent quand la probabilité baisse ;
- **Durée d'un pas** : 1/16 (le plus courant), 1/8, 1/16 triolet ou 1/4.

Le cercle dessine le rythme : les points rouges sont les coups, et le point entouré avance en direct pendant que la boîte tourne.

**Deux façons de s'en servir, en même temps si tu veux :**
1. **Sur un jack** : donne au jack le mode « Euclide A » (ou B, C). Il envoie une impulsion à chaque coup. Branche-le sur le déclencheur d'une enveloppe ou d'un module de percussion.
2. **En notes MIDI** : coche « Jouer une note MIDI » et choisis le **canal**, la **note** et la **vélocité**. La boîte joue cette note à chaque coup, sur ses 2 prises MIDI. Sur le canal 10 (la batterie dans la norme General MIDI), l'écran indique le son : 36 = grosse caisse, 38 = caisse claire, 42 = charleston…

Par exemple, avec A = 5/16 sur la grosse caisse, B = 3/8 sur la caisse claire et C = 7/16 sur le charleston, tous en MIDI sur le canal 10, ta boîte à rythme joue toute seule, au tempo de la clockbox.

> Les rythmes se règlent seulement sur l'écran. Une fois réglés, ils restent dans la boîte, et le menu de la boîte peut les mettre sur un jack ou rappeler un préréglage.

---

## 5. L'écran dans le navigateur

La boîte n'a pas d'écran, mais l'ordinateur peut en faire un : une page qui affiche tout ce qui se passe dans la boîte, en direct, et qui permet **tous les réglages** à la souris.

### L'ouvrir
1. Branche la boîte à l'ordinateur avec son câble USB.
2. Ouvre le site **https://dr-john-8bits.github.io/clockbox/** dans **Google Chrome** (ou Microsoft Edge). Safari et Firefox ne savent pas parler au port USB. Sans internet, le fichier `site/index.html` du projet fait la même chose.
3. Clique **« Connecter la boîte »**. Dans la liste qui s'ouvre, choisis **« FT232R USB UART »**, puis **« Connexion »**.
4. La boîte **redémarre une seconde** (elle repasse à l'arrêt) : c'est normal, la puce USB fait ça à chaque connexion. Connecte-toi donc **avant** de jouer, pas en plein morceau.
5. L'écran s'allume et la pastille en haut passe à « Connecté ».

### Ce qu'on y voit
- **Une boîte dessinée** comme la vraie, avec un écran ajouté. Le potard tourne quand tu tournes le vrai, le bouton s'enfonce quand tu appuies, la LED clignote comme la vraie, et chaque jack s'allume quand il envoie une impulsion, avec son mode écrit dessous. Les prises MIDI s'allument quand la boîte envoie de l'horloge ou des notes.
- **L'écran de la boîte dessinée** montre : le tempo, en marche, en pause ou à l'arrêt, la mesure (4/4…), les temps et le numéro de mesure. Quand tu tiens le bouton, une barre se remplit jusqu'à l'action. Dans le menu, la page en cours et le mode choisi, avec ses voisins.

### Les réglages
- **Transport et tempo** : Start, Pause / Reprendre, Stop, Début. Un **tempo précis** au dixième (par exemple 92,5) et un bouton **Tap** pour taper le tempo. Le potard reprend la main dès que tu le bouges.
- **Les 3 jacks** : clique sur le mode voulu, il est envoyé et **enregistré tout de suite**. Le curseur **Probabilité** règle la chance que chaque impulsion parte. « Identifier » fait battre ce jack seul pendant 15 s ; « Place » indique où il est sur la boîte.
- **Rythmes euclidiens** : voir section 4.
- **MIDI et mesure** :
  - la **mesure** : 4/4, 3/4, 2/4, 5/4, 6/8 ou 7/8 (pour le mode Mesure, le Reset, la LED et le métronome) ;
  - **envoyer la position de départ** : conseillé, laisse coché ;
  - **envoyer l'horloge même à l'arrêt** : décoche si une vieille machine se met à jouer toute seule dès qu'elle reçoit l'horloge ;
  - **le bouton met en pause** : voir section 1 ;
  - le **métronome MIDI** : une note sur le 1er temps seulement, ou sur chaque temps (le 1er plus fort), avec canal et notes au choix.
- **Préréglages** : 4 emplacements. « Enregistrer ici » garde **tout** (modes des jacks, probabilités, rythmes, MIDI, mesure). « Charger » le rappelle, « Effacer » le vide. Un préréglage se rappelle aussi depuis le menu de la boîte (4e page), sans ordinateur.
- **Mise à jour du firmware** : voir section 6.

Tous les réglages sont **enregistrés dans la boîte dès que tu les changes**. Tu peux débrancher l'ordinateur et partir en concert : la boîte, alimentée par un chargeur USB, démarre avec tes réglages.

### Se déconnecter
Clique « Déconnecter », ou ferme la page. **Sans la page, la boîte n'envoie rien de plus que d'habitude sur ses prises MIDI.**

> **Mode démo** : sans boîte branchée, la page fait tourner une boîte imaginaire, pour tout découvrir. Clique le bouton rouge dessiné pour start/stop.

---

## 6. Mettre à jour le firmware

Le firmware, c'est le programme qui tourne dans la boîte. Quand une nouvelle version sort, tu peux l'installer **depuis le site, sans aucun logiciel** :

1. Ouvre le site dans Chrome et connecte la boîte (section 5).
2. Descends à la carte **« Mise à jour du firmware »**. Elle indique la version de ta boîte et celle du site.
3. Clique **« Mettre à jour la boîte »** et confirme.
4. Attends environ 15 secondes, **sans débrancher le câble**. La barre avance (écriture, puis vérification).
5. La boîte redémarre et la page se reconnecte toute seule.

Si quelque chose se passe mal (câble débranché, par exemple), **la boîte n'est pas abîmée** : la partie qui permet de la mettre à jour ne s'efface jamais. Recommence simplement.

Tes réglages et tes préréglages sont normalement conservés d'une version à l'autre (la 2.3 reprend ceux de la 2.2). Si un jour une version ne peut pas les reprendre, la boîte repart sur ses réglages d'origine : il suffit alors de les refaire sur l'écran.

---

## 7. Si ça ne marche pas comme prévu

| Problème | Explication |
|---|---|
| J'appuie longtemps et la boîte démarre au lieu d'ouvrir le menu | J'ai lâché avant 1,5 s, ou la boîte tournait déjà. Il faut partir de l'arrêt, LED éteinte |
| Dans le menu, le potard ne change rien | Il faut d'abord le bouger d'un petit cran |
| Après le menu, le potard ne change pas le tempo | Même chose : bouge-le un peu, et il reprend la main |
| Mon séquenceur démarre au pas 2 au lieu du pas 1 | Certains séquenceurs gèrent mal un reset suivi d'une impulsion d'horloge. Essaie le mode **Run** à la place du Reset |
| Une machine MIDI joue toute seule alors que la boîte est à l'arrêt | Décoche « Envoyer l'horloge MIDI même à l'arrêt » |
| Ma boîte à rythme ne repart pas du début | Laisse cochée « Envoyer la position de départ » |
| Je ne sais plus ce que j'ai réglé | Connecte l'écran, ou entre dans le menu : la LED montre le mode de chaque jack |
| « Connecter la boîte » ne montre pas « FT232R » | Vérifie le câble USB. Ferme tout autre programme qui utiliserait la boîte (IDE Arduino, autre onglet de l'écran) |
| L'écran dit que ma boîte a un ancien firmware | Mets-la à jour depuis la carte « Mise à jour du firmware » (section 6) |

---

## 8. Avant de flasher ta propre boîte

Sauvegarde d'abord le programme qui est dedans, pour pouvoir le remettre en cas de souci. Avec l'outil `avrdude` fourni avec l'IDE Arduino, carte Nano branchée :

    avrdude -p atmega328p -c arduino -P <port série> -b 115200 -U flash:r:sauvegarde.bin:r

Avec un Nano « old bootloader », remplace `115200` par `57600`. Pour remettre la sauvegarde, utilise la même commande avec `flash:w:sauvegarde.bin:r`.
