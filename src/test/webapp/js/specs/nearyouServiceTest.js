describe('the nearyou service', function() {
  var nearyouService;

  beforeEach(function() {
    nearyouService = new nearyouScript();
    events = [];
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
    expect(isNearby).toBe('true');
  });

  it('must detect when an event is not nearby', function() {
    eventObj1 = new Object();
    eventObj1.event = 'Event 1';
    eventObj1.xlocation = 2200;
    eventObj1.ylocation = 0;
    var isNearby = nearyouService.isNearby(eventObj1, currLocation);
    expect(isNearby).toBe('false');
  });
  
});
