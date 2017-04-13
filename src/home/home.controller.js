(function () {
    'use strict';
    angular.module('app.home')
        .controller('Home', Home);

    Home.$inject = ['$state','$scope','messageService','roomsService'];
    function Home($state, $scope, messageService, roomsService) {
        let vm = this;
        let selectedDate = new Date();
        let todayDate = new Date();
        vm.rooms = [];
        vm.query = {};
        vm.settings = {
            'selectedDate': selectedDate,
            'todayDate': todayDate,
            'loading': true
        };

        vm.roomsByDate = getRoomsByDate;
        vm.setTomorrowDate = setTomorrowDate;
        vm.setYestardayDate = setYestardayDate;

        getRoomsByDate('now');
        /////////////////
    
        //TODO: block the option that user can see the room list of yestarday.

        function getRoomsByDate(date) {
            let timestamp = roomsService.filterDateToTimestamp(date,false);
            roomsService.getRoomsByDate(timestamp).then(rooms => {
                vm.rooms = rooms;
                console.log(rooms);
            }).finally((done)=>{
                console.log(done);
                vm.settings.loading = false;
            }).catch((reject)=>{
                console.log(reject);
               messageService.error("Please check your internet connection" + reject);
                
            });
        }


        function setTomorrowDate() {
            let selectedDate = vm.settings.selectedDate;
            selectedDate = selectedDate.setDate(selectedDate.getDate() + 1);
            getRoomsByDate(selectedDate);
        }

        function setYestardayDate() {
            let selectedDate = vm.settings.selectedDate;
            if(selectedDate > vm.settings.todayDate) {
                selectedDate = selectedDate.setDate(selectedDate.getDate() - 1);
                getRoomsByDate(selectedDate);
            }
        }

    }
})();
