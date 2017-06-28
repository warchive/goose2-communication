/**
 * Created by Ruslan on 6/28/2017.
 */
exports.writeFile = function (data, callback) {
    var fs = require('fs');
    fs.writeFile(timenow() + ".json", data, function(err) {

        if (err) {
            return callback(err);
        }
        callback(true);
    });
};

function timenow() {
    var now= new Date(),
        h= now.getHours(),
        m= now.getMinutes(),
        s= now.getSeconds();

    if(m<10) m= '0'+m;
    if(s<10) s= '0'+s;
    return now.toLocaleDateString()+ '_' + h + ':' + m + ':' + s;
}
