# clockbox
Arduino based clock generator for musical electronic instruments with MIDI and analog clock outputs.

Let's watch a nice little video about what it does : https://youtu.be/OYtPbgozCbE

Original project by Alexis Zbik (2020). Version 2 (2026) adds one division per jack, reset/run outputs, a beat LED, a steadier tempo and a settings menu. No hardware change is needed.

## Build

- Board: Arduino Nano or Uno (ATmega328P).
- Library: [uClock](https://github.com/midilab/uClock) by midilab, **version 2.3.x** (Arduino Library Manager → "uClock"). Version 1.x will not build.
- `EEPROM` comes with the Arduino AVR core.

## Hardware

| Pin | Use |
|---|---|
| A0 | Tempo pot |
| D2 | Push button, active HIGH (external pull-down) |
| D9 | LED |
| D3, D5, D7 | Clock/gate jacks 1, 2, 3 |
| TX (D1) | MIDI out (31250 baud) |

Pins can be changed at the top of `clockbox.ino`.

## Use

- **Pot**: tempo, 30 to 240 BPM, in 1 BPM steps (filtered, so it does not wobble).
- **Button while running**: stop, immediately.
- **Button while stopped**: short press = start (on release). Hold 1.5 s = settings menu.
- **LED**: running = long flash on beat 1, short flash on beats 2-4. Stopped = off.
- **MIDI**: clock (24 PPQN) is sent all the time so devices follow the tempo; Start and Stop follow the button.

### Jack modes

| # | Mode | Signal |
|---|---|---|
| 1 | 24 ppqn | 24 pulses per quarter note (DIN sync, some drum machines) |
| 2 | 1/16 | 4 pulses per quarter (most modular sequencers) |
| 3 | 1/8 | 2 pulses per quarter (Volca, Pocket Operator) |
| 4 | 1/4 | 1 pulse per quarter |
| 5 | 1/2 | 1 pulse every 2 quarters |
| 6 | Bar | 1 pulse per 4/4 bar |
| 7 | Reset | 10 ms trigger on start, just before the first clock |
| 8 | Run | High while running |

Clock modes have a 50 % duty cycle. On start, all clocks go high together with the MIDI Start.
Defaults: jack 1 = 1/16, jack 2 = 1/8, jack 3 = Reset.

### Settings menu

1. Stop the box, then hold the button 1.5 s.
2. The LED blinks quickly 1, 2 or 3 times: the jack being edited. Then it blinks like that jack, and the jack outputs its mode too (other jacks are silent).
3. Turn the pot to pick the mode: the pot is split into 8 zones, from 24 ppqn (fully left) to Run (fully right). Move it a little first to take over.
4. Short press: next jack. Hold 1.5 s: save (EEPROM) and quit.

After the menu, the tempo stays where it was until you move the pot.

## En français

Boîtier d'horloge pour instruments électroniques : sortie MIDI clock, 3 jacks clock/gate et une LED.

- **Potard** : tempo de 30 à 240 BPM.
- **Bouton** : en marche, un appui arrête tout de suite. À l'arrêt, un appui court lance (au relâchement) ; tenir 1,5 s ouvre le menu.
- **LED** : en marche, flash long sur le 1er temps et court sur les autres. À l'arrêt, éteinte.
- **Menu** : la LED fait 1, 2 ou 3 éclairs rapides (numéro du jack), puis clignote au rythme du mode choisi. Le potard choisit le mode, de gauche à droite : 24 ppqn, 1/16, 1/8, 1/4, 1/2, mesure, reset, run. Appui court = jack suivant, tenir 1,5 s = enregistrer et quitter.
- Réglages par défaut : jack 1 = 1/16, jack 2 = 1/8, jack 3 = reset.
- À compiler avec la bibliothèque uClock **2.3.x**.
