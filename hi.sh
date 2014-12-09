osascript -e 'quit app "CHROME"';
sleep 1;
echo '------------------------------';

echo 'Opening audio sync interface.';
echo '------------------------------';
cd SYNC; open SYNCRONIZATION-CLIENT.html;

echo 'Opening client access point.'
echo '------------------------------';
cd ..; cd AUDIENCE; open AUDIENCE-CLIENT.html;

echo 'Starting main server.';
echo '------------------------------';
cd ..; node SERVER.js;
