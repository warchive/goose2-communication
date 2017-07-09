const socket = require('socket.io-client')('http://192.168.1.143:8002'); // ip will probably change all the time
const readLine = require('readline');

var counter = 0;
var firstCounter = 0;
const COUNTER_CHECK = 60;
var PRINT_RATE = true;

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', function (input)  {
    if (input === 'test') {
        test();
    } else if (input === "save") {
        socket.emit('save', "");
    } else if (input === "ping") {
        var now = new Date();
        socket.emit('ping', JSON.stringify({mills: now.getMilliseconds()}));
    } else if (input === "bv on") {
        socket.emit('control', JSON.stringify({cmd: "spd", val: [1]}));
    } else if (input === "bv off") {
        socket.emit('control', JSON.stringify({cmd: "spd", val: [0]}));
    } else if (input === "show rate") {
        PRINT_RATE = true;
    } else if (input === "hide rate") {
        PRINT_RATE = false;
    } else {
        console.log("Command is not supported");
    }
});

socket.on('connect', function() {
    console.log("connected");
});

socket.on('event', function(data){
    console.log(data);
});

socket.on('ping', function(data){
    var parsed = JSON.stringify(data);
    var now = new Date();
    console.log("ping: " + (now.getMilliseconds() - parsed.mills) + "ms");
});

socket.on('pi', function(data) {
    var parsed = JSON.parse(data);

    if (parsed.sensor === 'gyro') {
        counter ++;
        printHB(parsed);
    }

    // {"time":"1009", "sensor":"imu", "data": [1, 2, 3], "check": 2}
});

socket.on('disconnect', function() {
    console.log("disconnected");
});

// this is how we write to the socket
// socket.emit('control', JSON.stringify({Command: "Autonomous", Value: [1]}));

function printHB(parsed) {
    if (counter === COUNTER_CHECK) {
        if (PRINT_RATE) {
            console.log("comm rate: " + (parsed.check - firstCounter) + "/" + COUNTER_CHECK);
        }
    }
    firstCounter = parsed.check;
    counter = 0;
}

function test() {
    const CHECK_VAL = 13;
    var checkSum = [];
    var ans = [];
    var rand = Math.floor(Math.random() * 5) + 1;

    for (var i = 0; i < rand; i++) {
        var num = getRand();
        checkSum.push(num);
        ans.push(num + CHECK_VAL);
    }
    socket.emit('checkSum', JSON.stringify({test: checkSum}));

    socket.on('answer', function(data) {
        var response = JSON.parse(data).ans;

        if (listComp(response, ans)) {
            console.log("Test Successful");
        } else {
            console.log("Test Failed: Sent-> " + ans.length + " packages, Received-> " + response.length);
        }
    });

}

function listComp (a, b) {
    return (a.length === b.length && a.every(function (u, i) {return u === b[i];}))
}

function getRand() {
    return Math.floor(Math.random() * 10) + 1;
}

