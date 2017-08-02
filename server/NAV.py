# Script for navigation system with functions for position calculations
# Written by Rosie Zou, June 2017

import numpy as np
from sklearn.svm import SVR
import sys
import json


def svr_process_monotype(json_arr, d_type):
    size = len(json_arr)
    x = []
    y = []
    z = []
    t = []
    heartbeat = []

    try:
        for k in json_arr:
            x.append(k["data"][0])
            y.append(k["data"][1])
            z.append(k["data"][2])
            heartbeat.append(k["data"][3])
            t.append([float(k["time"] / 1000)])

        svr_rbf = SVR(kernel='rbf', C=0.2e2, gamma=0.2, verbose=False)
        x = np.array(x)
        y = np.array(y)
        z = np.array(z)
        x_rbf = svr_rbf.fit(t, x).predict(t)
        y_rbf = svr_rbf.fit(t, y).predict(t)
        z_rbf = svr_rbf.fit(t, z).predict(t)

        return_json_arr = []
        count = 0

        while count < size:
            obj = {
                'time': t[count][0],
                'sensor': d_type,
                'data': [
                    x_rbf[count],
                    y_rbf[count],
                    z_rbf[count],
                    heartbeat[count]
                ]
            }

            count += 1
            return_json_arr.append(obj)

        # print(return_json_arr)
        return return_json_arr

    except Exception:
        return False


def calc_lat_force(accel_arr):
    accel_arr = map(lambda x:
                    {'time': x['time'],
                     'sensor': 'latf',
                     'data': [
                         float(x["data"][0] * 140),
                         float(x["data"][1] * 140),
                         float(x["data"][2] * 140),
                         x["data"][3]]
                     }, accel_arr)

    return accel_arr


def calc_lin_velocity(accel_arr):
    x, y, z, t, = [], [], [], []
    x_vel, y_vel, z_vel, heartbeat = [], [], [], []
    size = len(accel_arr)

    for i in accel_arr:
        x.append(i["data"][0] * 9.80665)
        y.append(i["data"][1] * 9.80665)
        z.append(i["data"][2] * 9.80665)
        t.append((i["time"]))
        heartbeat.append(i["data"][3])

    x_vel.append(0)
    y_vel.append(0)
    z_vel.append(0)
    count = 1

    while count < size:
        x_vel.append(float(
            (x[count] - x[count - 1]) * (t[count] - t[count - 1])))
        y_vel.append(float(
            (y[count] - y[count - 1]) * (t[count] - t[count - 1])))
        z_vel.append(float(
            (z[count] - z[count - 1]) * (t[count] - t[count - 1])))
        count += 1

    return_json_arr = []
    count = 0

    while count < size:
        return_dict = {
            'time': t[count],
            'sensor': 'lvel',
            'data': [
                x_vel[count],
                y_vel[count],
                z_vel[count],
                heartbeat[count]]
        }

        return_json_arr.append(json.dumps(return_dict))
        count += 1

    return return_json_arr


def calc_lin_displacement(prev_disp, vel):
    x_disp, y_disp, z_disp = [], [], []
    size = len(vel)

    x_disp.append(prev_disp[0])
    y_disp.append(prev_disp[1])
    z_disp.append(prev_disp[2])

    count = 1
    while count < size:
        x_disp.append(float(
            (vel[count]['data'][0] - vel[count - 1]['data'][0]) *
            (vel[count]['time'] -
             vel[count - 1]['time'])) + x_disp[count - 1])
        y_disp.append(float(
            (vel[count]['data'][1] - vel[count - 1]['data'][1]) *
            (vel[count]['time'] -
             vel[count - 1]['time'])) + y_disp[count - 1])
        z_disp.append(float(
            (vel[count]['data'][2] - vel[count - 1]['data'][2]) *
            (vel[count]['time'] -
             vel[count - 1]['time'])) + z_disp[count - 1])
        count += 1

    return_json_arr = []
    count = 0

    while count < size:
        return_dict = {
            'time': vel[count]['time'],
            'sensor': 'ldisp',
            'data': [
                x_disp[count],
                y_disp[count],
                z_disp[count],
                vel[count]['data'][3]
            ]
        }
        return_json_arr.append(json.dumps(return_dict))
        count += 1

    prev_disp[0] = x_disp[count - 1]
    prev_disp[1] = y_disp[count - 1]
    prev_disp[2] = z_disp[count - 1]

    return prev_disp, return_json_arr


def out_row_pitch_yaw(ACCELArray, MAGArray):
    DataType = ACCELArray[0]["sensor"]
    returnJSONArray = []
    if DataType != "accel":
        return "Accelerometer readings required"
    elif MAGArray[0]["sensor"] != "mag":
        return "Magnetometer readings required"
    else:
        size = len(ACCELArray)
        accelData = svr_process_monotype(ACCELArray)
        magData = svr_process_monotype(MAGArray)
        for count in range(size):
            r = (float)(accelData[count]["data"][3] / 180)
            p = (float)(magData[count]["data"][4] / 180)
            xm = MAGArray[count]["data"][0]
            ym = MAGArray[count]["data"][1]
            zm = MAGArray[count]["data"][2]
            y = calcYaw(r, p, xm, ym, zm)
            t = accelData[count]["time"]
            hr = magData[count]["data"][3]
            returnDict = {'time': t, 'sensor': 'rpy',
                          'data': [r, p, y, hr]}
            returnJSONObject = json.dumps(returnDict)
            returnJSONArray.append(returnJSONObject)
        print(returnJSONArray)
        return returnJSONArray


def calc_ang_velocity(gyro_arr):
    gyro_arr = map(lambda x:
                   {'time': x['time'],
                    'sensor': x['sensor'],
                    'data': [
                        float(x["data"][0] / 180),
                        float(x["data"][1] / 180),
                        float(x["data"][2] / 180),
                        x["data"][3]]
                    }, gyro_arr)

    return gyro_arr


# yaw = atan2( (-ymag*cos(Roll) + zmag*sin(Roll) ) , (xmag*cos(Pitch) + ymag*sin(Pitch)*sin(Roll)+ zmag*sin(Pitch)*cos(Roll)) )
def calcYaw(roll, pitch, xmag, ymag, zmag):
    arg1 = -1 * ymag * np.cos(roll) + zmag * np.sin(roll)
    arg2 = xmag * np.cos(pitch) + ymag * np.sin(pitch) * np.sin * (
        roll) + zmag * np.sin(pitch) * np.cos(roll)
    return np.arctan2(arg1, arg2)


# {"time":1009,"sensor":"Color","data":[2]}
# 4in = 0.1016m
# 100ft = 30.48m
# 50ft = 15.24m
# prevStats = [time, displacement, velocity]
def optical(opt_json, prev_stats, counter):

    if counter == 1:
        if opt_json["data"] == 1 or opt_json["data"] == 2:
            prev_stats[2] = float(
                30.48 / opt_json["time"] - prev_stats[0])
            prev_stats[0] = opt_json["time"]
            prev_stats[1] += 30.48
            counter += 1
    elif counter <= 41:
        if opt_json["data"] == 1 or opt_json["data"] == 2:
            prev_stats[2] = float(
                30.5816 / opt_json["time"] - prev_stats[0])
            prev_stats[0] = opt_json["time"]
            prev_stats[1] += 30.5816
            counter += 1

    return prev_stats, counter


def main(lines):
    init_disp = [0.0, 0.0, 0.0]
    prev_stats = [0.0, 0.0, 0.0]
    counter = 1
    array = lines['to_parse']
    data_type = array[0]['sensor']
    parsed_data = svr_process_monotype(array, data_type)

    if parsed_data:
        if data_type != "Color":
            if data_type == 'gyro':
                print json.dumps({
                    'parsed': calc_ang_velocity(parsed_data)
                })

            if data_type == 'accel':
                print json.dumps({
                    'parsed': calc_lat_force(parsed_data)
                })
                sys.stdout.flush()

                lvel = calc_lin_velocity(parsed_data)

                print json.dumps({'parsed': lvel})
                sys.stdout.flush()

                init_disp, ldisp = calc_lin_displacement(init_disp,
                                                         lvel)

                print json.dumps({'parsed': ldisp})
                sys.stdout.flush()

        if data_type == "Color":
            prev_stats, counter = optical(parsed_data, prev_stats,
                                          counter)
            print json.dumps({'parsed': prev_stats})
            sys.stdout.flush()


def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])


if __name__ == '__main__':
    main(read_in())
