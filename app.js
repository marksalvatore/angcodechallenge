(function(){
	'use strict';

	var app = angular.module('app', ['ngRoute']);

	// Constants
	app.constant('ENDPOINT', {
			login : 'http://kelbynew.staging.wpengine.com/api/v1/login',
			categories : 'http://kelbynew.staging.wpengine.com/api/v1/categories',
			courses : 'http://kelbynew.staging.wpengine.com/api/v1/category-classes'
	});
	app.constant('CREDENTIALS', {
			username : 'root',
			password : 'root'
	});

	// Router
	app.config(['$routeProvider', function($routeProvider) {
		$routeProvider
		.when('/login', {
			templateUrl: 'templates/login.html'
		})
		.when('/home', {
			templateUrl: 'templates/home.html'
		})
		.otherwise({
			redirectTo: '/login'
		});
	}]);

	// MainCtrl
	app.controller('MainCtrl', ['$rootScope', '$location', 'DataSrvc', 'ENDPOINT', 'CREDENTIALS', function($rootScope, $location, DataSrvc, ENDPOINT, CREDENTIALS) {

		var vm = this;

		$rootScope.sessionToken = null;
		vm.username = null;
		vm.password = null;
		vm.feedback = false;
		vm.overlayme = false;

		// Make login request
		vm.getLoginToken = function(){

			console.log('getting token...');
			vm.overlayme = true;

			var request = {
				'request_data':{
					'username': CREDENTIALS.username,
					'password': CREDENTIALS.password
				},
				'device':{
					'app_version':'3.0',
					'hardware_model':'iPhone 6s',
					'operating_system':'9.2.1'
				}
			};

			// Handle login response
			DataSrvc.getData(ENDPOINT.login, request)
				.then(function(resp){
						$rootScope.sessionToken = resp.data.response_data.session_token;
						vm.overlayme = false;
						$location.path('/home');
						console.log("Here's the token:");
						console.log($rootScope.sessionToken);
						// Now use the token to fetch categories
						vm.getCategories();
				},
				function(error){
					$rootScope.sessionToken = null;
					$location.path('/login');
					console.log("Couldn't connect: " + error);
				}
			);
		}; // getLoginToken()

		// Make categories request
		vm.getCategories = function(){
			console.log('getting categories...');
			vm.overlayme = true;
			var request = {
				'request_data':[],
				'device':{
					'app_version':'3.0',
					'hardware_model':'iPhone 6s',
					'operating_system':'9.2.1'
				},
				'session_token': $rootScope.sessionToken
			};

			// Handle categories response
			DataSrvc.getData(ENDPOINT.categories, request)
				.then(function(resp){
					vm.categories = resp.data.response_data;
					vm.overlayme = false;
					console.log("Here come the categories:");
					console.log(vm.categories);
				},
				function(error){
					$rootScope.sessionToken = null;
					$location.path('/login');
					console.log("Couldn't connect: " + error);
				}
			);
		};

		// Make courses request
		vm.getCourses = function(index, $event){
			var catId = event.target.id;
			vm.selectedCatIndex = index;
			console.log('getting courses for category id: ' + catId + ' ...');
			vm.overlayme = true;

			var request = {
				"request_data":{
					"category_id": catId
				},
				"device":{
					"app_version":"3.0",
					"hardware_model":"iPhone 6s",
					"operating_system":"9.2.1"
				},
				'session_token': $rootScope.sessionToken
			};

			// Handle courses response
			DataSrvc.getData(ENDPOINT.courses, request)
				.then(function(resp){
					vm.courses = resp.data.response_data;
					vm.overlayme = false;
					$location.path('/home');
					console.log("Here are the courses:");
					console.log(vm.courses);
				},
				function(error){
					$rootScope.sessionToken = null;
					$location.path('/login');
					console.log("Couldn't connect: " + error);
				}
			);
		};

		// Login
		vm.login = function(){
			if( vm.username === CREDENTIALS.username && vm.password === CREDENTIALS.password) {
				vm.getLoginToken();
			} else {
				vm.feedback = true;
				console.log('Login credentials are incorrect!');
			}
		};

		// Logout
		vm.logout = function(){
			console.log("Logging out...");
			vm.feedback = false;
			$rootScope.sessionToken = null;
			$location.path('/login');
			console.log("Logged out!");
		};

	}]); // MainCtrl


	// DataSrvc
	app.service('DataSrvc', ['$http', function($http) {
		this.getData = function(url, request){
			return $http.post(url, request);
		};
	}]);

}());
