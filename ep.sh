echo '------------------------------';
echo '[Empathetic Performer - Build] Quitting chrome if open.';
osascript -e 'quit app "CHROME"';
sleep 1;
echo '------------------------------';

echo '[Empathetic Performer - Build] Compiling soy templates';
echo '------------------------------';
cd production/soy; java -jar SoyToJsSrcCompiler.jar --outputPathFormat '{INPUT_FILE_NAME_NO_EXT}.js' --srcs templates.soy;

echo '[Empathetic Performer - Build] Opening Production Control.';
echo '------------------------------';
cd ..; open ProductionControl.html; cd ..;

echo '[Empathetic Performer - Build] Opening Audience Visuals.'
echo '------------------------------';
cd audience; open http://localhost:8888/;

echo '[Empathetic Performer - Build] Starting Empathetic Performer.';
echo '------------------------------';
cd ..; node EmpatheticPerformer.js;
