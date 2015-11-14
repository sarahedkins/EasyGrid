var express = require('express');
var app = express();
var path = require("path");

app.use('/test', express.static(path.join(__dirname + "/test-html")));
app.use('/style', express.static(path.join(__dirname + "/style")));
app.use('/stuff', express.static(path.join(__dirname + "/node_modules")));

app.get('/', function (req, res) {
    // var webpage = '<p id="hello"> Hello World! </p>';
    //res.sendFile(path.join(__dirname + '/test-html/product-tile.html'));
    res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});