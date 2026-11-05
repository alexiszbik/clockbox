/*
 * clockbox - Arduino clock generator for electronic music instruments.
 * MIDI clock out + 3 analog clock/gate outputs + beat LED.
 *
 * Original project by Alexis Zbik (2020).
 * v2 (2026): one division/mode per jack, reset & run outputs, beat LED,
 * stable tempo, settings menu saved in EEPROM.
 *
 * Requires the uClock library v2.3.x by midilab: https://github.com/midilab/uClock
 * Target: Arduino Nano / Uno (ATmega328P).
 *
 * Controls
 *   Pot ............ tempo, 30 to 240 BPM
 *   Button, running  stop (immediately, on press)
 *   Button, stopped  short press = start (on release)
 *                    hold 1.5 s  = settings menu
 *   In the menu .... the LED blinks 1, 2 or 3 times quickly = which jack is edited,
 *                    then it blinks like that jack (= its selected mode).
 *                    The pot chooses the mode (move it a little to take over),
 *                    short press = next jack, hold 1.5 s = save and quit.
 *   LED ............ running: long flash on beat 1, short on beats 2-4. Stopped: off.
 *
 * Screen on a computer (https://dr-john-8bits.github.io/clockbox/ or site/index.html, Chrome/Edge over USB):
 *   The box stays silent until the page says hello. Then it reports its state
 *   (tempo, transport, pot, button, menu, jack modes) as SysEx when something
 *   changes, and accepts new jack modes from the page. See PROTOCOL below.
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
const float    BPM_MIN = 30.0;
const float    BPM_MAX = 240.0;
const float    BPM_HYSTERESIS = 0.7;  // pot must move this many BPM before tempo changes
const uint16_t POT_PICKUP = 32;       // pot travel (0..1023) needed to take over after the menu
const uint16_t POT_SAMPLE_MS = 5;

// ------------------------------------------------------------------ button --
const uint16_t DEBOUNCE_MS   = 25;
const uint16_t LONG_PRESS_MS = 1500;
const uint8_t  RESET_PULSE_MS = 10;

// ------------------------------------------------------------ output modes --
// Internal resolution is 96 ticks per quarter note, 384 per 4/4 bar.
enum Mode : uint8_t {
  MODE_24PPQN,   // 24 pulses per quarter (DIN sync, some drum machines)
  MODE_16TH,     // 4 pulses per quarter (most modular sequencers)
  MODE_8TH,      // 2 pulses per quarter (Volca / Pocket Operator sync)
  MODE_QUARTER,  // 1 pulse per quarter
  MODE_HALF,     // 1 pulse every 2 quarters
  MODE_BAR,      // 1 pulse per 4/4 bar
  MODE_RESET,    // 10 ms trigger just before the first clock, on start
  MODE_RUN,      // gate high while running
  MODE_COUNT
};
const uint16_t TICKS_PER_BAR = 384;
const uint16_t MODE_PERIOD[MODE_RESET] = {4, 24, 48, 96, 192, 384};  // in ticks, 50% duty

const uint8_t DEFAULT_MODES[JACK_COUNT] = {MODE_16TH, MODE_RESET, MODE_8TH};

// EEPROM layout: 'C' 'B' version modes[JACK_COUNT]
const uint8_t EEPROM_MAGIC0 = 'C', EEPROM_MAGIC1 = 'B', EEPROM_VERSION = 2;  // 2: jacks renumbered top to bottom

// ---------------------------------------------------------------- PROTOCOL --
// SysEx, manufacturer ID 0x7D (non-commercial), then 'C' 'B', a command, data.
//   computer -> box   F0 7D 43 42 10 F7            hello: start reporting, send state
//                     F0 7D 43 42 11 jack mode F7  set a jack mode (saved in EEPROM)
//                     F0 7D 43 42 12 jack F7       identify: only this jack pulses on
//                                                  every beat for 15 s (7F = stop)
//                     F0 7D 43 42 13 p0 p1 p2 F7   physical position of each jack
//                                                  (0 top, 1 middle, 2 bottom), saved
//   box -> computer   F0 7D 43 42 01 <state> F7    state, see sendState()
// The tempo, start/stop and beat position are also readable from the MIDI
// clock itself (F8 / FA / FC), which the computer receives on the same line.
const uint8_t FW_VERSION_MAJOR = 2, FW_VERSION_MINOR = 1;
const uint8_t SYSEX_ID = 0x7D, SYSEX_C = 'C', SYSEX_B = 'B';
const uint8_t CMD_STATE = 0x01, CMD_HELLO = 0x10, CMD_SET_MODE = 0x11,
              CMD_IDENTIFY = 0x12, CMD_SET_POSITIONS = 0x13;
const uint32_t IDENTIFY_MS = 15000;
const uint8_t  EEPROM_POSITIONS = 3 + JACK_COUNT;   // after the modes
const uint16_t REPORT_MIN_INTERVAL_MS = 30;
const uint8_t  REPORT_POT_STEP = 3;   // pot change (0..1023) worth reporting

// ------------------------------------------------- state shared with the ISR --
volatile bool    playing = false;
volatile bool    pendingStart = false;   // send MIDI Start right before the next clock
volatile bool    menuActive = false;
volatile uint8_t menuJack = 0;
volatile bool    menuLedPreview = false;  // LED copies the edited jack (after its number is shown)
volatile uint8_t jackMode[JACK_COUNT];
volatile int8_t  identifyJack = -1;       // >= 0: only this jack pulses (screen request)

// ------------------------------------------------------- loop-only state --
float    bpm = 120;
uint16_t potValue = 0;          // filtered, 0..1023
uint32_t potFiltered = 0;       // potValue << 4, exponential moving average
uint32_t lastPotSample = 0;
bool     tempoArmed = true;     // false right after the menu, until the pot moves
uint16_t potRef = 0;            // pot position when the pot was "frozen"
bool     menuArmed = false;

enum PressAction : uint8_t { PRESS_NONE, PRESS_STOPPED, PRESS_MENU };
bool     buttonStable = false;
bool     buttonLastRaw = false;
uint32_t buttonChangedAt = 0;
uint32_t pressStartedAt = 0;
PressAction pressAction = PRESS_NONE;
bool     longPressDone = false;
uint32_t menuBlinkStart = 0;

bool     reporting = false;     // a computer screen said hello
bool     stateDirty = false;
uint32_t lastReportAt = 0;
uint16_t lastReportedPot = 0;
uint32_t identifyUntil = 0;
uint8_t  jackPosition[JACK_COUNT] = {0, 1, 2};   // physical place, set from the screen
uint8_t  rxBuffer[12];
uint8_t  rxLength = 0;
bool     rxInSysex = false;

static void markDirty() { stateDirty = true; }

// ======================================================= clock (interrupt) ==

// Level of a jack for a given mode and position in the bar.
static bool jackLevel(uint8_t mode, uint16_t barTick, bool preview) {
  if (mode < MODE_RESET) {
    uint16_t period = MODE_PERIOD[mode];
    return (barTick % period) < (period / 2);
  }
  if (mode == MODE_RUN) return true;
  // MODE_RESET: the real pulse is sent by startTransport(); in the menu,
  // preview it as a short trigger once per bar.
  return preview && barTick < 2;
}

// Called by uClock 96 times per quarter note.
void onClockTick(uint32_t tick) {
  static uint16_t barTick = 0;
  barTick = (tick == 0) ? 0 : (barTick + 1 == TICKS_PER_BAR ? 0 : barTick + 1);

  // MIDI clock: 24 PPQN, sent all the time so that slaves follow the tempo.
  if ((barTick & 3) == 0) {
    if (pendingStart) {
      pendingStart = false;
      Serial.write(0xFA);
    }
    Serial.write(0xF8);
  }

  if (identifyJack >= 0) {
    // One pulse per beat on the requested jack only, mirrored on the LED.
    bool level = barTick % 96 < 48;
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      digitalWrite(JACK_PINS[j], (int8_t)j == identifyJack && level);
    }
    digitalWrite(LED_PIN, level);
    return;
  }

  if (menuActive) {
    // Preview the jack being edited, others silent. Once loop() has shown the
    // jack number, the LED mirrors the preview so the chosen mode is visible.
    bool level = jackLevel(jackMode[menuJack], barTick, true);
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      digitalWrite(JACK_PINS[j], j == menuJack && level);
    }
    if (menuLedPreview) digitalWrite(LED_PIN, level);
    return;
  }

  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    digitalWrite(JACK_PINS[j], playing && jackLevel(jackMode[j], barTick, false));
  }

  // LED: running = long flash on the downbeat, short flash on other beats.
  //      stopped = off.
  bool led = playing && (barTick < 24 || barTick % 96 < 6);
  digitalWrite(LED_PIN, led);
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

static void loadSettings() {
  bool valid = EEPROM.read(0) == EEPROM_MAGIC0 && EEPROM.read(1) == EEPROM_MAGIC1 &&
               EEPROM.read(2) == EEPROM_VERSION;
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    uint8_t m = EEPROM.read(3 + j);
    if (m >= MODE_COUNT) valid = false;
    jackMode[j] = m;
  }
  if (!valid) {
    for (uint8_t j = 0; j < JACK_COUNT; j++) jackMode[j] = DEFAULT_MODES[j];
  }

  // positions: must be a permutation of 0..JACK_COUNT-1
  uint8_t seen = 0;
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    uint8_t p = EEPROM.read(EEPROM_POSITIONS + j);
    if (p < JACK_COUNT) seen |= 1 << p;
    jackPosition[j] = p;
  }
  if (!valid || seen != (1 << JACK_COUNT) - 1) {
    for (uint8_t j = 0; j < JACK_COUNT; j++) jackPosition[j] = j;
  }
}

static void saveSettings() {
  EEPROM.update(0, EEPROM_MAGIC0);
  EEPROM.update(1, EEPROM_MAGIC1);
  EEPROM.update(2, EEPROM_VERSION);
  for (uint8_t j = 0; j < JACK_COUNT; j++) EEPROM.update(3 + j, jackMode[j]);
  for (uint8_t j = 0; j < JACK_COUNT; j++) EEPROM.update(EEPROM_POSITIONS + j, jackPosition[j]);
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

static void startTransport() {
  uClock.stop();   // freeze ticks so that the restart is clean, from tick 0
  bool reset = false;
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    if (jackMode[j] == MODE_RESET) {
      digitalWrite(JACK_PINS[j], HIGH);
      reset = true;
    }
  }
  if (reset) {
    delay(RESET_PULSE_MS);
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      if (jackMode[j] == MODE_RESET) digitalWrite(JACK_PINS[j], LOW);
    }
  }
  delay(2);        // let sequencers see the reset fall before the first clock
  pendingStart = true;
  playing = true;
  uClock.start();  // first tick: MIDI Start + Clock, every jack goes high together
  markDirty();
}

static void stopTransport() {
  playing = false;  // jacks and Run gate fall on the next tick
  noInterrupts();   // the ISR writes to Serial too
  Serial.write(0xFC);
  interrupts();
  markDirty();
}

// ========================================================= computer screen ==

static void sendState() {
  uint16_t b = (uint16_t)bpm;
  uint8_t msg[] = {
    0xF0, SYSEX_ID, SYSEX_C, SYSEX_B, CMD_STATE,
    FW_VERSION_MAJOR, FW_VERSION_MINOR,
    (uint8_t)(b >> 7), (uint8_t)(b & 0x7F),
    playing, menuActive, menuJack,
    jackMode[0], jackMode[1], jackMode[2],
    (uint8_t)(potValue >> 7), (uint8_t)(potValue & 0x7F),
    buttonStable, (uint8_t)pressAction, tempoArmed, menuArmed,
    (uint8_t)(identifyJack < 0 ? 0x7F : identifyJack),
    jackPosition[0], jackPosition[1], jackPosition[2],
    0xF7
  };
  // Never block: the clock interrupt also writes to Serial.
  if (Serial.availableForWrite() < (int)sizeof(msg)) return;
  noInterrupts();   // keep the message in one piece in the TX buffer
  for (uint8_t i = 0; i < sizeof(msg); i++) Serial.write(msg[i]);
  interrupts();
  stateDirty = false;
  lastReportAt = millis();
  lastReportedPot = potValue;
}

static void handleCommand() {
  // rxBuffer holds the bytes between F0 and F7
  if (rxLength < 4 || rxBuffer[0] != SYSEX_ID || rxBuffer[1] != SYSEX_C || rxBuffer[2] != SYSEX_B) return;
  switch (rxBuffer[3]) {
    case CMD_HELLO:
      reporting = true;
      markDirty();
      break;
    case CMD_SET_MODE:
      if (rxLength >= 6 && rxBuffer[4] < JACK_COUNT && rxBuffer[5] < MODE_COUNT) {
        jackMode[rxBuffer[4]] = rxBuffer[5];
        saveSettings();
        markDirty();
      }
      break;
    case CMD_IDENTIFY:
      if (rxLength >= 5) {
        if (rxBuffer[4] < JACK_COUNT && !playing && !menuActive) {
          identifyJack = rxBuffer[4];
          identifyUntil = millis() + IDENTIFY_MS;
        } else {
          identifyJack = -1;
        }
        markDirty();
      }
      break;
    case CMD_SET_POSITIONS:
      if (rxLength >= 4 + JACK_COUNT) {
        uint8_t seen = 0;
        for (uint8_t j = 0; j < JACK_COUNT; j++) {
          if (rxBuffer[4 + j] < JACK_COUNT) seen |= 1 << rxBuffer[4 + j];
        }
        if (seen == (1 << JACK_COUNT) - 1) {
          for (uint8_t j = 0; j < JACK_COUNT; j++) jackPosition[j] = rxBuffer[4 + j];
          saveSettings();
          markDirty();
        }
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
  if (stateDirty && millis() - lastReportAt >= REPORT_MIN_INTERVAL_MS) sendState();
}

// ================================================================== menu ==

static void enterMenu() {
  menuLedPreview = false;
  menuJack = 0;
  menuArmed = false;
  potRef = potValue;
  menuBlinkStart = millis();
  menuActive = true;
  markDirty();
}

static void nextMenuJack() {
  menuLedPreview = false;
  menuJack = (menuJack + 1) % JACK_COUNT;
  menuArmed = false;
  potRef = potValue;
  menuBlinkStart = millis();
  markDirty();
}

static void exitMenu() {
  menuActive = false;
  menuLedPreview = false;
  saveSettings();
  tempoArmed = false;  // keep the current tempo until the pot is moved
  potRef = potValue;
  markDirty();
}

static void updateMenu() {
  if (!menuArmed && potDistance(potValue, potRef) > POT_PICKUP) {
    menuArmed = true;
    markDirty();
  }
  if (menuArmed) {
    // pot split into MODE_COUNT zones, with a dead band around each boundary
    const uint16_t zone = 1024 / MODE_COUNT, margin = 10;
    uint8_t candidate = potValue / zone;
    if (candidate >= MODE_COUNT) candidate = MODE_COUNT - 1;
    uint16_t offset = potValue - candidate * zone;
    if (candidate != jackMode[menuJack] && offset > margin && offset < zone - margin) {
      jackMode[menuJack] = candidate;
      markDirty();
    }
  }

  // LED: first (jack number) quick blinks, then it shows the selected mode
  uint32_t t = millis() - menuBlinkStart;
  uint32_t blinks = 200UL * (menuJack + 1);
  if (t < blinks + 500) {
    menuLedPreview = false;
    digitalWrite(LED_PIN, t < blinks && (t % 200) < 70);
  } else {
    menuLedPreview = true;
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
    if (buttonStable) {                       // pressed
      if (identifyJack >= 0) identifyJack = -1;  // any press ends the identification
      pressStartedAt = now;
      longPressDone = false;
      if (menuActive) {
        pressAction = PRESS_MENU;
      } else if (playing) {
        stopTransport();                      // stop must be instant
        pressAction = PRESS_NONE;
      } else {
        pressAction = PRESS_STOPPED;
      }
    } else {                                  // released
      if (!longPressDone) {
        if (pressAction == PRESS_STOPPED) startTransport();
        else if (pressAction == PRESS_MENU) nextMenuJack();
      }
      pressAction = PRESS_NONE;
    }
  }

  if (buttonStable && !longPressDone && now - pressStartedAt >= LONG_PRESS_MS) {
    if (pressAction == PRESS_STOPPED) {
      enterMenu();
      longPressDone = true;
    } else if (pressAction == PRESS_MENU) {
      exitMenu();
      longPressDone = true;
    }
  }
}

// ============================================================= setup/loop ==

void setup() {
  Serial.begin(31250);  // MIDI
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  for (uint8_t j = 0; j < JACK_COUNT; j++) pinMode(JACK_PINS[j], OUTPUT);

  loadSettings();

  potFiltered = (uint32_t)analogRead(POT_PIN) << 4;
  potValue = potFiltered >> 4;
  bpm = (float)(int)(potToBpm(potValue) + 0.5);

  uClock.init();
  uClock.setOutputPPQN(uClock.PPQN_96);
  uClock.setOnOutputPPQN(onClockTick);
  applyTempo(bpm);
  uClock.start();  // the clock always runs; "playing" is the transport state
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
