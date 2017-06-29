var socket = require('socket.io-client')('http://192.168.1.142:8002'); // ip will probably change all the time
const readLine = require('readline');

// Set up cli
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', function (input)  {
    if (input === 'test') {
        test();
    } else {
        console.log("Command is not supported");
    }
});

socket.on('connect', function(){
    console.log("connected");
});

socket.on('event', function(data){
    console.log(data);
});

socket.on('pi', function(data){ // so this is our main listener.
    // when we emit a message on the server side, we can specify what type of message it is
    // its called pi in this case, but can be anything else
    console.log(data);
});

socket.on('disconnect', function(){
    console.log("disconnected");
});

// this is how we write to the socket
socket.emit('control', JSON.stringify({Command: "Autonomous", Value: [1]}));


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

