CAbubble-jQuery-Flot
====================

jQuery Flot plugin for showing data information in bubbles and crosshair, thin lines, when the mouse hovers over the plot.

### Author
Carlos Asín
### Demo page

[https://0268d684e8f52406f20fcd84cf48eed905c0e154.googledrive.com/host/0BwzDh0DsxCXlS3g5TF9kS1BDWHM/cabubble-demo/](https://0268d684e8f52406f20fcd84cf48eed905c0e154.googledrive.com/host/0BwzDh0DsxCXlS3g5TF9kS1BDWHM/cabubble-demo/)

## How to install:

- Load js librery after jQuery and jQUery Flot
- Load css

`<script src="js/jquery-1.10.2.min.js"></script>`

`<script src="js/jquery.flot.min.js"></script>`

`<script src="js/jquery.flot.bubble.js"></script>`

## How to use:

THe plugin have options to configure color and line width.

	var options = {
        bubble: {
            color: "black",
            lineWidth: 1
        }
    };

Example of jquery flot configuration:    

     $.plot($("#placeholder"), [d1, d2, d3], {
     	
        series: { 
          lines: { show: true},
          points: {show: true, radius:2, fillColor: "black"}
        },
        xaxis:  {tickLength:7 },
        yaxes: {tickLength:0 },
        grid: { borderWidth: 0, color: '#999'}
        bubble: { color: "red", lineWidth: 2 }
      });