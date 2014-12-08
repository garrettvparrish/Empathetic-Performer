#include <Adafruit_NeoPixel.h>

#define STRIP1 9
#define STRIP2 10

Adafruit_NeoPixel strip1 = Adafruit_NeoPixel(20, STRIP1, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2 = Adafruit_NeoPixel(20, STRIP2, NEO_GRB + NEO_KHZ800);

uint32_t OFF = strip1.Color(0,0,0);
uint32_t RED = strip1.Color(255, 0, 0);
uint32_t CURRENT_COLOR = strip1.Color(255,255,255);

void setup() {
  Serial.begin(9600);
  strip1.begin();
  strip1.show();

  strip2.begin();
  strip2.show();
  
  pinMode(A0, INPUT);
}

boolean alternateChecker;
int checkerDelay;
int pingCount = 0;
boolean pingUp = true;
boolean pingDown = false;
int pingDelay;

void loop() {
    int protoBit = 100;
    Serial.println("Ping:");
       
    int pingRemainder = pingCount % strip1.numPixels();
    int numToTurnOn = 0;
    if (pingUp) {
      numToTurnOn = pingRemainder;
    } else if (pingDown) {
      numToTurnOn = strip1.numPixels() - pingRemainder;
    }
    
    for (uint16_t i = 0; i < strip1.numPixels(); i++) {
      if (i == numToTurnOn) {
        strip1.setPixelColor(i, CURRENT_COLOR);
      } else {
        strip1.setPixelColor(i, OFF);
      }
    }
    
    int maxPingDelay = 1000 / strip1.numPixels();
    int minPingDelay = 50 / strip1.numPixels();
    
    pingDelay = ((protoBit / 255.0) * (maxPingDelay - minPingDelay)) + (minPingDelay / strip1.numPixels());
    delay(pingDelay);
    strip1.show();
    pingCount++;

    if (pingRemainder == strip1.numPixels()-1) {
      pingUp = !pingUp;
      pingDown = !pingDown;
    }

  //  ping(strip1, 100);
//  checker(strip2, 100);
}

void brightness(Adafruit_NeoPixel strip1, int protoBit) {
    Serial.println("Brightness:");
    
    for (uint16_t i = 0; i < strip1.numPixels(); i++) {
      strip1.setPixelColor((strip1.numPixels() - i), CURRENT_COLOR);
    }
    strip1.setBrightness(protoBit);
    strip1.show();
}

void checker(Adafruit_NeoPixel strip1, int protoBit) {
    for (uint16_t i = 0; i < strip1.numPixels(); i++) {
      int modResult = alternateChecker ? 1 : 0;
      if (i % 2 == modResult) {
        strip1.setPixelColor(i, CURRENT_COLOR);        
      } else {
        strip1.setPixelColor(i, OFF);
      }
    }
   
    int delayMax = 700;
    int delayMin = 50;
    alternateChecker = !alternateChecker;
    checkerDelay = ((protoBit / 255.0) * (delayMax - delayMin)) + delayMin;
    delay(checkerDelay);
    Serial.println(checkerDelay);
    strip1.show();
}

void color(Adafruit_NeoPixel strip1, int protoBit) {
      
    Serial.println("Color Spectrum:");
    
    byte WheelPos = protoBit;
    int r = 0;
    int g = 0;
    int b = 0;
    
    if(WheelPos < 85) {
      r = WheelPos * 3;
      g = 255 - WheelPos * 3;
      b = 0;
    } else if(WheelPos < 170) {
      WheelPos -= 85;
      r = 255 - WheelPos * 3;
      g = 0;
      b = WheelPos * 3;
    } else {
     WheelPos -= 170;
     r = 0;
     g = WheelPos * 3;
     b = 255 - WheelPos * 3;
    }
    CURRENT_COLOR = strip1.Color(r,g,b);
    for (uint16_t i = 0; i < strip1.numPixels(); i++) {
      strip1.setPixelColor(i, CURRENT_COLOR);
    }
    strip1.show();
  
}

void ping(Adafruit_NeoPixel strip1, int protoBit) {
    Serial.println("Ping:");
       
    int pingRemainder = pingCount % strip1.numPixels();
    int numToTurnOn = 0;
    if (pingUp) {
      numToTurnOn = pingRemainder;
    } else if (pingDown) {
      numToTurnOn = strip1.numPixels() - pingRemainder;
    }
    
    for (uint16_t i = 0; i < strip1.numPixels(); i++) {
      if (i == numToTurnOn) {
        strip1.setPixelColor(i, CURRENT_COLOR);
      } else {
        strip1.setPixelColor(i, OFF);
      }
    }
    
    int maxPingDelay = 1000 / strip1.numPixels();
    int minPingDelay = 50 / strip1.numPixels();
    
    pingDelay = ((protoBit / 255.0) * (maxPingDelay - minPingDelay)) + (minPingDelay / strip1.numPixels());
    delay(pingDelay);
    strip1.show();
    pingCount++;

    if (pingRemainder == strip1.numPixels()-1) {
      pingUp = !pingUp;
      pingDown = !pingDown;
    }

}


