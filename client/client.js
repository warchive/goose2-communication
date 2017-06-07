var socket = require('socket.io-client')('http://192.168.1.142:8002'); // ip will probably change all the time
// on the rpi. Will have to hard code it at some point
// TODO: give a static ip address to rpi

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

