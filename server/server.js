'use strict';

// import settings
const CONFIG = require('./config.js');

// import dependencies
const express = require('express');
const SimpleNodeLogger = require('simple-node-logger');
const serialport = require('serialport');
const util = require('util');
const fs = require('fs');
const H = require('./helpers/helpers.js');
//const PythonShell = require('python-shell');

let dataLog = [];
let connectCounter = 0;
let RAW_OUT = true;
const RAW_FILE = H.getFilename();
let timer = null;

// Setup server
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// Logger
const log = SimpleNodeLogger.createSimpleLogger(CONFIG.SIMPLE_LOGGER);

// Serial port setup
let SerialPort = serialport.SerialPort;
let parsers = serialport.parsers;
let port = getNewPort();

port.on('open', function () {
    port.flush(function () {
        console.log("Open Serial Port");
    });
});

// Server Setup
server.listen(CONFIG.PORT);
console.log("listening on port:" + CONFIG.PORT);

// Python setup
//let pyshell = new PythonShell(CONFIG.NAV_PY);
//let py_accel = [], py_gyro = [], py_mag = [];

// Listeners
io.sockets.on('connection', function (socket) {
    log.info('Client count: ' + ++connectCounter);

    socket.on('disconnect', function () {
        log.info('Client count: ' + --connectCounter);
        if (connectCounter === 0) {
            H.writer(RAW_FILE, dataLog, fs);
        } else {
            socket.emit('message', JSON.stringify({
                time: 0,
                message: "client count: " + connectCounter
            }));
        }
    });

    socket.on('control', function (data) {
        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            console.error("JSON parsing error on socket control");
            return;
        }
        console.log(parsed);

        port.write(data, function (err) {
            if (err) {
                log.error('Failed to send data over serial port: ', err.message, ' data: ', data);
                socket.emit('message', JSON.stringify({
                    time: 0,
                    message: "cmd FAILED: " + data.toString()
                }));
            } else {
                log.info('Successful cmd: ', data);
                socket.emit('message', JSON.stringify({
                    time: 0,
                    message: "cmd SUCCESSFUL: " + data.toString()
                }));
                console.log(data);
            }
        });

        if (parsed.cmd === 'connect') {
            if (timer !== null) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                port.write(JSON.stringify({
                    cmd: "check",
                    val: [1]
                }));
            }, CONFIG.CHECK_DELAY);
        }
    });


    socket.on('trigger_save', function () {
        H.writer(RAW_FILE, dataLog, fs);
        log.info("save triggered from client");
        socket.emit('message', JSON.stringify({
            time: 0,
            message: "saved raw out file"
        }));
    });

    socket.on('save', function (data) {
        if (data === 1) {
            RAW_OUT = true;
            console.log("started writing data to a file");
            socket.emit('message', JSON.stringify({
                time: 0,
                message: "started writing data to a file"
            }));
        } else {
            RAW_OUT = false;
            console.log("stopped writing data to a file");
            socket.emit('message', JSON.stringify({
                time: 0,
                message: "stopped writing data to a file"
            }));
        }
    });

    port.on('data', function (data) {
        // console.log("with <3 from arduino: " + data);

        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            console.error("JSON parsing error on port data");
            return;
        }

        if (parsed.type === "sensors") {
            socket.emit("sensors", data)
        } else if (parsed.type === "state") {
            socket.emit("state", data)
        } else if (parsed.type === "message") {
            socket.emit("message", data)
        }

        if (RAW_OUT) {
            dataLog.push(data);
            if (dataLog.length === CONFIG.RAW_OUT_BUFF) {
                console.log("saved " + CONFIG.RAW_OUT_BUFF + " lines into a file");
                socket.emit('message', JSON.stringify({
                    time: 0,
                    message: "saved " + CONFIG.RAW_OUT_BUFF + " lines to raw out"
                }));
                H.writer(RAW_FILE, dataLog, fs);
                dataLog = [];
            }
        }
    });

    //pyshell.on('message', function (out) {
    // received a message sent from the Python script (a simple "print" statement)
    //    let parsed = JSON.parse(out);
    //    for (let i = 0; i < out.parsed.length; i++) {
    //        socket.emit('sensor', JSON.stringify(parsed[i]));
    //    }
    //});

    log.info('Socket is open');
    console.log('Socket is open');
});

function getNewPort() {
    return new SerialPort(CONFIG.AR_FOLDER_DIR, {
        baudrate: CONFIG.AR_BITRATE,
        parser: parsers.readline('\n')
    });
}
