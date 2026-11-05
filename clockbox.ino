/*
 * clockbox - Arduino clock generator for electronic music instruments.
 * MIDI clock out + 3 analog clock/gate outputs + beat LED.
 *
 * Original project by Alexis Zbik (2020).
 * v2 (2026): one mode per jack (clocks, triplets, dotted, reset, run,
 * Euclidean rhythms), Euclidean rhythms and metronome as MIDI notes, time
 * signatures, song position, pause/continue, presets, beat LED, steady tempo,
 * settings menu, and a screen in the web browser.
 *
 * Requires the uClock library v2.3.x by midilab: https://github.com/midilab/uClock
 * Target: Arduino Nano / Uno (ATmega328P).
 *
 * Controls
 *   Pot ............ tempo, 30 to 240 BPM
 *   Button, running  stop, or pause if "button pauses" is on (on press)
 *   Button, paused   short press = continue, hold 1.5 s = back to the start
 *   Button, stopped  short press = start (on release), hold 1.5 s = settings menu
 *   In the menu .... pages: jack 1, jack 2, jack 3, preset. The LED first blinks
 *                    the page number (1 to 4), then shows the selected mode.
 *                    The pot chooses (move it a little to take over),
 *                    short press = next page, hold 1.5 s = save and quit.
 *   LED ............ running: long flash on beat 1, short on the other beats.
 *                    Paused: short blink every 2 beats. Stopped: off.
 *
 * Screen on a computer (https://dr-john-8bits.github.io/clockbox/ or site/index.html, Chrome/Edge over USB):
 *   The box stays silent until the page says hello. Then it reports its state
 *   and settings as SysEx, and accepts settings and commands. See PROTOCOL.
 */

#include <uClock.h>
#include <EEPROM.h>

// ---------------------------------------------------------------- hardware --
const uint8_t POT_PIN    = A0;
const uint8_t BUTTON_PIN = 2;    // active HIGH, external pull-down resistor
const uint8_t LED_PIN    = 9;
const uint8_t JACK_COUNT = 3;
const uint8_t JACK_PINS[JACK_COUNT] = {5, 7, 3};   // jacks 1, 2, 3 = top, middle, bottom

// ------------------------------------------------------------------- tempo --
const float    BPM_MIN = 30.0;        // pot range
const float    BPM_MAX = 240.0;
const uint16_t BPM10_MIN = 200;       // range accepted from the screen, in 0.1 BPM
const uint16_t BPM10_MAX = 3000;
const float    BPM_HYSTERESIS = 0.7;  // pot must move this many BPM before tempo changes
const uint16_t POT_PICKUP = 32;       // pot travel (0..1023) needed to take over
const uint16_t POT_SAMPLE_MS = 5;

// ------------------------------------------------------------------ button --
const uint16_t DEBOUNCE_MS   = 25;
const uint16_t LONG_PRESS_MS = 1500;
const uint8_t  RESET_PULSE_MS = 10;

// ------------------------------------------------------------ output modes --
// Internal resolution is 96 ticks per quarter note.
enum Mode : uint8_t {
  MODE_24PPQN,          // 24 pulses per quarter (DIN sync, some drum machines)
  MODE_16TH,            // 4 pulses per quarter (most modular sequencers)
  MODE_8TH,             // 2 pulses per quarter (Volca / Pocket Operator sync)
  MODE_QUARTER,         // 1 pulse per quarter
  MODE_HALF,            // 1 pulse every 2 quarters
  MODE_BAR,             // 1 pulse per bar (see time signature)
  MODE_RESET,           // 10 ms trigger just before the first clock, on start
  MODE_RUN,             // gate high while running
  MODE_8TH_TRIPLET,     // 3 pulses per quarter
  MODE_16TH_TRIPLET,    // 6 pulses per quarter
  MODE_8TH_DOTTED,      // 1 pulse every dotted eighth
  MODE_EUCLID_A,        // Euclidean rhythm A, B, C
  MODE_EUCLID_B,
  MODE_EUCLID_C,
  MODE_COUNT
};
// Clock periods in ticks (50 % duty), 0 = not a plain clock.
const uint16_t MODE_PERIOD[MODE_COUNT] = {4, 24, 48, 96, 192, 0, 0, 0, 32, 16, 72, 0, 0, 0};
const uint16_t CYCLE_TICKS = 576;     // common multiple of every period above
// Order of the modes along the pot, in the box menu.
const uint8_t POT_ORDER[MODE_COUNT] = {
  MODE_24PPQN, MODE_16TH, MODE_16TH_TRIPLET, MODE_8TH, MODE_8TH_TRIPLET, MODE_8TH_DOTTED,
  MODE_QUARTER, MODE_HALF, MODE_BAR, MODE_RESET, MODE_RUN, MODE_EUCLID_A, MODE_EUCLID_B, MODE_EUCLID_C
};

// Time signatures: 4/4 3/4 2/4 5/4 6/8 7/8 (bar length and LED beat, in ticks)
const uint8_t  TIME_SIG_COUNT = 6;
const uint16_t BAR_TICKS[TIME_SIG_COUNT]  = {384, 288, 192, 480, 288, 336};
const uint8_t  BEAT_TICKS[TIME_SIG_COUNT] = {96, 96, 96, 96, 144, 48};

// Euclidean rhythms
const uint8_t EUCLID_COUNT = 3;
const uint8_t EUCLID_MAX_STEPS = 32;
const uint8_t EUCLID_DIV_COUNT = 4;
const uint8_t EUCLID_DIV_TICKS[EUCLID_DIV_COUNT] = {24, 48, 16, 96};   // 1/16, 1/8, 1/16T, 1/4

// --------------------------------------------------------------- settings --
struct Euclid {
  uint8_t steps;      // 1..32
  uint8_t hits;       // 0..steps
  uint8_t rotation;   // 0..steps-1, shifts the pattern to the right
  uint8_t division;   // index in EUCLID_DIV_TICKS
  uint8_t midi;       // 1 = also play a MIDI note on each hit
  uint8_t channel;    // 0..15
  uint8_t note;       // 0..127
  uint8_t velocity;   // 1..127
};

struct Config {             // what a preset holds; every byte is 0..127 (fits SysEx)
  uint8_t jackMode[JACK_COUNT];
  uint8_t timeSig;          // index in BAR_TICKS
  uint8_t clockWhenStopped; // 1 = MIDI clock is sent while stopped too
  uint8_t songPosition;     // 1 = send Song Position Pointer before Start / Continue
  uint8_t buttonPauses;     // 1 = the button pauses instead of stopping
  uint8_t metroMode;        // 0 off, 1 downbeat only, 2 every beat
  uint8_t metroChannel;     // 0..15
  uint8_t metroNoteDown;    // note on beat 1
  uint8_t metroNoteBeat;    // note on the other beats
  Euclid  euclid[EUCLID_COUNT];
};
const uint8_t CONFIG_SIZE = sizeof(Config);   // 35

const Config DEFAULT_CONFIG = {
  {MODE_16TH, MODE_RESET, MODE_8TH},
  0, 1, 1, 0,
  0, 9, 76, 77,                                  // metronome off, channel 10, wood blocks
  {{16, 5, 0, 0, 0, 9, 36, 110},                 // A: 5 hits over 16, kick
   { 8, 3, 0, 0, 0, 9, 38, 100},                 // B: tresillo, snare
   {16, 7, 0, 0, 0, 9, 42, 80}}                  // C: 7 over 16, closed hat
};

// EEPROM layout: 'C' 'B' version, positions[3], config at 8, presets at 64 (40 bytes each)
const uint8_t  EEPROM_MAGIC0 = 'C', EEPROM_MAGIC1 = 'B', EEPROM_VERSION = 3;
const uint8_t  EEPROM_POSITIONS = 3;
const uint8_t  EEPROM_CONFIG = 8;
const uint8_t  PRESET_COUNT = 4;
const uint16_t EEPROM_PRESETS = 64, PRESET_STRIDE = 40;
const uint8_t  PRESET_MAGIC = 0x5A;

// ---------------------------------------------------------------- PROTOCOL --
// SysEx, manufacturer ID 0x7D (non-commercial), then 'C' 'B', a command, data.
//   computer -> box
//     10                      hello: start reporting, send state and config
//     11 jack mode            set one jack mode (saved)
//     12 jack                 identify: only this jack pulses on every beat for 15 s (7F = stop)
//     13 p0 p1 p2             physical place of each jack (0 top, 1 middle, 2 bottom), saved
//     14 <config, 35 bytes>   replace the settings (saved)
//     15 bpmHi bpmLo          tempo in 0.1 BPM (14 bits); the pot takes over when moved
//     16 action               0 start, 1 stop, 2 pause, 3 continue, 4 back to the start
//     17 op slot              preset: op 0 = load, 1 = save current settings, 2 = erase
//   box -> computer
//     01 <state>              see sendState()
//     02 <config> presetMask  current settings, and which preset slots are filled
// The MIDI clock itself (F8 / FA / FB / FC / F2) is on the same line.
const uint8_t FW_VERSION_MAJOR = 2, FW_VERSION_MINOR = 2;
const uint8_t SYSEX_ID = 0x7D, SYSEX_C = 'C', SYSEX_B = 'B';
const uint8_t CMD_STATE = 0x01, CMD_CONFIG = 0x02,
              CMD_HELLO = 0x10, CMD_SET_MODE = 0x11, CMD_IDENTIFY = 0x12, CMD_SET_POSITIONS = 0x13,
              CMD_SET_CONFIG = 0x14, CMD_SET_TEMPO = 0x15, CMD_TRANSPORT = 0x16, CMD_PRESET = 0x17;
const uint32_t IDENTIFY_MS = 15000;
const uint16_t REPORT_MIN_INTERVAL_MS = 30;
const uint8_t  REPORT_POT_STEP = 3;
const uint8_t  MENU_PAGES = JACK_COUNT + 1;   // 3 jacks, then the preset page

// ================================================================= state ==

// Position counters, advanced once per tick.
struct Counters {
  uint16_t cycle;                 // 0..CYCLE_TICKS-1, for the plain clocks
  uint16_t bar;                   // position in the bar
  uint8_t  sub[EUCLID_COUNT];     // tick within the current Euclidean step
  uint8_t  step[EUCLID_COUNT];    // current Euclidean step
};

enum Transport : uint8_t { STOPPED, PLAYING, PAUSED };

// shared with the clock interrupt
Config            cfg;
volatile uint8_t  transport = STOPPED;
volatile bool     pendingStart = false;      // MIDI Start right before the next clock
volatile bool     pendingContinue = false;   // MIDI Continue right before the next clock
volatile bool     menuActive = false;
volatile uint8_t  menuPage = 0;
volatile bool     menuLedPreview = false;    // LED copies the edited jack
volatile int8_t   identifyJack = -1;
Counters          song;                      // advances while playing
Counters          freeRun;                   // always advances (menu preview, identify)
volatile uint32_t songTick = 0;              // position while playing / paused, in ticks
int8_t            heldNote[EUCLID_COUNT] = {-1, -1, -1};
int8_t            metroHeldNote = -1;
uint8_t           metroOffIn = 0;

// loop only
float    bpm = 120;
uint16_t potValue = 0;
uint32_t potFiltered = 0;
uint32_t lastPotSample = 0;
bool     tempoArmed = true;     // false after the menu or a tempo from the screen
uint16_t potRef = 0;
bool     menuArmed = false;
uint8_t  menuPreset = 0;        // preset chosen on the menu's preset page
bool     menuPresetChosen = false;

enum PressAction : uint8_t { PRESS_NONE, PRESS_STOPPED, PRESS_MENU, PRESS_PAUSED };
bool     buttonStable = false;
bool     buttonLastRaw = false;
uint32_t buttonChangedAt = 0;
uint32_t pressStartedAt = 0;
PressAction pressAction = PRESS_NONE;
bool     longPressDone = false;
uint32_t menuBlinkStart = 0;

bool     reporting = false;
bool     stateDirty = false;
bool     configDirty = false;
uint32_t lastReportAt = 0;
uint16_t lastReportedPot = 0;
uint32_t identifyUntil = 0;
uint8_t  jackPosition[JACK_COUNT] = {0, 1, 2};
uint8_t  rxBuffer[48];
uint8_t  rxLength = 0;
bool     rxInSysex = false;

static void markDirty() { stateDirty = true; }
static void markConfigDirty() { configDirty = true; stateDirty = true; }

// ================================================================ rhythm ==

static bool euclidHit(const Euclid &e, uint8_t step) {
  if (e.hits == 0 || e.steps == 0) return false;
  uint8_t i = (uint8_t)((step + e.steps - (e.rotation % e.steps)) % e.steps);
  return (uint16_t)(i * e.hits) % e.steps < e.hits;
}

static uint16_t barTicks() { return BAR_TICKS[cfg.timeSig]; }

static void resetCounters(Counters &c) {
  c.cycle = 0; c.bar = 0;
  for (uint8_t g = 0; g < EUCLID_COUNT; g++) { c.sub[g] = 0; c.step[g] = 0; }
}

static void setCounters(Counters &c, uint32_t pos) {
  c.cycle = pos % CYCLE_TICKS;
  c.bar = pos % barTicks();
  for (uint8_t g = 0; g < EUCLID_COUNT; g++) {
    uint8_t div = EUCLID_DIV_TICKS[cfg.euclid[g].division];
    c.sub[g] = pos % div;
    c.step[g] = (pos / div) % cfg.euclid[g].steps;
  }
}

static void advance(Counters &c) {
  if (++c.cycle >= CYCLE_TICKS) c.cycle = 0;
  if (++c.bar >= barTicks()) c.bar = 0;
  for (uint8_t g = 0; g < EUCLID_COUNT; g++) {
    if (++c.sub[g] >= EUCLID_DIV_TICKS[cfg.euclid[g].division]) {
      c.sub[g] = 0;
      if (++c.step[g] >= cfg.euclid[g].steps) c.step[g] = 0;
    }
  }
}

// Level of an output for a mode at a position. preview: menu / identify display.
static bool modeLevel(uint8_t mode, const Counters &c, bool preview) {
  uint16_t period = MODE_PERIOD[mode];
  if (period) return c.cycle % period < period / 2;
  switch (mode) {
    case MODE_BAR:   return c.bar < barTicks() / 2;
    case MODE_RUN:   return true;
    case MODE_RESET: return preview && c.bar < 2;   // the real pulse comes from startTransport()
    default: {
      uint8_t g = mode - MODE_EUCLID_A;
      const Euclid &e = cfg.euclid[g];
      return euclidHit(e, c.step[g]) && c.sub[g] < EUCLID_DIV_TICKS[e.division] / 2;
    }
  }
}

// ==================================================================== MIDI ==
// Channel messages are only written from the clock interrupt, or with
// interrupts off, so that they never end up inside a SysEx message.

static void midi3(uint8_t status, uint8_t d1, uint8_t d2) {
  Serial.write(status); Serial.write(d1); Serial.write(d2);
}

static void releaseNotes() {   // call with interrupts off or from the ISR
  for (uint8_t g = 0; g < EUCLID_COUNT; g++) {
    if (heldNote[g] >= 0) { midi3(0x80 | cfg.euclid[g].channel, heldNote[g], 0); heldNote[g] = -1; }
  }
  if (metroHeldNote >= 0) { midi3(0x80 | cfg.metroChannel, metroHeldNote, 0); metroHeldNote = -1; }
}

static void playNotes(const Counters &c) {
  // metronome
  if (metroHeldNote >= 0 && metroOffIn && --metroOffIn == 0) {
    midi3(0x80 | cfg.metroChannel, metroHeldNote, 0);
    metroHeldNote = -1;
  }
  if (cfg.metroMode && c.bar % BEAT_TICKS[cfg.timeSig] == 0) {
    bool down = c.bar == 0;
    if (down || cfg.metroMode == 2) {
      if (metroHeldNote >= 0) midi3(0x80 | cfg.metroChannel, metroHeldNote, 0);
      metroHeldNote = down ? cfg.metroNoteDown : cfg.metroNoteBeat;
      midi3(0x90 | cfg.metroChannel, metroHeldNote, down ? 120 : 90);
      metroOffIn = 12;
    }
  }
  // Euclidean notes
  for (uint8_t g = 0; g < EUCLID_COUNT; g++) {
    const Euclid &e = cfg.euclid[g];
    uint8_t div = EUCLID_DIV_TICKS[e.division];
    if (c.sub[g] == div / 2 && heldNote[g] >= 0) {
      midi3(0x80 | e.channel, heldNote[g], 0);
      heldNote[g] = -1;
    }
    if (e.midi && c.sub[g] == 0 && euclidHit(e, c.step[g])) {
      if (heldNote[g] >= 0) midi3(0x80 | e.channel, heldNote[g], 0);
      heldNote[g] = e.note;
      midi3(0x90 | e.channel, e.note, e.velocity);
    }
  }
}

// ======================================================= clock (interrupt) ==

// Called by uClock 96 times per quarter note.
void onClockTick(uint32_t tick) {
  bool playing = transport == PLAYING;

  // MIDI clock, 24 PPQN
  if ((tick & 3) == 0) {
    if (pendingStart)    { pendingStart = false;    Serial.write(0xFA); }
    if (pendingContinue) { pendingContinue = false; Serial.write(0xFB); }
    if (playing || cfg.clockWhenStopped) Serial.write(0xF8);
  }

  if (playing) playNotes(song);

  if (identifyJack >= 0) {
    bool level = freeRun.cycle % 96 < 48;     // one pulse per beat
    for (uint8_t j = 0; j < JACK_COUNT; j++) digitalWrite(JACK_PINS[j], (int8_t)j == identifyJack && level);
    digitalWrite(LED_PIN, level);
  } else if (menuActive) {
    bool level = menuPage < JACK_COUNT && modeLevel(cfg.jackMode[menuPage], freeRun, true);
    for (uint8_t j = 0; j < JACK_COUNT; j++) digitalWrite(JACK_PINS[j], j == menuPage && level);
    if (menuLedPreview) digitalWrite(LED_PIN, level);
  } else {
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      digitalWrite(JACK_PINS[j], playing && modeLevel(cfg.jackMode[j], song, false));
    }
    bool led;
    if (playing) led = song.bar < 24 || song.bar % BEAT_TICKS[cfg.timeSig] < 6;
    else if (transport == PAUSED) led = freeRun.cycle % 192 < 12;
    else led = false;
    digitalWrite(LED_PIN, led);
  }

  advance(freeRun);
  if (playing) { advance(song); songTick++; }
}

// ================================================================ helpers ==

static void applyTempo(float newBpm) {
  bpm = newBpm;
  markDirty();
  uClock.setTempo(bpm);
  // uClock reprograms Timer1 without touching its counter. If the counter is
  // already past the new compare value (tempo went up), it would run up to
  // 65535 and wrap, delaying the next tick by up to ~30 ms. Make it fire now.
  noInterrupts();
  if (OCR1A > 2 && TCNT1 >= OCR1A) TCNT1 = OCR1A - 2;
  interrupts();
}

static float potToBpm(uint16_t pot) {
  return BPM_MIN + (float)pot * (BPM_MAX - BPM_MIN) / 1023.0;
}

static bool validConfig(const Config &c) {
  for (uint8_t j = 0; j < JACK_COUNT; j++) if (c.jackMode[j] >= MODE_COUNT) return false;
  if (c.timeSig >= TIME_SIG_COUNT || c.clockWhenStopped > 1 || c.songPosition > 1 ||
      c.buttonPauses > 1 || c.metroMode > 2 || c.metroChannel > 15 ||
      c.metroNoteDown > 127 || c.metroNoteBeat > 127) return false;
  for (uint8_t g = 0; g < EUCLID_COUNT; g++) {
    const Euclid &e = c.euclid[g];
    if (e.steps < 1 || e.steps > EUCLID_MAX_STEPS || e.hits > e.steps || e.rotation >= e.steps ||
        e.division >= EUCLID_DIV_COUNT || e.midi > 1 || e.channel > 15 || e.note > 127 ||
        e.velocity < 1 || e.velocity > 127) return false;
  }
  return true;
}

// Install new settings safely while the clock runs.
static void applyConfig(const Config &c) {
  noInterrupts();
  releaseNotes();
  cfg = c;
  setCounters(song, songTick);
  setCounters(freeRun, 0);
  interrupts();
  markConfigDirty();
}

static void saveConfig() {
  EEPROM.update(0, EEPROM_MAGIC0);
  EEPROM.update(1, EEPROM_MAGIC1);
  EEPROM.update(2, EEPROM_VERSION);
  for (uint8_t j = 0; j < JACK_COUNT; j++) EEPROM.update(EEPROM_POSITIONS + j, jackPosition[j]);
  const uint8_t *p = (const uint8_t *)&cfg;
  for (uint8_t i = 0; i < CONFIG_SIZE; i++) EEPROM.update(EEPROM_CONFIG + i, p[i]);
}

static bool readConfig(uint16_t addr, Config &out) {
  uint8_t *p = (uint8_t *)&out;
  for (uint8_t i = 0; i < CONFIG_SIZE; i++) p[i] = EEPROM.read(addr + i);
  return validConfig(out);
}

static bool presetFilled(uint8_t slot) {
  Config tmp;
  uint16_t a = EEPROM_PRESETS + slot * PRESET_STRIDE;
  return EEPROM.read(a) == PRESET_MAGIC && readConfig(a + 1, tmp);
}

static bool loadPreset(uint8_t slot) {
  Config tmp;
  uint16_t a = EEPROM_PRESETS + slot * PRESET_STRIDE;
  if (slot >= PRESET_COUNT || EEPROM.read(a) != PRESET_MAGIC || !readConfig(a + 1, tmp)) return false;
  applyConfig(tmp);
  saveConfig();
  return true;
}

static void savePreset(uint8_t slot) {
  if (slot >= PRESET_COUNT) return;
  uint16_t a = EEPROM_PRESETS + slot * PRESET_STRIDE;
  EEPROM.update(a, PRESET_MAGIC);
  const uint8_t *p = (const uint8_t *)&cfg;
  for (uint8_t i = 0; i < CONFIG_SIZE; i++) EEPROM.update(a + 1 + i, p[i]);
  markConfigDirty();
}

static void loadSettings() {
  bool valid = EEPROM.read(0) == EEPROM_MAGIC0 && EEPROM.read(1) == EEPROM_MAGIC1 &&
               EEPROM.read(2) == EEPROM_VERSION;
  if (!valid || !readConfig(EEPROM_CONFIG, cfg)) cfg = DEFAULT_CONFIG;

  uint8_t seen = 0;   // positions must be a permutation of 0..JACK_COUNT-1
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    uint8_t p = EEPROM.read(EEPROM_POSITIONS + j);
    if (p < JACK_COUNT) seen |= 1 << p;
    jackPosition[j] = p;
  }
  if (!valid || seen != (1 << JACK_COUNT) - 1) {
    for (uint8_t j = 0; j < JACK_COUNT; j++) jackPosition[j] = j;
  }
}

static void readPot() {
  uint32_t now = millis();
  if (now - lastPotSample < POT_SAMPLE_MS) return;
  lastPotSample = now;
  uint32_t raw = (uint32_t)analogRead(POT_PIN) << 4;
  potFiltered = potFiltered + raw / 8 - potFiltered / 8;  // alpha = 1/8, ~40 ms
  potValue = potFiltered >> 4;
}

static uint16_t potDistance(uint16_t a, uint16_t b) {
  return a > b ? a - b : b - a;
}

// ============================================================= transport ==

static void sendSongPosition(uint32_t tick) {   // with interrupts off
  uint16_t sixteenths = (tick / 24) & 0x3FFF;
  Serial.write(0xF2); Serial.write(sixteenths & 0x7F); Serial.write(sixteenths >> 7);
}

static void startTransport() {
  uClock.stop();   // freeze ticks so that the restart is clean, from tick 0
  identifyJack = -1;
  noInterrupts();
  releaseNotes();
  songTick = 0;
  resetCounters(song);
  if (cfg.songPosition) sendSongPosition(0);
  interrupts();
  bool reset = false;
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    if (cfg.jackMode[j] == MODE_RESET) { digitalWrite(JACK_PINS[j], HIGH); reset = true; }
  }
  if (reset) {
    delay(RESET_PULSE_MS);
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      if (cfg.jackMode[j] == MODE_RESET) digitalWrite(JACK_PINS[j], LOW);
    }
  }
  delay(2);        // let sequencers see the reset fall before the first clock
  pendingStart = true;
  transport = PLAYING;
  uClock.start();  // first tick: MIDI Start + Clock, every jack goes high together
  markDirty();
}

static void stopTransport(bool pause) {
  if (transport != PLAYING) return;
  transport = pause ? PAUSED : STOPPED;   // jacks fall on the next tick
  noInterrupts();
  Serial.write(0xFC);
  releaseNotes();
  interrupts();
  if (!pause) songTick = 0;
  markDirty();
}

static void continueTransport() {
  if (transport != PAUSED) return;
  uClock.stop();
  noInterrupts();
  songTick -= songTick % 24;   // resume on a sixteenth, as the Song Position Pointer does
  setCounters(song, songTick);
  if (cfg.songPosition) sendSongPosition(songTick);
  interrupts();
  pendingContinue = true;
  transport = PLAYING;
  uClock.start();
  markDirty();
}

static void rewindTransport() {
  if (transport == PLAYING) stopTransport(false);
  transport = STOPPED;
  songTick = 0;
  noInterrupts();
  resetCounters(song);
  if (cfg.songPosition) sendSongPosition(0);
  interrupts();
  markDirty();
}

// ========================================================= computer screen ==

static bool sendSysex(const uint8_t *msg, uint8_t len) {
  // Never block: the clock interrupt also writes to Serial.
  if (Serial.availableForWrite() < (int)len) return false;
  noInterrupts();   // keep the message in one piece in the TX buffer
  for (uint8_t i = 0; i < len; i++) Serial.write(msg[i]);
  interrupts();
  return true;
}

static void sendState() {
  uint16_t b10 = (uint16_t)(bpm * 10 + 0.5);
  uint16_t pos16 = (songTick / 24) & 0x3FFF;
  uint8_t msg[] = {
    0xF0, SYSEX_ID, SYSEX_C, SYSEX_B, CMD_STATE,
    FW_VERSION_MAJOR, FW_VERSION_MINOR,
    (uint8_t)(b10 >> 7), (uint8_t)(b10 & 0x7F),
    transport, menuActive, menuPage, menuPreset,
    (uint8_t)(potValue >> 7), (uint8_t)(potValue & 0x7F),
    buttonStable, (uint8_t)pressAction, tempoArmed, menuArmed,
    (uint8_t)(identifyJack < 0 ? 0x7F : identifyJack),
    jackPosition[0], jackPosition[1], jackPosition[2],
    (uint8_t)(pos16 >> 7), (uint8_t)(pos16 & 0x7F),
    cfg.jackMode[0], cfg.jackMode[1], cfg.jackMode[2],
    0xF7
  };
  if (!sendSysex(msg, sizeof(msg))) return;
  stateDirty = false;
  lastReportAt = millis();
  lastReportedPot = potValue;
}

static void sendConfig() {
  uint8_t msg[5 + CONFIG_SIZE + 2];
  msg[0] = 0xF0; msg[1] = SYSEX_ID; msg[2] = SYSEX_C; msg[3] = SYSEX_B; msg[4] = CMD_CONFIG;
  memcpy(msg + 5, &cfg, CONFIG_SIZE);
  uint8_t mask = 0;
  for (uint8_t s = 0; s < PRESET_COUNT; s++) if (presetFilled(s)) mask |= 1 << s;
  msg[5 + CONFIG_SIZE] = mask;
  msg[6 + CONFIG_SIZE] = 0xF7;
  if (sendSysex(msg, sizeof(msg))) configDirty = false;
}

static void handleCommand() {
  // rxBuffer holds the bytes between F0 and F7
  if (rxLength < 4 || rxBuffer[0] != SYSEX_ID || rxBuffer[1] != SYSEX_C || rxBuffer[2] != SYSEX_B) return;
  const uint8_t *d = rxBuffer + 4;
  uint8_t n = rxLength - 4;
  switch (rxBuffer[3]) {
    case CMD_HELLO:
      reporting = true;
      markConfigDirty();
      break;
    case CMD_SET_MODE:
      if (n >= 2 && d[0] < JACK_COUNT && d[1] < MODE_COUNT) {
        cfg.jackMode[d[0]] = d[1];
        saveConfig();
        markConfigDirty();
      }
      break;
    case CMD_IDENTIFY:
      if (n >= 1) {
        if (d[0] < JACK_COUNT && transport != PLAYING && !menuActive) {
          identifyJack = d[0];
          identifyUntil = millis() + IDENTIFY_MS;
        } else {
          identifyJack = -1;
        }
        markDirty();
      }
      break;
    case CMD_SET_POSITIONS:
      if (n >= JACK_COUNT) {
        uint8_t seen = 0;
        for (uint8_t j = 0; j < JACK_COUNT; j++) if (d[j] < JACK_COUNT) seen |= 1 << d[j];
        if (seen == (1 << JACK_COUNT) - 1) {
          for (uint8_t j = 0; j < JACK_COUNT; j++) jackPosition[j] = d[j];
          saveConfig();
          markDirty();
        }
      }
      break;
    case CMD_SET_CONFIG:
      if (n >= CONFIG_SIZE) {
        Config tmp;
        memcpy(&tmp, d, CONFIG_SIZE);
        if (validConfig(tmp)) { applyConfig(tmp); saveConfig(); }
        else markConfigDirty();   // send back what the box really has
      }
      break;
    case CMD_SET_TEMPO:
      if (n >= 2) {
        uint16_t b10 = ((uint16_t)d[0] << 7) | d[1];
        if (b10 >= BPM10_MIN && b10 <= BPM10_MAX) {
          applyTempo(b10 / 10.0);
          tempoArmed = false;   // the pot takes over once moved
          potRef = potValue;
        }
      }
      break;
    case CMD_TRANSPORT:
      if (n >= 1 && !menuActive) {
        switch (d[0]) {
          case 0: startTransport(); break;
          case 1: if (transport == PLAYING) stopTransport(false); else rewindTransport(); break;
          case 2: stopTransport(true); break;
          case 3: continueTransport(); break;
          case 4: rewindTransport(); break;
        }
      }
      break;
    case CMD_PRESET:
      if (n >= 2 && d[1] < PRESET_COUNT) {
        if (d[0] == 0) loadPreset(d[1]);
        else if (d[0] == 1) savePreset(d[1]);
        else if (d[0] == 2) { EEPROM.update(EEPROM_PRESETS + d[1] * PRESET_STRIDE, 0); markConfigDirty(); }
      }
      break;
  }
}

static void updateScreenLink() {
  while (Serial.available() > 0) {
    uint8_t c = Serial.read();
    if (c >= 0xF8) continue;               // real-time bytes may appear anywhere
    if (c == 0xF0) { rxInSysex = true; rxLength = 0; continue; }
    if (!rxInSysex) continue;
    if (c == 0xF7) { rxInSysex = false; handleCommand(); continue; }
    if (c & 0x80 || rxLength >= sizeof(rxBuffer)) { rxInSysex = false; continue; }
    rxBuffer[rxLength++] = c;
  }

  if (identifyJack >= 0 && (long)(millis() - identifyUntil) >= 0) {
    identifyJack = -1;
    markDirty();
  }

  if (!reporting) return;
  if (potDistance(potValue, lastReportedPot) >= REPORT_POT_STEP) markDirty();
  if (millis() - lastReportAt < REPORT_MIN_INTERVAL_MS) return;
  if (configDirty) sendConfig();
  if (stateDirty) sendState();
}

// ================================================================== menu ==

static void showMenuPage() {
  menuLedPreview = false;
  menuArmed = false;
  potRef = potValue;
  menuBlinkStart = millis();
  markDirty();
}

static void enterMenu() {
  menuPage = 0;
  menuPresetChosen = false;
  showMenuPage();
  menuActive = true;
}

static void nextMenuPage() {
  menuPage = (menuPage + 1) % MENU_PAGES;
  showMenuPage();
}

static void exitMenu() {
  menuActive = false;
  menuLedPreview = false;
  if (!(menuPresetChosen && loadPreset(menuPreset))) saveConfig();
  markConfigDirty();
  tempoArmed = false;  // keep the current tempo until the pot is moved
  potRef = potValue;
}

static uint8_t potZone(uint8_t zones, uint8_t current) {
  // pot split into zones, with a dead band around each boundary (keeps current)
  uint16_t zone = 1024 / zones, margin = 8;
  uint8_t candidate = potValue / zone;
  if (candidate >= zones) candidate = zones - 1;
  uint16_t offset = potValue - candidate * zone;
  return (offset > margin && offset < zone - margin) ? candidate : current;
}

static void updateMenu() {
  if (!menuArmed && potDistance(potValue, potRef) > POT_PICKUP) {
    menuArmed = true;
    markDirty();
  }
  uint32_t t = millis() - menuBlinkStart;
  uint32_t blinks = 200UL * (menuPage + 1);

  if (menuPage < JACK_COUNT) {
    if (menuArmed) {
      uint8_t idx = 0;
      for (uint8_t i = 0; i < MODE_COUNT; i++) if (POT_ORDER[i] == cfg.jackMode[menuPage]) idx = i;
      uint8_t mode = POT_ORDER[potZone(MODE_COUNT, idx)];
      if (mode != cfg.jackMode[menuPage]) {
        cfg.jackMode[menuPage] = mode;
        markConfigDirty();
      }
    }
    // LED: page number, then it shows the selected mode
    if (t < blinks + 500) {
      menuLedPreview = false;
      digitalWrite(LED_PIN, t < blinks && (t % 200) < 70);
    } else {
      menuLedPreview = true;
    }
  } else {
    if (menuArmed) {
      uint8_t p = potZone(PRESET_COUNT, menuPreset);
      if (p != menuPreset || !menuPresetChosen) {
        menuPreset = p;
        menuPresetChosen = true;
        markDirty();
      }
    }
    // LED: 4 blinks (page), then (preset number) slow blinks, repeated
    menuLedPreview = false;
    if (t < blinks + 500) {
      digitalWrite(LED_PIN, t < blinks && (t % 200) < 70);
    } else {
      uint32_t u = (t - blinks - 500) % (400UL * (menuPreset + 1) + 1000);
      digitalWrite(LED_PIN, menuPresetChosen && u < 400UL * (menuPreset + 1) && (u % 400) < 200);
    }
  }
}

// ================================================================ button ==

static void updateButton() {
  uint32_t now = millis();
  bool raw = digitalRead(BUTTON_PIN) == HIGH;
  if (raw != buttonLastRaw) {
    buttonLastRaw = raw;
    buttonChangedAt = now;
  }
  if (raw != buttonStable && now - buttonChangedAt >= DEBOUNCE_MS) {
    buttonStable = raw;
    markDirty();
    if (buttonStable) {                          // pressed
      if (identifyJack >= 0) identifyJack = -1;
      pressStartedAt = now;
      longPressDone = false;
      if (menuActive)                 pressAction = PRESS_MENU;
      else if (transport == PLAYING) { stopTransport(cfg.buttonPauses); pressAction = PRESS_NONE; }
      else if (transport == PAUSED)   pressAction = PRESS_PAUSED;
      else                            pressAction = PRESS_STOPPED;
    } else {                                     // released
      if (!longPressDone) {
        if (pressAction == PRESS_STOPPED)     startTransport();
        else if (pressAction == PRESS_PAUSED) continueTransport();
        else if (pressAction == PRESS_MENU)   nextMenuPage();
      }
      pressAction = PRESS_NONE;
    }
  }

  if (buttonStable && !longPressDone && now - pressStartedAt >= LONG_PRESS_MS) {
    if (pressAction == PRESS_STOPPED)     { enterMenu(); longPressDone = true; }
    else if (pressAction == PRESS_MENU)   { exitMenu(); longPressDone = true; }
    else if (pressAction == PRESS_PAUSED) { rewindTransport(); longPressDone = true; }
  }
}

// ============================================================= setup/loop ==

void setup() {
  Serial.begin(31250);  // MIDI
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  for (uint8_t j = 0; j < JACK_COUNT; j++) pinMode(JACK_PINS[j], OUTPUT);

  loadSettings();
  resetCounters(song);
  resetCounters(freeRun);

  potFiltered = (uint32_t)analogRead(POT_PIN) << 4;
  potValue = potFiltered >> 4;
  bpm = (float)(int)(potToBpm(potValue) + 0.5);

  uClock.init();
  uClock.setOutputPPQN(uClock.PPQN_96);
  uClock.setOnOutputPPQN(onClockTick);
  applyTempo(bpm);
  uClock.start();  // the clock always runs; "transport" is what the user sees
}

void loop() {
  readPot();
  updateButton();
  updateScreenLink();

  if (menuActive) {
    updateMenu();
    return;
  }

  if (!tempoArmed && potDistance(potValue, potRef) > POT_PICKUP) {
    tempoArmed = true;
    markDirty();
  }
  if (tempoArmed) {
    float target = potToBpm(potValue);
    if (fabs(target - bpm) >= BPM_HYSTERESIS) {
      float rounded = (float)(int)(target + 0.5);
      if (rounded < BPM_MIN) rounded = BPM_MIN;
      if (rounded > BPM_MAX) rounded = BPM_MAX;
      if (rounded != bpm) applyTempo(rounded);
    }
  }
}
