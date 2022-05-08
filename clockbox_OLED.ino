
#include <uClock.h>
#include <U8g2lib.h>
#include <Wire.h>
#define ANALOG_SYNC_RATIO 4

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

bool currentState = false;
bool currentSwitchState = false;
bool needsToSendMidiStart = false;

//my OLED addition (Marek Mach 7:54PM 7th May 2022)
uint8_t TickLinePos;
uint16_t TickLinePosMult;
uint32_t DisplayRefreshPMill;
uint32_t DisplayTickPMill;
bool TickDirection;
float TickAngle = -0.70 * PI;

const byte pinCount = 4;
byte digitalPinOut[pinCount] = {3, 5, 7, 9}; //Define analog clock outputs here

void clockOutput96PPQN(uint32_t* tick) {
  if (needsToSendMidiStart) {
    needsToSendMidiStart = false;
    Serial.write(0xFA);
  }
  Serial.write(0xF8);
}

void clockOutput32PPQN(uint32_t* tick) {
  if (currentState) {
    if ((*tick % ANALOG_SYNC_RATIO ) == 0) {
      sendDigitalOut(true);
    } else {
      sendDigitalOut(false);
    }
  }
}

void sendDigitalOut(bool state) {
  byte pinState = state ? HIGH : LOW;

  for (byte i = 0; i < pinCount; i++) {
    digitalWrite(digitalPinOut[i], pinState);
  }
}

void setup() {

  Serial.begin(31250);
  uClock.init();
  u8g2.begin();

  pinMode(2, INPUT);

  for (byte i = 0; i < pinCount; i++) {
    pinMode(digitalPinOut[i], OUTPUT);
  }


  uClock.init();

  uClock.setClock96PPQNOutput(clockOutput96PPQN);
  uClock.setClock32PPQNOutput(clockOutput32PPQN);
  uClock.setTempo(96);

  uClock.start();
}

void toggleStartStop() {
  if (currentState) {
    Serial.write(0xFC);
    sendDigitalOut(false);
    currentState = false;

  } else {
    uClock.stop();
    delay(20);
    currentState = true;
    needsToSendMidiStart = true;
    uClock.start();
  }
}

float FloatMap(float x, float in_min, float in_max, float out_min, float out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

void loop() {

  int tempoPot = analogRead(A0);

  float tempo = ((float)tempoPot / 1024.f) * 210.f + 30.f;

  uClock.setTempo(tempo);
  int switchState = digitalRead(2);

  if ((switchState == HIGH) && !currentSwitchState) {
    toggleStartStop();
    TickLinePosMult = 10; //reset the position of the tick arm
    currentSwitchState = true;
  }

  if (switchState == LOW) {
    currentSwitchState = false;
  }

  if (millis() - DisplayTickPMill > 50 && currentState) { //whole tick arm loop
    DisplayTickPMill = millis();

    TickLinePosMult += map(tempo, 30, 240, 42, 344);  //calculate, how much to add to the tick arm position in order to make it tick at the right speed
    if (TickDirection) TickAngle += FloatMap(tempo, 30, 240, -0.0133333 * PI, -0.1092063 * PI); //I've came back to this code ad reworked it so it looks better (making it look more like a metronome)
    else TickAngle += FloatMap(tempo, 30, 240, 0.0133333 * PI, 0.1092063 * PI); //again, aclculationg the step to take based on the tempo
    if (TickLinePosMult > 1260) { //reset if near end
      TickLinePosMult = 10;
      if (TickDirection) TickAngle = -0.70 * PI;
      TickDirection = !TickDirection; //flip tick arm direction flag
    }
  }

  if (millis() - DisplayRefreshPMill > 50) {  //render the OLED
    DisplayRefreshPMill = millis();
    u8g2.clearBuffer();          // clear the internal memory
    u8g2.drawRFrame(0, 0, 128, 28, 3);
    u8g2.drawLine((94*cos(TickAngle))+64, (94*sin(TickAngle))+96, (69*cos(TickAngle))+64, (69*sin(TickAngle))+96);  //a whole bunch of Polar to cartesian conversions
    u8g2.drawDisc((84*cos(TickAngle))+64, (84*sin(TickAngle))+96, 5, U8G2_DRAW_ALL);
    u8g2.setDrawColor(0);
    u8g2.drawBox(0, 28, 128, 35);
    u8g2.setDrawColor(1);
    u8g2.setFont(u8g2_font_fub35_tn); // choose a suitable font
    u8g2.setCursor(0, 64);
    u8g2.print(tempo);  // write something to the internal memory

    u8g2.sendBuffer();          // transfer internal memory to the display
  }
}
