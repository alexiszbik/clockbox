# clockbox
Arduino based clock generator for musical electronic instruments with MIDI and analog clock outputs.

**Website and live screen: https://dr-john-8bits.github.io/clockbox/**

Let's watch a nice little video about what it does : https://youtu.be/OYtPbgozCbE

Original project by Alexis Zbik (2020). Version 2 (2026) adds, with no hardware change:
- one mode per jack: clocks, triplets, dotted 8th, reset, run, and **Euclidean rhythms**, with a **probability** per jack;
- Euclidean rhythms and a **metronome as MIDI notes**, to drive a drum machine;
- **time signatures**, **Song Position**, **pause/continue**, optional MIDI clock while stopped;
- **4 presets**, a beat LED, a steadier tempo, a settings menu on the box;
- a **screen in the browser** over USB (Chrome/Edge), with every setting, tap tempo and **one-click firmware updates**.

## Build

- Board: Arduino Nano or Uno (ATmega328P).
- Library: [uClock](https://github.com/midilab/uClock) by midilab, **version 2.3.x** (Arduino Library Manager → "uClock"). Version 1.x will not build.
- `EEPROM` comes with the Arduino AVR core.
- Or flash the `.hex` built by CI from the website, or update from the website directly.

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
- **Button while running**: stop, immediately (or pause, if "button pauses" is on).
- **Button while paused**: short press = continue, hold 1.5 s = back to the start.
- **Button while stopped**: short press = start (on release). Hold 1.5 s = settings menu.
- **LED**: running = long flash on beat 1, short flash on the other beats. Paused = short blink every 2 beats. Stopped = off.
- **MIDI**: clock (24 PPQN), Start / Stop / Continue, Song Position before Start and Continue, Euclidean notes and metronome.

### Jack modes

In pot order in the menu:

| Mode | Signal |
|---|---|
| 24 ppqn | 24 pulses per quarter note (DIN sync, some drum machines) |
| 1/16 | 4 pulses per quarter (most modular sequencers) |
| 1/16 triplet | 6 pulses per quarter |
| 1/8 | 2 pulses per quarter (Volca, Pocket Operator) |
| 1/8 triplet | 3 pulses per quarter |
| Dotted 1/8 | 1 pulse every 3 sixteenths |
| 1/4 | 1 pulse per quarter |
| 1/2 | 1 pulse every 2 quarters |
| Bar | 1 pulse per bar (chosen time signature) |
| Reset | 10 ms trigger on start, just before the first clock |
| Run | High while running |
| Euclid A, B, C | Euclidean rhythm A, B or C |

Clock modes have a 50 % duty cycle. On start, all clocks go high together with the MIDI Start.
Each jack has a probability (0-100 %, default 100) that each pulse is sent; Reset and Run are never random.
Defaults: jack 1 (top) = 1/16, jack 2 (middle) = Reset, jack 3 (bottom) = 1/8.

### Euclidean rhythms

Three rhythms (A, B, C), each with steps (1-32), hits, rotation, step length (1/16, 1/8, 1/16 triplet, 1/4) and a probability (0-100 %) for each hit to play. Each one can drive a jack (mode Euclid A/B/C) and/or play a MIDI note (channel, note, velocity). They are set from the screen and saved in the box.

### Settings menu

1. Stop the box, then hold the button 1.5 s.
2. Pages: jack 1, jack 2, jack 3, preset. The LED first blinks the page number, then shows the selected mode (on a jack page, the jack outputs it too; other jacks are silent).
3. Turn the pot to choose (move it a little first to take over).
4. Short press: next page. Hold 1.5 s: save (EEPROM) and quit. If a preset was chosen on page 4, it is loaded.

### Screen in the browser

Open **https://dr-john-8bits.github.io/clockbox/** in Chrome or Edge (Web Serial; `site/index.html` also works offline), click **Connect the box** and pick the USB serial port. The page draws the box with a screen and shows everything live. Every setting is there (jack modes, Euclidean rhythms with a live ring, MIDI options, metronome, time signature, presets), with transport buttons, an exact tempo, tap tempo, **Identify** to find which jack is which, and a **firmware update** button (STK500 over Web Serial, verified after writing).

- The box restarts once when the page connects (USB-serial DTR reset): connect before playing.
- The box sends nothing extra until the page says hello. While connected, status messages are SysEx (manufacturer ID `0x7D`), also present on the MIDI outputs. The protocol is described at the top of `clockbox.ino`.
- **Demo mode** shows the page without a box.

### CI

`.github/workflows/pages.yml` builds the firmware with arduino-cli and uClock 2.3.0 on every push and pull request, and publishes `site/` with the compiled `.hex` on GitHub Pages from `master`.

## En français

Boîtier d'horloge pour instruments électroniques : sortie MIDI, 3 jacks clock/gate et une LED.

👉 **Mode d'emploi détaillé, tout expliqué pas à pas : [MODE_D_EMPLOI.md](MODE_D_EMPLOI.md)**

- **Potard** : tempo de 30 à 240 BPM.
- **Bouton** : en marche, un appui arrête (ou met en pause, en option). À l'arrêt, un appui court lance (au relâchement) ; tenir 1,5 s ouvre le menu.
- **Jacks** : horloges, triolets, croche pointée, reset, run ou rythmes euclidiens, avec une probabilité par jack. Jack 1 = haut, jack 2 = milieu, jack 3 = bas. Par défaut : haut = 1/16, milieu = reset, bas = 1/8.
- **MIDI** : horloge, position de départ, pause et reprise, rythmes euclidiens (avec probabilité) et métronome en notes MIDI, mesures 4/4, 3/4, 2/4, 5/4, 6/8, 7/8.
- **4 préréglages**, rappelables depuis l'écran ou depuis le menu de la boîte.
- **Écran dans le navigateur** : ouvre **https://dr-john-8bits.github.io/clockbox/** dans Chrome, clique « Connecter la boîte ». Tout s'affiche en direct, tout se règle à la souris, et le firmware se met à jour en un clic.
- À compiler avec la bibliothèque uClock **2.3.x**.
