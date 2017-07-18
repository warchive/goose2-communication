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

# Communication format

* Only certain commands and certain types of data is sent through the communication pipeline
* Find information about it [here](http://htmlpreview.github.io/?https://github.com/teamwaterloop/communication-system/blob/master/communication_format.html)
