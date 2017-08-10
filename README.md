For the system to work, both the RPI and user laptop has to be located on the same network. Plug in the router into a wall outlet and connect to the network called `dd-wrt`

# Setup instructions Server
 - Clone the repo
 - Navigate to `/server`
 - Run `npm install` (make sure you have a working internet connection)
 - Run `node server.js` to run the server
 
Notes:
* Server automatically save all of the records from every launch when all the clients disconnect, or
* Force save by typing `save` while the server is running
    - The records from every launch are stored in `server/launch-records/timestamp.json`
* Additionally, the server logs all of the incoming commands
    - The log file is stored in `server/blackgox.log`
    
# Setup instructions Client
 - Clone the repo
 - Navigate to `/client`
 - Run `npm install` (make sure you have a working internet connection)
 - Run `node client.js` to run the server
 
# CLI commands
|        cmd     | description |
|:----------:|:-------------|
|    'ping'         |   run connection test |
|    'connect'      |   command to initiate arduino creates connection between RPI and Arduino |
|    'data stop'    |   start writing raw data to a file on pi                                 |
|    'data start'   |   stop writing raw data to a file on pi                                  | 
|    'data save'    |   manually save raw out file                                             |
|    'bv on'        |   turn ball valve on                                                     |
|    'bv off'       |   turn ball valve off                                                    |
|    'dpr on'       |   turn dpr on                                                            |
|    'dpr off'      |   turn dpr off                                                           |
|    'drive on'     |   turn emergency drive on                                                |
|    'drive off'    |   turn emergency drive off                                               |
|    'drop on'      |   turn emergency wheel release on                                        |
|    'drop off'     |   turn emergency wheel release off                                       |
|    'auto on'      |   enable autonomous mode                                                 |
|    'man on'       |   enable manual mode                                                     |
|    'start script' |   run off script                                                         |
|    'ar rests'     |   restart arduino and save states                                        |
|    'ar restus'    |   restart arduino and reset states                                       |
|    'brake on'     |   turn brake on                                                          |
|    'brake off'    |   turn brake off                                                         |
|    'emg on'       |   turn on emergency mode                                                 |
|    'emg off'      |   turn off emergency mode                                                |
|    'speed --50'   |   set speed (ex: to set speed to 50%, enter 'speed --50')                |


# Communication format

* Only certain commands and certain types of data is sent through the communication pipeline
* Find information about it [here](http://htmlpreview.github.io/?https://github.com/teamwaterloop/communication-system/blob/master/communication_format.html)

# IO data structure used in NAV.py:

* All heartbeat data are preserved throughout the processing

* `svr_process_monotype(json_arr, d_type)` does preliminary error correction on the input stream. Disabling this function will NOT affect other computations.

* `calc_lat_force(accel_arr)` takes an array of accelerometer data and calculates the force applied to the pod in x,y, and z directions. Return array has time in seconds and force in Newtons assuming 140kg for the weight of the pod.

* `calc_lin_velocity(accel_arr)` takes an array of accelerometer data and outputs acceleration in m/s^2. Return array has time in seconds and sensor type "lvel"

* `calc_lin_displacement(prev_disp, vel)` takes an array of previously computed displacements and velocities calculated in `calc_lin_velocity()`. The function outputs displacement in meters and time in seconds. Sensor type = "ldisp"

* `out_row_pitch_yaw()` should be disabled in the python script and directly computed on the arduino since yaw would require two input streams with synchronized time stamps.

* `calc_ang_velocity(gyro_arr)` outputs angular velocitiy in radians per second. The kvp for 'sensor' : sensor_type is unchanged.

* `optical(opt_json, prev_stats, counter)` takes in an array of optical sensor data in json format (which will come from RPi), an array of previously computed data, and a counter (both of which will be stored in the script). prev_stats has the format [time, displacement, velocity] and will be printed to stdout at the end of the main function call.
