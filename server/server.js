'use strict';

var express = require('express');  //web server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);	//web socket server

// ===============================Serial port setup========================
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = new SerialPort("/dev/ttyACM0", {
  	baudrate: 9600,
  	parser: parsers.readline('\r\n')
});

// ===============================Server Setup===========================
const netPort = 8002;
server.listen(netPort); //start the webserver on port 8080
app.use(express.static('public')); //tell the server that ./public/ contains the static webpages
console.log("listening on port:" + netPort);

// ==============================Sending data======================
io.sockets.on('connection', function (socket) {
  	socket.emit('pi', { status: 'opened' });
	port.on('data', function(data) {
		socket.emit('pi', {val: data});
	});  
	console.log('Socket is open'); // log to console, once serial connection is established
});
