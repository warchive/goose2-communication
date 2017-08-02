/**
 * Created by ruslan on 02/08/17.
 */
'use strict';

// import dependencies
const NAV_PY = 'NAV.py';

// Use python shell
let PythonShell = require('python-shell');
let pyshell = new PythonShell(NAV_PY);

let a = ["{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760449,\"sensor\":\"gyro\",\"data\":[0.18375,-0.0875,-0.28,1],\"check\":12890}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760515,\"sensor\":\"gyro\",\"data\":[-0.09625,0.0875,0.21875,1],\"check\":12891}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760573,\"sensor\":\"gyro\",\"data\":[0.0525,-0.20125,-0.3675,1],\"check\":12892}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760630,\"sensor\":\"gyro\",\"data\":[0.18375,-0.13125,-0.1225,1],\"check\":12893}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760686,\"sensor\":\"gyro\",\"data\":[0,-0.2625,-0.02625,1],\"check\":12894}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760740,\"sensor\":\"gyro\",\"data\":[0.28,-0.5075,-0.88375,1],\"check\":12895}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760798,\"sensor\":\"gyro\",\"data\":[0.06125,-0.09625,0.30625,1],\"check\":12896}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760865,\"sensor\":\"gyro\",\"data\":[0.14875,-0.07,0.07,1],\"check\":12897}\r","{\"time\":760921,\"sensor\":\"gyro\",\"data\":[-0.035,-0.13125,0.1225,1],\"check\":12898}\r","{\"time\":760921,\"sensor\":\"gyro\",\"data\":[-0.035,-0.13125,0.1225,1],\"check\":12898}\r","{\"time\":760921,\"sensor\":\"gyro\",\"data\":[-0.035,-0.13125,0.1225,1],\"check\":12898}\r","{\"time\":760921,\"sensor\":\"gyro\",\"data\":[-0.035,-0.13125,0.1225,1],\"check\":12898}\r",];
let arr = [];

for (let i = 0; i < a.length; i++) {
    arr.push(JSON.parse(a[i]));
}

pyshell.send(JSON.stringify({to_parse: arr}));

pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
});

// end the input stream and allow the process to exit
pyshell.end(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("success");
    }
});
