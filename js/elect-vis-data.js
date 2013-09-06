electvisdata = angular.module('elect-vis-data', []);

electvisdata.factory('githubData', function($http) {
  var githubUrl = 'http://rawgithub.com/kennib/elect-data/master';
  delete $http.defaults.headers.common['X-Requested-With'];

  return function(file) {
    return $http.get(githubUrl+'/'+file+'.json').then(function(response) {
      return response.data;
    });
  };
});

electvisdata.factory('yearData', function(githubData) {
  return function (year) {
    var data = {};
    var datasets = ['candidates', 'twocandidate', 'firstpreferences', 'electorates', 'parties'];
    angular.forEach(datasets, function(set) {
      data[set] = githubData('data/'+year+'/'+set);
    });

    return data; 
  }
});


electvisdata.factory('news', function($http) {
	return $http.get('data/news.json').then(function(response) {
		return response.data;
	}).then(function(news) {
		return news;
	});
});

electvisdata.factory('electorates', function($http) {
	return $http.get('data/electorates.json').then(function(response) {
		return response.data;
	});
});

electvisdata.factory('preferences', function($http) {
	return $http.get('data/preferences.json').then(function(response) {
		return response.data;
	});
});
