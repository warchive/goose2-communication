'use strict';

const express = require('express');  //web server
const readLine = require('readline');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);	//web socket server
const SimpleNodeLogger = require('simple-node-logger'); // create a custom timestamp format for log statements
const serialport = require('serialport');
const util = require('util');
const fs = require('fs');

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

io.sockets.on('connection', function (socket) {
    log.info('Client count: ' + ++connectCounter);

    socket.on('disconnect', function() {
        log.info('Client count: ' + --connectCounter);
        if (connectCounter === 0) {
	    writer(dataLog);
        }
    });

    socket.on('checkSum', function(data) {
        const CHECK_VAL = 13;
        var parsed = JSON.parse(data);
        var test = parsed.test;
        var ans = [];

        for (var i = 0; i < test.length; i++) {
            ans.push(test[i] + CHECK_VAL);
        }

        socket.emit('answer', JSON.stringify({ans: ans}));
    });

    socket.on('control', function(data) {
        console.log(data);
        port.write(data, function(err) {
            if (err) {
                log.error('Failed to send data over serial port: ', err.message, ' data: ', data);
            } else {
                log.info('Successful cmd: ', data);
                console.log(data);
            }
        });
    });

    socket.on('save', function(data) {
        writer(dataLog);
        log.info("save triggered from client");
	socket.emit("saved file");
    });

    port.on('data', function(data) { // triggered every time there is data coming from the serial port
	console.log(data);
	socket.broadcast.emit('pi', data); // this is what actually sensor reading messages through the websocket
	dataLog.push({val: data});
	console.log(data);
    });

    log.info('Socket is open'); // log to console, once serial connection is established
    console.log('Socket is open'); // log to console, once serial connection is established
});


rl.on('line', function (input)  {
    if (input === 'save') {
        writer(dataLog);
    } else {
        console.log("Command is not supported");
    }
});


function writer (data) {
    var now = new Date(),
        d = now.getDate(),
        m = now.getMonth(),
        y = now.getFullYear(),
        h = now.getHours(),
        min = now.getMinutes(),
        sec = now.getSeconds(),
        mill = now.getMilliseconds(),
        filename = __dirname + util.format('/launch-records/%s_%s_%s_%s_%s_%s_%s.json', d, m , y, h, min, sec, mill);
	

    fs.writeFile(filename, JSON.stringify(data), function (err) {
        if (err) throw err;
        log.info('data saved in /launch-records/' + filename);
        console.log('data saved in /launch-records/' + filename);
    });
}




