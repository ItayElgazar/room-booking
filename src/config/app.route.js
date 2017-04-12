(function () {
    'use strict';
    angular.module('app')
        .config(route);

    function route($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('main', {
                abstract: true,
                url: '/',
                template: '<div ui-view></div>',
            })
            .state('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                controller: 'Home',
                controllerAs: 'vm'
            });
    }
})();
