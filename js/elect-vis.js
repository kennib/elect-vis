electvis = angular.module('elect-vis', ['elect-vis-data']);


electvis.config(function($routeProvider) {
	$routeProvider.
		when('', {controller: pageCtrl, templateUrl: 'pages/home.html'}).
		when('/electorate/:electorate', {controller: electorateCtrl, templateUrl: 'pages/electorate.html'}).
		when('/electorates', {controller: electorateCtrl, templateUrl: 'pages/electorates.html'}).
		when('/electorate', {redirectTo: '/:year/electorates'})
});

/* Default static-ish page controller */
function pageCtrl($scope) {
}

/* Electorates data and visualisation controller */
function electorateCtrl($scope, $routeParams,
                        electorates) {
	$scope.electorates = electorates;
	
	var electorateName = $routeParams.electorate;
	if (electorateName) electorateName = electorateName.capitalize();
	// Watch for async electorates
	$scope.$watch('electorates', function(electorates) {
		if (electorates)
			$scope.electorate = electorates[electorateName];
	});
}
