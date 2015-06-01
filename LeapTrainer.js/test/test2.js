var leap = require('./lib/index')
var controller =  new leap.Controller({frameEventName:"deviceFrame"});
var gestures=["SWIPE"];
var actions = ["console.log('gesture')"]
var leapTrainer = require('./lib/leaptrainer')
// var geoTemp = require('./lib/geoTemp.js')
// console.log(leapTrainer);
leapTrainer.overidden.initialize({controller:controller})
var fs = require('fs');
fs.readFile('./swipe.json', function (err, contents) {
      // fs.readFile(file, 'utf8', callback) can also be used
      var lines = contents.toString()

      leapTrainer.overidden.fromJSON(lines);

    })

 // leapTrainer.Controller(controller);
controller.on('deviceDisconnected', function() {console.log('Create a gesture or pose to get started'); });

for (int i=0; i < gestures.length; i++) {
	controller.on(gestures[i],function(){
		eval(actions[i])
	})
}


controller.connect();
