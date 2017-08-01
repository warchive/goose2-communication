# Script for navigation system with functions for position calculations
# Written by Rosie Zou, June 2017

import numpy as np
from sklearn.svm import SVR
import sys
import json

def SVR_process_monotype(JSONArray):
    try:
        DataType = JSONArray[0]["sensor"]
        size = len(JSONArray)
        x = []
        y = []
        z = []
        t = []
        heartbeat = []
        for count in range(size):
            x.append(JSONArray[count]["data"][0])
            y.append(JSONArray[count]["data"][1])
            z.append(JSONArray[count]["data"][2])
            heartbeat.append(JSONArray[count]["data"][3])
            t.append([float(JSONArray[count]["time"]/1000)])

        svr_rbf = SVR(kernel='rbf', C=0.2e2, gamma=0.2, verbose=False)
        x = np.array(x)
        y = np.array(y)
        z = np.array(z)
        x_rbf = svr_rbf.fit(t, x).predict(t)
        y_rbf = svr_rbf.fit(t, y).predict(t)
        z_rbf = svr_rbf.fit(t, z).predict(t)
        returnJSONArray = []
        count = 0
        while count < size:
            returnDict = {'time': t[count][0], 'sensor': DataType, 'data': [x_rbf[count], y_rbf[count], z_rbf[count], heartbeat[count]]}
            returnJSONObject = json.dump(returnDict)
            returnJSONArray.append(returnJSONObject)
            count += 1

        print(returnJSONArray)
        sys.stdout.flush()
        return returnJSONObject
    except(Exception):
        print(JSONArray)

def calcLateralForce(ACCELArray):
    data = SVR_process_monotype(ACCELArray)
    data = map(lambda x: x["data"][0] * 140, data)
    data = map(lambda x: x["data"][1] * 140, data)
    data = map(lambda x: x["data"][2] * 140, data)
    for i in range(len(data)):
        data[i]["sensor"] = "latf"
    print(data)
    return data


def calcLinearVelocity(ACCELArray):
    data = SVR_process_monotype(ACCELArray)
    DataType = data[0]["sensor"]
    if DataType != "accel":
        return "Accelerometer readings required"
    else:
        size = len(ACCELArray)
        x = []
        y = []
        z = []
        t = []
        xVel = []
        yVel = []
        zVel = []
        heartbeat = []
        for count in range(size):
            x.append(data[count]["data"][0]*9.80665)
            y.append(data[count]["data"][1]*9.80665)
            z.append(data[count]["data"][2]*9.80665)
            t.append((data[count]["time"]))
            heartbeat.append(data[count]["data"][3])

        xVel.append(0)
        yVel.append(0)
        zVel.append(0)
        count = 1
        while count < size:
            xVel.append((float)((x[count] - x[count - 1]) * (t[count] - t[count - 1])))
            yVel.append((float)((y[count] - y[count - 1]) * (t[count] - t[count - 1])))
            zVel.append((float)((z[count] - z[count - 1]) * (t[count] - t[count - 1])))
            count += 1

        returnJSONArray = []
        count = 0
        while count < size:
            returnDict = {'time': t[count], 'sensor': 'lvel',
                          'data': [xVel[count], yVel[count], zVel[count], heartbeat[count]]}
            returnJSONObject = json.dumps(returnDict)
            returnJSONArray.append(returnJSONObject)
            count += 1

        print(returnJSONArray)
        sys.stdout.flush()
        return returnJSONObject

def calcLinearDisplacement(ACCELArray, prevDisp):
    DataType = ACCELArray[0]["sensor"]
    if DataType != "accel":
        return "Accelerometer readings required"
    else:
        velocity = calcLinearVelocity(ACCELArray)
        size = len(velocity)
        xVel = map(lambda x: x["data"][0], velocity)
        yVel = map(lambda x: x["data"][1], velocity)
        zVel = map(lambda x: x["data"][2], velocity)
        time = map(lambda x: x["time"], velocity)
        heartbeat = map(lambda x: x["data"][3], velocity)
        xDisp = []
        yDisp = []
        zDisp = []

        xDisp.append(prevDisp[0])
        yDisp.append(prevDisp[1])
        zDisp.append(prevDisp[2])
        count = 1
        while count < size:
            xDisp.append((float)((xVel[count]-xVel[count-1])*(time[count] - time[count-1])) + xDisp[count-1])
            yDisp.append((float)((yVel[count]-yVel[count-1])*(time[count] - time[count-1])) + yDisp[count-1])
            zDisp.append((float)((zVel[count]-zVel[count-1])*(time[count] - time[count-1])) + zDisp[count-1])
            count += 1

        returnJSONArray = []
        count = 0
        while count < size:
            returnDict = {'time': time[count], 'sensor': 'ldisp',
                          'data': [xDisp[count], yDisp[count], zDisp[count], heartbeat[count]]}
            returnJSONObject = json.dumps(returnDict)
            returnJSONArray.append(returnJSONObject)
            count += 1
        prevDisp[0] = xDisp[count-1]
        prevDisp[1] = yDisp[count-1]
        prevDisp[2] = zDisp[count-1]
        print(returnJSONArray)
        return prevDisp

def outputRowPitchYaw(ACCELArray, MAGArray):
    DataType = ACCELArray[0]["sensor"]
    returnJSONArray = []
    if DataType != "accel":
        return "Accelerometer readings required"
    elif MAGArray[0]["sensor"] != "mag":
        return "Magnetometer readings required"
    else:
        size = len(ACCELArray)
        accelData = SVR_process_monotype(ACCELArray)
        magData = SVR_process_monotype(MAGArray)
        for count in range(size):
            r = (float)(accelData[count]["data"][3]/180)
            p = (float)(magData[count]["data"][4]/180)
            xm = MAGArray[count]["data"][0]
            ym = MAGArray[count]["data"][1]
            zm = MAGArray[count]["data"][2]
            y = calcYaw(r, p, xm, ym, zm)
            t = accelData[count]["time"]
            hr = magData[count]["data"][3]
            returnDict = {'time':t, 'sensor':'rpy',
                          'data':[r, p, y, hr]}
            returnJSONObject = json.dumps(returnDict)
            returnJSONArray.append(returnJSONObject)
        print(returnJSONArray)
        return returnJSONArray

def calcAngularVelocity(GYROArray):
    data = SVR_process_monotype(GYROArray)
    if data[0]["sensor"] != "gyro":
        return "Gyroscope readings required"
    else:
        map(lambda x: float(x["data"][0]/180), data)
        map(lambda x: float(x["data"][1]/180), data)
        map(lambda x: float(x["data"][2]/180), data)
        print(data)
        return data


# yaw = atan2( (-ymag*cos(Roll) + zmag*sin(Roll) ) , (xmag*cos(Pitch) + ymag*sin(Pitch)*sin(Roll)+ zmag*sin(Pitch)*cos(Roll)) )
def calcYaw(roll, pitch, xmag, ymag, zmag):
    arg1 = -1 * ymag * np.cos(roll) + zmag * np.sin(roll)
    arg2 = xmag * np.cos(pitch) + ymag * np.sin(pitch) * np.sin*(roll) + zmag * np.sin(pitch) * np.cos(roll)
    return np.arctan2(arg1, arg2)

# {"time":1009,"sensor":"Color","data":[2]}
# 4in = 0.1016m
# 100ft = 30.48m
# 50ft = 15.24m
# prevStats = [time, displacement, velocity]
def Optical(OptJSON, prevStats, counter):
    if counter == 1:
        if OptJSON["data"] == 1 or OptJSON["data"] == 2:
            prevStats[2] = float(30.48/OptJSON["time"] - prevStats[0])
            prevStats[0] = OptJSON["time"]
            prevStats[1] += 30.48
            counter += 1
    elif counter <= 41:
        if OptJSON["data"] == 1 or OptJSON["data"] == 2:
            prevStats[2] = float(30.5816/OptJSON["time"] - prevStats[0])
            prevStats[0] = OptJSON["time"]
            prevStats[1] += 30.5816
            counter += 1
    print(prevStats)
    return prevStats, counter


if __name__ == '__main__':
    data = input()
    initDisp = [0.0, 0.0, 0.0]
    prevStats = [0.0, 0.0, 0.0]
    counter = 1
    while True:
        if data == 'break':
            break
            exit(0)
        else:
            jsonarray = json.loads(data)
            if jsonarray[0]["sensor"] != "Color":
                jsonarray = SVR_process_monotype(jsonarray)

                if (jsonarray[0]["sensor"] == 'gyro'):
                    calcAngularVelocity(jsonarray)

                if (jsonarray[0]["sensor"] == 'accel'):
                    calcLateralForce(jsonarray)
                    calcLinearVelocity(jsonarray)
                    initDisp = calcLinearDisplacement(jsonarray, initDisp)

            if jsonarray["sensor"] == "Color":
                prevStats, counter = Optical(jsonarray, prevStats, counter)

            data = input()