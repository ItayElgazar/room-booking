(function () {
    'use strict';
    angular.module('app')
        .config(unauthorisedInterceptor);

    function unauthorisedInterceptor($provide, $httpProvider){
        /**
         * @desc If a response from an HTTP request comes back as unauthorized
         *       it means that the token has expired/is invalid, and the user is redirected to the login screen
         */
        $provide.factory('unauthorisedInterceptor', ['$q', function ($q) {
            return {
                'responseError': function (rejection) {
                    if (rejection.status === 401) {
                        window.location.href = '/#/auth/login';
                    }

                    return $q.reject(rejection);
                }
            };
        }]);

        $httpProvider.interceptors.push('unauthorisedInterceptor');
    }
})();