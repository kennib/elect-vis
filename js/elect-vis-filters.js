electvisfilters = angular.module('elect-vis-filters', []);

electvisfilters.filter('percent', function() {
  return function(value, outof) {
    return value/outof * 100;
  }
});

electvisfilters.filter('sum', function() {
  return function(list, attr) {
    var sum = 0;
    angular.forEach(list, function(l) {
      if (attr)
        sum += l[attr];
      else
        sum += l;
    });

    return sum;
  }
});
