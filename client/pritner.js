const socket = require('socket.io-client')('http://192.168.1.142:8002'); // ip will probably change all the time
const readLine = require('readline');

var counter = 0;
var firstCounter = 0;
const COUNTER_CHECK = 60;
var PRINT_RATE = false;

socket.on('connect', function() {
    console.log("connected");
});

socket.on('disconnect', function() {
    console.log("disconnected");
});

socket.on('message', function(data){
    console.log(JSON.parse(data).message);
});

socket.on('sensor', function(data) {
    console.log(data);

    if (parsed.sensor === 'start') {
        console.log("arduino connected");
    }
});
