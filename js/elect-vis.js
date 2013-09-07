electvis = angular.module('elect-vis', ['elect-vis-data', 'elect-vis-diagrams', 'elect-vis-filters']);


electvis.config(function($routeProvider) {
	$routeProvider.
		when('/home', {controller: pageCtrl, templateUrl: 'pages/home.html'}).
		when('/electorate/:electorate', {controller: electorateCtrl, templateUrl: 'pages/electorate.html'}).
		when('/electorates/:electorate', {redirectTo: '/electorate/:electorate'}).
		when('/electorates', {controller: electorateCtrl, templateUrl: 'pages/electorates.html'}).
		when('/electorate', {redirectTo: '/electorates'}).
    when('/livefeed', {controller: liveCtrl, templateUrl: 'pages/livefeed.html'}).
    when('/live', {redirectTo: '/livefeed'}).
    otherwise({redirectTo: '/livefeed'});
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

/* Controller for the new section */
function newsCtrl($scope, news) {
	// Load articles
	news.then(function(news) {
		$scope.articles = news.articles;
	});
};

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

/* Live feed for use on election night */
function liveCtrl($scope, $timeout,
                  electorates, yearData) {
  window.scope = $scope;
  var year =  2010; // Mock live data from 2010

  $scope.electorates = electorates;
  $scope.livedata = yearData(year);

  // Auto updater
  $scope.updatePeriod = 2*60*1000; // Update data every two minutes
  var refreshPeriod = 1000; // Update refresh meter every second
  $scope.lastUpdate = Date.now();
  $scope.untilNextUpdate = $scope.updatePeriod;
  
  $scope.updateData = function() {
    // Do an update
    if ($scope.lastUpdate + $scope.updatePeriod < Date.now() && Date.now() > new Date("September 7 2013 16:00:00")) {
      $scope.livedata = yearData(year);
      $scope.lastUpdate = Date.now();
    };

    $scope.untilNextUpdate = ($scope.lastUpdate + $scope.updatePeriod) - Date.now();
    refresh = $timeout($scope.updateData, refreshPeriod);
  };

  var refresh;
  $scope.updateData();
};
