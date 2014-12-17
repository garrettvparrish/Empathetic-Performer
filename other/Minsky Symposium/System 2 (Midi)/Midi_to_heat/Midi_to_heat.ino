void setup() {
      Serial.begin(250000);
      Serial.print("\n\nHello, I just rebooted\n\n");
      pinMode(11, OUTPUT);
      pinMode(10, OUTPUT);
}

char delimiter = '$';
String inString = "";

void loop() {
  // Read serial input:
  while (Serial.available() > 0) {
    int inChar = Serial.read();
    if (isDigit(inChar)) {
      // convert the incoming byte to a char 
      // and add it to the string:
      inString += (char)inChar; 
    }
    // if you get a newline, print the string,
    // then the string's value:
    if (inChar == delimiter) {
      Serial.print("Value:");
      Serial.println(inString.toInt());
      
      // Map this to the controller on the two thermoelectric pieces
      int temperatureValue = inString.toInt();
      analogWrite(11, temperatureValue);
      analogWrite(10, temperatureValue);
      inString = ""; 
    }
  }
}
