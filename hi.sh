osascript -e 'quit app "CHROME"';
sleep 1;
echo '------------------------------';

echo 'Opening audio sync interface.';
echo '------------------------------';
cd SYNC; open SYNCRONIZATION-CLIENT.html;

echo 'Opening client access point.'
echo '------------------------------';
cd ..; cd AUDIENCE; open http://localhost:8888/;

open http://www.websocket.org/echo.html;
open http://whatismyipaddress.com/;

echo 'Starting main server.';
echo '------------------------------';
cd ..; node SERVER.js;
