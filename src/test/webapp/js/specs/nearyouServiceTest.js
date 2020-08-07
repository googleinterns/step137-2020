describe('the nearyou service', function() {
  var nearyouService;

  beforeEach(function() {
    nearyouService = new nearyouScript();
    events = [];
    eventObjs = [];
    currLocation = {xlocation : 0, ylocation : 0};
  });

  it('detects when there are no events', function () {
    var response = nearyouService.findNearbyEvents(events, currLocation);
    expect(response).toBe('No nearby events');
  });

  it('detects whether an event is nearby', function() {
    eventObj = {event : 'Event 1', xlocation : 1500, ylocation : 0};
    var isNearby = nearyouService.isNearby(eventObj, currLocation);
    expect(isNearby).toBe(true);
  });

  it('detects when an event is not nearby', function() {
    eventObj = {event : 'Event 1', xlocation : 2200, ylocation : 0};
    var isNearby = nearyouService.isNearby(eventObj, currLocation);
    expect(isNearby).toBe(false);
  });
  
  it('returns only nearby events', function() {
    eventObj1 = {event : 'Far event', xlocation : 2200, ylocation : 0};
    eventObjs.push(eventObj1);
    eventObj2 = {event : 'Near event', xlocation : 1500, ylocation : 500};
    eventObjs.push(eventObj2);
    var nearbyEvents = nearyouService.findNearbyEvents(eventObjs, currLocation);
    expect(nearbyEvents).toEqual([eventObj2]);
  });

  it('displays events in order of the nearest events', function() {
    eventObjs = [
      {event : 'Farthest event', xlocation : 1900, ylocation : 0},
      {event : 'Second Nearest event', xlocation : 1500, ylocation : 0},
      {event : 'Nearest event', xlocation : 1200, ylocation : 0}
    ];
    var nearbyEventsInOrder = nearyouService.findNearbyEvents(eventObjs, 
      currLocation
    );
    expect(nearbyEventsInOrder).toEqual(
      [
        {event : 'Nearest event', xlocation : 1200, ylocation : 0, distance : 1200},
        {event : 'Second Nearest event', xlocation : 1500, ylocation : 0, distance : 1500},
        {event : 'Farthest event', xlocation : 1900, ylocation : 0, distance : 1900}
      ]
    );
  });
});
