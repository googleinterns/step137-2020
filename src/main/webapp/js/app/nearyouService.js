function nearyouScript() {
}
nearyouScript.prototype.locationRadius = 2000;
nearyouScript.prototype.events = [];
nearyouScript.prototype.eventObjs = [];
nearyouScript.prototype.findNearbyEvents = function(events, currLocation) {
  'use strict';
  if (events.length == 0) {
    return "No nearby events";
  }
};

nearyouScript.prototype.isNearby = function(eventObj, currLocation) {
  
  var distanceFromCurrLocation = Math.sqrt(
    (Math.pow((eventObj.xlocation - currLocation.xlocation), 2)) + 
    (Math.pow((eventObj.ylocation - currLocation.ylocation), 2)) 
  );
  if (distanceFromCurrLocation <= 2000) {
    return 'true';
  }
  else { return 'false'; }
};
