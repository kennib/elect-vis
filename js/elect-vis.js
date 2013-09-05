electvis = angular.module('elect-vis', ['elect-vis-data', 'elect-vis-diagrams']);


electvis.config(function($routeProvider) {
	$routeProvider.
		when('', {controller: pageCtrl, templateUrl: 'pages/home.html'}).
		when('/electorate/:electorate', {controller: electorateCtrl, templateUrl: 'pages/electorate.html'}).
		when('/electorates/:electorate', {redirectTo: '/electorate/:electorate'}).
		when('/electorates', {controller: electorateCtrl, templateUrl: 'pages/electorates.html'}).
		when('/electorate', {redirectTo: '/electorates'}).
		when('/map', {controller: mapCtrl, templateUrl: 'pages/map.html'})
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

/* Controller for the map */
function mapCtrl($scope) {
	// Create the map
	var map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(-25.641526, 132.964783),
		zoom: 4,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.RIGHT_TOP
		},
		mapTypeControl: false,
		panControl: false,
		streetViewControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	console.log(document.getElementById('map'), map);
	var layer = new google.maps.FusionTablesLayer({
      map: map,
      heatmap: { enabled: false },
      query: {
        select: "col3",
        from: "1KxmDttJs8iLccWZwOjw5yofSkvYpOXd5iILRCKY",
        where: ""
      },
      options: {
        styleId: 2,
        templateId: 2
      }
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