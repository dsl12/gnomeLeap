// var leap = require('./lib/index')
var leap = require("leapjs")
var controller =  new leap.Controller({frameEventName:"deviceFrame",gestures:false});
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
         if (controller.frame(0).pointables.length ==1 && controller.frame(0).pointables[0].stabilizedTipPosition[2] < 0){
console.log("TAP   " + Date())

               leapTrainer.overidden.pause();
                robot.mouseClick();
                leapTrainer.overidden.resume();}

      })

    })



leapTrainer.overidden.on("mouse",function(data){

  var x,y,screenWidth,screenHeight;
  screenHeight = 1599
  screenWidth = 2599
  x = Math.round(data[0] * screenWidth)
  y = Math.round(screenHeight - data[1]  * screenHeight)
  
  robot.moveMouse(x,y)
})




leapTrainer.overidden.on("SWIPE", function(){console.log("swipe")})
leapTrainer.overidden.create('Dave')
leapTrainer.overidden.on('training-complete',function(){
 
})
 // leapTrainer.Controller(controller);
controller.on('deviceDisconnected', function() {console.log('Create a gesture or pose to get started'); });
controller.on('frame', function(frame){
 if (frame.data.pointables.length == 1 ) {
  if(frame.data.pointables[0].stabilizedTipPosition[2] >=0 ){var x,y,screenWidth,screenHeight;
    screenHeight = 1599
    screenWidth = 2599
    var data = [];
    var values = frame.interactionBox.normalizePoint(frame.data.pointables[0].stabilizedTipPosition)
    data[0] = values[0]
    data[1] = values[1]
    x = Math.round(data[0] * screenWidth)
    y = Math.round(screenHeight - data[1]  * screenHeight)
    
    robot.moveMouse(x,y)}
}
})
controller.connect();

var screenPos= function(positionVec3) {
      var baseScale = 6
        baseVerticalOffset = -100
            verticalOffset =0
        return [(2599 / 2) + (positionVec3[0] * baseScale ), 1599 + baseVerticalOffset + verticalOffset - (positionVec3[1] * baseScale ), positionVec3[2] * baseScale ];
      }
