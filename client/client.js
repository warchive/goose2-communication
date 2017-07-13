const socket = require('socket.io-client')('http://192.168.1.142:8002'); // ip will probably change all the time
const readLine = require('readline');

var counter = 0;
var firstCounter = 0;
const COUNTER_CHECK = 60;
var PRINT_RATE = false;

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

const cmds = {
    "test": function () {test();},
    "save data": function () {socket.emit('s_save', "");}, // to start saving
    "start data": function () {socket.emit('e_save', "");}, // to finish saving
    "bv on": function () {socket.emit('control', JSON.stringify({cmd: "bv", val: [1]}));},
    "bv off": function () {socket.emit('control', JSON.stringify({cmd: "bv", val: [0]}));},
    "dpr on": function () {socket.emit('control', JSON.stringify({cmd: "dpr", val: [0]}));},
    "dpr off": function () {socket.emit('control', JSON.stringify({cmd: "dpr", val: [1]}));},
    "start": function () {socket.emit('control', JSON.stringify({cmd: "scpt", val: [1]}));},
    "stop": function () {socket.emit('control', JSON.stringify({cmd: "scpt", val: [0]}));},
    "restart serial": function () {socket.emit('restart_s', "")}, // restarting serial port on Arduino
    "ping": function () {PRINT_RATE = true;}
};

rl.on('line', function (input)  {
    try {
        cmds[input]();
    }
    catch (e) {
        console.log("Command is not supported");
        console.log("Available commands: " + Object.keys(cmds));
    }
});

socket.on('connect', function() {
    console.log("connected");
});

socket.on('event', function(data){
    console.log(data);
});

socket.on('pi', function(data) {
    var parsed = JSON.parse(data);

    // console.log(data);

    if (parsed.sensor === 'gyro') {
        counter ++;
        printHB(parsed);
    }

    // {"time":"1009", "sensor":"imu", "data": [1, 2, 3], "check": 2}
});

socket.on('disconnect', function() {
    console.log("disconnected");
});

function printHB(parsed) {
    if (counter === COUNTER_CHECK) {
        if (PRINT_RATE) {
            console.log("comm rate: " + (parsed.check - firstCounter) + "/" + COUNTER_CHECK);
        }
        PRINT_RATE = false;
        firstCounter = parsed.check;
        counter = 0;
    }
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
}

function getRand() {
    return Math.floor(Math.random() * 10) + 1;
}

