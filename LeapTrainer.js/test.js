var leap = require('../lib/index',function(){
	console.log("loaded");
});
//var leapTrainer = require('./leaptrainer.js');

var controller =  leap.Controller({frameEventName:"deviceFrame"});
//var trainer =  leapTrainer.Controller(controller);
	var trainer = new LeapTrainer.Controller({controller: controller});

controller.connect();
