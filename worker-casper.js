var exec = require('child_process').exec
    , net = require('net')
    , scheduleCounter = 0;

const command = 'casperjs --proxy-type=socks5 --proxy=127.0.0.1:9050 --ssl-protocol=any --ignore-ssl-errors=true traffic-bot.js';

function runPretenders(command) {
    attemptRenewTorSession(function (e, msg) {
        if (msg) {
            var process = exec(command);
            scheduleCounter++;
        } else {
            console.log(`attemptRenewTorSession false  :(  `, e);
        }
    });
}
setInterval(function () {
    runPretenders(command);
    console.log(`CasperJS  <HomoSapiensPretender/>  work:     << ${scheduleCounter} >>     times;`);
}, 1000);
setInterval(function () {
    console.log(`---restart node process---`);
    process.exit();
}, 180 * 1000);
//
//
// Функции смены IP:
//
//
function attemptRenewTorSession(done) {
    var password = "mypassword";
    var commands = [
        'authenticate "' + password + '"', // authenticate the connection
        'signal newnym', // send the signal (renew Tor session)
        'quit' // close the connection
    ];
    changeIPadress(commands, function (err, data) {
        if (err) {
            done(err);
        } else {
            var lines = data.split(require('os').EOL).slice(0, -1);
            var success = lines.every(function (val, ind, arr) {
                return val.length <= 0 || val.indexOf('250') >= 0;
            });
            if (!success) {
                done(new Error('Error communicating with Tor ControlPort\n' + data));
            } else {
                done(null, "Tor session successfully renewed!!");
            }
        }
    });
}
//
function changeIPadress(commands, done) {
    var socket = net.connect({
        host: 'localhost',
        port: 9051
    }, function () {
        var commandString = commands.join('\n') + '\n';
        socket.write(commandString);
    });
    socket.on('error', function (err) {
        done(err || 'ControlPort communication error');
    });
    var data = "";
    socket.on('data', function (chunk) {
        data += chunk.toString();
    });
    socket.on('end', function () {
        //console.log('>>>>>>>>>>>>>>>>>>>>>>  CONGRATULATION!!!  changeIPadress success');
        done(null, data);
    });
}