describe('the nearyou service', function() {
  var nearyouService;

  beforeEach(function() {
    nearyouService = new nearyouScript();
    events = [];
    eventObjs = [];
    currLocation = new Object();
    currLocation.xlocation = 0;
    currLocation.ylocation = 0;
  });

  it('must detect when there are no events', function () {
    var response = nearyouService.findNearbyEvents(events, currLocation);
    expect(response).toBe('No nearby events');
  });

  it('must detect whether an event is nearby', function() {
    eventObj = new Object();
    eventObj.event = 'Event 1';
    eventObj.xlocation = 1500;
    eventObj.ylocation = 0;
    var isNearby = nearyouService.isNearby(eventObj, currLocation);
    expect(isNearby).toBe(true);
  });

  it('must detect when an event is not nearby', function() {
    eventObj = new Object();
    eventObj.event = 'Event 1';
    eventObj.xlocation = 2200;
    eventObj.ylocation = 0;
    var isNearby = nearyouService.isNearby(eventObj, currLocation);
    expect(isNearby).toBe(false);
  });
  
  it('must only return nearby events', function() {
    eventObj1 = new Object();
    eventObj1.event = 'Far event';
    eventObj1.xlocation = 2200;
    eventObj1.ylocation = 0;
    eventObjs.push(eventObj1);
    eventObj2 = new Object();
    eventObj2.event = 'Near event';
    eventObj2.xlocation = 1500;
    eventObj2.ylocation = 500;
    eventObjs.push(eventObj2);
    var nearbyEvents = nearyouService.findNearbyEvents(eventObjs, currLocation);
    expect(nearbyEvents).toEqual([eventObj2]);
  });

  it('must display events in order of the nearest events',function() {
    //create event objects with varying distances to currLocation
    //expect the resulting array to be in order of nearness to you current Location
  })
});
