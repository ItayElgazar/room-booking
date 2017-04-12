'use strict';

//TODO: ngAnnotate!!!!!!
//Initialize the app
(function () {
        angular.module('app', [
        //3rd modules + angular modules
        'app.core',

        //Custom modules
        'app.home', 'app.room']);
})();
'use strict';

(function () {
    'use strict';

    angular.module('app').constant('API', 'https://challenges.1aim.com/roombooking');
})();
'use strict';

(function () {
    'use strict';

    angular.module('app').config(unauthorisedInterceptor);

    function unauthorisedInterceptor($provide, $httpProvider) {
        /**
         * @desc If a response from an HTTP request comes back as unauthorized
         *       it means that the token has expired/is invalid, and the user is redirected to the login screen
         */
        $provide.factory('unauthorisedInterceptor', ['$q', function ($q) {
            return {
                'responseError': function responseError(rejection) {
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
'use strict';

(function () {
    'use strict';

    angular.module('app').config(route);

    function route($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('main', {
            abstract: true,
            url: '/',
            template: '<div ui-view></div>'
        }).state('home', {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'Home',
            controllerAs: 'vm'
        });
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.home').controller('Home', Home);

    function Home($state, $scope, roomsService) {
        var vm = this;
        var today = new Date();
        vm.rooms = [];
        vm.query = {};
        vm.settings = {
            'selectedDate': today
        };

        vm.roomsByDate = getRoomsByDate;
        vm.setTomorrowDate = setTomorrowDate;
        vm.setYestardayDate = setYestardayDate;

        getRoomsByDate('now');
        /////////////////

        //TODO: block the option that user can see the room list of yestarday.

        function getRoomsByDate(date) {
            var timestamp = roomsService.filterDateToTimestamp(date, false);
            roomsService.getRoomsByDate(timestamp).then(function (rooms) {
                vm.rooms = rooms;
            });
        }

        function setTomorrowDate() {
            var selectedDate = vm.settings.selectedDate;
            selectedDate = selectedDate.setDate(selectedDate.getDate() + 1);
            getRoomsByDate(selectedDate);
        }

        function setYestardayDate() {
            var selectedDate = vm.settings.selectedDate;
            selectedDate = selectedDate.setDate(selectedDate.getDate() - 1);
            getRoomsByDate(selectedDate);
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app').directive('pop', Directive);

    function Directive(ModalService) {
        return {
            link: function link(scope, element, attrs) {
                // ensure id attribute exists
                if (!attrs.id) {
                    console.error('modal must have an id');
                    return;
                }

                // move element to bottom of page (just before </body>) so it can be displayed above everything else
                $('body').append(element);

                // close modal on background click
                element.on('click', function (e) {
                    var target = $(e.target);
                    if (!target.closest('.pop-body').length) {
                        scope.$evalAsync(Close);
                    }
                });

                // add self (this modal instance) to the modal service so it's accessible from controllers
                var modal = {
                    id: attrs.id,
                    open: Open,
                    close: Close
                };
                ModalService.Add(modal);

                // remove self from modal service when directive is destroyed
                scope.$on('$destroy', function () {
                    ModalService.Remove(attrs.id);
                    element.remove();
                });

                // open modal
                function Open() {
                    $(element).show();
                    $('body').addClass('pop-open');
                }

                // close modal
                function Close() {
                    $(element).hide();
                    $('body').removeClass('pop-open');
                }
            }
        };
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app').factory('ModalService', Service);

    function Service() {
        var modals = []; // array of modals on the page
        var service = {};

        service.Add = Add;
        service.Remove = Remove;
        service.Open = Open;
        service.Close = Close;

        return service;

        function Add(modal) {
            // add modal to array of active modals
            modals.push(modal);
        }

        function Remove(id) {
            // remove modal from array of active modals
            var modalToRemove = _.findWhere(modals, { id: id });
            modals = _.without(modals, modalToRemove);
        }

        function Open(id) {
            // open modal specified by id
            var modal = _.findWhere(modals, { id: id });
            modal.open();
        }

        function Close(id) {
            // close modal specified by id
            var modal = _.findWhere(modals, { id: id });
            modal.close();
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.room').component('room', {
        bindings: { //TODO: ngAnnotate
            //@ reads the attribute value, = provides two-way binding, & works with functions
            room: '<',
            selectedDate: '<',
            onDetails: '&',
            fullPage: '@'
        },
        templateUrl: 'views/room.component.html',
        controllerAs: 'vm',
        controller: function controller($scope, roomsService, ModalService) {
            var vm = this;
            vm.openModal = openModal;
            vm.closeModal = closeModal;
            vm.bookRoom = bookRoom;
            vm.addPraticipant = addPraticipant;
            vm.removePraticipant = removePraticipant;
            vm.modal = false;
            vm.praticipants = [];
            vm.praticipant = {};
            ///////////////

            $scope.$on('onAvailabillityBookingEvent', onAvailabillityBooking);

            function onAvailabillityBooking(event, args) {
                vm.room.selectedHours = args;
            }

            function bookRoom() {
                if (vm.praticipants.length > 0) {
                    var date = vm.selectedDate;
                    var start = roomsService.filterDateToTimestamp(date, splitTime(vm.room.selectedHours[0].hour));
                    var end = roomsService.filterDateToTimestamp(date, splitTime(vm.room.selectedHours[1].hour));
                    var name = vm.room.name;
                    var praticipants = angular.toJson(vm.praticipants);

                    var bookingSechma = new Booking({
                        "date": roomsService.filterDateToTimestamp(date, false),
                        "start": start,
                        "end": end,
                        "name": name,
                        "praticipants": JSON.parse(praticipants)
                    });

                    roomsService.sendPass(bookingSechma).then(function (res) {
                        if (res.success) {
                            vm.room.selectedHours = [];
                            vm.praticipants = [];
                        } else {}
                    });
                }
            }

            function addPraticipant() {
                vm.praticipants.push(vm.praticipant);
                vm.praticipant = {};
            }

            function removePraticipant(praticipant) {
                vm.praticipants = vm.praticipants.filter(function (p) {
                    return p.name !== praticipant.name;
                });
            }

            function Booking(booking) {
                return {
                    "booking": {
                        date: booking.date,
                        "time_start": booking.start,
                        "time_end": booking.end,
                        "title": "Booking Title!",
                        "description": "Booking description",
                        "room": booking.name
                    },
                    "passes": booking.praticipants
                };
            }

            function splitTime(time) {
                return { "hour": time.split(':')[0], "minutes": time.split(':')[1] };
            }

            function openModal(id) {
                ModalService.Open(id);
                vm.modal = true;
            }

            function closeModal(id) {
                ModalService.Close(id);
                vm.modal = false;
            }
        }
    });
})();
//Would open a popup with room info by directive
//Availability: ["07:00 - 09:30", "11:00 - 11:45", "14:30 - 18:45"]
'use strict';

(function () {
    'use strict';

    angular.module('app.room').value('AVAIL_ROOMS', false).service('roomsService', roomsService);

    function roomsService($http, API, AVAIL_ROOMS) {

        var service = {
            getRoomsByDate: getRoomsByDate,
            sendPass: sendPass,
            filterDateToTimestamp: filterDateToTimestamp
        };
        return service;
        //////////////////


        /**
         * @name getRoomsByDate
         * @desc Gets room list from the API using API endpoint constant
         * @param {String} date - "Now" | "Today" | Unix timestamp
         * @returns {Array} rooms list
         */
        function getRoomsByDate(date) {
            return $http({
                method: 'POST',
                url: API + '/getrooms',
                headers: { 'Content-Type': 'text/plain' },
                data: {
                    date: date
                }
            }).then(function (res) {
                AVAIL_ROOMS = res.data;
                return res.data;
            }).catch(function (e) {
                console.log(e);
            });
        }

        function sendPass(booking) {
            return $http({
                method: 'POST',
                url: API + '/sendpass',
                headers: { 'Content-Type': 'text/plain' },
                data: booking
            }).then(function (res) {
                return res.data;
            });
        }

        function filterDateToTimestamp(date, time) {
            var filterDate = void 0;

            if (date === 'now') {
                return date;
            }

            if (time) {
                filterDate = new Date(date).setHours(time.hour, time.minutes, 0, 0);
            } else {
                filterDate = date;
            }

            return Math.floor(filterDate / 1000);
        }
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app').service('messageService', messageService);

    function messageService(toastr) {
        /**
         * @desc Exposed functions available from this service
         * @type {{error: error, success: success}}
         */
        var service = {
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
        function success(message) {
            toastr.success(message);
        }
    }
})();
'use strict';

(function () {
    angular.module('app.room').directive('timeline', function () {
        return {
            restrict: 'E',
            scope: {
                availablity: '<'
            },
            templateUrl: 'views/timeline.directive.html',
            controllerAs: 'vm',
            controller: function controller($scope) {
                var vm = this;
                vm.selectHours = selectHours;
                vm.selectedHours = [];
                vm.roomTimeLine = [];
                initHours();
                filterRoomAvailabillity();
                ///////////////////

                $scope.$watch('availablity', onAvailabillityChanges);

                function onAvailabillityChanges(current, original) {
                    $scope.availablity = current;
                    vm.selectedHours = [];
                    initHours();
                    filterRoomAvailabillity();
                }

                function availablityBookingEvent() {
                    $scope.$emit('onAvailabillityBookingEvent', vm.selectedHours);
                }

                function Hour(hour) {
                    return {
                        hour: hour,
                        availablity: false
                    };
                }

                function initHours() {
                    var hours = [];
                    var topHours = [];
                    for (var i = 0; i < 24; i++) {
                        if (i > 6 && i < 20) {
                            for (var j = 0; j < 4; j++) {
                                if (i === 19 && j === 1) {
                                    break;
                                } else {
                                    hours.push(new Hour((i < 10 ? '0' : '') + i + ':' + (j === 0 ? '00' : 15 * j)));
                                }
                            }
                        }
                    }
                    vm.roomTimeLine = hours;
                }

                function filterRoomAvailabillity() {
                    var roomAvailabillity = $scope.availablity;

                    var _loop = function _loop(i) {
                        var hoursToCompare = roomAvailabillity[i].split(' - ');
                        var availFrom = hoursToCompare[0];
                        var availTo = hoursToCompare[1];
                        vm.roomTimeLine.forEach(function (Hour, key) {
                            if (Hour.hour >= availFrom && Hour.hour <= availTo) {
                                Hour.availablity = true;
                            }
                        });
                    };

                    for (var i = 0; i < roomAvailabillity.length; i++) {
                        _loop(i);
                    }
                }

                /** 
                {@function} getMaxNumIndex
                {@param} array [size 2]
                {@desc} checking the max size in array
                {@return} ![index]! of the max numbe in array
                */
                function getMaxNumIndex(arr) {
                    if (arr[1] > arr[0]) {
                        return 1;
                    }

                    return 0;
                }

                function pushSelectedHours(step) {
                    var stepIndex = vm.roomTimeLine.findIndex(function (s) {
                        return s.hour === step.hour;
                    });
                    var nextStep = vm.roomTimeLine[stepIndex + 1];
                    if (nextStep && nextStep.availablity) {
                        return vm.selectedHours.push(step);
                    } else {
                        return 0;
                    }
                }

                function selectHours(step) {
                    var isAllowed = true;
                    if (vm.selectedHours.length === 2) {
                        vm.selectedHours = [];
                        pushSelectedHours(step);
                    } else {
                        if (vm.selectedHours.length === 1) {
                            if (step.hour > vm.selectedHours[0].hour) {
                                vm.roomTimeLine.forEach(function (h, index) {
                                    if (h.hour > vm.selectedHours[0].hour && h.hour < step.hour && !h.availablity) {
                                        isAllowed = false;
                                    }
                                });
                                if (isAllowed) {
                                    vm.selectedHours.push(step);
                                    availablityBookingEvent();
                                }
                            }
                        } else {
                            pushSelectedHours(step);
                        }
                    }
                }
            }
        };
    });
})();