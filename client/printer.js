/**
 * Purely a helper script to run in a separate shell and monitor data flow
 * run with "node printer.js" once the printer is connected you will see a message "connected"
 *
 * Prints all data sent over web-socket: messages and sensors
 */

const socket = require('socket.io-client')('http://192.168.1.142:8002'); // ip will probably change all the time

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
	
	let parsed = JSON.parse(data);

    if (parsed.sensor === 'start') {
        console.log("arduino connected");
    }
});
