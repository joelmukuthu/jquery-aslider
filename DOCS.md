# jquery-aslider docs

## Options

Here's a list of all the supported options, with their default values:

```javascript
var options = {
    // Selectors for the slider buttons. These must be strings. jQuery objects of the actual buttons are not supported.
    // This provides better performance and also allows for dynamic adding/removal of slider buttons.
    up: '.up',
    right: '.right',
    down: '.down',
    left: '.left',
    previous: '.previous',
    next: '.next',
    first: '.first',
    last: '.last',
    // The class added to the above buttons when the button has a disabled state. May also be null or empty string,
    disabledButtonsClass: 'disabled',
    // Whether to restart the slider when it reaches an item at the edge (first or last even in a grid).
    // If this is `true`, the slider buttons will not have a disabled state and the `disabledButtonsClass` is ignored
    rewind: false,
    // Whether or not it can be controlled by keyboard arrows
    keyboardArrowKeys: false,
    // An lement whose children (or specified by `pageSelector`) are the actual slider pages. Also accepts a jQuery object.
    pageContainer: '> ul',
    // If null, the children of `pageContainer` are assumed to be the pages. Else, this selector is applied on `pageContainer` to find the pages.
    pageSelector: null,
    // How many items represent a page?
    itemsPerPage: 1,
    // An index to transition to after the slider is initialized. Note that this is zero-based.
    // TODO: add support for initialCoordinates as well (i.e. row and column).
    initialIndex: 0,
    // Whether to use CSS transitions or not. If this is `true`, `jQueryAnimation` is ignored.
    cssTransitions: false,
    // Whether to use jQuery animations or not. If this is `false` and `cssTransitions` is false, then the page will
    // be transitioned to without any animation.
    jQueryAnimation: true,
    // Animation speed passed to jQuery().animate() if `jQueryAnimation` is `true`.
    jQueryAnimationSpeed: 400,
    // Animation easing passed to jQuery().animate() if `jQueryAnimation` is `true`.
    jQueryAnimationEasing: 'swing',
    // A function to be called before transitioning to a page. It's passed an `index` (zero-based) of the page
    // being transitioned to. If this function returns false, the transition is not performed.
    beforeSlide: $.noop,
    // A function to be called after transitioning to a page. It's passed an `index` (zero-based) of the page
    // that was transitioned to.
    afterSlide: $.noop
};
```
These options can be overriden when creating a new slider instance, for example:
```javascript
$('.slider').aslider({
    rewind: true,
    keyboardArrowKeys: true,
    cssTransitions: true,
    beforeSlide: function (index) {
        console.log('transitioning to page', index);
    }
});
```

## API Methods

The API can be accessed by querying the element's data using `jQuery().data()`, for example:
```javascript
var slider = $('.slider').aslider({
    rewind: true,
    keyboardArrowKeys: true,
    cssTransitions: true,
    beforeSlide: function (index) {
        console.log('transitioning to page', index);
    }
});
var api = slider.data('aslider');
// api.next(); // transition to the next page
```
For all the API methods, `this` represents the api itself so, for example, you can do `this.getIndex()` within the `next` function.

#### Disable/enable:

* `disable()` - used to disable a slider instance so that the slider buttons, keyboard keys and API methonds don't work for that instance
* `enable()` - used to re-enable a slider instance that was previously disabled.

#### Control transitioning:

These methods accept an optional callback that is executed after the sliding is finished. Note that even if there's an `afterSlide` callback already set, this callback will be executed instead.

* `seek: function (index, [callback])` - transition to a certain (zero-based) index. If the index is out of bounds this will do nothing.
* `up([callback])` - transition up
* `right([callback])` - transition right
* `down([callback])` - transition down
* `left([callback])` - transition left
* `previous([callback])` - transition to the previous page
* `next([callback])` - transition to the next page
* `first([callback])` - transition to the first page
* `last([callback])` - transition to the last page

Some of these methods do the same thing and are just aliases for each other. For example, in a horizontal slider, `next()` and `right()` do the same thing. Essentially, they all build upon `seek()`.

#### Getters
* `getIndex()` - returns the current index

#### Low level
These are private methods and normally you would not need to use them.
* `_getPages()`
* `_getPageCount()`
* `_getColumnCount()`
* `_getRowCount()`
* `_isValid(index)`
* `_getIndex(coordinates)` - `coordinates` is an object with a zero-based grid position, such as `{ row: 0, column: 0 }`
* `_getCoordinates(index)` - returns an object such as `{ row: 0, column: 0 }`
* `_getCss(index)` - returns an object such as `{ top: '-100%', left: '200%' }`
* `_updateButtonStates` - adds/removes the `disabledButtonsClass` to/from the slider buttons
* `_slide(index, [callback])` - performs the actual sliding
* `_registerEvents` - adds `click` listeners for the slider buttons and `keydown` listeners for the keyboard arrow keys if configured to do so
* `_deregisterEvents` - removes the `click` and `keydown` listeners

## Examples

### Minimal setup

HTML:

```html
<div class="slider">
    <ul>
        <li>one</li>
        <li>two</li>
        <li>three</li>
    </ul>
</div>
```

CSS:

```css
.slider {
    position: relative; /* 1 */
    overflow: hidden; /* 1 */
}

.slider ul {
    position: absolute; /* 1 */
    width: 300%; /* 2 */
    list-style: none; /* 3 */
    margin: 0; /* 3 */
    padding: 0; /* 3 */
}

.slider li {
    float: left; /* 3 */
    width: 33.33%; /* 2 */
}

.slider li:nth-child(odd) { background: #F6F4F0; } /* 3 */
.slider li:nth-child(even) { background: #cdcdcd; } /* 3 */
```

1 - required,
2 - make it responsive,
3 - aesthetics

JavaScript:

```javascript
$('.slider').aslider();
```

### Keyboard keys support

Building on the minimal setup, update the JS as follows:

```javascript
$('.slider').aslider({
    keyboardArrowKeys: true
});
```

### Slider buttons

Update the HTML and CSS as follows:

HTML:

```html
<div class="slider">
    <ul>
        <li>one</li>
        <li>two</li>
        <li>three</li>
    </ul>
    <p>
        <!-- since initial index is 0, a.previous starts off as disabled -->
        <a class="previous disabled" href="#">Prev</a>
        <a class="next" href="#">Next</a>
    </p>
</div>
```

CSS:

```css
.slider p {
    position: absolute;
    bottom: 0;
    margin: 0;
    width: 98%; /* 1 */
    padding: 0.5em 1%; /* 1 */
}
.slider .prev {
    float: left;
}
.slider .next {
    float: right;
}
.slider .disabled {
    color: silver;
    cursor: default;
}
```
1 - makes it responsive, the rest is just aesthetics

JS:

No need to update JS, it'll use the defaults.

### CSS transitions

Update the CSS and JS as follows:

CSS:

```css
.slider ul {
    position: absolute;
    width: 300%;
    list-style: none;
    margin: 0;
    padding: 0;
    -webkit-transition: -webkit-transform 400ms ease-in-out;
    transition: transform 400ms ease-in-out;
}
```

JS:

```javascript
$('.slider').aslider({
    keyboardArrowKeys: true,
    cssTransitions: true
});
```

You can detect broweser capabilities and enable CSS animations accordingly, e.g. using Modernizr:

```javascript
$('.slider').aslider({
    keyboardArrowKeys: true,
    cssTransitions: Modernizr.csstransitions
});
```

### Vertical slider

No extra configuration is needed for the plugin to support vertical sliders.

HTML:

```html
<div class="slider">
    <p>
        <a class="up disabled" href="#">Up</a>
        <a class="down" href="#">Down</a>
    </p>
    <ul>
        <li>one</li>
        <li>two</li>
        <li>three</li>
    </ul>
</div>
```

CSS:

```css
.slider {
    position: relative; /* 1 */
    overflow: hidden; /* 1 */
    height: 40px;
}

.slider ul {
    position: absolute; /* 1 */
    list-style: none; /* 3 */
    margin: 0; /* 3 */
    padding: 0; /* 3 */
}

.slider li {
    height: 40px;
}

.slider li:nth-child(odd) { background: #F6F4F0; } /* 3 */
.slider li:nth-child(even) { background: #cdcdcd; } /* 3 */

.slider p {
    height: auto; /* 3 */
    overflow: hidden; /* 3 */
}

.slider .up {
    width: 50%; /* 3 */
    display: block; /* 3 */
    float: left; /* 3 */
}
.slider .down {
    width: 50%; /* 3 */
    display: block; /* 3 */
    float: right; /* 3 */
}
.slider .disabled {
    color: silver; /* 3 */
    cursor: default; /* 3 */
}
```
1 - required,
3 - aesthetics

JS:

No need to update JS, it’ll use the defaults.

### Items of varied width or height / beforeSlide callback

The trick is to use the `beforeSlide` function to update pageSize accordingly. Example with a vertical slider:

HTML:

```html
<div class="slider">
    <p>
        <a class="up disabled" href="#">Up</a>
        <a class="down" href="#">Down</a>
    </p>
    <ul>
        <li style="height: 60px">one</li>
        <li style="height: 100px">two</li>
        <li style="height: 80px">three</li>
    </ul>
</div>
```

```javascript
var slider = $('.slider'),
    initialHeight = slider.height();

slider.aslider({
    keyboardArrowKeys: true,
    cssTransitions: Modernizr.csstransitions,
    beforeSlide: function (index) {
        var pages = this._getPages(),
            next = pages.eq(index),
            height = next.outerHeight();

        if (height < intialHeight) {
            height = initialHeight;
        }
        slider.height(height); // or use $().animate or CSS animations
    }
});
```
