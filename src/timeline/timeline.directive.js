(function () {
    angular.module('app.room')
        .directive('timeline', function () {
            return {
                restrict: 'E',
                scope: {
                    availablity: '<'
                },
                templateUrl: 'views/timeline.directive.html',
                controllerAs: 'vm',
                controller: function ($scope) {
                    let vm = this;
                    vm.selectHours = selectHours;
                    vm.selectedHours = [];
                    vm.roomTimeLine = [];
                    initHours();
                    filterRoomAvailabillity();
                    ///////////////////

                    $scope.$on('roomBooking', onRoomBooking);
                    function onRoomBooking(event,data) {
                        if(data.isBooked) {
                            vm.selectedHours = [];
                        }
                    }

                    $scope.$watch('availablity', onAvailabillityChanges);
                    function onAvailabillityChanges(current,original) {
                        $scope.availablity = current;
                        vm.selectedHours = [];
                        initHours();
                        filterRoomAvailabillity();
                    }

                    
                    function availablityBookingEvent() {
                        $scope.$emit('onAvailabillityBookingEvent',vm.selectedHours);
                    }


                    function Hour(hour) {
                        return {
                            hour: hour,
                            availablity: false
                        };
                    }

                    function initHours() {
                        let hours = [];
                        let topHours = [];
                        for (let i = 0; i < 24; i++) {
                            if (i > 6 && i < 20) {
                                for (let j = 0; j < 4; j++) {
                                    if (i === 19 && j === 1) {
                                        break;
                                    }
                                    else {
                                        hours.push(new Hour((i < 10 ? '0' : '') + i + ':' + (j === 0 ? '00' : 15 * j)));
                                    }
                                }
                            }
                        }
                        vm.roomTimeLine = hours;
                    }

                    function filterRoomAvailabillity() {
                        let roomAvailabillity = $scope.availablity;
                        for (let i = 0; i < roomAvailabillity.length; i++) {
                            let hoursToCompare = roomAvailabillity[i].split(' - ');
                            let availFrom = hoursToCompare[0];
                            let availTo = hoursToCompare[1];
                            vm.roomTimeLine.forEach((Hour, key) => {
                                if (Hour.hour >= availFrom && Hour.hour <= availTo) {
                                    Hour.availablity = true;
                                }
                            });
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
                        let stepIndex = vm.roomTimeLine.findIndex(s => { return (s.hour === step.hour); });
                        let nextStep = vm.roomTimeLine[stepIndex + 1];
                        if (nextStep && nextStep.availablity) {
                            return vm.selectedHours.push(step);
                        } else {
                            return 0;
                        }
                    }

                    function selectHours(step) {
                        let isAllowed = true;
                        if (vm.selectedHours.length === 2) {
                            vm.selectedHours = [];
                            pushSelectedHours(step);
                        }
                        else {
                            if (vm.selectedHours.length === 1) {
                                if (step.hour > vm.selectedHours[0].hour) {
                                    vm.roomTimeLine.forEach((h, index) => {
                                        if (h.hour > vm.selectedHours[0].hour &&
                                            h.hour < step.hour && !h.availablity) {
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