// Only executed our code once the DOM is ready.
window.onload = function() {
        // Get a reference to the canvas object
        var canvas = document.getElementById('myCanvas');
        // Create an empty project and a view for the canvas:
        paper.setup(canvas);

        var myPath = new paper.Path();
        myPath.strokeColor = 'black';

        // Draw the view now:
        paper.view.draw();

        var tool = new paper.Tool();

        tool.onMouseDown = function(event) {
            myPath.add(event.point);
        }
    };
