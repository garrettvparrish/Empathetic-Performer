
/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  /* print the address pattern and the typetag of the received OscMessage */
    println("### received an osc message.");
   println(" addrpattern: "+theOscMessage.addrPattern());
   println(" typetag: "+theOscMessage.typetag());
  
  pattern = theOscMessage.addrPattern();
  println(" pattern: " + pattern);
  
  if (theOscMessage.get(0)  != null){
    OscArgument OA = theOscMessage.get(0);
    F = OA.floatValue(); 
  }
 

  if (pattern.equals("/VM/Start")){
   println("start programMMMMMMMMMMMMMMMMMMMMMMM" );
    StartRecording();
  } 
  
  if (pattern.equals("/VM/Stop")){
    println("stop programmN111111111111111111111" );
    println(countline);
    StopRecording();
    println("stop programmNN22222222222222222222" );
    println(countline);
  } 
  
  if (pattern.equals("/VM/StartPiece")){
   println("start PIECE33333333333333333333333" );
    StartPiece();
  } 
  
  if (pattern.equals("/VM/StopPiece")){
   println("stopPIECE444444444444444444444" );
    StopPiece();
  } 

}




