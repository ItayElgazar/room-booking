(function () {
    'use strict';
    angular.module('app.room')
        .value('AVAIL_ROOMS', false)
        .service('roomsService', roomsService);

    function roomsService($http, API, AVAIL_ROOMS) {
        
        let service = {
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
                url: `${API}/getrooms`,
                headers: {'Content-Type': 'text/plain'},
                data: {
                    date: date
                }
            }).then(res => {
                AVAIL_ROOMS = res.data;
                return res.data;
            }).catch(e => {
                console.log(e);
            })
        }
        
        function sendPass(booking) {
            return $http({
                method: 'POST',
                url: `${API}/sendpass`,
                headers: {'Content-Type': 'text/plain'},
                data: booking
            }).then(res=>{
                return res.data;
            });
        }

        function filterDateToTimestamp(date,time) {
            let filterDate;

            if(date === 'now') {
                return date;
            }

            if(time) {
                filterDate = new Date(date).setHours(time.hour,time.minutes,0,0);
            } else {
                filterDate = date;
            }

            return Math.floor(filterDate/1000);
        }


    }
})();
