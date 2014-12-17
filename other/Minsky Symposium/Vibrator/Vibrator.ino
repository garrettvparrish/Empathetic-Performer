

void setup() {
  pinMode(11 , OUTPUT); 
  Serial.begin(115200);
}

int count = 1;
boolean increasing = true;

void loop () {
  if (count < 120 && increasing) {
    count += 1;
  } else if (count > 0 && !increasing) {
    count -= 1;
  } else if (count == 120 || count == 0) {
    increasing = !increasing;
  }
  
  int pwm = map(count, 0, 120, 0, 255);
  Serial.println(pwm);
  analogWrite(11, pwm);
//  int val = analogRead(1);
//  Serial.println(val);
  delay(50);
}
