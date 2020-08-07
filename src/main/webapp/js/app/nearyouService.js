function nearyouScript() {
}
nearyouScript.prototype.locationRadius = 2000;
nearyouScript.prototype.events = [];
nearyouScript.prototype.eventObjs = [];
nearyouScript.prototype.nearyouEvents = [];
nearyouScript.prototype.findNearbyEvents = function(eventObjList, currLocation) {
  if (eventObjList.length == 0) {
    return "No nearby events";
  }
  else {
    this.nearyouEvents = [];
    for (var i = 0; i < eventObjList.length; i++) {
      if (this.isNearby(eventObjList[i], currLocation)) {
        var distanceFromLocation = this.getDistance(eventObjList[i], currLocation);
        eventObjList[i].distance = distanceFromLocation;
        this.nearyouEvents.push(eventObjList[i]);
      }
    }
    // return this.nearyouEvents.length;
    this.nearyouEvents.sort( this.compareDistancetoCurrLocation );
    return this.nearyouEvents;
  }
};

nearyouScript.prototype.isNearby = function(eventObj, currLocation) {
  var distanceFromCurrLocation = Math.sqrt(
    (Math.pow((eventObj.xlocation - currLocation.xlocation), 2)) + 
    (Math.pow((eventObj.ylocation - currLocation.ylocation), 2)) 
  );
  if (distanceFromCurrLocation <= 2000) {
    return true;
  }
  else { return false; }
};

nearyouScript.prototype.getDistance = function(eventObj, currLocation) {
  var distance = Math.sqrt(
    (Math.pow((eventObj.xlocation - currLocation.xlocation), 2)) + 
    (Math.pow((eventObj.ylocation - currLocation.ylocation), 2)) 
  );
  return distance;
}

nearyouScript.prototype.compareDistancetoCurrLocation = function (eventObj1, eventObj2) {
  if (eventObj1.distance < eventObj2.distance) {
    return -1;
  }
  if (eventObj1.distance > eventObj2.distance) {
    return 1;
  }
  return 0;
}
