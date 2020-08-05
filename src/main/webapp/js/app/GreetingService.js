function GreetingService() {
}

GreetingService.prototype.greeting = "Hello";

GreetingService.prototype.greet = function(name) {
  'use strict';
  if (!name) {
    name = 'anonymous';
  }
  return this.greeting + ", " + name;
};