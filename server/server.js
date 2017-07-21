'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const SimpleNodeLogger = require('simple-node-logger');
const serialport = require('serialport');
const util = require('util');
const fs = require('fs');
const BUFFER = 500;

var dataLog = [];
var connectCounter = 0;
var RAW_OUT = false;
var timer = null;

// Logger
const log = SimpleNodeLogger.createSimpleLogger({
    logFilePath:'blackbox.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

// Serial port setup
var SerialPort = serialport.SerialPort;
var parsers = serialport.parsers;

var port = getNewPort();

port.on('open', function () {
    console.log("Open Serial Port");
});

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
        } else {
            socket.emit('message', JSON.stringify({time: 0, message: "client count: " + connectCounter}));
        }
    });

    socket.on('control', function(data) {
        var parsed = JSON.parse(data);
        console.log(parsed);

        port.write(data, function(err) {
            if (err) {
                log.error('Failed to send data over serial port: ', err.message, ' data: ', data);
                socket.emit('message', JSON.stringify({time: 0, message: "cmd FAILED: " + data.toString()}));
            } else {
                log.info('Successful cmd: ', data);
                socket.emit('message', JSON.stringify({time: 0, message: "cmd SUCCESSFUL: " + data.toString()}));
                console.log(data);
            }
        });

        if (parsed.cmd === 'connect') {
            if (timer !== null) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                port.write(JSON.stringify({cmd: "check", val:[1]}));
            }, 400);
        }
    });


    socket.on('trigger_save', function() {
        writer(dataLog);
        log.info("save triggered from client");
        socket.emit('message', JSON.stringify({time: 0, message: "saved raw out file"}));
    });

    socket.on('save', function(data) {
        if (data === 1) {
            RAW_OUT = true;
            console.log("started writing data to a file");
            socket.emit('message', JSON.stringify({time: 0, message: "started writing data to a file"}));
        } else {
            RAW_OUT = false;
            console.log("stopped writing data to a file");
            socket.emit('message', JSON.stringify({time: 0, message: "stopped writing data to a file"}));
        }
    });

    port.on('data', function(data) {
        console.log("with <3 from arduino: " + data);

        var obj = JSON.parse(data);
        try {
            if(obj.hasOwnProperty('received')){
                obj.received = JSON.parse(obj.received);
                socket.emit('command_received', JSON.stringify(obj));
            } else if (obj.hasOwnProperty('sensor')) {
                socket.emit('sensor', data);
            } else {
                socket.emit('message', data);
            }
        } catch (e){
            console.log(e);
        }

        if (RAW_OUT) {
            dataLog.push(data);
            if (dataLog.length === BUFFER) {
                console.log("saved 500 lines into a file");
                socket.emit('message', JSON.stringify({time: 0, message: "saved 500 lines to raw out"}));
                writer(dataLog);
                dataLog = [];
            }
        }
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




