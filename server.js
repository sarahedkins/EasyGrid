var express = require('express');
var app = express();
var path = require("path");

app.use('/img', express.static(__dirname + "/test-html"));

app.get('/', function (req, res) {
    // var webpage = '<p id="hello"> Hello World! </p>';
    res.sendFile(path.join(__dirname + '/test-html/product-tile.html'));
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});