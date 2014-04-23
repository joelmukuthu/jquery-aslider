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
                property: 'position', // currently supported: 'position' and 'transform'. if set to 'transform', the plugin will not animate the slide so use css transitions instead
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
            seek,
            slide,
            getNewPosition,
            prevClick,
            nextClick,
            setCallback,
            beforeSlide,
            afterSlide,
            bindEvents,
            unbindEvents,
            exposedMethods,
            exposedMethodsDisabled = false;

        setCallback = function (key, callback) {
            if ($.isFunction(callback)) {
                options[key] = callback;
            } else {
                options[key] = null;
            }
        }

        beforeSlide = function () {
            var returnValue;
            if (options.beforeSlide) {
                returnValue = options.beforeSlide.call(exposedMethods, seekToIndex);
                return returnValue === false ? false : true;
            }
            return true;
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

        getNewPosition = function() {
            var offset = pages.eq(seekToIndex * options.itemsPerPage).position(),
                css = {};

            if (options.vertical) {
                css.top = -offset.top;
            } else {
                css.left = -offset.left;
            }

            return css;
        }

        slide = function (callback) {
            var css = getNewPosition();

            function executeCallback() {
                if ($.isFunction(callback)) {
                    callback.call(exposedMethods);
                } else {
                    afterSlide()
                }
            }

            if (options.property === 'transform') {
                css = $.extend({
                    top: 0,
                    left: 0
                }, css);
                css = {
                    'transform': 'translate(' + css.left + 'px, ' + css.top + 'px)'
                };

                pageHolder
                    .css(css)
                    .one('webkitTransitionEnd otransitionend oTransitionEnd MSTransitionEnd transitionend', executeCallback);

            } else if (options.animation) {
                !pageHolder.queue('fx').length && pageHolder.animate(css, options.slideSpeed, options.easing, executeCallback);
            } else {
                pageHolder.css(css);
                executeCallback();
            }
        }


        seek = function (callback) {

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

            if (seekToIndex === currentIndex) {
                return;
            }

            if (!beforeSlide()) {
                seekToIndex = currentIndex;
                return;
            }

            slide(callback);
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

        bindEvents = function () {
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
        }

        unbindEvents = function () {
            prev.length && prev.off('click.aslider');
            next.length && next.off('click.aslider');
            options.keys && $(document).off('keydown.aslider');
        }

        exposedMethods = {
            next: function (callback) {
                if (exposedMethodsDisabled)
                    return null;
                seekToIndex++;
                seek(callback);
                return this;
            },
            prev: function (callback) {
                if (exposedMethodsDisabled)
                    return null;
                seekToIndex--;
                seek(callback);
                return this;
            },
            seek: function (index, callback) {
                if (exposedMethodsDisabled)
                    return null;
                if (index >= 0 && index < totalPages) {
                    seekToIndex = index;
                    seek(callback);
                    return this;
                }
                return false;
            },
            begin: function (callback) {
                if (exposedMethodsDisabled)
                    return null;
                seekToIndex = 0;
                seek(callback);
                return this;
            },
            end: function (callback) {
                if (exposedMethodsDisabled)
                    return null;
                seekToIndex = totalPages - 1;
                seek();
                return this;
            },
            off: function (alsoDisableExposedMethods) {
                if (alsoDisableExposedMethods === undefined
                    || alsoDisableExposedMethods === true) {
                    exposedMethodsDisabled = true;
                }
                if (!slider.data('aslider'))
                    return;
                unbindEvents();
                slider.data('aslider', false);
            },
            on: function (alsoEnableExposedMethods) {
                if (alsoEnableExposedMethods === undefined
                    || alsoEnableExposedMethods === true) {
                    exposedMethodsDisabled = false;
                }
                if (slider.data('aslider'))
                    return;
                bindEvents();
                slider.data('aslider', this);
            },
            isOn: function () {
                return !!slider.data('aslider');
            },
            isOff: function () {
                return !slider.data('aslider');
            },
            methodsEnabled: function () {
                return !exposedMethodsDisabled;
            },
            methodsDisabled: function () {
                return exposedMethodsDisabled;
            },
            getCurrentIndex: function () {
                if (exposedMethodsDisabled)
                    return;
                return currentIndex;
            },
            getPages: function () {
                if (exposedMethodsDisabled)
                    return null;
                return pages;
            },
            getPageCount: function () {
                if (exposedMethodsDisabled)
                    return null;
                return totalPages;
            },
            getPageHolder: function () {
                if (exposedMethodsDisabled)
                    return null;
                return pageHolder;
            },
            getOptions: function () {
                if (exposedMethodsDisabled)
                    return null;
                return options;
            },
            beforeSlide: function (callback) {
                if (exposedMethodsDisabled)
                    return null;
                if (callback === undefined) {
                    beforeSlide();
                } else {
                    setCallback('beforeSlide', callback);
                }
                return this;
            },
            afterSlide: function (callback) {
                if (exposedMethodsDisabled)
                    return null;
                if (callback === undefined) {
                    afterSlide();
                } else {
                    setCallback('afterSlide', callback);
                }
                return this;
            }
        };

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

        totalPages = Math.ceil(pages.length / options.itemsPerPage);

        bindEvents();

        slider.data('aslider', exposedMethods);

        options.initialIndex = parseInt(options.initialIndex);
        if (options.initialIndex % 1 === 0 && options.initialIndex >= 0 && options.initialIndex < totalPages) { // if is int and is valid
            seekToIndex = options.initialIndex;
            seek();
        }

        return slider; // allow jQuery chaining
    }
}(jQuery));
