void setup() {
      Serial.begin(250000);
      Serial.print("\n\nHello, I just rebooted\n\n");
      pinMode(13, OUTPUT);
}

char delimiter = '$';
int count = 0;

void loop() {
        uint8_t incomingByte;
        // send data only when you receive data:
	if (Serial.available() > 0) {
		// read the incoming byte:
		incomingByte = Serial.read();
                
//                message[count] = incomingByte;
                
                int val = incomingByte;
                if (val == delimiter) {
                  Serial.write("RECEIVED");
                  digitalWrite(13, HIGH);                 
                } else {
                  digitalWrite(13, LOW);
                }

		// say what you got with both the ASCII and decimal representations
		Serial.write("I received: ");
		Serial.write(incomingByte);
	}
}
