(function (angular) {
    'use strict';

    angular.module('appDirect.commons.packery')
        .service('appDirect.commons.packery.PackeryService', PackeryService);

    PackeryService.$inject = [
        '$timeout'
    ];

    function PackeryService ($timeout) {
        this.add = add;
        this.refresh = refresh;
        this.enableDraggableElement = enableDraggableElement;

        function add (packery, element) {
            packery.appended(element);
            enableDraggableElement(packery, element);
            refresh(packery);
        }

        function refresh (packery) {
            $timeout(function () {
                packery.layout();
            });
        }

        function enableDraggableElement (packery, element) {
            var draggabilly = new Draggabilly(element, {
                handle: packery.options.handle
            });
            packery.bindDraggabillyEvents(draggabilly);
        }
    }
})(angular);
