#include <Adafruit_NeoPixel.h>

#define STRIP1 10
#define STRIP2 11
#define STRIP_LENGTH 20

Adafruit_NeoPixel strip1 = Adafruit_NeoPixel(STRIP_LENGTH, STRIP1, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2 = Adafruit_NeoPixel(STRIP_LENGTH, STRIP2, NEO_GRB + NEO_KHZ800);

uint32_t OFF = strip1.Color(0,0,0);
uint32_t RED = strip1.Color(255, 0, 0);
uint32_t CURRENT_COLOR = strip1.Color(255,0,0);

void setup() {
  Serial.begin(250000);
  Serial.print("\n Accerlometer to LED \n\n");

  // Turn strips on
  strip1.begin();
  strip1.show();
  strip2.begin();
  strip2.show();
}

boolean ha = true;
void loop() {

  // Read serial input:
  while (Serial.available() > 0) {
    int inChar = Serial.read();

    int x = Serial.parseInt();
    int z = Serial.parseInt();
    int n = Serial.parseInt();
    if ((char)inChar == '$') {
      // send to strip 2
      if (n == 0) {
        Serial.println(0);
        // x to lit LED
        int toLight = floor(map(x, 0, 100, 0, 19));
        for (uint16_t i = 0; i < strip1.numPixels(); i++) {
          if (i == toLight) {
            strip1.setPixelColor(i-1, RED);
            strip1.setPixelColor(i, RED);
            strip1.setPixelColor(i+1, RED);
          } else if (i != toLight + 1 || i != toLight - 1) {
            strip1.setPixelColor(i-1, OFF);        
            strip1.setPixelColor(i, OFF);        
            strip1.setPixelColor(i+1, OFF);        
          }
        }
        // z --> brightness        
        strip1.setBrightness(map(z,0, 100, 0, 255));
        strip1.show();

      // send to strip 1
      } else {
        Serial.println(1);
        int toLight = floor(map(x, 0, 100, 0, 19));
        for (uint16_t i = 0; i < strip2.numPixels(); i++) {
          if (i == toLight) {
            strip2.setPixelColor(i-1, RED);
            strip2.setPixelColor(i, RED);
            strip2.setPixelColor(i+1, RED);
          } else if (i != toLight + 1 || i != toLight - 1) {
            strip2.setPixelColor(i-1, OFF);        
            strip2.setPixelColor(i, OFF);        
            strip2.setPixelColor(i+1, OFF);        
          }
        }
        strip2.setBrightness(map(z,0, 100, 0, 255));
        strip2.show();        
      }

    }
  }
}
