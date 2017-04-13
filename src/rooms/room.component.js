(function () {
    'use strict';
    angular.module('app.room')
        .component('room', {
            bindings: { //TODO: ngAnnotate
                //@ reads the attribute value, = provides two-way binding, & works with functions
                room: '<',
                selectedDate: '<',
                onDetails: '&',
                fullPage: '@'
            },
            templateUrl: 'views/room.component.html',
            controllerAs: 'vm',
            controller: function ($scope, roomsService, messageService, ModalService) {
                var vm = this;
                vm.openModal = openModal;
                vm.closeModal = closeModal;
                vm.bookRoom = bookRoom;
                vm.addPraticipant =  addPraticipant;
                vm.removePraticipant = removePraticipant;
                vm.modal = false;
                vm.praticipants = [];
                vm.praticipant = {};
                ///////////////
            
                $scope.$on('onAvailabillityBookingEvent',onAvailabillityBooking);

                function onAvailabillityBooking(event,args) {
                    vm.room.selectedHours = args;
                }


                function bookRoom() {
                    if(vm.praticipants.length > 0) {
                        let date = vm.selectedDate;
                        let start = roomsService.filterDateToTimestamp(date,splitTime(vm.room.selectedHours[0].hour));
                        let end = roomsService.filterDateToTimestamp(date,splitTime(vm.room.selectedHours[1].hour));
                        let name = vm.room.name;
                        let praticipants = angular.toJson(vm.praticipants);

                        let bookingSechma = new Booking({
                            "date": roomsService.filterDateToTimestamp(date,false),
                            "start": start,
                            "end": end,
                            "name": name,
                            "praticipants": JSON.parse(praticipants)
                        });
                        
                        roomsService.sendPass(bookingSechma)
                        .then((res)=>{
                           if(res.success) {
                               vm.room.selectedHours = [];
                               vm.praticipants = [];
                               $scope.$broadcast('roomBooking', {
                                    isBooked: true
                                });
                               messageService.success(vm.room.name + " has been booked!");
                           } else {
                               console.log(res);
                                messageService.error("Please check all the fields and try again");
                           }
                        }).catch((reject)=>{
                                console.log(reject);
                                console.log('rejected');
                                messageService.error("Please check your internet connection");
                        });

                    }
                }

                function addPraticipant() {
                    vm.praticipants.push(vm.praticipant);
                    vm.praticipant = {};
                }

                function removePraticipant(praticipant) { 
                    vm.praticipants = vm.praticipants.filter((p)=>{return p.name !== praticipant.name});
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
                    }
                }

                function splitTime(time) {
                    return {"hour": time.split(':')[0], "minutes": time.split(':')[1]};
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