/*
>> Pulse Sensor Digital Filter <<
This code is the library prototype for Pulse Sensor by Yury Gitman and Joel Murphy
    www.pulsesensor.com 
    >>> Pulse Sensor purple wire goes to Analog Pin 0 <<<
Pulse Sensor sample aquisition and processing happens in the background via Timer 1 interrupt. 1mS sample rate.
The following variables are automatically updated:
Pulse :     boolean that is true when a heartbeat is sensed then false in time with pin13 LED going out.
Signal :    int that holds the analog signal data straight from the sensor. updated every 1mS.
HRV  :      int that holds the time between the last two beats. 1mS resolution.
B  :        boolean that is made true whenever HRV is updated. User must reset.
BPM  :      int that holds the heart rate value. derived from averaging HRV every 10 pulses.
QS  :       boolean that is made true whenever BPM is updated. User must reset.
Scale  :    int that works abit like gain. use to change the amplitude of the digital filter output. useful range 12<>20 : high<>low default = 12
FSignal  :  int that holds the output of the digital filter/amplifier. updated every 1mS.

See the README for detailed information and known issues.
Code Version 0.6 by Joel Murphy  December 2011  Happy New Year! 
*/

long Hxv[4]; // these arrays are used in the digital filter
long Hyv[4]; // H for highpass, L for lowpass
long Lxv[4];
long Lyv[4];

unsigned long readings; // used to help normalize the signal
unsigned long peakTime; // used to time the start of the heart pulse
unsigned long lastPeakTime = 0;// used to find the time between beats
volatile int Peak;     // used to locate the highest point in positive phase of heart beat waveform
int rate;              // used to help determine pulse rate
volatile int BPM;      // used to hold the pulse rate
int offset = 0;        // used to normalize the raw data
int sampleCounter;     // used to determine pulse timing
int beatCounter = 1;   // used to keep track of pulses
volatile int Signal;   // holds the incoming raw data
int NSignal;           // holds the normalized signal 
volatile int FSignal;  // holds result of the bandpass filter
volatile int HRV;      // holds the time between beats
volatile int Scale = 13;  // used to scale the result of the digital filter. range 12<>20 : high<>low amplification
volatile int Fade = 0;

boolean first = true; // reminds us to seed the filter on the first go
volatile boolean Pulse = false;  // becomes true when there is a heart pulse
volatile boolean B = false;     // becomes true when there is a heart pulse
volatile boolean QS = false;      // becomes true when pulse rate is determined. every 20 pulses

int pulsePin = 5;  // pulse sensor purple wire connected to analog pin 0
int breathPin = 4;
int breathValue1 = 0;
int breathValue2 = 0;

int breathMapped = 0;

// Musician 2
int breathEmulator1 = 36;
int breathSensor2 = 5;

// Musician 1
int breathEmulator2 = 6;
int breathSensor1 = 4;

void setup(){

  // Musician 1
  pinMode(breathEmulator1, OUTPUT);
  pinMode(breathEmulator2, OUTPUT);
  pinMode(breathSensor1, INPUT);
  pinMode(breathSensor2, INPUT);
  
  Serial.begin(115200); // we agree to talk fast!
}

void loop() { 
  
  // black
  breathValue1 = analogRead(breathSensor2);
  
  // white
  breathValue2 = analogRead(breathSensor1);
  
  // Cap 
  breathValue2 = (breathValue2 < 250) ? 250 : breathValue2;
  breathValue2 = (breathValue2 > 300) ? 300 : breathValue2;
  
  breathValue1 = (breathValue1 < 250) ? 250 : breathValue1;
  breathValue1 = (breathValue1 > 300) ? 300 : breathValue1;  
  
  int val = map(breathValue1, 250, 300, 255, 0);
  Serial.print(breathValue1); Serial.println(val);
  
  int var = map(breathValue2, 240, 300, 255, 0);
  Serial.println(var);
  
  // write avg to breath
  analogWrite(6,val);
  analogWrite(10,var);
  delay(50);
}



