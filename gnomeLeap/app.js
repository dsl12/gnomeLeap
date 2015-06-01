var leap = require('./lib/index')
var controller =  new leap.Controller({frameEventName:"deviceFrame"});
// console.log(controller);
var gestures=["SWIPE"];
var actions = ["exec(\"dbus-send --session --type=method_call --dest=org.gnome.Shell /org/gnome/Shell org.gnome.Shell.Eval string:'Main.layoutManager.hotCorners[Main.layoutManager.primaryIndex]._toggleOverview();'\")"]

var robot= require('robotjs')
var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }



var leapTrainer = require('./lib/leaptrainer')
// var geoTemp = require('./lib/geoTemp.js')
// console.log(leapTrainer);
leapTrainer.overidden.initialize({controller:controller})
var fs = require('fs');
fs.readFile('./swipe.json', function (err, contents) {
      // fs.readFile(file, 'utf8', callback) can also be used
      var lines = contents.toString()

      leapTrainer.overidden.fromJSON(lines);
      for (var i=0; i< gestures.length; i++) {
      	var x = i;
		leapTrainer.overidden.on(gestures[i],function(){eval(actions[x])
			
})

      }

    })

fs.readFile('./tap.json', function (err, contents) {
      // fs.readFile(file, 'utf8', callback) can also be used
      var lines = contents.toString()

      leapTrainer.overidden.fromJSON(lines);
      leapTrainer.overidden.on("TAP",function(){
        leapTrainer.overidden.pause();
      	robot.mouseClick();
        leapTrainer.overidden.resume();

      })

    })








leapTrainer.overidden.on("mouse",function(data){
	// console.log(data[0]);
    // console.log(screenPos(data))
    // data = screenPos(data)
	// leapTrainer.overidden.pause()
	// var iBox = leapT
	var x,y,screenWidth,screenHeight;
  screenHeight = 1599
  screenWidth = 2599
	x = Math.round(data[0] * screenWidth)
	y = Math.round(screenHeight - data[1]  * screenHeight)
  console.log("x  :" + data[0] + " -> " + x)
  console.log("y  :" + data[1] + " -> " + y)

	robot.moveMouse(x,y)
})

 // leapTrainer.Controller(controller);
controller.on('deviceDisconnected', function() {console.log('Create a gesture or pose to get started'); });

controller.connect();

var screenPos= function(positionVec3) {
	    var baseScale = 6
	    	baseVerticalOffset = -100
            verticalOffset =0
        return [(2599 / 2) + (positionVec3[0] * baseScale ), 1599 + baseVerticalOffset + verticalOffset - (positionVec3[1] * baseScale ), positionVec3[2] * baseScale ];
      }
