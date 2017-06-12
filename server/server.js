'use strict';

const express = require('express');  //web server
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);	//web socket server
const SimpleNodeLogger = require('simple-node-logger'); // create a custom timestamp format for log statements
const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath:'blackbox.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

// ===============================Serial port setup========================
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = new SerialPort("/dev/ttyACM0", { // if you get an error that this file does not exist,
    // make sure that you plug in the Arduino via a serial port first. That will create the file in rpi
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
    log.info('Established connection');
    socket.emit('pi', {status: 'opened'});

    socket.on('control', function(data) {
        console.log(data);
        port.write('main screen turn on', function(err) {
            if (err) {
                log.error('Failed to send data over serial port: ', err.message, ' data: ', data);
            } else {
                log.info('Successful cmd: ', data);
            }
        });
    });

    port.on('data', function(data) { // triggered every time there is data coming from the serial port
        socket.emit('pi', {val: data}); // this is what actually sensor reading messages through the websocket
        // by specifying 'pi', i'm obligated to listen to pi events ont he client side
    });

    console.log('Socket is open'); // log to console, once serial connection is established
});
