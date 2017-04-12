(function () {
    'use strict';

    angular
        .module('app')
        .directive('pop', Directive);

    function Directive(ModalService) {
        return {
            link: function (scope, element, attrs) {
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
                let modal = {
                    id: attrs.id,
                    open: Open,
                    close: Close
                };
                ModalService.Add(modal);

                // remove self from modal service when directive is destroyed
                scope.$on('$destroy', function() {
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