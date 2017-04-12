(function () {
    'use strict';
    angular.module('app.home')
        .controller('Home', Home);

    function Home($state, $scope, roomsService) {
        let vm = this;
        let today = new Date();
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
            let timestamp = roomsService.filterDateToTimestamp(date,false);
            roomsService.getRoomsByDate(timestamp).then(rooms => {
                vm.rooms = rooms;
            });
        }


        function setTomorrowDate() {
            let selectedDate = vm.settings.selectedDate;
            selectedDate = selectedDate.setDate(selectedDate.getDate() + 1);
            getRoomsByDate(selectedDate);
        }

        function setYestardayDate() {
            let selectedDate = vm.settings.selectedDate;
            selectedDate = selectedDate.setDate(selectedDate.getDate() - 1);
            getRoomsByDate(selectedDate);
        }

    }
})();
