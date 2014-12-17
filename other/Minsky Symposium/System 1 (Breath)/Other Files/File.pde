
void StartRecording(){
  countline = 0;
  countPeople = countPeople +1;
  String recT= CurTime();
  String NameFile="D"+recT +"P"+countPeople+".text";
  println(NameFile);
  output = createWriter(NameFile);
  output.println("recording starts at ,"+recT); // Write the coordinate to the file 
  On = true;
}



void StopRecording(){
  On = false;
  
  String recFT= CurTime();
  output.println("recording stops at ;"+recFT); // Write the coordinate to the file 
  output.flush(); // Writes the remaining data to the file
  output.close(); // Finishes the file
  println("IFFFFlushed");
  delay(100);
  //ComputeResult();
  
}

void StartPiece(){
  PieceOn = true;
}

void StopPiece(){
  PieceOn = false;
}


String CurTime(){
  String CurTime;
  int[] t = new int[6];
  t[0] = day();    // Values from 1 - 31
  t[1] = month();  // Values from 1 - 12
  t[2] = year();
  t[3] = second();  // Values from 0 - 59
  t[4] = minute();  // Values from 0 - 59
  t[5] = hour();    // Values from 0 - 23
  CurTime = join(nf(t, 0), ","); 
  return CurTime;
}
