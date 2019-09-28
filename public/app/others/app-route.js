(function() {
    "use strict";

    angular.module('app').config(config);

    config.$inject = ['$routeProvider', '$locationProvider'];

    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {	// path della view
                templateUrl: '/app/pages/home.html',	// view da usare 
                controller: 'TodoCtrl',	// controler da usare
                controllerAs: 'td'	// alias del controller da usare nella view
            })
            .when('/new', {
                templateUrl: '/app/pages/new.html',
                controller: 'TodoNewCtrl',
                controllerAs: 'tn'
            })
            .when('/edit/:id', {
                templateUrl: '/app/pages/edit.html',
                controller: 'TodoEditCtrl',
                controllerAs: 'te'
            })
            .otherwise({ redirectTo: "/" });	// se mon trovata va in home
        // configure html5 to get links working
        // you URLs will be sgart.it/home rather than sgart.it/#/home
        //$locationProvider.html5Mode({ enabled: true });
    }

})();