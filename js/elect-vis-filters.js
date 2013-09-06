electvisfilters = angular.module('elect-vis-filters', []);

electvisfilters.filter('percent', function() {
  return function(value, outof) {
    return value/outof * 100;
  }
});
