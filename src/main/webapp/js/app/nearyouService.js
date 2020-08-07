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
    this.nearyouEvents.sort( this.compareDistancetoCurrLocation );
    return this.nearyouEvents;
  }
};

nearyouScript.prototype.isNearby = function(eventObj, currLocation) {
  var distanceFromCurrLocation = this.getDistance(eventObj, currLocation);
  if (distanceFromCurrLocation <= 2000) {
    return true;
  }
  else { return false; }
};

nearyouScript.prototype.getDistance = function(eventObj, currLocation) {
  // Use the Haversine formula to calculate great-circle distance between two points.
  const earthRadius = 6371e3; //in metres
  const latInRad1 = currLocation.lat * Math.PI/180;
  const latInRad2 = eventObj.lat * Math.PI/180;
  const changeLat = (eventObj.lat - currLocation.lat) * Math.PI/180;
  const changeLng = (eventObj.lng - currLocation.lng) * Math.PI/180;
 // a is the square of half the chord length between two points
  const a = Math.sin(changeLat/2) * Math.sin(changeLat/2) +
            Math.cos(latInRad1) * Math.cos(latInRad2) *
            Math.sin(changeLng/2) * Math.sin(changeLng/2);
  // c is the angular distance between two points in radians.
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = earthRadius * c; // in metres
  return Math.round(distance/100)*100; // round to nearest hundred
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
