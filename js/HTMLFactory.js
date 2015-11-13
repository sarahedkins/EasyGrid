app.controller("HTMLCtrl", function($scope, HTMLFactory){
    $scope.generatedHTML = HTMLFactory.genHTML;
});

app.factory("HTMLFactory", function(GridFactory){

    HTMLFactory = {};

    var bits = {
        container: '<div class="container">',
        row: '<div class="row">',
        nl: '<br />',  // TODO another way to do newlines when generating code?
        close: '</div>'
    }

    function colMaker(sz, span) {
        console.log("in colMaker, sz " + sz, ", span: " + span);
        return '<div class="col-' + sz + '-' + span + '"></div>';
    }

    var coordinateHash = {};

    HTMLFactory.updateCoordinateHash = function(r, c, html) {
        var key = "r" + r + "c" + c;
        coordinateHash[key] = html;
    }

    /* Takes an object where keys are rc coordinates and values are html strings.
    { r0c1: “<div>cats</div>”, r1c1: “<div>meow</div>” }
    */
    HTMLFactory.genHTML = function(){
        var sz = "lg"; // TODO this should be variable. eventually.
        var html = "";
        var dim = GridFactory.getCurrentRC();
        var rows = dim[0], cols = dim[1];
        var span = 12 / dim[1]; // number of Bootstrap columns to span across

        var obj = {};
        // make a request to bg for the obj to use here (coordHash)
        chrome.runtime.sendMessage({action: "getCoordHash"}, function(response){
            console.log("Response from getCoordHash is", response);
            obj = response.data;

            // generate the html
            html += bits.container;
            for (var i = 0; i < rows; i++) {
                html += bits.row;
                for (var j = 0; j < cols; j++){
                    // check the hash obj
                    var key = "r" + i + "c" + j;
                    if (obj.hasOwnProperty(key)) {
                        html += obj[key];
                    }
                    html += colMaker(sz, span);
                }
                html += bits.close;
            }
            html += bits.close;
            return html;
        });
    };

    return HTMLFactory;
});