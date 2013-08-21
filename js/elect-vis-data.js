electvisdata = angular.module('elect-vis-data', []);

electvisdata.factory('electorates', function($http) {
	return $http.get('data/electorates.json').then(function(response) {
		return response.data;
	});
});
