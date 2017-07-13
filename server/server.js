'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const SimpleNodeLogger = require('simple-node-logger');
const serialport = require('serialport');
const util = require('util');
const fs = require('fs');

var dataLog = [];
var connectCounter = 0;
var RAW_OUT = false;

// Logger
const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath:'blackbox.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

// Serial port setup
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = getNewPort();

port.on('open', function () {console.log("Open Serial Port");});

// Server Setup
const netPort = 8002;
server.listen(netPort);
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

    socket.on('ping', function(data) {
	    socket.emit('ping', data);
    });

    socket.on('save', function(data) {
        writer(dataLog);
        log.info("save triggered from client");
	    socket.emit("saved file");
    });

    socket.on('restart_S', function(data) {
        port = getNewPort();
    });

    socket.on('s_save', function() {RAW_OUT = true;});
    socket.on('e_save', function() {RAW_OUT = false;});

    port.on('data', function(data) {
        // console.log(data);
        socket.emit('pi', data);
        if (RAW_OUT) {dataLog.push({val: data});}
    });

    log.info('Socket is open');
    console.log('Socket is open');
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

function getNewPort() {
    return new SerialPort("/dev/ttyACM0", {
        baudrate: 115200,
        parser: parsers.readline('\n')
    });
}




