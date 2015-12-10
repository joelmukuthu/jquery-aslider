(function ($) {

    'use strict';

    var aslider = function (elem, opts) {
        var options = $.extend({
                next: '.next', // also accepts a jQuery object
                prev: '.prev', // also accepts a jQuery object
                pageHolder: '> ul', // element whose children (or specified by selector) are the actual pages, also accepts a jQuery object
                pageSelector: null, // if null, children of pageHolder are assumed to be the pages. if not, the selector is applied on pageHolder
                itemsPerPage: 1,
                slideSpeed: 400,
                initialIndex: 0,
                behaviourAtEdge: 'none', // 'reset', 'none'
                disabledClass: 'disabled', // may also be null or empty string,
                beforeSlide: null, // passed the index being seeked to as param
                afterSlide: null, // passed currentIndex as param
                animation: true, // whether to use $.animate or simply set the css property
                easing: 'swing', // $.animate easing
                property: 'position', // currently supported: 'position' and 'transform'. if set to 'transform', the plugin will not animate the slide so use css transitions instead
                keys: false // whether or not it can be controlled by keyboard arrows
            }, opts),
            pageHolder = options.pageHolder,
            next = options.next,
            prev = options.prev,
            currentIndex = 0,
            pages,
            totalPages,
            seek,
            slide,
            totalColumns,
            totalRows,
            getCoordinates,
            getIndexFromCoordinates,
            getNewPosition,
            prevClick,
            nextClick,
            setCallback,
            beforeSlide,
            afterSlide,
            bindEvents,
            unbindEvents,
            exposedMethods,
            busy = false,
            exposedMethodsDisabled = false;

        setCallback = function (key, callback) {
            if ($.isFunction(callback)) {
                options[key] = callback;
            } else {
                options[key] = null;
            }
        };

        beforeSlide = function (index) {
            var returnValue;
            if (options.beforeSlide) {
                returnValue = options.beforeSlide.call(exposedMethods, index);
                return returnValue === false ? false : true;
            }
            return true;
        };

        afterSlide = function () {
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
        };

        getCoordinates = function (index) {
            var row,
                column;
            index += 1;
            row     = Math.ceil(index / totalColumns);
            column  = index % totalColumns;
            if (column === 0) {
                column = totalColumns;
            }
            return {
                row: row,
                column: column
            };
        };

        getIndexFromCoordinates = function (coordinates) {
            return ((coordinates.row - 1) * totalColumns) + (coordinates.column - 1);
        };

        getNewPosition = function (index) {
            var top,
                left,
                width,
                height,
                offset,
                coords;

            if (index === 0) {
                return {
                    top: 0,
                    left: 0
                };
            }

            if (options.property === 'position') { // no choice but to assume items are all same size
                // find the row and column on which destination is
                coords = getCoordinates(index);
                // zero-base the position
                left = (coords.column - 1) * 100;
                top = (coords.row - 1) * 100;
            } else {
                offset = pages.eq(index * options.itemsPerPage).position();
                top = offset.top;
                left = offset.left;

                height = pageHolder.height();
                top = height === 0 ? 0 : (top / height * 100);

                width = pageHolder.width();
                left = width === 0 ? 0 : (left / width * 100);
            }

            return {
                top: '-' + top + '%',
                left: '-' + left + '%'
            };
        };

        slide = function (index, callback) {
            var css = getNewPosition(index);

            function executeCallback() {

                busy = false;
                currentIndex = index;

                if ($.isFunction(callback)) {
                    callback.call(exposedMethods, currentIndex);
                } else {
                    afterSlide();
                }
            }

            busy = true;

            if (options.property === 'transform') {
                css = $.extend({
                    top: 0,
                    left: 0
                }, css);
                css = {
                    'transform': 'translate(' + css.left + ', ' + css.top + ')'
                };
                pageHolder
                    .css(css)
                    .one('webkitTransitionEnd otransitionend oTransitionEnd MSTransitionEnd transitionend', executeCallback);

            } else if (options.animation) {
                if (!pageHolder.queue('fx').length) {
                    pageHolder.animate(css, options.slideSpeed, options.easing, executeCallback);
                }
            } else {
                pageHolder.css(css);
                executeCallback();
            }
        };

        seek = function (index, callback) {

            if (busy) {
               return;
            }

            switch (options.behaviourAtEdge) {
                case 'reset':
                    if (index < 0) {
                        index = totalPages - 1;
                    }
                    if (index > totalPages - 1) {
                        index = 0;
                    }
                break;

                default:
                case 'none':
                    if (index <= 0) {
                        index = 0;
                    }
                    if (index + 1 >= totalPages) {
                        index = totalPages - 1;
                    }
                break;
            }

            if (index === currentIndex) {
                return;
            }

            if (!beforeSlide(index)) {
                return;
            }

            slide(index, callback);
        };

        prevClick = function (e) {
            e.preventDefault();
            seek(currentIndex - 1);
        };

        nextClick = function (e) {
            e.preventDefault();
            seek(currentIndex + 1);
        };

        bindEvents = function () {
            if (prev.length) {
                prev.on('click.aslider', prevClick);
            }
            if (next.length) {
                next.on('click.aslider', nextClick);
            }

            if (options.keys) {
                $(document).on('keydown.aslider', function (e) {
                    var key = e.which,
                        index = currentIndex,
                        doSeek = false,
                        nextRow,
                        nextColumn,
                        currentCoordinates;
                    // if focus is on some element other than the body
                    if (document.activeElement !== document.body) {
                        return;
                    }

                    currentCoordinates = getCoordinates(index);

                    if (key === 37) { // left
                        if (currentCoordinates.column === 1) {
                            return;
                        }
                        nextColumn = currentCoordinates.column - 1;
                        if (nextColumn < 0) {
                            return;
                        }
                        nextRow = currentCoordinates.row;
                        doSeek = true;
                    } else if (key === 39) { // right
                        if (currentCoordinates.column === totalColumns) {
                            return;
                        }
                        nextColumn = currentCoordinates.column + 1;
                        if (nextColumn > totalColumns) {
                            return;
                        }
                        nextRow = currentCoordinates.row;
                        doSeek = true;
                    }
                    if (key === 38) { // up
                        if (currentCoordinates.row === 1) {
                            return;
                        }
                        nextRow = currentCoordinates.row - 1;
                        if (nextRow < 0) {
                            return;
                        }
                        nextColumn = currentCoordinates.column;
                        doSeek = true;
                    } else if (key === 40) { // down
                        if (currentCoordinates.row === totalRows) {
                            return;
                        }
                        nextRow = currentCoordinates.row + 1;
                        if (nextRow > totalRows) {
                            return;
                        }
                        nextColumn = currentCoordinates.column;
                        doSeek = true;
                    }
                    if (doSeek) {
                        e.preventDefault();
                        index = getIndexFromCoordinates({
                            row: nextRow,
                            column: nextColumn
                        });
                        seek(index);
                    }
                });
            }
        };

        unbindEvents = function () {
            if (prev.length) {
                prev.off('click.aslider');
            }
            if (next.length) {
                next.off('click.aslider');
            }
            if (options.keys) {
                $(document).off('keydown.aslider');
            }
        };

        exposedMethods = {
            next: function (callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
                seek(currentIndex + 1, callback);
                return this;
            },
            prev: function (callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
                seek(currentIndex - 1, callback);
                return this;
            },
            seek: function (index, callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
                if (index >= 0 && index < totalPages) {
                    seek(index, callback);
                    return this;
                }
                return false;
            },
            first: function (callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
                seek(0, callback);
                return this;
            },
            last: function (callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
                seek(totalPages - 1, callback);
                return this;
            },
            off: function (alsoDisableExposedMethods) {
                if (alsoDisableExposedMethods === undefined || alsoDisableExposedMethods === true) {
                    exposedMethodsDisabled = true;
                }
                if (!elem.data('aslider')) {
                    return;
                }
                unbindEvents();
                elem.data('aslider', false);
            },
            on: function (alsoEnableExposedMethods) {
                if (alsoEnableExposedMethods === undefined || alsoEnableExposedMethods === true) {
                    exposedMethodsDisabled = false;
                }
                if (elem.data('aslider')) {
                    return;
                }
                bindEvents();
                elem.data('aslider', this);
            },
            isOn: function () {
                return !!elem.data('aslider');
            },
            isOff: function () {
                return !elem.data('aslider');
            },
            methodsEnabled: function () {
                return !exposedMethodsDisabled;
            },
            methodsDisabled: function () {
                return exposedMethodsDisabled;
            },
            getCurrentIndex: function () {
                if (exposedMethodsDisabled) {
                    return;
                }
                return currentIndex;
            },
            getPages: function () {
                if (exposedMethodsDisabled) {
                    return null;
                }
                return pages;
            },
            getPageCount: function () {
                if (exposedMethodsDisabled) {
                    return null;
                }
                return totalPages;
            },
            getPageHolder: function () {
                if (exposedMethodsDisabled) {
                    return null;
                }
                return pageHolder;
            },
            getOptions: function () {
                if (exposedMethodsDisabled) {
                    return null;
                }
                return options;
            },
            getVersion: function () {
                return '1.1';
            },
            beforeSlide: function (callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
                if (callback === undefined) {
                    beforeSlide();
                } else {
                    setCallback('beforeSlide', callback);
                }
                return this;
            },
            afterSlide: function (callback) {
                if (exposedMethodsDisabled) {
                    return null;
                }
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

        if (!(pageHolder instanceof $)) {
            pageHolder = elem.find(options.pageHolder);
        }
        if (!(next instanceof $)) {
            next = elem.find(options.next);
        }
        if (!(prev instanceof $)) {
            prev = elem.find(options.prev);
        }

        if (options.pageSelector) {
            pages = pageHolder.find(options.pageSelector);
        } else {
            pages = pageHolder.children();
        }

        totalPages = Math.ceil(pages.length / options.itemsPerPage);

        totalColumns = Math.round(pageHolder.width() / pages.first().outerWidth());
        totalRows = Math.round(pageHolder.height() / pages.first().outerHeight());

        bindEvents();

        elem.data('aslider', exposedMethods);

        options.initialIndex = parseInt(options.initialIndex);
        if (options.initialIndex % 1 === 0 && options.initialIndex >= 0 && options.initialIndex < totalPages) { // if is int and is valid
            seek(options.initialIndex);
        }
    };

    $.fn.aslider = function(opts) {
        return this.each(function () {
            aslider($(this), opts);
        });
    };

}(jQuery));
