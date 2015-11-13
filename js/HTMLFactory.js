app.controller("HTMLCtrl", function($scope, HTMLFactory, GridFactory){
    $scope.generatedHTML;

    var sz = "lg";
    var span = 1;
});

app.factory("HTMLFactory", function(GridFactory){

    var bits = {
        container: '<div class="container">',
        row: '<div class="row">',
        nl: '\n',
        close: '</div>'
    }

    function colMaker(sz, span) {
        return '<div class="col-' + sz + '-' + span + '">';
    }

    HTMLFactory.getHTML = function(){
        console.log("generating HTML....");
        var sz = "lg"; // this should be variable?
        var html = "";
        var dim = GridFactory.getCurrentRC();
        var rows = dim[0], cols = dim[1];

        html += bits.container;
        for (var i = 0; i < rows; i++) {
            html += bits.row;
            html += bits.nl;
            for (var j = 0; j < cols; j++){

            }
        }
        html += close;
        return html;
    };

    return HTMLFactory;
});