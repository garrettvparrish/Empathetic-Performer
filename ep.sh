osascript -e 'quit app "CHROME"';
sleep 1;
echo '------------------------------';

echo 'Opening Production Control.';
echo '------------------------------';
cd production; open ProductionControl.html; cd ..;

echo 'Opening Audience Visuals.'
echo '------------------------------';
cd audience; open http://localhost:8888/;

# open http://www.websocket.org/echo.html;
# open http://whatismyipaddress.com/;

echo 'Starting Empathetic Performer.';
echo '------------------------------';
cd ..; node EmpatheticPerformer.js;
