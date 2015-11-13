app.controller("HTMLCtrl", function($scope, HTMLFactory){
    $scope.generatedHTML = HTMLFactory.getHTML;
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

    HTMLFactory.getHTML = function(){
        console.log("generating HTML....");
        var sz = "lg"; // TODO this should be variable. eventually.
        var html = "";
        var dim = GridFactory.getCurrentRC();
        var rows = dim[0], cols = dim[1];
        var span = 12 / dim[1]; // number of boostrap columns to span across

        html += bits.container;
        for (var i = 0; i < rows; i++) {
            html += bits.row;

            for (var j = 0; j < cols; j++){
                html += colMaker(sz, span);
            }
            html += bits.close;
        }
        html += bits.close;
        console.log("after generating, html looks like", html);
        return html;
    };

    return HTMLFactory;
});