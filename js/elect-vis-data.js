electvisdata = angular.module('elect-vis-data', []);

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
