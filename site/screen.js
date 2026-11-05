"use strict";
// clockbox screen: talks to the box over Web Serial (31250 baud, same line as MIDI).
// Protocol: see the top of clockbox.ino.

// ------------------------------------------------------------------- text --
const T = {
  fr: {
    title: "clockbox — écran", connect: "Connecter la boîte", disconnect: "Déconnecter",
    demo: "Mode démo", demoStop: "Quitter la démo",
    noSerial: "Ce navigateur ne sait pas parler au port USB. Ouvre cette page dans <b>Google Chrome</b> ou <b>Microsoft Edge</b> (Safari et Firefox ne le permettent pas). Le mode démo marche partout.",
    resetNote: "La boîte redémarre une seconde au moment de la connexion (elle repasse à l'arrêt) : c'est normal, c'est la puce USB. Connecte-toi avant de jouer, pas en plein morceau.",
    oldFw: "Ta boîte a le firmware {v}. Les rythmes euclidiens, le MIDI, les mesures et les préréglages demandent la version 2.2 : mets-la à jour plus bas, en un clic.",
    st_off: "Déconnecté", st_wait: "Connexion…", st_ok: "Connecté", st_old: "Connecté (horloge seule)", st_demo: "Démo", st_flash: "Mise à jour…",
    playing: "EN MARCHE", stopped: "À L'ARRÊT", paused: "EN PAUSE", bar: "mesure",
    menu: "MENU", jack: "JACK", preset: "PRÉRÉGLAGE", identify: "IDENTIFIER", identHelp: "seul ce jack bat à chaque temps",
    holdStart: "tenir = menu…", holdMenu: "tenir = enregistrer…", holdPaused: "tenir = retour au début…",
    menuHelp: "court: page suivante · long: enregistrer", turnPot: "bouge le potard pour agir", turnPotShort: "bouge-moi",
    presetHelp: "long: charger ce préréglage", empty: "vide",
    places: ["Haut", "Milieu", "Bas"], place: "Place",
    identBtn: "Identifier", identStop: "Arrêter", identDisabled: "Disponible quand la boîte ne tourne pas",
    transportTitle: "Transport et tempo",
    tStart: "▶ Start", tStop: "■ Stop", tPause: "❚❚ Pause", tContinue: "▶ Reprendre", tRewind: "⏮ Début",
    tempoLabel: "Tempo (BPM)", tempoSet: "Appliquer", tap: "Tap",
    tempoHelp: "Tape un tempo précis (au dixième) ou tape le rythme sur « Tap ». Le potard reprend la main dès que tu le bouges.",
    jacksTitle: "Les 3 jacks",
    jacksHelp: "Clique un mode : il est envoyé à la boîte et enregistré tout de suite. « Identifier » fait battre ce jack seul pendant 15 s, pour savoir lequel est lequel.",
    groups: ["Horloges", "Triolets, pointées et divisions libres", "Transport", "Rythmes euclidiens"],
    pulse: "Impulsion", pulseOpts: ["Gate (50 %)", "Trigger (court)"], offset: "Décalage", offNone: "aucun", divN: "N doubles croches",
    expBtn: "Exporter les réglages", impBtn: "Importer des réglages…", impOk: "Réglages importés", impBad: "Fichier de réglages invalide : {e}",
    backupHelp: "Garde ta configuration dans un fichier (.json) : pour la sauvegarder, la partager avec un ami qui a une clockbox, ou la remettre plus tard. Le tempo et la place des jacks sont inclus.", backupTitle: "Sauvegarde",
    euclidTitle: "Rythmes euclidiens",
    euclidHelp: "Un rythme euclidien répartit des coups le plus régulièrement possible sur un nombre de pas : 3 coups sur 8 donnent le tresillo, 5 sur 16 une bossa… Chaque rythme peut sortir sur un jack (mode « Euclide A/B/C ») et/ou jouer une note MIDI, pour piloter une boîte à rythme.",
    euSteps: "Pas", euHits: "Coups", euRot: "Rotation", euDiv: "Durée d'un pas", euMidi: "Jouer une note MIDI",
    euChannel: "Canal", euNote: "Note", euVel: "Vélocité", prob: "Probabilité",
    probHelp: "100 % = toujours. En dessous, des impulsions sont sautées au hasard : le rythme change un peu à chaque fois.",
    probOld: "La probabilité demande le firmware 2.3.", euUsedBy: "sur le jack", euNoJack: "sur aucun jack",
    divs: ["1/16", "1/8", "1/16 triolet", "1/4"],
    midiTitle: "MIDI et mesure",
    timeSig: "Mesure", spp: "Envoyer la position de départ (Song Position) avant Start et Reprendre",
    clockStopped: "Envoyer l'horloge MIDI même à l'arrêt", buttonPauses: "Le bouton met en pause (tenir 1,5 s en pause = retour au début)",
    metro: "Métronome MIDI", metroModes: ["Éteint", "1er temps seulement", "Chaque temps"],
    metroDown: "Note du 1er temps", metroBeat: "Note des autres temps",
    presetsTitle: "Préréglages",
    presetsHelp: "4 emplacements dans la boîte pour tout garder : modes des jacks, rythmes, MIDI, mesure et tempo. Le 4e écran du menu de la boîte permet de les rappeler sans ordinateur.",
    pLoad: "Charger", pSave: "Enregistrer ici", pErase: "Effacer", pFilled: "enregistré", pEmpty: "vide",
    pConfirmSave: "Remplacer le préréglage {n} par les réglages actuels ?",
    fwTitle: "Mise à jour du firmware",
    fwHelp: "Installe la dernière version du programme dans la boîte, directement depuis cette page (environ 15 secondes). Ton ancien programme peut toujours être remis avec une sauvegarde.",
    fwBox: "Dans ta boîte", fwSite: "Sur le site", fwUnknown: "—",
    fwUpdate: "Mettre à jour la boîte", fwFile: "Installer un fichier .hex…",
    fwConfirm: "Installer le firmware {v} dans la boîte ? Ne débranche pas le câble pendant la mise à jour.",
    fwNoHex: "Le fichier du firmware n'est pas disponible ici (page ouverte depuis le disque ?) : choisis un fichier .hex.",
    fwSteps: ["Connexion au bootloader…", "Écriture…", "Vérification…", "Terminé !"],
    fwDone: "Firmware installé. La boîte redémarre.", fwFail: "Échec de la mise à jour : {e}. La boîte n'est pas abîmée : réessaie.",
    fwSettings: "Tes réglages et préréglages sont conservés d'une version à l'autre quand c'est possible (la 2.4 reprend ceux de la 2.2 et de la 2.3). Par précaution, exporte-les avant (carte Sauvegarde).",
    infoTitle: "État", howTitle: "Rappel des commandes", logTitle: "Journal",
    howList: [
      "<b>Potard</b> : tempo, 30 à 240 BPM.",
      "<b>Bouton en marche</b> : stop (ou pause si l'option est cochée).",
      "<b>Bouton en pause</b> : appui court = reprendre, tenir 1,5 s = retour au début.",
      "<b>Bouton à l'arrêt</b> : appui court = start (au relâchement), tenir 1,5 s = menu.",
      "<b>Menu</b> : 4 pages (jack 1, jack 2, jack 3, préréglage) ; bouge un peu le potard puis choisis ; appui court = page suivante ; tenir 1,5 s = enregistrer et quitter."
    ],
    k_fw: "Firmware", k_bpm: "Tempo", k_meas: "Tempo mesuré (horloge MIDI)", k_state: "Transport", k_pos: "Position",
    k_pot: "Potard", k_btn: "Bouton", down: "enfoncé", up: "relâché",
    noState: "Pas de réponse d'état : la boîte a sans doute un très ancien firmware. Le tempo et le start/stop restent affichés depuis l'horloge MIDI.",
    modes: ["24 ppqn", "1/16", "1/8", "1/4", "1/2", "Mesure", "Reset", "Run", "1/8 triolet", "1/16 triolet", "1/8 pointée", "Euclide A", "Euclide B", "Euclide C", "Division libre"],
    modeShort: ["24pq", "1/16", "1/8", "1/4", "1/2", "Mes.", "Reset", "Run", "1/8T", "1/16T", "1/8.", "Eu.A", "Eu.B", "Eu.C", "1/N"],
    modeDesc: ["DIN sync", "doubles cr.", "croches", "noires", "blanches", "1 / mesure", "au start", "gate", "3 / noire", "6 / noire", "pointée", "rythme A", "rythme B", "rythme C", "1 / N doubles"],
  },
  en: {
    title: "clockbox — screen", connect: "Connect the box", disconnect: "Disconnect",
    demo: "Demo mode", demoStop: "Leave demo",
    noSerial: "This browser cannot talk to the USB port. Open this page in <b>Google Chrome</b> or <b>Microsoft Edge</b> (Safari and Firefox cannot). Demo mode works everywhere.",
    resetNote: "The box restarts for a second when the page connects (it goes back to stop): that is the USB chip, it is normal. Connect before playing, not in the middle of a song.",
    oldFw: "Your box runs firmware {v}. Euclidean rhythms, MIDI, time signatures and presets need version 2.2: update it below, in one click.",
    st_off: "Disconnected", st_wait: "Connecting…", st_ok: "Connected", st_old: "Connected (clock only)", st_demo: "Demo", st_flash: "Updating…",
    playing: "RUNNING", stopped: "STOPPED", paused: "PAUSED", bar: "bar",
    menu: "MENU", jack: "JACK", preset: "PRESET", identify: "IDENTIFY", identHelp: "only this jack pulses on each beat",
    holdStart: "hold = menu…", holdMenu: "hold = save…", holdPaused: "hold = back to start…",
    menuHelp: "short: next page · long: save", turnPot: "move the pot to act", turnPotShort: "move me",
    presetHelp: "long: load this preset", empty: "empty",
    places: ["Top", "Middle", "Bottom"], place: "Place",
    identBtn: "Identify", identStop: "Stop", identDisabled: "Available while the box is not running",
    transportTitle: "Transport and tempo",
    tStart: "▶ Start", tStop: "■ Stop", tPause: "❚❚ Pause", tContinue: "▶ Continue", tRewind: "⏮ To start",
    tempoLabel: "Tempo (BPM)", tempoSet: "Apply", tap: "Tap",
    tempoHelp: "Type an exact tempo (to 0.1) or tap the beat on “Tap”. The pot takes over as soon as you move it.",
    jacksTitle: "The 3 jacks",
    jacksHelp: "Click a mode: it is sent to the box and saved right away. “Identify” makes only this jack pulse for 15 s, to find which is which.",
    groups: ["Clocks", "Triplets, dotted and free divisions", "Transport", "Euclidean rhythms"],
    pulse: "Pulse", pulseOpts: ["Gate (50 %)", "Trigger (short)"], offset: "Offset", offNone: "none", divN: "N sixteenths",
    expBtn: "Export settings", impBtn: "Import settings…", impOk: "Settings imported", impBad: "Invalid settings file: {e}",
    backupHelp: "Keep your setup in a file (.json): to back it up, share it with a friend who has a clockbox, or restore it later. Tempo and jack places are included.", backupTitle: "Backup",
    euclidTitle: "Euclidean rhythms",
    euclidHelp: "A Euclidean rhythm spreads hits as evenly as possible over a number of steps: 3 hits over 8 is the tresillo, 5 over 16 a bossa… Each rhythm can go to a jack (mode “Euclid A/B/C”) and/or play a MIDI note, to drive a drum machine.",
    euSteps: "Steps", euHits: "Hits", euRot: "Rotation", euDiv: "Step length", euMidi: "Play a MIDI note",
    euChannel: "Channel", euNote: "Note", euVel: "Velocity", prob: "Probability",
    probHelp: "100 % = always. Below that, pulses are skipped at random: the rhythm changes a little every time.",
    probOld: "Probability needs firmware 2.3.", euUsedBy: "on jack", euNoJack: "on no jack",
    divs: ["1/16", "1/8", "1/16 triplet", "1/4"],
    midiTitle: "MIDI and time signature",
    timeSig: "Time signature", spp: "Send the song position before Start and Continue",
    clockStopped: "Send MIDI clock while stopped too", buttonPauses: "The button pauses (hold 1.5 s while paused = back to start)",
    metro: "MIDI metronome", metroModes: ["Off", "Beat 1 only", "Every beat"],
    metroDown: "Beat 1 note", metroBeat: "Other beats note",
    presetsTitle: "Presets",
    presetsHelp: "4 slots in the box to keep everything: jack modes, rhythms, MIDI, time signature and tempo. The 4th page of the box menu recalls them without a computer.",
    pLoad: "Load", pSave: "Save here", pErase: "Erase", pFilled: "saved", pEmpty: "empty",
    pConfirmSave: "Replace preset {n} with the current settings?",
    fwTitle: "Firmware update",
    fwHelp: "Installs the latest program into the box, right from this page (about 15 seconds). Your previous program can always be restored from a backup.",
    fwBox: "In your box", fwSite: "On the site", fwUnknown: "—",
    fwUpdate: "Update the box", fwFile: "Install a .hex file…",
    fwConfirm: "Install firmware {v} into the box? Do not unplug the cable during the update.",
    fwNoHex: "The firmware file is not available here (page opened from disk?): pick a .hex file.",
    fwSteps: ["Talking to the bootloader…", "Writing…", "Verifying…", "Done!"],
    fwDone: "Firmware installed. The box restarts.", fwFail: "Update failed: {e}. The box is not harmed: try again.",
    fwSettings: "Your settings and presets are kept from one version to the next whenever possible (2.4 keeps those of 2.2 and 2.3). To be safe, export them first (Backup card).",
    infoTitle: "Status", howTitle: "Controls", logTitle: "Log",
    howList: [
      "<b>Pot</b>: tempo, 30 to 240 BPM.",
      "<b>Button while running</b>: stop (or pause if the option is on).",
      "<b>Button while paused</b>: short press = continue, hold 1.5 s = back to start.",
      "<b>Button while stopped</b>: short press = start (on release), hold 1.5 s = menu.",
      "<b>Menu</b>: 4 pages (jack 1, jack 2, jack 3, preset); move the pot a little, then choose; short press = next page; hold 1.5 s = save and quit."
    ],
    k_fw: "Firmware", k_bpm: "Tempo", k_meas: "Measured tempo (MIDI clock)", k_state: "Transport", k_pos: "Position",
    k_pot: "Pot", k_btn: "Button", down: "pressed", up: "released",
    noState: "No status reply: the box probably runs a very old firmware. Tempo and start/stop are still shown from the MIDI clock.",
    modes: ["24 ppqn", "1/16", "1/8", "1/4", "1/2", "Bar", "Reset", "Run", "1/8 triplet", "1/16 triplet", "Dotted 1/8", "Euclid A", "Euclid B", "Euclid C", "Free division"],
    modeShort: ["24pq", "1/16", "1/8", "1/4", "1/2", "Bar", "Reset", "Run", "1/8T", "1/16T", "1/8.", "Eu.A", "Eu.B", "Eu.C", "1/N"],
    modeDesc: ["DIN sync", "16ths", "8ths", "quarters", "halves", "1 / bar", "on start", "gate", "3 / quarter", "6 / quarter", "dotted", "rhythm A", "rhythm B", "rhythm C", "1 / N 16ths"],
  }
};
if (window.SITE_T) for (const l in window.SITE_T) Object.assign(T[l], window.SITE_T[l]);
let lang = "fr";
try { lang = localStorage.getItem("clockbox.lang") || (navigator.language.startsWith("fr") ? "fr" : "en"); } catch (e) {}
const t = k => T[lang][k];
const tf = (k, o) => t(k).replace(/\{(\w+)\}/g, (_, x) => o[x]);

// ------------------------------------------------------------- constants --
const LONG_PRESS_MS = 1500, IDENTIFY_MS = 15000;
const MODE_COUNT = 15;
const POT_ORDER = [0, 1, 9, 2, 8, 10, 3, 4, 5, 14, 6, 7, 11, 12, 13];
const MODE_GROUPS = [[0, 1, 2, 3, 4, 5], [9, 8, 10, 14], [6, 7], [11, 12, 13]];
const PERIOD24 = [1, 6, 12, 24, 48, 0, 0, 0, 8, 4, 18, 0, 0, 0, 0];   // plain clocks, in MIDI clock ticks
const TIME_SIGS = ["4/4", "3/4", "2/4", "5/4", "6/8", "7/8"];
const BAR24 = [96, 72, 48, 120, 72, 84], BEAT24 = [24, 24, 24, 24, 36, 12];
const EU_DIV24 = [6, 12, 4, 24];
const PRESS_STOPPED = 1, PRESS_MENU = 2, PRESS_PAUSED = 3;
const STOPPED = 0, PLAYING = 1, PAUSED = 2;
const CONFIG_SIZE = 50, CONFIG_SIZE_V23 = 41, CONFIG_SIZE_V22 = 35;
const configSizeFor = fw => fw >= 24 ? CONFIG_SIZE : fw === 23 ? CONFIG_SIZE_V23 : CONFIG_SIZE_V22;
const GM = { 35: "kick", 36: "kick", 37: "rim", 38: "snare", 39: "clap", 40: "snare 2", 41: "tom", 42: "hat", 44: "pedal hat", 45: "tom", 46: "open hat", 47: "tom", 49: "crash", 50: "tom", 51: "ride", 54: "tamb.", 56: "cowbell", 60: "bongo", 62: "conga", 69: "cabasa", 70: "maracas", 75: "claves", 76: "wood hi", 77: "wood lo" };
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteName = n => NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 2);   // 60 = C3

// ----------------------------------------------------------------- state --
let S = null;      // live state from the box
let C = null;      // settings from the box (firmware 2.2+)
let link = null;   // { port, reader, writer }
let demo = null;
let conn = "off";  // off | wait | ok | old | demo | flash
const clock = { songTick: 0, freeTick: 0, f8: [], startFlash: 0, spp: 0, notes: [0, 0, 0], midiAt: 0 };
let pressSince = 0, identSince = 0, configTimer = null, siteFw = null;

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function log(msg) {
  const el = $("log");
  el.textContent = (new Date().toLocaleTimeString() + "  " + msg + "\n" + el.textContent).slice(0, 5000);
}

// ---------------------------------------------------------------- protocol --
const enc = (...d) => new Uint8Array([0xF0, 0x7D, 0x43, 0x42, ...d, 0xF7]);

function decodeState(d) {
  if (d[0] === 2 && d[1] === 1) {   // firmware 2.1 layout
    return { fw: "2.1", fwNum: 21, bpm: (d[2] << 7) | d[3], transport: d[4] ? PLAYING : STOPPED, menu: !!d[5], menuPage: d[6],
      menuPreset: 0, modes: [d[7], d[8], d[9]], pot: (d[10] << 7) | d[11], button: !!d[12], press: d[13],
      tempoArmed: !!d[14], menuArmed: !!d[15], ident: d[16] === 0x7F ? -1 : d[16], pos: [d[17], d[18], d[19]], pos16: 0 };
  }
  return { fw: d[0] + "." + d[1], fwNum: d[0] * 10 + d[1], bpm: ((d[2] << 7) | d[3]) / 10, transport: d[4], menu: !!d[5],
    menuPage: d[6], menuPreset: d[7], pot: (d[8] << 7) | d[9], button: !!d[10], press: d[11], tempoArmed: !!d[12],
    menuArmed: !!d[13], ident: d[14] === 0x7F ? -1 : d[14], pos: [d[15], d[16], d[17]], pos16: (d[18] << 7) | d[19],
    modes: [d[20], d[21], d[22]] };
}

function decodeConfig(d, size = CONFIG_SIZE) {
  const c = { jackMode: [d[0], d[1], d[2]], timeSig: d[3], clockWhenStopped: d[4], songPosition: d[5], buttonPauses: d[6],
    metroMode: d[7], metroChannel: d[8], metroNoteDown: d[9], metroNoteBeat: d[10], euclid: [], presetMask: d[size] || 0,
    jackProb: size >= 41 ? [d[35], d[36], d[37]] : [100, 100, 100],
    euclidProb: size >= 41 ? [d[38], d[39], d[40]] : [100, 100, 100],
    jackTrigger: size >= 50 ? [d[41], d[42], d[43]] : [0, 0, 0],
    jackOffset: size >= 50 ? [d[44], d[45], d[46]] : [0, 0, 0],
    jackDivision: size >= 50 ? [d[47], d[48], d[49]] : [3, 3, 3] };
  for (let g = 0; g < 3; g++) {
    const o = 11 + g * 8;
    c.euclid.push({ steps: d[o], hits: d[o + 1], rotation: d[o + 2], division: d[o + 3], midi: d[o + 4],
      channel: d[o + 5], note: d[o + 6], velocity: d[o + 7] });
  }
  return c;
}

function encodeConfig(c) {
  const b = [...c.jackMode, c.timeSig, c.clockWhenStopped, c.songPosition, c.buttonPauses,
    c.metroMode, c.metroChannel, c.metroNoteDown, c.metroNoteBeat];
  for (const e of c.euclid) b.push(e.steps, e.hits, e.rotation, e.division, e.midi, e.channel, e.note, e.velocity);
  b.push(...c.jackProb, ...c.euclidProb, ...c.jackTrigger, ...c.jackOffset, ...c.jackDivision);   // older firmware ignores the tail
  return b;
}

async function send(bytes) {
  if (demo) return demoCommand(bytes);
  if (!link || !link.writer) return;
  try { await link.writer.write(bytes); } catch (e) { log("écriture impossible : " + e.message); }
}

// Settings edited on the page: apply locally now, send after a short pause.
function editConfig(fn) {
  if (!C) return;
  fn(C);
  for (const e of C.euclid) { e.hits = Math.min(e.hits, e.steps); e.rotation = Math.min(e.rotation, e.steps - 1); }
  renderSettings(true);
  clearTimeout(configTimer);
  configTimer = setTimeout(() => { configTimer = null; send(enc(0x14, ...encodeConfig(C))); }, 250);
}

function onState(d) {
  const prev = S;
  S = decodeState(d);
  if (S.button && !(prev && prev.button)) pressSince = performance.now();
  if (S.ident >= 0 && !(prev && prev.ident === S.ident)) identSince = performance.now();
  if (C) C.jackMode = S.modes.slice();
  if (conn === "wait" || conn === "old") { setConn(S.fwNum >= 22 ? "ok" : "old"); log("état reçu, firmware " + S.fw); }
  if (prev) {
    if (prev.transport !== S.transport) log(["stop", "start", "pause"][S.transport]);
    if (prev.menu !== S.menu) log(S.menu ? "menu ouvert" : "menu fermé, réglages enregistrés");
    if (prev.bpm !== S.bpm) log("tempo " + S.bpm + " BPM");
    for (let j = 0; j < 3; j++) if (prev.modes[j] !== S.modes[j]) log("jack " + (j + 1) + " → " + T[lang].modes[S.modes[j]]);
  }
  renderPanel(); renderSettings();
}

function onConfig(d) {
  if (configTimer) return;   // a local edit is about to be sent; the box will echo it
  C = decodeConfig(d, configSizeFor(S ? S.fwNum : 24));
  if (S) C.jackMode = S.modes.slice();
  renderPanel(); renderSettings();
}

// --------------------------------------------------------- MIDI stream parser --
function makeParser() {
  let inSx = false, sx = [], status = 0, data = [];
  return (b, now) => {
    if (b >= 0xF8) return onRealtime(b, now);
    if (b === 0xF0) { inSx = true; sx = []; return; }
    if (inSx) {
      if (b === 0xF7) {
        inSx = false;
        if (sx[0] === 0x7D && sx[1] === 0x43 && sx[2] === 0x42) {
          if (sx[3] === 0x01 && sx.length >= 24) onState(sx.slice(4));
          if (sx[3] === 0x02 && sx.length >= 4 + CONFIG_SIZE_V22) onConfig(sx.slice(4));
        }
        return;
      }
      if (b & 0x80 || sx.length > 80) { inSx = false; } else { sx.push(b); return; }
    }
    if (b & 0x80) { status = b; data = []; return; }
    data.push(b);
    if (status === 0xF2 && data.length === 2) { clock.spp = (data[0] | (data[1] << 7)) * 6; status = 0; }
    else if ((status & 0xE0) === 0x80 && data.length === 2) {   // note on/off
      if ((status & 0xF0) === 0x90 && data[1] > 0) {
        clock.midiAt = now;
        if (C) C.euclid.forEach((e, g) => { if (e.midi && e.note === data[0] && e.channel === (status & 15)) clock.notes[g] = now; });
      }
      data = [];
    }
  };
}

function onRealtime(b, now) {
  if (b === 0xF8) {
    clock.freeTick++;
    if (clock.running) clock.songTick++;   // FA / FB / FC are exact, state messages may lag
    clock.f8.push(now); if (clock.f8.length > 49) clock.f8.shift();
  } else if (b === 0xFA) { clock.running = true; clock.songTick = -1; clock.startFlash = now; }
  else if (b === 0xFB) { clock.running = true; clock.songTick = clock.spp - 1; }
  else if (b === 0xFC) { clock.running = false; }
}

function measuredBpm() {
  const f = clock.f8;
  if (f.length < 25 || performance.now() - f[f.length - 1] > 1500) return null;
  return (f.length - 1) / ((f[f.length - 1] - f[0]) / 1000) * 60 / 24;
}

// -------------------------------------------------------------- connection --
async function openApp(port) {
  await port.open({ baudRate: 31250, bufferSize: 4096 });
  link = { port, writer: port.writable.getWriter(), reader: null, closed: false };
  S = null; C = null; setConn("wait");
  $("resetNote").hidden = false;
  readLoop(link);
  for (let i = 0; i < 6 && link && !S; i++) {
    await sleep(i === 0 ? 2200 : 1000);
    if (link && !S) await send(enc(0x10));
  }
  if (link && !S) { setConn("old"); log(t("noState")); }
}

async function connect() {
  if (link) return disconnect();
  if (demo) stopDemo();
  let port;
  try { port = await navigator.serial.requestPort(); } catch (e) { return; }
  try { await openApp(port); log("port ouvert, la boîte redémarre…"); }
  catch (e) { log("ouverture impossible : " + e.message + " (le port est peut-être utilisé par un autre programme)"); }
}

async function closeLink() {
  const l = link; link = null;
  if (!l) return null;
  l.closed = true;
  try { l.reader && await l.reader.cancel(); } catch (e) {}
  try { l.writer && l.writer.releaseLock(); } catch (e) {}
  for (let i = 0; i < 20 && l.port.readable && l.port.readable.locked; i++) await sleep(20);
  try { await l.port.close(); } catch (e) {}
  return l.port;
}

async function disconnect() {
  await closeLink();
  S = null; C = null; clock.running = false; setConn("off"); log("déconnecté"); renderPanel(); renderSettings();
}

async function readLoop(l) {
  const parse = makeParser();
  while (!l.closed && l.port.readable) {
    const reader = l.port.readable.getReader(); l.reader = reader;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const now = performance.now();
        for (const b of value) parse(b, now);
      }
    } catch (e) { if (!l.closed) log("lecture interrompue : " + e.message); }
    finally { try { reader.releaseLock(); } catch (e) {} }
    if (l.closed) break;
    await sleep(200);
  }
}

if ("serial" in navigator) {
  navigator.serial.addEventListener("disconnect", e => {
    if (link && e.target === link.port && conn !== "flash") { log("câble débranché"); disconnect(); }
  });
}

// ----------------------------------------------------------------- flasher --
// STK500v1, as spoken by the Arduino bootloaders (Optiboot at 115200, old Nano at 57600).
function parseHex(text) {
  const mem = new Uint8Array(32768).fill(0xFF);
  let base = 0, top = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line[0] !== ":") throw new Error("fichier .hex invalide");
    const b = line.slice(1).match(/../g).map(h => parseInt(h, 16));
    const n = b[0], addr = (b[1] << 8) | b[2], type = b[3];
    if (b.reduce((a, x) => a + x, 0) & 0xFF) throw new Error("somme de contrôle .hex fausse");
    if (type === 0) {
      for (let i = 0; i < n; i++) { const a = base + addr + i; if (a >= mem.length) throw new Error("programme trop gros"); mem[a] = b[4 + i]; top = Math.max(top, a + 1); }
    } else if (type === 1) break;
    else if (type === 2) base = ((b[4] << 8) | b[5]) << 4;
    else if (type === 4) base = ((b[4] << 8) | b[5]) << 16;
  }
  if (!top) throw new Error("fichier .hex vide");
  if (top > 0x7800) throw new Error("programme trop gros pour un ATmega328P");
  return mem.slice(0, Math.ceil(top / 128) * 128);
}

class Stk {
  constructor(port) { this.port = port; this.buf = []; this.waiter = null; }
  async open(baud) {
    await this.port.open({ baudRate: baud, bufferSize: 1024 });
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();
    this.alive = true;
    (async () => {
      try { for (;;) { const { value, done } = await this.reader.read(); if (done) break; this.buf.push(...value); if (this.waiter) this.waiter(); } }
      catch (e) {} this.alive = false;
    })();
  }
  async close() {
    try { await this.reader.cancel(); } catch (e) {}
    try { this.reader.releaseLock(); } catch (e) {}
    try { this.writer.releaseLock(); } catch (e) {}
    try { await this.port.close(); } catch (e) {}
  }
  async read(n, ms) {
    const end = performance.now() + ms;
    while (this.buf.length < n) {
      const left = end - performance.now();
      if (left <= 0) throw new Error("pas de réponse du bootloader");
      await new Promise(r => { this.waiter = r; setTimeout(r, left); });
      this.waiter = null;
    }
    return this.buf.splice(0, n);
  }
  async cmd(bytes, replyLen = 0, ms = 500) {
    this.buf = [];
    await this.writer.write(new Uint8Array(bytes));
    const r = await this.read(replyLen + 2, ms);
    if (r[0] !== 0x14 || r[r.length - 1] !== 0x10) throw new Error("réponse inattendue du bootloader");
    return r.slice(1, -1);
  }
  async reset() {
    await this.port.setSignals({ dataTerminalReady: false, requestToSend: false });
    await sleep(120);
    await this.port.setSignals({ dataTerminalReady: true, requestToSend: true });
    await sleep(60);
  }
  async sync() {
    for (let i = 0; i < 12; i++) {
      try { await this.cmd([0x30, 0x20], 0, 150); return true; } catch (e) { await sleep(30); }
    }
    return false;
  }
}

async function flash(hexText, version) {
  const image = parseHex(hexText);
  if (!confirm(tf("fwConfirm", { v: version || "?" }))) return;
  if (demo) stopDemo();
  let port = await closeLink();
  if (!port) { try { port = await navigator.serial.requestPort(); } catch (e) { return; } }
  setConn("flash"); S = null; C = null; renderPanel(); renderSettings();
  const progress = (step, frac) => {
    $("fwProgress").hidden = false;
    $("fwBar").style.width = Math.round(frac * 100) + "%";
    $("fwMsg").textContent = t("fwSteps")[step];
  };
  let ok = false;
  try {
    progress(0, 0);
    let stk = null;
    for (const baud of [115200, 57600]) {
      stk = new Stk(port);
      await stk.open(baud);
      await stk.reset();
      if (await stk.sync()) { log("bootloader trouvé à " + baud + " bauds"); break; }
      await stk.close(); stk = null;
    }
    if (!stk) throw new Error("bootloader introuvable");
    const sig = await stk.cmd([0x75, 0x20], 3);
    if (sig[0] !== 0x1E || sig[1] !== 0x95 || (sig[2] !== 0x0F && sig[2] !== 0x14)) throw new Error("ce n'est pas un ATmega328P");
    await stk.cmd([0x50, 0x20]);
    const pages = image.length / 128;
    for (let p = 0; p < pages; p++) {
      const w = (p * 128) >> 1;
      await stk.cmd([0x55, w & 0xFF, w >> 8, 0x20]);
      await stk.cmd([0x64, 0x00, 0x80, 0x46, ...image.slice(p * 128, p * 128 + 128), 0x20], 0, 1000);
      progress(1, (p + 1) / pages * 0.6);
    }
    for (let p = 0; p < pages; p++) {
      const w = (p * 128) >> 1;
      await stk.cmd([0x55, w & 0xFF, w >> 8, 0x20]);
      const back = await stk.cmd([0x74, 0x00, 0x80, 0x46, 0x20], 128, 1000);
      for (let i = 0; i < 128; i++) if (back[i] !== image[p * 128 + i]) throw new Error("vérification échouée à l'adresse " + (p * 128 + i));
      progress(2, 0.6 + (p + 1) / pages * 0.4);
    }
    await stk.cmd([0x51, 0x20]);
    await stk.close();
    progress(3, 1);
    log(t("fwDone")); ok = true;
  } catch (e) {
    log(tf("fwFail", { e: e.message }));
    $("fwMsg").textContent = tf("fwFail", { e: e.message });
    try { await port.close(); } catch (err) {}
  }
  setConn("off");
  if (ok) { await sleep(800); try { await openApp(port); } catch (e) { log("reconnexion impossible : " + e.message); setConn("off"); } }
}

async function flashFromSite() {
  try {
    const r = await fetch("firmware/clockbox.hex", { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    await flash(await r.text(), siteFw);
  } catch (e) {
    if (e instanceof TypeError || /^\d+$/.test(e.message)) { log(t("fwNoHex")); $("fwMsg").textContent = t("fwNoHex"); $("fwProgress").hidden = false; }
    else log(tf("fwFail", { e: e.message }));
  }
}

// -------------------------------------------------------------------- demo --
function defaultConfig() {
  return { jackMode: [1, 6, 2], timeSig: 0, clockWhenStopped: 1, songPosition: 1, buttonPauses: 0,
    jackProb: [100, 100, 100], euclidProb: [100, 100, 70], jackTrigger: [0, 0, 0], jackOffset: [0, 0, 0], jackDivision: [3, 3, 3],
    metroMode: 0, metroChannel: 9, metroNoteDown: 76, metroNoteBeat: 77, presetMask: 0,
    euclid: [{ steps: 16, hits: 5, rotation: 0, division: 0, midi: 1, channel: 9, note: 36, velocity: 110 },
             { steps: 8, hits: 3, rotation: 0, division: 0, midi: 1, channel: 9, note: 38, velocity: 100 },
             { steps: 16, hits: 7, rotation: 0, division: 0, midi: 0, channel: 9, note: 42, velocity: 80 }] };
}
function startDemo() {
  if (link) disconnect();
  demo = { timer: null, playTimer: null, identTimer: null, presets: [null, null, null, null],
    D: { bpm: 120, transport: STOPPED, menu: false, menuPage: 0, menuPreset: 0, modes: [1, 11, 2], pot: 384, button: false,
         press: 0, tempoArmed: true, menuArmed: false, ident: -1, pos: [0, 1, 2], tick: 0 },
    C: defaultConfig() };
  demo.C.jackMode = demo.D.modes.slice();
  setConn("demo"); log("démo : la boîte est simulée — clique le bouton rouge pour start/stop");
  demoPush();
  const tick = () => {
    if (!demo) return;
    const now = performance.now();
    onRealtime(0xF8, now);
    if (demo.D.transport === PLAYING) {
      demo.D.tick++;
      const st = clock.songTick;
      demo.C.euclid.forEach((e, g) => {
        const div = EU_DIV24[e.division];
        if (e.midi && st % div === 0 && euHit(e, Math.floor(st / div) % e.steps) && Math.random() * 100 < demo.C.euclidProb[g]) { clock.notes[g] = now; clock.midiAt = now; }
      });
    }
    demo.timer = setTimeout(tick, 60000 / (demo.D.bpm * 24));
  };
  tick();
  demo.playTimer = setTimeout(() => { if (demo) demoTransport(0); }, 1200);
}
function stopDemo() {
  if (!demo) return;
  clearTimeout(demo.timer); clearTimeout(demo.playTimer); clearTimeout(demo.identTimer); demo = null;
  S = null; C = null; clock.running = false; setConn("off"); renderPanel(); renderSettings();
}
function demoPush() {
  const D = demo.D, b10 = Math.round(D.bpm * 10), p16 = Math.floor(Math.max(0, clock.songTick) / 6);
  onState([2, 4, b10 >> 7, b10 & 0x7F, D.transport, +D.menu, D.menuPage, D.menuPreset, D.pot >> 7, D.pot & 0x7F,
    +D.button, D.press, +D.tempoArmed, +D.menuArmed, D.ident < 0 ? 0x7F : D.ident, ...D.pos, p16 >> 7, p16 & 0x7F, ...D.modes]);
  const mask = demo.presets.reduce((m, p, i) => m | (p ? 1 << i : 0), 0);
  configTimer = null;
  onConfig([...encodeConfig(demo.C), mask]);
}
function demoTransport(a) {
  const D = demo.D, now = performance.now();
  if (a === 0) { D.transport = PLAYING; D.ident = -1; onRealtime(0xFA, now); }
  else if (a === 1) { if (D.transport === PLAYING) { D.transport = STOPPED; onRealtime(0xFC, now); } else { D.transport = STOPPED; clock.songTick = 0; } }
  else if (a === 2 && D.transport === PLAYING) { D.transport = PAUSED; onRealtime(0xFC, now); }
  else if (a === 3 && D.transport === PAUSED) { D.transport = PLAYING; clock.spp = Math.floor(clock.songTick / 6) * 6; onRealtime(0xFB, now); }
  else if (a === 4) { D.transport = STOPPED; clock.songTick = 0; }
  demoPush();
}
function demoCommand(bytes) {
  const D = demo.D, c = bytes[4], d = bytes.slice(5, -1);
  if (c === 0x11) { D.modes[d[0]] = d[1]; demo.C.jackMode = D.modes.slice(); }
  if (c === 0x12) {
    D.ident = (d[0] < 3 && D.transport !== PLAYING && !D.menu) ? d[0] : -1;
    clearTimeout(demo.identTimer);
    if (D.ident >= 0) demo.identTimer = setTimeout(() => { if (demo) { D.ident = -1; demoPush(); } }, IDENTIFY_MS);
  }
  if (c === 0x13) D.pos = [d[0], d[1], d[2]];
  if (c === 0x14) { const n = decodeConfig([...d, 0]); demo.C = n; D.modes = n.jackMode.slice(); }
  if (c === 0x15) { D.bpm = ((d[0] << 7) | d[1]) / 10; D.tempoArmed = false; }
  if (c === 0x16) return demoTransport(d[0]);
  if (c === 0x17) {
    if (d[0] === 0 && demo.presets[d[1]]) { demo.C = JSON.parse(JSON.stringify(demo.presets[d[1]])); D.modes = demo.C.jackMode.slice(); }
    if (d[0] === 1) demo.presets[d[1]] = JSON.parse(JSON.stringify(demo.C));
    if (d[0] === 2) demo.presets[d[1]] = null;
  }
  demoPush();
}

// ------------------------------------------------------------ rhythm model --
function euHit(e, step) {
  if (!e.hits || !e.steps) return false;
  const i = (step + e.steps - (e.rotation % e.steps)) % e.steps;
  return (i * e.hits) % e.steps < e.hits;
}
// Same rules as jackPhase() in the firmware, at MIDI clock resolution.
function levelAt(mode, t24, preview, now, j) {
  const ts = C ? C.timeSig : 0, trig = C && j != null ? C.jackTrigger[j] : 0;
  const off = C && j != null ? C.jackOffset[j] * 6 : 0;
  const wrap = (x, L) => ((x - off) % L + L) % L;
  if (mode === 7) return true;
  if (mode === 6) return preview ? t24 % BAR24[ts] < 1 : now - clock.startFlash < 120;
  let L, ph, hit = true;
  if (PERIOD24[mode]) { L = PERIOD24[mode]; ph = wrap(t24, L); }
  else if (mode === 5) { L = BAR24[ts]; ph = wrap(t24, L); }
  else if (mode === 14) { L = (C ? C.jackDivision[j != null ? j : 0] : 3) * 6; ph = wrap(t24, L); }
  else {
    if (!C) return false;
    const e = C.euclid[mode - 11];
    L = EU_DIV24[e.division]; ph = t24 % L;
    hit = euHit(e, Math.floor(t24 / L) % e.steps);
  }
  if (L === 1) return hit && (t24 & 1) === 0;
  return hit && (trig ? ph === 0 : ph < L / 2);
}

// --------------------------------------------------------------- rendering --
function setConn(c) {
  conn = c;
  const el = $("status");
  el.className = "chip " + ({ ok: "ok", old: "ok", wait: "wait", demo: "wait", flash: "wait" }[c] || "");
  el.textContent = t("st_" + c);
  $("connect").textContent = link ? t("disconnect") : t("connect");
  $("connect").disabled = c === "flash" || !("serial" in navigator);
  $("demo").textContent = demo ? t("demoStop") : t("demo");
  $("demo").disabled = c === "flash";
  const old = (c === "ok" || c === "old") && S && S.fwNum < 22;
  $("oldFw").hidden = !old;
  if (old) $("oldFw").innerHTML = tf("oldFw", { v: S.fw });
}

const transportOf = () => S ? S.transport : (clock.running ? PLAYING : STOPPED);
function fmtBpm(b) { return Number.isInteger(b) ? String(b) : b.toFixed(1); }

function renderLcd(now) {
  const lcd = $("lcd");
  if (conn === "off" || conn === "wait" || conn === "flash") {
    lcd.className = "lcd off";
    lcd.innerHTML = `<div class="row"><span>clockbox</span><span>${conn === "off" ? "" : "…"}</span></div><div class="bpm">--- <small>BPM</small></div><div class="row"><span>${esc(t("st_" + conn))}</span></div>`;
    return;
  }
  lcd.className = "lcd";
  const tr = transportOf(), ts = C ? C.timeSig : 0;
  const bpm = S ? S.bpm : measuredBpm();
  const st = Math.max(0, clock.songTick);
  const beatsInBar = BAR24[ts] / BEAT24[ts];
  const beat = Math.floor((st % BAR24[ts]) / BEAT24[ts]), bar = Math.floor(st / BAR24[ts]) + 1;

  if (S && S.menu) {
    const held = S.button && S.press === PRESS_MENU;
    const helpLine = held ? t("holdMenu") : (S.menuArmed ? (S.menuPage === 3 ? t("presetHelp") : t("menuHelp")) : t("turnPot"));
    let body;
    if (S.menuPage < 3) {
      const cur = S.modes[S.menuPage], i = POT_ORDER.indexOf(cur), short = T[lang].modeShort;
      const prev = i > 0 ? short[POT_ORDER[i - 1]] : "", next = i < MODE_COUNT - 1 ? short[POT_ORDER[i + 1]] : "";
      body = `<div class="row big"><span class="dim">${esc(prev)}</span><b class="sel">${esc(T[lang].modes[cur])}</b><span class="dim">${esc(next)}</span></div>`;
    } else {
      const mask = C ? C.presetMask : 0;
      body = `<div class="row big">${[0, 1, 2, 3].map(p => `<b class="${S.menuArmed && p === S.menuPreset ? "sel" : ""} ${mask & (1 << p) ? "" : "dim"}">${p + 1}</b>`).join("")}</div>`;
    }
    const title = S.menuPage < 3 ? `${t("jack")} ${S.menuPage + 1} · ${esc(t("places")[S.pos[S.menuPage]])}` : t("preset");
    lcd.innerHTML = `<div class="row"><b>${t("menu")} · ${title}</b><span>${S.menuPage + 1}/4</span></div>${body}
      <div class="row dim"><span>${esc(helpLine)}</span></div>
      <div class="bar"><i style="width:${held ? Math.min(100, (now - pressSince) / LONG_PRESS_MS * 100) : 0}%"></i></div>`;
    return;
  }
  if (S && S.ident >= 0) {
    const left = Math.max(0, Math.ceil((IDENTIFY_MS - (now - identSince)) / 1000));
    lcd.innerHTML = `<div class="row"><b>${t("identify")} · ${t("jack")} ${S.ident + 1}</b><span>${left} s</span></div>
      <div class="bpm">${(clock.freeTick % 24) < 12 ? "● ●" : "○ ○"}</div>
      <div class="row dim"><span>${esc(t("identHelp"))}</span></div>`;
    return;
  }
  const dots = Array.from({ length: beatsInBar }, (_, i) => `<span class="beat ${tr === PLAYING && i === beat ? "on" : ""} ${i === 0 ? "first" : ""}"></span>`).join("");
  const held = S && S.button && (S.press === PRESS_STOPPED || S.press === PRESS_PAUSED);
  const jacks = S ? [0, 1, 2].map(j => [S.pos[j], j]).sort((a, b) => a[0] - b[0])
    .map(([p, j]) => `${esc(t("places")[p][0])}:${esc(T[lang].modeShort[S.modes[j]])}`).join(" ") : "";
  const label = tr === PLAYING ? "▶ " + t("playing") : tr === PAUSED ? "❚❚ " + t("paused") : "■ " + t("stopped");
  lcd.innerHTML = `<div class="row"><b>${label}</b><span>${C ? TIME_SIGS[ts] + " · " : ""}${S ? "fw " + S.fw : ""}</span></div>
    <div class="row" style="align-items:flex-end"><div class="bpm">${bpm == null ? "---" : fmtBpm(S ? bpm : Math.round(bpm * 10) / 10)}<small>BPM</small></div>
      <div style="text-align:right"><div class="beats">${dots}</div><div class="dim">${tr !== STOPPED ? `${t("bar")} ${bar}` : "&nbsp;"}</div></div></div>
    ${held ? `<div class="bar"><i style="width:${Math.min(100, (now - pressSince) / LONG_PRESS_MS * 100)}%"></i></div><div class="row dim"><span>${esc(t(S.press === PRESS_PAUSED ? "holdPaused" : "holdStart"))}</span></div>`
           : `<div class="row dim"><span>${jacks}</span></div>`}`;
}

function frame() {
  const now = performance.now();
  renderLcd(now);
  const tr = transportOf(), st = Math.max(0, clock.songTick), ts = C ? C.timeSig : 0;

  let led = false;
  if (S && S.ident >= 0) led = clock.freeTick % 24 < 12;
  else if (S && S.menu) led = S.menuPage < 3 ? levelAt(S.modes[S.menuPage], clock.freeTick, true, now, S.menuPage) : (now % 1200) < 200;
  else if (tr === PLAYING) led = st % BAR24[ts] < 6 || (st % BAR24[ts]) % BEAT24[ts] < 2;
  else if (tr === PAUSED) led = clock.freeTick % 48 < 3;
  $("led").classList.toggle("on", led && conn !== "off");

  document.querySelectorAll(".jack").forEach(el => {
    const slot = +el.dataset.slot, j = S ? S.pos.indexOf(slot) : slot;
    let on = false;
    if (S) {
      if (S.ident >= 0) on = j === S.ident && clock.freeTick % 24 < 12;
      else if (S.menu) on = j === S.menuPage && levelAt(S.modes[j], clock.freeTick, true, now, j);
      else on = tr === PLAYING && levelAt(S.modes[j], st, false, now, j);
    }
    el.classList.toggle("on", on);
    el.classList.toggle("ident", !!S && S.ident === j);
    el.querySelector(".tag").textContent = S ? `J${j + 1} · ${T[lang].modes[S.modes[j]]}` : "";
  });

  const flowing = clock.f8.length && now - clock.f8[clock.f8.length - 1] < 200;
  const noteFlash = now - clock.midiAt < 90;
  document.querySelectorAll(".din").forEach(d => d.classList.toggle("act", !!flowing && (clock.freeTick % 24 < 3 || noteFlash)));

  $("knob").style.transform = `rotate(${-135 + (S ? S.pot : 0) / 1023 * 270}deg)`;
  const needTurn = S && ((S.menu && !S.menuArmed) || (!S.menu && !S.tempoArmed));
  $("potHint").textContent = needTurn ? "↻ " + t("turnPotShort") : "";
  $("btn").classList.toggle("down", !!(S && S.button));
  const holding = S && S.button && [PRESS_STOPPED, PRESS_MENU, PRESS_PAUSED].includes(S.press);
  const frac = holding ? Math.min(1, (now - pressSince) / LONG_PRESS_MS) : 0;
  $("ring").setAttribute("stroke-dasharray", `${frac * 113} 200`);

  renderEuclidLive(now);
  renderInfo();
  requestAnimationFrame(frame);
}

function renderInfo() {
  const m = measuredBpm(), tr = transportOf(), ts = C ? C.timeSig : 0, st = Math.max(0, clock.songTick);
  const rows = [
    [t("k_fw"), S ? S.fw : "—"],
    [t("k_bpm"), S ? fmtBpm(S.bpm) + " BPM" : "—"],
    [t("k_meas"), m ? m.toFixed(1) + " BPM" : "—"],
    [t("k_state"), [t("stopped"), t("playing"), t("paused")][tr]],
    [t("k_pos"), tr === STOPPED ? "—" : `${Math.floor(st / BAR24[ts]) + 1}.${Math.floor((st % BAR24[ts]) / BEAT24[ts]) + 1}`],
    [t("k_pot"), S ? S.pot + " / 1023" : "—"],
    [t("k_btn"), S ? (S.button ? t("down") : t("up")) : "—"],
  ];
  const html = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
  if ($("info").innerHTML !== html) $("info").innerHTML = html;
}

// ---- transport card and jacks (rebuilt when what they show changes)
let panelKey = "";
function renderPanel() {
  const live = !!S && (conn === "ok" || conn === "old" || conn === "demo");
  const v22 = live && S.fwNum >= 22;
  const tr = transportOf();
  const key = [lang, conn, live, v22, tr, S && S.modes.join(), S && S.pos.join(), S && S.ident, S && S.menu].join("|");
  if (key === panelKey) return;
  panelKey = key;

  // transport buttons
  const tb = [
    ["tStart", () => send(enc(0x16, 0)), v22 && !S.menu],
    tr === PAUSED ? ["tContinue", () => send(enc(0x16, 3)), v22] : ["tPause", () => send(enc(0x16, 2)), v22 && tr === PLAYING],
    ["tStop", () => send(enc(0x16, 1)), v22 && tr !== STOPPED],
    ["tRewind", () => send(enc(0x16, 4)), v22 && tr === PAUSED],
  ];
  const tw = $("transportBtns"); tw.innerHTML = "";
  for (const [k, fn, en] of tb) { const b = document.createElement("button"); b.textContent = t(k); b.disabled = !en; b.onclick = fn; tw.appendChild(b); }
  $("tempoInput").disabled = $("tempoSet").disabled = $("tap").disabled = !v22;

  // jacks
  const canIdent = live && tr !== PLAYING && !S.menu;
  const order = S ? [0, 1, 2].sort((a, b) => S.pos[a] - S.pos[b]) : [0, 1, 2];
  const v24 = live && S.fwNum >= 24;
  const maxMode = !live || v24 ? MODE_COUNT : v22 ? 14 : 8;
  $("jackRows").innerHTML = order.map(j => {
    const mode = S ? S.modes[j] : -1, identOn = S && S.ident === j;
    const places = t("places").map((p, i) => `<option value="${i}" ${S && S.pos[j] === i ? "selected" : ""}>${esc(p)}</option>`).join("");
    const groups = MODE_GROUPS.map((g, gi) => {
      const btns = g.filter(m => m < maxMode).map(m => `<button data-jack="${j}" data-mode="${m}" aria-pressed="${m === mode}" ${live ? "" : "disabled"}>${esc(T[lang].modes[m])}<span class="d">${esc(T[lang].modeDesc[m])}</span></button>`).join("");
      return btns ? `<div class="grp"><span class="gl">${esc(t("groups")[gi])}</span><div class="seg">${btns}</div></div>` : "";
    }).join("");
    return `<div class="jackrow">
      <div class="head">
        <span class="name">Jack ${j + 1}<small>${S ? esc(t("places")[S.pos[j]]) : ""}</small></span>
        <label>${esc(t("place"))} <select data-pos="${j}" ${live ? "" : "disabled"}>${places}</select></label>
        <button data-ident="${j}" class="${identOn ? "ident-on" : ""}" ${canIdent || identOn ? "" : "disabled"} title="${canIdent ? "" : esc(t("identDisabled"))}">${esc(identOn ? t("identStop") : t("identBtn"))}</button>
      </div>${groups}
      ${field(t("prob"), `<input type="range" min="0" max="100" step="5" data-jp="${j}" ${live && S.fwNum >= 23 ? "" : "disabled"}><output></output>`)}
      <div class="jx">
        ${field(t("pulse"), `<select data-jt="${j}" ${v24 && mode !== 6 && mode !== 7 ? "" : "disabled"}>${t("pulseOpts").map((o, i) => `<option value="${i}">${esc(o)}</option>`).join("")}</select>`)}
        ${field(t("offset"), `<select data-jo="${j}" ${v24 && (mode <= 5 || (mode >= 8 && mode <= 10) || mode === 14) ? "" : "disabled"}>${Array.from({ length: 16 }, (_, i) => `<option value="${i}">${esc(offsetLabel(i))}</option>`).join("")}</select>`)}
        ${mode === 14 ? field(t("divN"), `<input type="number" min="1" max="64" data-jn="${j}" ${v24 ? "" : "disabled"}>`) : ""}
      </div></div>`;
  }).join("");
  syncJackProb();
}

// ---- settings cards (built once, values synced so that editing is never interrupted)
let built = false;
function field(label, input) { return `<label class="fld"><span>${esc(label)}</span>${input}</label>`; }
function buildSettings() {
  built = true;
  const chOpts = Array.from({ length: 16 }, (_, i) => `<option value="${i}">${i + 1}</option>`).join("");
  $("euclids").innerHTML = [0, 1, 2].map(g => `
    <div class="eu" data-g="${g}">
      <div class="eu-head"><b>${"ABC"[g]}</b><span class="eu-used"></span></div>
      <svg class="ring" viewBox="-50 -50 100 100" aria-hidden="true"></svg>
      <div class="eu-fields">
        ${field(t("euSteps"), `<input type="range" min="1" max="32" data-k="steps"><output></output>`)}
        ${field(t("euHits"), `<input type="range" min="0" max="16" data-k="hits"><output></output>`)}
        ${field(t("euRot"), `<input type="range" min="0" max="15" data-k="rotation"><output></output>`)}
        ${field(t("prob"), `<input type="range" min="0" max="100" step="5" data-k="prob"><output></output>`)}
        ${field(t("euDiv"), `<select data-k="division">${t("divs").map((d, i) => `<option value="${i}">${esc(d)}</option>`).join("")}</select>`)}
        <label class="chk"><input type="checkbox" data-k="midi"> ${esc(t("euMidi"))}</label>
        <div class="midi-row">
          ${field(t("euChannel"), `<select data-k="channel">${chOpts}</select>`)}
          ${field(t("euNote"), `<input type="number" min="0" max="127" data-k="note"><output class="nn"></output>`)}
          ${field(t("euVel"), `<input type="range" min="1" max="127" data-k="velocity"><output></output>`)}
        </div>
      </div>
    </div>`).join("");
  $("midiFields").innerHTML = `
    ${field(t("timeSig"), `<select data-c="timeSig">${TIME_SIGS.map((s, i) => `<option value="${i}">${s}</option>`).join("")}</select>`)}
    <label class="chk"><input type="checkbox" data-c="songPosition"> ${esc(t("spp"))}</label>
    <label class="chk"><input type="checkbox" data-c="clockWhenStopped"> ${esc(t("clockStopped"))}</label>
    <label class="chk"><input type="checkbox" data-c="buttonPauses"> ${esc(t("buttonPauses"))}</label>
    ${field(t("metro"), `<select data-c="metroMode">${t("metroModes").map((s, i) => `<option value="${i}">${esc(s)}</option>`).join("")}</select>`)}
    <div class="midi-row">
      ${field(t("euChannel"), `<select data-c="metroChannel">${chOpts}</select>`)}
      ${field(t("metroDown"), `<input type="number" min="0" max="127" data-c="metroNoteDown"><output class="nn"></output>`)}
      ${field(t("metroBeat"), `<input type="number" min="0" max="127" data-c="metroNoteBeat"><output class="nn"></output>`)}
    </div>`;
  $("presets").innerHTML = [0, 1, 2, 3].map(p => `
    <div class="preset" data-p="${p}"><b>${p + 1}</b><span class="pst"></span>
      <button data-pa="0">${esc(t("pLoad"))}</button><button data-pa="1">${esc(t("pSave"))}</button><button data-pa="2">${esc(t("pErase"))}</button></div>`).join("");
}

const noteLabel = (n, ch) => `${noteName(n)}${ch === 9 && GM[n] ? " · " + GM[n] : ""}`;
function setVal(el, v) {
  if (document.activeElement === el) return;
  if (el.type === "checkbox") el.checked = !!v; else if (String(el.value) !== String(v)) el.value = v;
}
function renderSettings(force) {
  if (!built) buildSettings();
  const has = !!C && !!S && S.fwNum >= 22;
  document.querySelectorAll(".needs-config").forEach(c => c.classList.toggle("disabled", !has));
  document.querySelectorAll(".needs-config input, .needs-config select, .needs-config button").forEach(el => { el.disabled = !has; });
  if (!has) { drawRings(); return; }
  document.querySelectorAll(".eu").forEach(box => {
    const g = +box.dataset.g, e = C.euclid[g];
    box.querySelectorAll("[data-k]").forEach(el => {
      const k = el.dataset.k, v = k === "prob" ? C.euclidProb[g] : e[k];
      if (k === "hits") el.max = e.steps;
      if (k === "rotation") el.max = Math.max(0, e.steps - 1);
      if (k === "prob") { el.disabled = S.fwNum < 23; el.title = S.fwNum < 23 ? t("probOld") : ""; }
      setVal(el, v);
      const out = el.nextElementSibling;
      if (out && out.tagName === "OUTPUT") out.textContent = k === "note" ? noteLabel(e.note, e.channel) : k === "prob" ? v + " %" : v;
    });
    box.querySelector(".midi-row").classList.toggle("off", !e.midi);
    const jacks = C.jackMode.map((m, j) => m === 11 + g ? j : -1).filter(j => j >= 0);
    box.querySelector(".eu-used").textContent = jacks.length ? `${t("euUsedBy")} ${jacks.map(j => j + 1).join(", ")}` : t("euNoJack");
  });
  document.querySelectorAll("#midiFields [data-c]").forEach(el => {
    setVal(el, C[el.dataset.c]);
    const out = el.nextElementSibling;
    if (out && out.tagName === "OUTPUT") out.textContent = noteLabel(C[el.dataset.c], C.metroChannel);
  });
  document.querySelectorAll(".preset").forEach(row => {
    const p = +row.dataset.p, filled = !!(C.presetMask & (1 << p));
    row.querySelector(".pst").textContent = filled ? t("pFilled") : t("pEmpty");
    row.classList.toggle("filled", filled);
    row.querySelector('[data-pa="0"]').disabled = !filled;
    row.querySelector('[data-pa="2"]').disabled = !filled;
  });
  if (document.activeElement !== $("tempoInput") && S) $("tempoInput").value = fmtBpm(S.bpm);
  syncJackProb();
  drawRings();
}

function drawRings() {
  document.querySelectorAll(".eu").forEach(box => {
    const g = +box.dataset.g, svg = box.querySelector(".ring");
    const e = C ? C.euclid[g] : { steps: 16, hits: 0, rotation: 0 };
    const prob = C ? C.euclidProb[g] : 100;
    const key = [e.steps, e.hits, e.rotation, prob].join();
    if (svg.dataset.key === key) return;
    svg.dataset.key = key;
    let html = `<circle r="38" class="track"/>`;
    for (let i = 0; i < e.steps; i++) {
      const a = (i / e.steps) * Math.PI * 2 - Math.PI / 2, x = Math.cos(a) * 38, y = Math.sin(a) * 38;
      const hit = euHit(e, i);
      html += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${e.steps > 24 ? 3.2 : 4.4}" class="${hit ? "hit" : "rest"}" data-i="${i}"${hit && prob < 100 ? ` style="fill-opacity:${(0.25 + 0.75 * prob / 100).toFixed(2)}"` : ""}/>`;
    }
    html += `<text y="${prob < 100 ? 0 : 5}" class="lbl">${e.hits}/${e.steps}</text>${prob < 100 ? `<text y="13" class="lbl sm">${prob} %</text>` : ""}`;
    svg.innerHTML = html;
  });
}

function renderEuclidLive(now) {
  if (!C) return;
  const playing = transportOf() === PLAYING, st = Math.max(0, clock.songTick);
  document.querySelectorAll(".eu").forEach(box => {
    const g = +box.dataset.g, e = C.euclid[g], div = EU_DIV24[e.division];
    const cur = playing ? Math.floor(st / div) % e.steps : -1;
    box.querySelectorAll(".ring [data-i]").forEach(c => c.classList.toggle("now", +c.dataset.i === cur));
    box.classList.toggle("sounding", now - clock.notes[g] < 100);
  });
}

function offsetLabel(n) {
  const names = { 0: t("offNone"), 1: "1/16", 2: "1/8", 3: "3/16", 4: "1/4", 6: "3/8", 8: "1/2", 12: "3/4" };
  return names[n] || n + "/16";
}
function syncJackProb() {
  document.querySelectorAll("[data-jp]").forEach(el => {
    const j = +el.dataset.jp, v = C ? C.jackProb[j] : 100;
    setVal(el, v);
    el.nextElementSibling.textContent = v + " %";
  });
  if (!C) return;
  document.querySelectorAll("[data-jt]").forEach(el => setVal(el, C.jackTrigger[+el.dataset.jt]));
  document.querySelectorAll("[data-jo]").forEach(el => setVal(el, C.jackOffset[+el.dataset.jo]));
  document.querySelectorAll("[data-jn]").forEach(el => setVal(el, C.jackDivision[+el.dataset.jn]));
}

// ------------------------------------------------------------ export / import --
function exportSettings() {
  if (!C || !S) return;
  const { presetMask, ...config } = C;
  const data = { app: "clockbox", format: 1, firmware: S.fw, tempo: S.bpm, positions: S.pos, config };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `clockbox-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  log("réglages exportés");
}

function checkConfig(src) {
  const c = defaultConfig(), int = (v, lo, hi) => {
    if (!Number.isInteger(v) || v < lo || v > hi) throw new Error(`valeur hors limites (${v})`);
    return v;
  };
  const arr = (a, n, lo, hi, def) => a == null ? def : (Array.isArray(a) && a.length === n ? a.map(v => int(v, lo, hi)) : (() => { throw new Error("tableau invalide"); })());
  c.jackMode = arr(src.jackMode, 3, 0, MODE_COUNT - 1, c.jackMode);
  for (const [k, hi] of [["timeSig", 5], ["clockWhenStopped", 1], ["songPosition", 1], ["buttonPauses", 1], ["metroMode", 2], ["metroChannel", 15], ["metroNoteDown", 127], ["metroNoteBeat", 127]])
    if (src[k] != null) c[k] = int(src[k], 0, hi);
  if (src.euclid) {
    if (!Array.isArray(src.euclid) || src.euclid.length !== 3) throw new Error("rythmes invalides");
    c.euclid = src.euclid.map(e => {
      const steps = int(e.steps, 1, 32);
      return { steps, hits: int(e.hits, 0, steps), rotation: int(e.rotation, 0, steps - 1), division: int(e.division, 0, 3),
        midi: int(e.midi, 0, 1), channel: int(e.channel, 0, 15), note: int(e.note, 0, 127), velocity: int(e.velocity, 1, 127) };
    });
  }
  c.jackProb = arr(src.jackProb, 3, 0, 100, c.jackProb);
  c.euclidProb = arr(src.euclidProb, 3, 0, 100, c.euclidProb);
  c.jackTrigger = arr(src.jackTrigger, 3, 0, 1, c.jackTrigger);
  c.jackOffset = arr(src.jackOffset, 3, 0, 15, c.jackOffset);
  c.jackDivision = arr(src.jackDivision, 3, 1, 64, c.jackDivision);
  return c;
}

async function importSettings(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || data.app !== "clockbox" || !data.config) throw new Error("ce n'est pas un fichier clockbox");
    const c = checkConfig(data.config);
    if (S && S.fwNum < 24) c.jackMode = c.jackMode.map(m => m < (S.fwNum >= 22 ? 14 : 8) ? m : 1);
    await send(enc(0x14, ...encodeConfig(c)));
    for (let j = 0; j < 3; j++) await send(enc(0x11, j, c.jackMode[j]));
    const pos = data.positions;
    if (Array.isArray(pos) && pos.length === 3 && [...pos].sort().join() === "0,1,2") await send(enc(0x13, ...pos));
    if (typeof data.tempo === "number" && data.tempo >= 20 && data.tempo <= 300) sendTempo(data.tempo);
    log(t("impOk")); $("backupMsg").textContent = t("impOk");
  } catch (e) {
    log(tf("impBad", { e: e.message })); $("backupMsg").textContent = tf("impBad", { e: e.message });
  }
}

// ------------------------------------------------------------------ events --
$("jackRows").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || !S) return;
  if (b.dataset.mode != null) send(enc(0x11, +b.dataset.jack, +b.dataset.mode));
  if (b.dataset.ident != null) send(enc(0x12, S.ident === +b.dataset.ident ? 0x7F : +b.dataset.ident));
});
$("jackRows").addEventListener("change", e => {
  const s = e.target.closest("select[data-pos]"); if (!s || !S) return;
  const j = +s.dataset.pos, p = +s.value, pos = S.pos.slice();
  const other = pos.indexOf(p); pos[other] = pos[j]; pos[j] = p;
  send(enc(0x13, ...pos));
});
$("jackRows").addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.jp != null) {
    const j = +el.dataset.jp, v = Math.round(+el.value);
    el.nextElementSibling.textContent = v + " %";
    editConfig(c => { c.jackProb[j] = v; });
  } else if (el.dataset.jt != null) editConfig(c => { c.jackTrigger[+el.dataset.jt] = +el.value; });
  else if (el.dataset.jo != null) editConfig(c => { c.jackOffset[+el.dataset.jo] = +el.value; });
  else if (el.dataset.jn != null) {
    const v = Math.round(+el.value);
    if (v >= 1 && v <= 64) editConfig(c => { c.jackDivision[+el.dataset.jn] = v; });
  }
});
$("euclids").addEventListener("input", e => {
  const el = e.target.closest("[data-k]"); if (!el) return;
  const g = +el.closest(".eu").dataset.g, k = el.dataset.k;
  let v = el.type === "checkbox" ? (el.checked ? 1 : 0) : Math.round(+el.value);
  if (k === "note") v = Math.max(0, Math.min(127, v || 0));
  editConfig(c => { if (k === "prob") c.euclidProb[g] = v; else c.euclid[g][k] = v; });
});
$("midiFields").addEventListener("input", e => {
  const el = e.target.closest("[data-c]"); if (!el) return;
  let v = el.type === "checkbox" ? (el.checked ? 1 : 0) : Math.round(+el.value);
  if (/Note/.test(el.dataset.c)) v = Math.max(0, Math.min(127, v || 0));
  editConfig(c => { c[el.dataset.c] = v; });
});
$("presets").addEventListener("click", e => {
  const b = e.target.closest("button[data-pa]"); if (!b) return;
  const p = +b.closest(".preset").dataset.p, a = +b.dataset.pa;
  if (a === 1 && C && (C.presetMask & (1 << p)) && !confirm(tf("pConfirmSave", { n: p + 1 }))) return;
  send(enc(0x17, a, p));
});
function sendTempo(bpm) {
  const b10 = Math.round(Math.max(20, Math.min(300, bpm)) * 10);
  send(enc(0x15, b10 >> 7, b10 & 0x7F));
}
$("tempoSet").addEventListener("click", () => { const v = parseFloat($("tempoInput").value.replace(",", ".")); if (v) sendTempo(v); });
$("tempoInput").addEventListener("keydown", e => { if (e.key === "Enter") $("tempoSet").click(); });
const taps = [];
$("tap").addEventListener("click", () => {
  const now = performance.now();
  if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
  taps.push(now); if (taps.length > 6) taps.shift();
  if (taps.length >= 3) {
    const bpm = 60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1));
    if (bpm >= 20 && bpm <= 300) { sendTempo(Math.round(bpm * 10) / 10); $("tempoInput").value = (Math.round(bpm * 10) / 10).toFixed(1); }
  }
});
$("btn").addEventListener("click", () => {
  if (!demo) return;
  const tr = demo.D.transport;
  demoTransport(tr === PLAYING ? (demo.C.buttonPauses ? 2 : 1) : tr === PAUSED ? 3 : 0);
});
$("fwUpdate").addEventListener("click", () => {
  if (!("serial" in navigator)) { $("noSerial").hidden = false; return; }
  flashFromSite();
});
$("fwFileBtn").addEventListener("click", () => $("fwFile").click());
$("expBtn").addEventListener("click", exportSettings);
$("impBtn").addEventListener("click", () => $("impFile").click());
$("impFile").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if (f) importSettings(f); });
$("fwFile").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  try { await flash(await f.text(), f.name); } catch (err) { log(tf("fwFail", { e: err.message })); $("fwMsg").textContent = tf("fwFail", { e: err.message }); $("fwProgress").hidden = false; }
});

function applyLang() {
  document.documentElement.lang = lang;
  $("lang").value = lang;
  document.querySelectorAll("[data-t]").forEach(el => {
    const v = T[lang][el.dataset.t];
    if (v == null) return;
    if (Array.isArray(v)) el.innerHTML = v.map(x => `<li>${x}</li>`).join("");
    else el.innerHTML = v;
  });
  document.title = t("title");
  built = false; panelKey = "";
  setConn(conn); renderPanel(); renderSettings();
  renderFwVersions();
}
function renderFwVersions() {
  $("fwVersions").innerHTML = `<dt>${esc(t("fwBox"))}</dt><dd>${S ? esc(S.fw) : t("fwUnknown")}</dd><dt>${esc(t("fwSite"))}</dt><dd>${siteFw ? esc(siteFw) : t("fwUnknown")}</dd>`;
}
$("lang").addEventListener("change", e => {
  lang = e.target.value; try { localStorage.setItem("clockbox.lang", lang); } catch (err) {} applyLang();
});
$("connect").addEventListener("click", () => {
  if (!("serial" in navigator)) { $("noSerial").hidden = false; return; }
  connect();
});
$("demo").addEventListener("click", () => demo ? stopDemo() : startDemo());

applyLang();
if (!("serial" in navigator)) { $("noSerial").hidden = false; $("connect").disabled = true; $("fwUpdate").disabled = true; }
fetch("firmware/version.json", { cache: "no-store" }).then(r => r.ok ? r.json() : null)
  .then(v => { if (v && v.version) { siteFw = v.version; renderFwVersions(); } }).catch(() => {});
setInterval(renderFwVersions, 1000);
startDemo();   // the home page shows the box running; connecting replaces the demo
requestAnimationFrame(frame);
