electvis = angular.module('elect-vis', []);


electvis.config(function($routeProvider) {
	$routeProvider.
		when('', {controller: pageCtrl, templateUrl: 'pages/home.html'});
});

/* Default static-ish page controller */
function pageCtrl($scope) {
}
