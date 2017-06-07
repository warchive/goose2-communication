var socket = require('socket.io-client')('http://192.168.1.142:8002');

socket.on('connect', function(){
    console.log("connected");
});
socket.on('event', function(data){
    console.log(data);
});

socket.on('pi', function(data){
    console.log(data);
});

socket.on('disconnect', function(){
    console.log("disconnected");
});

