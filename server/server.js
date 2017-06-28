'use strict';

const express = require('express');  //web server
const readLine = require('readline');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);	//web socket server
const SimpleNodeLogger = require('simple-node-logger'); // create a custom timestamp format for log statements
const fileWriter = require('./fileWriter.js');
const serialport = require('serialport');

var dataLog = [];
var connectCounter = 0;

// Set up cli
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Logger
const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath:'blackbox.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

// Serial port setup
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = new SerialPort("/dev/ttyACM0", { // if you get an error that this file does not exist,
    // make sure that you plug in the Arduino via a serial port first. That will create the file in rpi
    baudrate: 115200,
    parser: parsers.readline('\r\n')
});

// Server Setup
const netPort = 8002;
server.listen(netPort); // start the web server on port 8080
console.log("listening on port:" + netPort);


// Listeners
io.sockets.on('connect', function() { connectCounter++; });
io.sockets.on('disconnect', function() {
    connectCounter--;
    if (connectCounter === 0) {
        saveData();
    }
});

io.sockets.on('connection', function (socket) {
    log.info('Client count: ' + connectCounter);

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
        socket.broadcast.emit('pi', data); // this is what actually sensor reading messages through the websocket
        dataLog.push({val: data});
        // by specifying 'pi', i'm obligated to listen to pi events ont he client side
    });

    console.log('Socket is open'); // log to console, once serial connection is established
});


rl.on('line', function (input)  {
    if (input === 'save') {
        saveData();
    } else {
        console.log("Command is not supported");
    }
});


function saveData() {
    fileWriter.writeFile(JSON.stringify({data: dataLog}), function (result) {
        if (result) {
            console.log("Data saved into a file");
            dataLog = [];
        } else {
            console.log(result);
        }
    });
}



