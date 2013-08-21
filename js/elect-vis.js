electvis = angular.module('elect-vis', ['elect-vis-data']);


electvis.config(function($routeProvider) {
	$routeProvider.
		when('', {controller: pageCtrl, templateUrl: 'pages/home.html'}).
		when('/:year/electorate/:electorate', {controller: electorateCtrl, templateUrl: 'pages/electorate.html'}).
		when('/:year/electorates', {controller: electorateCtrl, templateUrl: 'pages/electorates.html'}).
		when('/:year/electorate', {redirectTo: '/:year/electorates'})
});

/* Default static-ish page controller */
function pageCtrl($scope) {
}

/* Electorates data and visualisation controller */
function electorateCtrl($scope, $routeParams,
                        electorates) {
	$scope.year = $routeParams.year;

	$scope.electorates = electorates;
	
	var electorateName = $routeParams.electorate;
	$scope.electorate = electorates[electorateName];
}
