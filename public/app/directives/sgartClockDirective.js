(function () {
    "use strict";

    angular.module('app').directive('sgartClock', sgartClock);

    sgartClock.$inject = ['$interval', 'dateFilter'];

    function sgartClock($interval, dateFilter) {
        //var self = this;
        //var format = 'dd/MM/yyyy hh:mm:ss';

        function link(scope, element, attrs) {
            var timeoutId;
            var format = 'dd/MM/yyyy hh:mm:ss';

            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }

            scope.$watch(attrs.myCurrentTime, function (value) {
                //format = value;
                updateTime();
            });

            element.on('$destroy', function () {
                $interval.cancel(timeoutId);
            });

            // start the UI update process; save the timeoutId for canceling
            timeoutId = $interval(function () {
                updateTime(); // update DOM
            }, 1000);
        }

        return {
            link: link
        };
    }

})();