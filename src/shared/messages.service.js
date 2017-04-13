(function () {
    'use strict';
    angular.module('app')
        .service('messageService', messageService);

    function messageService(toastr) {
        /**
         * @desc Exposed functions available from this service
         * @type {{error: error, success: success}}
         */
        let service = {
            error: error,
            success: success
        };
        return service;
        ////////////////////

        /**
         * @name error
         * @desc Used to dispatch a failure toast for a nice user feedback
         * @param {String} message Message to use for error display
         */
        function error(message) {
            toastr.error(message);
        }

        /**
         * @name success
         * @desc Used to dispatch a success toast for a nice user feedback
         * @param {String} message Message to use for success display
         */
        function success(message){
            toastr.success(message);
        }

        function errorHandler(err_code) {
          
        }
    }
})();
