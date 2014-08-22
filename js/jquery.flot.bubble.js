/*

 jQuery Flot plugin for showing data information in bubbles and crosshair,
 thin lines, when the mouse hovers over the plot.

  bubble: {
    color: color
    lineWidth: number
  }

*/

(function ($) {
    var options = {
        bubble: {
            color: "black",
            lineWidth: 1
        }
    };
      
  function init(plot) {

    // position of bubble in pixels
    var bubble = { x: -1, y: -1, locked: false };

    plot.setbubble = function setbubble(pos) {
        if (!pos)
            bubble.x = -1;
        else {
            var o = plot.p2c(pos);
            bubble.x = Math.max(0, Math.min(o.left, plot.width()));
            bubble.y = Math.max(0, Math.min(o.top, plot.height()));
        }
        
        plot.triggerRedrawOverlay();
    };
    
    plot.clearbubble = plot.setbubble; // passes null for pos
    
    plot.lockbubble = function lockbubble(pos) {
        if (pos)
            plot.setbubble(pos);
        bubble.locked = true;
    }

    plot.unlockbubble = function unlockbubble() {
        bubble.locked = false;
  }

  function onMouseOut(e) {
    if (bubble.locked) return;
    var plot_offset = plot.offset();
    if (e.pageX < plot_offset.left || 
        e.pageX > plot_offset.left+plot.width() ||
        e.pageY < plot_offset.top ||
        e.pageY > plot_offset.top+plot.height()) {

      if (bubble.x != -1) {
        bubble.x = -1;
        plot.unhighlight();
        plot.triggerRedrawOverlay();
        $("#tooltip").remove();
      }
    }
  }
        
  function showTooltips(x, y, contents, width, height, toporigin, leftorigin) {

    if (isNaN(toporigin)) {
      $('<div id="tooltip">' + contents + '</div>').css({
        'display':'none' }).appendTo("body");
      width = $("#tooltip").width();
      height = $("#tooltip").height();
      $("#tooltip").remove();
      toporigin = y-height/2; 
    }
    var offset = plot.offset();

    if (x < width + offset.left + 30) var right = x + 20;
    else var right = x - width -30;
    
    if (isNaN(leftorigin)) leftorigin = right;
    if ((y+height/2) > (offset.top+plot.height()))
      var topposition = offset.top+plot.height() - height - 60;
    else {
      if ((y-height/2) < (offset.top))
        var topposition = offset.top+15;
      else var topposition = y-height/2;
    }
    
    $('<div id="tooltip">' + contents + '</div>').css({
      top: toporigin, left: leftorigin     
    }).appendTo("body").animate({ "left": right,"top": topposition}, "fast");
    
    $("#tooltip").mousemove(function (event) { onMouseMove(event) });
  }

  function aFecha(timestamp) {
	  function pad2(number) { return (number < 10 ? '0' : '') + number }

     var a = new Date(timestamp);
     var months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", 
                   "Ago", "Sep", "Oct", "Nov", "Dec"];
     var month = months[a.getMonth()];
     var date = a.getUTCDate();
     var hour = a.getUTCHours();
     var min = a.getUTCMinutes();
     var sec = a.getUTCSeconds();
     return date+' '+month;
  }

  function onMouseMove(e) {

    if (bubble.locked)
      return;
    
    // Hide Bubble and line
    if (plot.getSelection && plot.getSelection()) {
      if ($("#tooltip").length) $("#tooltip").remove();
      bubble.x = -1;
      return;
    }
    
    // Plot parameters
    var axes = plot.getAxes();
    var offset = plot.offset();
    var dataset = plot.getData();

    // Previous position
    var previox = bubble.x;
    var previoy = bubble.y;

    var cordenades = [];
    var label = '';

    // Cursor pointer
    bubble.x = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
    bubble.y = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
    var point = axes.xaxis.c2p(bubble.x);


    for (var i = 0; i < dataset.length; i++) { 
      var series = dataset[i];
      var limite = series.data.length;

      if (bubble.x < previox || previox == -1) {

        for (var j = 0; j < limite; j++) {
            var diff = Math.abs(point-series.data[j][0]);

            if ((limite >= 1) && j < (limite-1)) {
              var hight_range = Math.abs(series.data[j][0]-series.data[j+1][0])/2;
              if (diff < hight_range) { 
                cordenades.push([i,j,diff]); 
                // Check more element on similar value
                for (var k=j-1; k > 0; k--) {
                  if ((Math.abs(series.data[k][0]-series.data[j][0])/2) < diff)
                    cordenades.push([i,k,diff]);
                  else break;
                }
                break;
              }
            }
            else  {
              if ((j > 0 && diff < (Math.abs(series.data[j-1][0]-series.data[j][0])/2)) ||
                 (j == 0 && point == series.data[j][0])) { cordenades.push([i,j,diff]); break; }
            }    
        }
      }
      else {
        for (var j = limite-1; j >=0; j--) {
          var diff = Math.abs(point-series.data[j][0]);

          if (j > 0) {
            var low_range = Math.abs(series.data[j][0]-series.data[j-1][0])/2;
            if (diff < low_range) { 
              cordenades.push([i,j,diff]); 

              // Check more element on similar value
              for (var k=j+1; k < limite; k++) {
                if ((Math.abs(series.data[j][0]-series.data[k][0])/2) < diff)
                  cordenades.push([i,k,diff]);
                else break;
              }
              break;
            }
          }
          else  {
            if ((j > 0 && diff < (Math.abs(series.data[j-1][0]-series.data[j][0])/2)) ||
               (j == 0 && point == series.data[j][0])) { cordenades.push([i,j,diff]); break; }
          }        
        }
      }
    }

    // Draw bubble and line
    if (cordenades.length) {
      // Centered line position in points
      bubble.x = axes.xaxis.p2c(dataset[cordenades[0][0]].data[cordenades[0][1]][0]);
      if (dataset[cordenades[0][0]].yaxis.n == 2) bubble.y = axes.y2axis.p2c(dataset[cordenades[0][0]].data[cordenades[0][1]][1]) + offset.top;
      else bubble.y = axes.yaxis.p2c(dataset[cordenades[0][0]].data[cordenades[0][1]][1]) + offset.top;
            
      // Check axis
      if ((axes.xaxis.p2c(axes.xaxis.min) <= bubble.x) && 
          (axes.xaxis.p2c(axes.xaxis.max) >= bubble.x)) {
        if (previox != bubble.x) {
          plot.unhighlight();
          label += '<span>'+((axes.xaxis.options.mode == "time")? aFecha(dataset[cordenades[0][0]].data[cordenades[0][1]][0]) : dataset[cordenades[0][0]].data[cordenades[0][1]][0])+'</span><br />';
          
          // Draw label data
          for (var k=0; k < cordenades.length; k++) {
            if (k==0  || cordenades[k][2] == cordenades[0][2]) {
              plot.highlight(cordenades[k][0],cordenades[k][1],1);
              label += '<span style="color:'+dataset[cordenades[k][0]].color+';">'
                    +((dataset[cordenades[k][0]].label != undefined)? dataset[cordenades[k][0]].label : 'Serie')+
                    '</span> : <span class="val">'
                    +dataset[cordenades[k][0]].data[cordenades[k][1]][1]
                    +((dataset[cordenades[k][0]].unit != undefined)? dataset[cordenades[k][0]].unit : '')+'</span><br />';
            }
          }
          plot.triggerRedrawOverlay();
            
          // Get size and position previous bubble          
          var arriba, right, width, height;
          if ($("#tooltip").length) {
            var offsettooltip = $("#tooltip").offset();
            arriba =  offsettooltip.top;
            right =  offsettooltip.left;
            width = $("#tooltip").width();
            height = $("#tooltip").height();
            $("#tooltip").remove();
          }

          // Move new bubble
          showTooltips(offset.left + bubble.x,bubble.y,label, width, 
                       height, arriba, right); 
          return;
        }        
      }    
    }
    else bubble.x = previox; 
  }

  plot.hooks.bindEvents.push(function (plot, eventHolder) {
      //if (!plot.getOptions().bubble.mode)
       //   return;

      eventHolder.mouseout(onMouseOut);
      eventHolder.mousemove(onMouseMove);
  });

  plot.hooks.drawOverlay.push(function (plot, ctx) {
      var c = plot.getOptions().bubble;
      //if (!c.mode)
      //    return;

      var plotOffset = plot.getPlotOffset();
      
      ctx.save();
      ctx.translate(plotOffset.left, plotOffset.top);

      if (bubble.x != -1) {
          ctx.strokeStyle = c.color;
          ctx.lineWidth = c.lineWidth;
          ctx.lineJoin = "round";

          ctx.beginPath();
          //if (c.mode.indexOf("x") != -1) {
              ctx.moveTo(bubble.x, 0);
              ctx.lineTo(bubble.x, plot.height());
          /*}
          if (c.mode.indexOf("y") != -1) {
              ctx.moveTo(0, bubble.y);
              ctx.lineTo(plot.width(), bubble.y);
          }*/
          ctx.stroke();
      }
      ctx.restore();
  });

  plot.hooks.shutdown.push(function (plot, eventHolder) {
      eventHolder.unbind("mouseout", onMouseOut);
      eventHolder.unbind("mousemove", onMouseMove);
  });
}
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'bubble',
        version: '1.0'
    });
})(jQuery);
