/**
 * Created by ruslan on 02/08/17.
 */
import util from "util"

module.exports = {
    writer: function (data, fs) {
        let now = new Date(),
            d = now.getDate(),
            m = now.getMonth(),
            y = now.getFullYear(),
            h = now.getHours(),
            min = now.getMinutes(),
            sec = now.getSeconds(),
            mill = now.getMilliseconds(),
            filename = __dirname + util.format('/launch-records/%s_%s_%s_%s_%s_%s_%s.json', d, m, y, h, min, sec, mill);


        fs.writeFile(filename, JSON.stringify({data: data}), function (err) {
            if (err) throw err;
            log.info('data saved in /launch-records/' + filename);
            console.log('data saved in /launch-records/' + filename);
        });
    }
};