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

// Map party IDs to colours
electvisfilters.filter('partyColor', function() {
  return d3.scale.ordinal()
						.domain(["ALP", "LP", "NP", "GRN"])
						.range(["#E95D4E", "#45A1DE", "#F4A425", "#59BC26", "#2C3E50", "#E9662C", "#762AAC", "#AC876A", "#7591AC", "#52AC5E", "#AC72A2", "#068894", "#94261D", "#00AC65",]);
});
