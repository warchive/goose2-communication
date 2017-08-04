/*
spacexstatus.js

Purpose:
  Sends SpaceX data packets, as required in Section 5, "Communications", of the SpaceX Hyperloop Track Specification.
  This is based on version 11.0 of the SpaceX Hyperloop Track Specification, updated March 3, 2017.

Usage:
  require('./spacexstatus')(function(){
    // This getter function produces an object containing the following fields.
    // This function is called at 10Hz.
    // A suggestion is that they should probably be in a global Status object somewhere.
    // {
    //   status:      status, integer from 0-6
    //   accel:       acceleration in cm/s^2
    //   pos:         position in cm
    //   vel:         velocity in cm/s
    //   voltage:     battery voltage in mV
    //   current:     battery current in mA
    //   batttemp:    battery temperature in tenths of a degree Celsius
    //   podtemp:     pod temperature in tenths of a degree Celsius
    //   stripecount: number of stripes encountered so far
    // }
  });

Dependencies:
  Just a reasonably up-to-date version of NodeJS. 'dgram' is built in, and no other packages are required.

Contact:
  Clive Chan

Copyright (c) 2017 Team Waterloop
*/


/* VARIOUS CONFIG */

const SPACEXSTATUS_HOST = process.env.SPACEXSTATUS_HOST    || '192.168.0.1';
const SPACEXSTATUS_PORT = process.env.SPACEXSTATUS_PORT    || 3000;
const TEAM_ID =           process.env.SPACEXSTATUS_TEAM_ID || 123;

const sendFrequency = 10; // Hz. Cannot be higher than 10, no specified minimum.

const fields = [
  {name: "id",          type: "byte",   constant_value: TEAM_ID},
  {name: "status",      type: "byte"},
  {name: "accel",       type: "int32"},
  {name: "pos",         type: "int32"},
  {name: "vel",         type: "int32"},
  {name: "voltage",     type: "int32"},
  {name: "current",     type: "int32"},
  {name: "batttemp",    type: "int32"},
  {name: "podtemp",     type: "int32"},
  {name: "stripecount", type: "uint32"}
];

const octets = {
  "byte": 1,
  "int32": 4,
  "uint32": 4
};

const writers = {
  "byte": "writeUInt8",
  "int32": "writeInt32BE",
  "uint32": "writeUInt32BE"
};


/* HERE BE CODE */

const dgram = require('dgram');
const SpaceXStatus = dgram.createSocket('udp4').unref();

function typeCheck(value, type){
  switch(type){
    case "byte": return Number.isInteger(value) && value >= 0 && value < 256;
    case "int32": return Number.isInteger(value) && value >= -2147483648 && value < 2147483648;
    case "uint32": return Number.isInteger(value) && value >= 0 && value < 4294967296;
    default: return false;
  }
}

module.exports = function(getPodStatus){
  if(typeof getPodStatus != "function")
    throw new Error('SpaceXStatus: You need to pass in a getPodStatus function when starting the SpaceXStatus module!');

  // Retrieve the initial status and validate everything, potentially throwing errors everywhere.
  let status = getPodStatus();

  // Counting the total number of bytes that will be in the UDP datagram.
  let totalOctets = 0;

  // For each field we're expecting
  for(var i = 0; i < fields.length; i++){
    // Check that the field name and the field type are valid
    if(!fields[i].hasOwnProperty("name"))
      throw new Error('SpaceXStatus: Field ' + i + ' has no name');
    if(!fields[i].hasOwnProperty("type") || !octets.hasOwnProperty(fields[i].type) || !writers.hasOwnProperty(fields[i].type))
      throw new Error('SpaceXStatus: Field "' + fields[i].name + '" has no type');

    // Add to the byte count so far.
    totalOctets += octets[fields[i].type];

    // If a constant value is specified, check that it's valid
    if(fields[i].hasOwnProperty("constant_value")){
      if(!typeCheck(fields[i].constant_value, fields[i].type))
        throw new Error('SpaceXStatus: Field "' + fields[i].name + '" has an invalid constant_value');
    }
    // Otherwise check that the value returned in getPodStatus() is valid.
    else{
      if(!typeCheck(status[fields[i].name], fields[i].type))
        throw new Error('SpaceXStatus: Field "' + fields[i].name + '" retrieved an invalid getPodStatus() value');
    }
  }

  // Every set amount of time, send the updated status packet.
  // After surviving that initial validation above, avoid throwing errors at all during normal operation.

  setInterval(function(){
    try{
      // Allocate a buffer, which we're going to send raw over UDP.
      // Note that Buffers cannot be resized.
      let buf = Buffer.alloc(totalOctets);

      // Retrieve the current pod status.
      let status = getPodStatus();

      // Write all values to the buffer.
      let currentOffset = 0;
      for(var i = 0; i < fields.length; i++){
        // If it's a constant value, write it
        if(fields[i].hasOwnProperty("constant_value"))
          buf[writers[fields[i].type]](fields[i].constant_value, currentOffset);
        // Otherwise, write the value provided by getPodStatus.
        else
          buf[writers[fields[i].type]](status[fields[i].name], currentOffset);

        // Update the offset at which we are writing.
        currentOffset += octets[fields[i].type];
      }

      // Finally, send the packet to SpaceX.
      SpaceXStatus.send(buf, 0, buf.length, SPACEXSTATUS_PORT, SPACEXSTATUS_HOST, function(err){
        if(err)
          console.error('SpaceXStatus: Error in UDP send:', err);
      });
    }catch(e){
      console.error('SpaceXStatus: Exception:', e);
    }
  }, 1000 / sendFrequency);
};


if(process.env.NODE_ENV == "test"){
  const SpaceXReceiver = dgram.createSocket('udp4');
  SpaceXReceiver.on('message', (msg, remote) => {console.log(remote.address + ':' + remote.port + ' says ' + msg.toString("hex"));});
  SpaceXReceiver.bind(SPACEXSTATUS_PORT, SPACEXSTATUS_HOST);
  module.exports(function(){
    return {
      status: Math.floor(Math.random() * 256),
      accel: 1, pos: 2, vel: 3,
      voltage: 4, current: 5, batttemp: 6,
      podtemp: 7,
      stripecount: 8
    };
  });
}
