electvis = angular.module('elect-vis', ['elect-vis-data', 'elect-vis-diagrams']);


electvis.config(function($routeProvider) {
	$routeProvider.
		when('', {controller: pageCtrl, templateUrl: 'pages/home.html'}).
		when('/electorate/:electorate', {controller: electorateCtrl, templateUrl: 'pages/electorate.html'}).
		when('/electorates/:electorate', {redirectTo: '/electorate/:electorate'}).
		when('/electorates', {controller: electorateCtrl, templateUrl: 'pages/electorates.html'}).
		when('/electorate', {redirectTo: '/electorates'})
});

/* Default static-ish page controller */
function pageCtrl($scope) {
}


/* Controller for the header */
function headerCtrl($scope,
                    electorates) {
	$scope.electorates = electorates;
}

/* Controller for the footer */
function footerCtrl($scope, $location) {
	$scope.$on('$locationChangeSuccess', function(){
		$scope.breadcrumbs = $location.path().split('/');
	});
}

/* Electorates data and visualisation controller */
function electorateCtrl($scope, $routeParams,
                        electorates, preferences) {
	$scope.electorates = electorates;
	$scope.preferences = preferences;
	
	if ($routeParams.electorate)
		$scope.electorateName = $routeParams.electorate;
	else
		$scope.electorateName = '';
	$scope.electorateName = $scope.electorateName.capitalize();
	
	// By default pretend an electorate is available
	$scope.electorate = {};
	
	// Watch for async electorates
	$scope.$watch('electorates', function(electorates) {
		if (electorates)
			$scope.electorate = electorates[$scope.electorateName];
	});
}