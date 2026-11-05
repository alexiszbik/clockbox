# clockbox
Arduino based clock generator for musical electronic instruments with MIDI and analog clock outputs.

Let's watch a nice little video about what it does : https://youtu.be/OYtPbgozCbE

Original project by Alexis Zbik (2020). Version 2 (2026) adds one division per jack, reset/run outputs, a beat LED, a steadier tempo, a settings menu and a **screen on your computer** over USB. No hardware change is needed.

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
| D5, D7, D3 | Clock/gate jacks 1, 2, 3 (top, middle, bottom on the original box) |
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
Defaults: jack 1 (top) = 1/16, jack 2 (middle) = Reset, jack 3 (bottom) = 1/8.

### Settings menu

1. Stop the box, then hold the button 1.5 s.
2. The LED blinks quickly 1, 2 or 3 times: the jack being edited. Then it blinks like that jack, and the jack outputs its mode too (other jacks are silent).
3. Turn the pot to pick the mode: the pot is split into 8 zones, from 24 ppqn (fully left) to Run (fully right). Move it a little first to take over.
4. Short press: next jack. Hold 1.5 s: save (EEPROM) and quit.

After the menu, the tempo stays where it was until you move the pot.

### Screen on your computer

Open `screen/clockbox-screen.html` in Chrome or Edge (Web Serial), click **Connect the box** and pick the USB serial port. The page draws the box with a screen: tempo, transport, beat and bar, the pot, the button (with the long-press countdown), the menu, and the jack outputs, all live. Jack modes can be set with the mouse, and **Identify** makes a single jack pulse so you can find which hole is which, then save its place.

- The box restarts once when the page connects (USB-serial DTR reset): connect before playing.
- The box sends nothing extra until the page says hello. While connected, status messages are SysEx (manufacturer ID `0x7D`), also present on the MIDI outputs. The protocol is described at the top of `clockbox.ino`.
- **Demo mode** shows the page without a box.

## En français

Boîtier d'horloge pour instruments électroniques : sortie MIDI clock, 3 jacks clock/gate et une LED.

👉 **Mode d'emploi détaillé, menu expliqué pas à pas : [MODE_D_EMPLOI.md](MODE_D_EMPLOI.md)**

- **Potard** : tempo de 30 à 240 BPM.
- **Bouton** : en marche, un appui arrête tout de suite. À l'arrêt, un appui court lance (au relâchement) ; tenir 1,5 s ouvre le menu.
- **LED** : en marche, flash long sur le 1er temps et court sur les autres. À l'arrêt, éteinte.
- **Menu** : la LED fait 1, 2 ou 3 éclairs rapides (numéro du jack), puis clignote au rythme du mode choisi. Le potard choisit le mode, de gauche à droite : 24 ppqn, 1/16, 1/8, 1/4, 1/2, mesure, reset, run. Appui court = jack suivant, tenir 1,5 s = enregistrer et quitter.
- Jack 1 = haut, jack 2 = milieu, jack 3 = bas. Réglages par défaut : haut = 1/16, milieu = reset, bas = 1/8.
- **Écran sur le Mac** : ouvre `screen/clockbox-screen.html` dans Chrome, clique « Connecter la boîte ». Tout s'affiche en direct, et les jacks se règlent à la souris.
- À compiler avec la bibliothèque uClock **2.3.x**.
