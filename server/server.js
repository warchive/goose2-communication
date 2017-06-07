'use strict';

var express = require('express');  //web server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);	//web socket server

// ===============================Serial port setup========================
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = new SerialPort("/dev/ttyACM0", { // if you get an error that this file does not exist,
    // make sure that you plug in the arduino via a serial port first. That will create the file in rpi
    baudrate: 9600,
    parser: parsers.readline('\r\n')
});

// ===============================Server Setup===========================
const netPort = 8002;
server.listen(netPort); // start the web server on port 8080
app.use(express.static('public')); // we don't need this unless we want to serve some static content from rpi
console.log("listening on port:" + netPort);

// ==============================Sending data======================
io.sockets.on('connection', function (socket) {
    socket.emit('pi', { status: 'opened' });

    port.on('data', function(data) { // triggered every time there is data coming from the serial port
        socket.emit('pi', {val: data}); // this is what actually sensor reading messages through the websocket
        // by specifying 'pi', i'm obligates to listen to pi events ont he client side
    });

    console.log('Socket is open'); // log to console, once serial connection is established
});
