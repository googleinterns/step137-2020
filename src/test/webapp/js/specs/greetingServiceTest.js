describe("the greeting service", function () {
  var greetingService;

  beforeEach(function () {
    greetingService = new GreetingService();
  });

  it('must create a valid greeting', function () {
    var greet = greetingService.greet('foo');
    expect(greet).toBe('Hello, foo');
  });

  it('must use an altered greeting', function () {
    greetingService.greeting = 'Hey';
    var greet = greetingService.greet('bar');
    expect(greet).toBe('Hey, bar');
  });

  it('must use fallback if no name given', function() {
    var greet = greetingService.greet();
    expect(greet).toBe('This test will be failing');
  });
})