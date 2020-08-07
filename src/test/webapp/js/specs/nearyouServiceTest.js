describe('the nearyou service', function() {
  var nearyouService;

  beforeEach(function() {
    nearyouService = new nearyouScript();
    events = [];
    eventObjs = [];
    currLocation = {lat : 0.0, lng : 0.0};
  });

  it('detects when there are no events', function () {
    var response = nearyouService.findNearbyEvents(events, currLocation);
    expect(response).toBe('No nearby events');
  });

  it('calculates distance between two locations', function() {
    eventObj = {event : 'Event 1', lat : 1, lng : 1};
    var distance = nearyouService.getDistance(eventObj, currLocation);
    expect(distance).toBe(157200); // correct value gotten from online calculator
  });

  it('detects whether an event is nearby', function() {
    // distance from eventObj to currLocation here is approx 1000 metres
    eventObj = {event : 'Event 1', lat : 0.009, lng : 0};
    var isNearby = nearyouService.isNearby(eventObj, currLocation);
    expect(isNearby).toBe(true);
  });

  it('detects when an event is not nearby', function() {
    // distance from eventObj to currLocation is approximately 222000 metres
    eventObj = {event : 'Event 1', lat : 2, lng : 0};
    var isNearby = nearyouService.isNearby(eventObj, currLocation);
    expect(isNearby).toBe(false);
  });
  
  it('returns only nearby events', function() {
    eventObj1 = {event : 'Far event', lat : 2, lng : 0};
    eventObjs.push(eventObj1);
    eventObj2 = {event : 'Near event', lat : 0.009, lng : 0};
    eventObjs.push(eventObj2);
    var nearbyEvents = nearyouService.findNearbyEvents(eventObjs, currLocation);
    expect(nearbyEvents).toEqual([eventObj2]);
  });

  it('displays events in order of the nearest events', function() {
    eventObjs = [
      {event : 'Farthest event', lat : 0.009, lng : 0},
      {event : 'Second Nearest event', lat : 0.0085, lng : 0},
      {event : 'Nearest event', lat : 0.007, lng : 0}
    ];
    var nearbyEventsInOrder = nearyouService.findNearbyEvents(eventObjs, 
      currLocation
    );
    expect(nearbyEventsInOrder).toEqual(
      [
        {event : 'Nearest event', lat : 0.007, lng : 0, distance : 800},
        {event : 'Second Nearest event', lat : 0.0085, lng : 0, distance : 900},
        {event : 'Farthest event', lat : 0.009, lng : 0, distance : 1000}
      ]
    );
  });
});
