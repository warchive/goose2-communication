/**
 * Created by ruslan on 02/08/17.
 */
'use strict';

const util = require("util");

module.exports = {
    writer: function (filename, data, fs) {
        fs.writeFile(filename, JSON.stringify({data: data}), function (err) {
            if (err) throw err;
            log.info('data saved in /launch-records/' + filename);
            console.log('data saved in /launch-records/' + filename);
        });
    },
    getFilename: function () {
        let now = new Date(),
            d = now.getDate(),
            m = now.getMonth(),
            y = now.getFullYear(),
            h = now.getHours(),
            min = now.getMinutes(),
            sec = now.getSeconds(),
            mill = now.getMilliseconds();

        return __dirname + util.format('/launch-records/%s_%s_%s_%s_%s_%s_%s.json', d, m, y, h, min, sec, mill);
    }
};