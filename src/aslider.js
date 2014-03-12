// slider plugin
(function ($) {
    $.fn.aslider = function (opts) {
        'use strict';

        var options = $.extend({
                next: '.next', // also accepts a jQuery object
                prev: '.prev', // also accepts a jQuery object
                pageHolder: '.pages', // element whose children (or specified by selector) are the actual pages, also accepts a jQuery object
                pageSelector: null, // if null, children of pageHolder are assumed to be the pages. if not, the selector is applied on pageHolder
                itemsPerPage: 1,
                slideSpeed: 400,
                initialIndex: 0,
                behaviourAtEdge: 'none', // 'reset', 'none'
                disabledClass: '', // may also be null or empty string,
                beforeSlide: null, // passed seekToIndex as param
                afterSlide: null, // passed currentIndex as param
                animation: true, // whether to use $.animate or simply set the css property
                easing: 'swing', // $.animate easing
                vertical: false, // up/down vs left/right slider
                cssProperty: 'position', // currently supported: 'position' and 'transform'. note that $().animate won't animate 'transform' property so for that set 'animation' to false and use CSS transitions instead
                keys: true // whether or not it can be controlled by keyboard arrows
            }, opts),
            slider = this,
            pageHolder = options.pageHolder,
            next = options.next,
            prev = options.prev,
            seekToIndex = 0,
            currentIndex = seekToIndex,
            pages,
            totalPages,
            pageWidth, // in the case of vertical slider, this holds the pageHeight instead
            seek,
            slide,
            prevClick,
            nextClick,
            setCallback,
            beforeSlide,
            afterSlide,
            exposedMethods;

        setCallback = function (key, callback) {
            if (typeof callback === null) {
                options[key] = null;
            } else if ($.isFunction(callback)) {
                options[key] = callback;
            }
        }

        // validate and set callbacks
        setCallback('beforeSlide', options.beforeSlide);
        setCallback('afterSlide', options.afterSlide);

        typeof pageHolder !== 'jQuery' && (pageHolder = slider.find(options.pageHolder));
        typeof next !== 'jQuery' && (next = slider.find(options.next));
        typeof prev !== 'jQuery' && (prev = slider.find(options.prev));

        if (options.pageSelector) {
            pages = pageHolder.find(options.pageSelector);
        } else {
            pages = pageHolder.children();
        }

        pageWidth = options.vertical ? pages.first().outerHeight() : pages.first().outerWidth();
        totalPages = Math.ceil(pages.length / options.itemsPerPage);

        beforeSlide = function () {
            var returnValue;
            if (options.beforeSlide) {
                returnValue = options.beforeSlide.call(exposedMethods, seekToIndex);
            }
            return returnValue === false ? false : true;
        }

        afterSlide = function () {
            currentIndex = seekToIndex;
            if (options.disabledClass && options.behaviourAtEdge === 'none') {
                prev.add(next).removeClass(options.disabledClass);
                if (currentIndex === 0) {
                    prev.addClass(options.disabledClass);
                }
                if (currentIndex === totalPages - 1) {
                    next.addClass(options.disabledClass);
                }
            }
            if (options.afterSlide) {
                options.afterSlide.call(exposedMethods, currentIndex);
            }
        }

        slide = function () {
            var newPosition,
                cssObject;

            newPosition = seekToIndex * options.itemsPerPage * -pageWidth;
            if (options.cssProperty === 'position') {
                if (options.vertical) {
                    cssObject = {
                        top: newPosition
                    };
                } else {
                    cssObject = {
                        left: newPosition
                    };  
                }
            } else if (options.cssProperty === 'transform') {
                if (options.vertical) {
                    cssObject = {
                        '-webkit-transform': 'translate(0, ' + newPosition + 'px)',
                        '-moz-transform': 'translate(0, ' + newPosition + 'px)',
                        '-ms-transform': 'translate(0, ' + newPosition + 'px)',
                        '-o-transform': 'translate(0, ' + newPosition + 'px)',
                        'transform': 'translate(0, ' + newPosition + 'px)'
                    };
                } else {
                    cssObject = {
                        '-webkit-transform': 'translate(' + newPosition + 'px, 0)',
                        '-moz-transform': 'translate(' + newPosition + 'px, 0)',
                        '-ms-transform': 'translate(' + newPosition + 'px, 0)',
                        '-o-transform': 'translate(' + newPosition + 'px, 0)',
                        'transform': 'translate(' + newPosition + 'px, 0)'
                    };
                }
            }

            if (options.animation && options.cssProperty !== 'transform') {
                !pageHolder.queue('fx').length && pageHolder.animate(cssObject, options.slideSpeed, options.easing, afterSlide); 
            } else {
                pageHolder.css(cssObject);
                afterSlide();
            }
        }


        seek = function () {

            switch (options.behaviourAtEdge) {
                case 'reset':
                    if (seekToIndex < 0) {
                        seekToIndex = totalPages - 1;
                    }
                    if (seekToIndex > totalPages - 1) {
                        seekToIndex = 0;
                    }
                break;

                default:
                case 'none':
                    if (seekToIndex <= 0) {
                        seekToIndex = 0;
                    }
                    if (seekToIndex + 1 >= totalPages) {
                        seekToIndex = totalPages - 1;
                    }
                break;
            }

            if (!beforeSlide()) {
                seekToIndex = currentIndex;
                return;
            }

            if (seekToIndex !== currentIndex) {
                slide();
            }
        }

        prevClick = function (e) {
            e.preventDefault();
            seekToIndex--;
            seek();
        }

        nextClick = function (e) {
            e.preventDefault();
            seekToIndex++;
            seek();
        }

        exposedMethods = {
            next: function () {
                seekToIndex++;
                seek();
            },
            prev: function () {
                seekToIndex--;
                seek();
            },
            seek: function (index) {
                if (index >= 0 && index < totalPages) {
                    seekToIndex = index;
                    seek();
                }
            },
            begin: function () {
                seekToIndex = 0;
                seek();
            },
            end: function () {
                seekToIndex = totalPages - 1;
                seek();
            },
            off: function () {
                prev.length && prev.off('click.aslider');
                next.length && next.off('click.aslider');
                options.keys && $(document).off('keydown.aslider');
            },
            getCurrentIndex: function () {
                return currentIndex;
            },
            getPages: function () {
                return pages;
            },
            getPageCount: function () {
                return totalPages;
            },
            getPageHolder: function () {
                return pageHolder;
            },
            getPageWidth: function () {
                return pageWidth;
            },
            getSlidePageWidth: function () {
                return pageWidth * options.itemsPerPage;
            },
            getOptions: function () {
                return options;
            },
            updatePageWidth: function(width) {
                if (typeof width === 'undefined') {
                    width = options.vertical ? pages.first().outerHeight() : pages.first().outerWidth();
                }
                pageWidth = width;
                slide();
            },
            beforeSlide: function (callback) {
                if (typeof callback === 'undefined') {
                    beforeSlide();
                }
                setCallback('beforeSlide', callback);
            },
            afterSlide: function (callback) {
                if (typeof callback === 'undefined') {
                    afterSlide();
                }
                setCallback('afterSlide', callback);
            }
        };

        exposedMethods.getPageHeight = exposedMethods.getPageWidth;
        exposedMethods.getSlidePageHeight = exposedMethods.getSlidePageWidth;
        exposedMethods.updatePageHeight = exposedMethods.updatePageWidth;

        prev.length && prev.on('click.aslider', prevClick);
        next.length && next.on('click.aslider', nextClick);

        if (options.keys) {
            $(document).on('keydown.aslider', function (e) {
                var key = e.which, 
                    doSeek = false;
                if (options.vertical) {
                    if (key === 38) { // up
                        seekToIndex--;
                        doSeek = true;
                    } else if (key === 40) { // down
                        seekToIndex++;
                        doSeek = true;
                    }
                } else {
                    if (key === 37) { // left
                        seekToIndex--;
                        doSeek = true;
                    } else if (key === 39) { // right
                        seekToIndex++;
                        doSeek = true;
                    }   
                }
                doSeek && seek();
            });
        }

        slider.data('aslider', exposedMethods);

        options.initialIndex = parseInt(options.initialIndex);
        if (options.initialIndex % 1 === 0 && options.initialIndex >= 0 && options.initialIndex < totalPages) { // if is int and is valid
            seekToIndex = options.initialIndex;
            seek();
        }

        return slider;
    }
}(jQuery));