(function ($) {
  'use strict';

  function Slider(id, element, options) {
    this.id = id;
    this.element = element;

    if (options.pageContainer instanceof $) {
      this.pageContainer = options.pageContainer;
    } else {
      this.pageContainer = this.element.find(options.pageContainer);
    }
    this.pageSelector = options.pageSelector;

    this.upButton = options.up;
    this.rightButton = options.right;
    this.downButton = options.down;
    this.leftButton = options.left;

    this.prevButton = options.prev;
    this.nextButton = options.next;
    this.firstButton = options.first;
    this.lastButton = options.last;

    this.disabledButtonsClass = options.disabledButtonsClass;

    this.keyboardArrowKeys = options.keyboardArrowKeys;

    this.index = 0;
    this.itemsPerPage = options.itemsPerPage;

    this.cssTransitions = options.cssTransitions;
    this.jQueryAnimation = options.jQueryAnimation;
    this.jQueryAnimationSpeed = options.jQueryAnimationSpeed;
    this.jQueryAnimationEasing = options.jQueryAnimationEasing;

    this.rewind = options.rewind;

    this.beforeSlide = options.beforeSlide;
    this.afterSlide = options.afterSlide;

    this.enable();

    if (this._isValid(options.initialIndex)) {
      this.seek(options.initialIndex);
    }
  }

  Slider.prototype._registerEvents = function () {
    var slider = this;

    if (this.upButton) {
      this.element.on('click.aslider', this.upButton, function (e) {
        e.preventDefault();
        slider.up();
      });
    }

    if (this.rightButton) {
      this.element.on('click.aslider', this.rightButton, function (e) {
        e.preventDefault();
        slider.right();
      });
    }

    if (this.downButton) {
      this.element.on('click.aslider', this.downButton, function (e) {
        e.preventDefault();
        slider.down();
      });
    }

    if (this.leftButton) {
      this.element.on('click.aslider', this.leftButton, function (e) {
        e.preventDefault();
        slider.left();
      });
    }

    if (this.prevButton) {
      this.element.on('click.aslider', this.prevButton, function (e) {
        e.preventDefault();
        slider.prev();
      });
    }

    if (this.nextButton) {
      this.element.on('click.aslider', this.nextButton, function (e) {
        e.preventDefault();
        slider.next();
      });
    }

    if (this.firstButton) {
      this.element.on('click.aslider', this.firstButton, function (e) {
        e.preventDefault();
        slider.first();
      });
    }

    if (this.lastButton) {
      this.element.on('click.aslider', this.lastButton, function (e) {
        e.preventDefault();
        slider.last();
      });
    }

    if (this.keyboardArrowKeys) {
      $(document).on('keydown.aslider' + this.id, function (e) {
        // if focus is on some element other than the body
        if (document.activeElement !== document.body) {
          return;
        }

        var key = e.which;
        switch (key) {
          case 38:
            e.preventDefault();
            slider.up();
            break;

          case 39:
            e.preventDefault();
            slider.right();
            break;

          case 40:
            e.preventDefault();
            slider.down();
            break;

          case 37:
            e.preventDefault();
            slider.left();
            break;
        }
      });
    }
  };

  Slider.prototype._deregisterEvents = function () {
    this.element.off('click.aslider');
    $(document).off('keydown.aslider' + this.id);
  };

  Slider.prototype.enable = function() {
    if (this.enabled) {
      return;
    }
    this._registerEvents();
    this.element.data('aslider', this);
    this.enabled = true;
  };

  Slider.prototype.disable = function() {
    if (!this.enabled) {
      return;
    }
    this._deregisterEvents();
    this.element.data('aslider', null);
    this.enabled = false;
  };

  Slider.prototype._getPages = function() {
    return this.pageSelector ? this.pageContainer.find(this.pageSelector) : this.pageContainer.children();
  };

  Slider.prototype._getPageCount = function() {
    return Math.ceil(this._getPages().length / this.itemsPerPage);
  };

  Slider.prototype._getColumnCount = function() {
    return Math.round(this.pageContainer.width() / this._getPages().eq(this.index).outerWidth());
  };

  Slider.prototype._getRowCount = function() {
    return Math.round(this.pageContainer.height() / this._getPages().eq(this.index).outerHeight());
  };

  Slider.prototype._isValid = function(index) {
    return index > 0 && index < this._getPageCount();
  };

  Slider.prototype._getIndex = function (coordinates) {
    return coordinates.row * this._getColumnCount() + coordinates.column;
  };

  Slider.prototype._getCoordinates = function (index) {
    index += 1;

    var columnCount = this._getColumnCount();
    var row = Math.ceil(index / columnCount);
    var column = index % columnCount;

    if (column === 0) {
      column = columnCount;
    }

    return {
      row: row - 1,
      column: column - 1
    };
  };

  Slider.prototype._getCss = function (index) {
    var css = {
      top: 0,
      left: 0
    };

    if (index === 0) {
      return css;
    }

    if (this.cssTransitions) {
      var offset = this._getPages().eq(index * this.itemsPerPage).position();
      css.top = offset.top;
      css.left = offset.left;

      var height = this.pageContainer.height();
      css.top = height === 0 ? 0 : (css.top / height * 100);

      var width = this.pageContainer.width();
      css.left = width === 0 ? 0 : (css.left / width * 100);
    } else { // no choice but to assume items are the same size
      var coordinates = this._getCoordinates(index);
      css.left = coordinates.column * 100;
      css.top = coordinates.row * 100;
    }

    return {
      top: '-' + css.top + '%',
      left: '-' + css.left + '%'
    };
  };

  Slider.prototype._updateButtonStates = function () {
    var coordinates = this._getCoordinates(this.index);
    var disabledButtons = [];

    if (this.index <= 0) {
      disabledButtons.push(this.firstButton, this.prevButton);
    }
    if (this.index >= this._getPageCount() - 1) {
      disabledButtons.push(this.lastButton, this.nextButton);
    }
    if (coordinates.row <= 0) {
      disabledButtons.push(this.upButton);
    }
    if (coordinates.row >= this._getRowCount() - 1) {
      disabledButtons.push(this.downButton);
    }
    if (coordinates.column <= 0) {
      disabledButtons.push(this.leftButton);
    }
    if (coordinates.column >= this._getColumnCount() - 1) {
      disabledButtons.push(this.rightButton);
    }

    if (disabledButtons.length) {
      var allButtons = [
        this.upButton,
        this.rightButton,
        this.downButton,
        this.leftButton,
        this.prevButton,
        this.nextButton,
        this.firstButton,
        this.lastButton
      ];

      this.element.find(allButtons.join(',')).removeClass(this.disabledButtonsClass);
      this.element.find(disabledButtons.join(',')).addClass(this.disabledButtonsClass);
    }
  };

  Slider.prototype._slide = function(index, callback) {
    var css = this._getCss(index);
    var slider = this;

    function done() {
      slider.index = index;

      if (!slider.rewind && slider.disabledButtonsClass) {
        slider._updateButtonStates();
      }

      var cb = $.isFunction(callback) ? callback : slider.afterSlide;
      cb(slider.index);
    }

    if (this.cssTransitions) {
      this.pageContainer.css({
        transform: 'translate(' + css.left + ', ' + css.top + ')'
      }).one('webkitTransitionEnd otransitionend oTransitionEnd MSTransitionEnd transitionend', done);
    } else if (this.jQueryAnimation) {
      this.pageContainer.stop();
      this.pageContainer.animate(css, this.jQueryAnimationSpeed, this.jQueryAnimationEasing, done);
    } else {
      this.pageContainer.css(css);
      done();
    }
  };

  Slider.prototype.seek = function(index, callback) {
    if (!this.enabled) {
      return;
    }

    var firstIndex = 0;
    var lastIndex = this._getPageCount() - 1;

    if (index < 0) {
      if (this.rewind) {
        index = lastIndex;
      } else {
        index = firstIndex;
      }
    } else if (index > lastIndex) {
      if (this.rewind) {
        index = firstIndex;
      } else {
        index = lastIndex;
      }
    }

    if (index === this.index) {
      return;
    }

    if (this.beforeSlide(index) === false) {
      return;
    }

    this._slide(index, callback);
  };

  Slider.prototype.up = function(callback) {
    var coordinates = this._getCoordinates(this.index);

    if (coordinates.row < 0) {
      if (this.rewind) {
        coordinates.row = this._getRowCount() - 1;
      } else {
        return;
      }
    } else {
      coordinates.row -= 1;
    }

    this.seek(this._getIndex(coordinates), callback);
  };

  Slider.prototype.right = function(callback) {
    var coordinates = this._getCoordinates(this.index);
    var columnCount = this._getColumnCount();

    if (coordinates.column > columnCount - 1) {
      if (this.rewind) {
        coordinates.column = 0;
      } else {
        return;
      }
    } else {
      coordinates.column += 1;
    }

    this.seek(this._getIndex(coordinates), callback);
  };

  Slider.prototype.down = function(callback) {
    var coordinates = this._getCoordinates(this.index);
    var rowCount = this._getRowCount();

    if (coordinates.row > rowCount - 1) {
      if (this.rewind) {
        coordinates.row = 0;
      } else {
        return;
      }
    } else {
      coordinates.row += 1;
    }

    this.seek(this._getIndex(coordinates), callback);
  };

  Slider.prototype.left = function(callback) {
    var coordinates = this._getCoordinates(this.index);

    if (coordinates.column < 0) {
      if (this.rewind) {
        coordinates.column = this._getColumnCount() - 1;
      } else {
        return;
      }
    } else {
      coordinates.column -= 1;
    }

    this.seek(this._getIndex(coordinates), callback);
  };

  Slider.prototype.prev = function(callback) {
    this.seek(this.index - 1, callback);
  };

  Slider.prototype.next = function(callback) {
    this.seek(this.index + 1, callback);
  };

  Slider.prototype.first = function(callback) {
    this.seek(0, callback);
  };

  Slider.prototype.last = function(callback) {
    this.seek(this._getPageCount() - 1, callback);
  };

  Slider.prototype.getIndex = function () {
    return this.index;
  }

  $.fn.aslider = function(userOptions) {
    var options = {
      up: '.up',
      right: '.right',
      down: '.down',
      left: '.left',

      prev: '.prev',
      next: '.next',
      first: '.first',
      last: '.last',

      disabledButtonsClass: 'disabled', // may also be null or empty string,

      rewind: false, // whether to restart the slider when it reaches the end or add the `disabledButtonsClass`

      keyboardArrowKeys: false, // whether or not it can be controlled by keyboard arrows

      pageContainer: '> ul', // element whose children (or specified by `pageSelector`) are the actual pages, also accepts a jQuery object
      pageSelector: null, // if null, children of `pageContainer` are assumed to be the pages. else the selector is applied on `pageContainer`

      itemsPerPage: 1,
      initialIndex: 0,

      cssTransitions: false, // if this is true, it takes precedence over `jQueryAnimation`

      jQueryAnimation: true,
      jQueryAnimationSpeed: 400,
      jQueryAnimationEasing: 'swing',

      beforeSlide: $.noop, // passed the index being seeked to as param
      afterSlide: $.noop // passed currentIndex as param
    };

    $.extend(options, userOptions);

    if (typeof options.beforeSlide !== 'function') {
      throw new Error('beforeSlide should be a function');
    }

    if (typeof options.afterSlide !== 'function') {
      throw new Error('beforeSlide should be a function');
    }

    options.initialIndex = parseInt(options.initialIndex, 10);
    if (isNaN(options.initialIndex)) {
      throw new Error('initialIndex should be an integer');
    }

    options.itemsPerPage = parseInt(options.itemsPerPage, 10);
    if (isNaN(options.itemsPerPage)) {
      throw new Error('itemsPerPage should be an integer');
    }

    // TODO: Validate other options e.g. jQueryAnimationSpeed?

    var sliders = this;
    return sliders.each(function (i) {
      new Slider(i, $(this), options);
    });
  };
}(jQuery));
