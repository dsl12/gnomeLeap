/*!
 * --------------------------------------------------------------------------------------------------------
 * 
 * 										GEOMETRIC TEMPLATE MATCHER
 * 
 * --------------------------------------------------------------------------------------------------------
 * 
 * Everything below this point is a geometric template matching implementation. This object implements the current 
 * DEFAULT default recognition strategy used by the framework.
 * 
 * This implementation is based on work at the University of Washington, described here:
 * 
 * 	http://depts.washington.edu/aimgroup/proj/dollar/pdollar.html
 * 
 * This implementation has been somewhat modified, functions in three dimensions, and has been 
 * optimized for performance.
 * 
 * Theoretically this implementation CAN support multi-stroke gestures - but there is not yet support in the LeapTrainer 
 * Controller or training UI for these kinds of gesture.
 * 
 * --------------------------------------------------------------------------------------------------------
 */

/**
 * A basic holding class for a 3D point. Note the final parameter, stroke, intended to indicate with which 
 * stroke in a multi-stroke gesture a point is associated - even if multi-stroke gestures are not yet supported 
 * by the framework.
 * 
 * @param x
 * @param y
 * @param z
 * @param stroke
 * @returns {LeapTrainer.Point}
 */
LeapTrainer.Point = function (x, y, z, stroke) {

	this.x = x;
	this.y = y;
	this.z = z;

	this.stroke = stroke; // stroke ID to which this point belongs (1,2,...)
};

/**
 * An implementation of the geometric template mathcing algorithm.
 */
LeapTrainer.TemplateMatcher = Class.extend({

	pointCount	: 25, 							// Gestures are resampled to this number of points
	origin 		: new LeapTrainer.Point(0,0,0), // Gestures are translated to be centered on this point

	/**
	 * Prepares a recorded gesture for template matching - resampling, scaling, and translating the gesture to the 
	 * origin.  Gesture processing ensures that during recognition, apples are compared to apples - all gestures are the 
	 * same (resampled) length, have the same scale, and share a centroid.
	 * 
	 * @param gesture
	 * @returns
	 */
	process: function(gesture) { 
	
		var points = [];
		
		var stroke = 1;

		for (var i = 0, l = gesture.length; i < l; i += 3) {

			points.push(new LeapTrainer.Point(gesture[i], gesture[i + 1], gesture[i + 2], stroke));
		}

		return this.translateTo(this.scale(this.resample(points, this.pointCount)), this.origin);	
	},	
	
	/**
	 * This is the primary correlation function, called in the LeapTrainer.Controller above in order to compare an detected 
	 * gesture with known gestures.  
	 * 
	 * @param gesture
	 * @param trainingGesture
	 * @returns
	 */
	match: function (gesture, trainingGesture) {

		var l 			= gesture.length, 
			step 		= Math.floor(Math.pow(l, 1 - this.e)),
			min 		= +Infinity,
			minf 		= Math.min;
		
		
		for (var i = 0; i < l; i += step) {
            
			min = minf(min, minf(this.gestureDistance(gesture, trainingGesture, i), this.gestureDistance(trainingGesture, gesture, i)));
		}

		return min;
	},
	
	/**
	 * Calculates the geometric distance between two gestures.
	 * 
	 * @param gesture1
	 * @param gesture2
	 * @param start
	 * @returns {Number}
	 */
	gestureDistance: function (gesture1, gesture2, start) {

		var p1l = gesture1.length;

		var matched = new Array(p1l);

		var sum = 0, i = start, index, min, d;

		do {

			index = -1, min = +Infinity;

			for (var j = 0; j < p1l; j++) {

				if (!matched[j]) {

					if (gesture1[i] == null || gesture2[j] == null) { continue; }
					
					d = this.distance(gesture1[i], gesture2[j]);

					if (d < min) { min = d; index = j; }
				}
			}

			matched[index] = true;

			sum += (1 - ((i - start + p1l) % p1l) / p1l) * min;

			i = (i + 1) % p1l;
		
		} while (i != start);

		return sum;
	},
	
	/**
	 * Resamples a gesture in order to create gestures of homogenous lengths.  The second parameter indicates the length to 
	 * which to resample the gesture.
	 * 
	 * This function is used to homogenize the lengths of gestures, in order to make them more comparable. 
	 * 
	 * @param gesture
	 * @param newLength
	 * @returns {Array}
	 */
	resample: function (gesture, newLength) {
		
		var target = newLength - 1;
		
		var interval = this.pathLength(gesture)/target, dist = 0.0, resampledGesture = new Array(gesture[0]), d, p, pp, ppx, ppy, ppz, q;
		
		for (var i = 1, l = gesture.length; i < l; i++) {

			p	= gesture[i];
			pp	= gesture[i - 1];
			
			if (p.stroke == pp.stroke) {

				d = this.distance(pp, p);

				if ((dist + d) >= interval) {
					
					ppx = pp.x;
					ppy = pp.y;
					ppz = pp.z;

					q = new LeapTrainer.Point((ppx + ((interval - dist) / d) * (p.x - ppx)), 
											  (ppy + ((interval - dist) / d) * (p.y - ppy)),
											  (ppz + ((interval - dist) / d) * (p.z - ppz)), p.stroke);
					
					resampledGesture.push(q);
					
					gesture.splice(i, 0, q);
					
					dist = 0.0;
				
				} else { 
				
					dist += d;
				}
			}
		}

		/*
		 * Rounding errors will occur short of adding the last point - in which case the array is padded by 
		 * duplicating the last point
		 */
		if (resampledGesture.length != target) {
			
			p = gesture[gesture.length - 1];
			
			resampledGesture.push(new LeapTrainer.Point(p.x, p.y, p.z, p.stroke));
		}

		return resampledGesture;
	},
	
	/**
	 * Scales gestures to homogenous variances in order to provide for detection of the same gesture at different scales.
	 * 
	 * @param gesture
	 * @returns {Array}
	 */
	scale: function (gesture) {

		var minX = +Infinity, 
			maxX = -Infinity, 
			minY = +Infinity, 
			maxY = -Infinity,
			minZ = +Infinity, 
			maxZ = -Infinity,
			l = gesture.length,
			g, x, y, z, 
			min = Math.min,
			max = Math.max;
		
		for (var i = 0; i < l; i++) {
			
			g = gesture[i];
			
			x = g.x;
			y = g.y;
			z = g.z;
			
			minX = min(minX, x);
			minY = min(minY, y);
			minZ = min(minZ, z);

			maxX = max(maxX, x);
			maxY = max(maxY, y);
			maxZ = max(maxZ, z);
		}

		var size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);

		for (var i = 0; i < l; i++) {
			
			g = gesture[i];

			gesture[i] = new LeapTrainer.Point((g.x - minX)/size, (g.y - minY)/size, (g.z - minZ)/size, g.stroke);
		}

		return gesture;
	},

	/**
	 * Translates a gesture to the provided centroid.  This function is used to map all gestures to the 
	 * origin, in order to recognize gestures that are the same, but occurring at at different point in space.
	 * 
	 * @param gesture
	 * @param centroid
	 * @returns {Array}
	 */
	translateTo: function (gesture, centroid) {

		var center = this.centroid(gesture), g;

		for (var i = 0, l = gesture.length; i < l; i++) {
		
			g = gesture[i];

			gesture[i] = new LeapTrainer.Point((g.x + centroid.x - center.x), 
											   (g.y + centroid.y - center.y), 
											   (g.z + centroid.z - center.z), g.stroke);
		}

		return gesture;
	},
	
	/**
	 * Finds the center of a gesture by averaging the X and Y coordinates of all points in the gesture data.
	 * 
	 * @param gesture
	 * @returns {LeapTrainer.Point}
	 */
	centroid: function (gesture) {

		var x = 0.0, y = 0.0, z = 0.0, l = gesture.length, g;

		for (var i = 0; i < l; i++) {

			g = gesture[i];
			
			x += g.x;
			y += g.y;
			z += g.z;
		}

		return new LeapTrainer.Point(x/l, y/l, z/l, 0);
	},
	
	/**
	 * Calculates the average distance between corresponding points in two gestures
	 * 
	 * @param gesture1
	 * @param gesture2
	 * @returns {Number}
	 */
	pathDistance: function (gesture1, gesture2) {
		
		var d = 0.0, l = gesture1.length;
		
		/*
		 * Note that resampling has ensured that the two gestures are both the same length
		 */
		for (var i = 0; i < l; i++) { d += this.distance(gesture1[i], gesture2[i]); }

		return d/l;
	},
	
	/**
	 * Calculates the length traversed by a single point in a gesture
	 * 
	 * @param gesture
	 * @returns {Number}
	 */
	pathLength: function (gesture) {

		var d = 0.0, g, gg;

		for (var i = 1, l = gesture.length; i < l; i++) {

			g	= gesture[i];
			gg 	= gesture[i - 1];
			
			if (g.stroke == gg.stroke) { d += this.distance(gg, g); }
		}

		return d;
	},
	
	/**
	 * A simple Euclidean distance function
	 * 
	 * @param p1
	 * @param p2
	 * @returns
	 */
	distance: function (p1, p2) {

		var dx = p1.x - p2.x;
		var dy = p1.y - p2.y;
		var dz = p1.z - p2.z;

		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}	
});