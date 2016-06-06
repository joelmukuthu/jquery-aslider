# jquery-aslider
[![Dependency Status](https://david-dm.org/joelmukuthu/jquery-aslider.svg)](https://david-dm.org/joelmukuthu/query-aslider) [![Licence](https://img.shields.io/npm/l/jquery-aslider.svg?maxAge=2592000)]() [![Bower version](https://img.shields.io/bower/v/jquery-aslider.svg?maxAge=2592000)]() [![npm version](https://img.shields.io/npm/v/jquery-aslider.svg?maxAge=2592000)]()

slider plugin for jQuery, supports CSS animations and grid transitions. [Demo](http://joelmukuthu.github.io/jquery-aslider/)

## Features

* Supports CSS transitions as well as jQuery animations (which ideally should be used only as a fallback)
* Supports grid (vertical, horizontal and diagonal) transitions. It calculates what row and column an item is on when transitioning to it.
* Plays nice with responsive designs. It doesn't add any CSS to make the elements responsive but doesn't interfere with those styles either.
* Supports items (pages) of unequal sizes. This is especially nice for vertical sliders.
* Provides an API for you to programmatically initiate transitioning to an item, for instance for adding touch support.
* Does not add unnecessary CSS to the elements, besides `transform`, `left` and `top` properties which are required for the transitioning.
* Has built in support for up, down, left, right, previous, next, first and last buttons (even their disabled states).
* Has built in support for keyboard navigation using the arrow keys.
* Supports before and after-slide callbacks.

## Installation
Install with bower:
```sh
bower install jquery-aslider
```
Or with npm:
```sh
npm install jquery-aslider
```
Or simply download the [latest release](https://github.com/joelmukuthu/jquery-aslider/releases/latest).

## Usage

First, include jQuery and jquery-aslider on your page. Then to create a slider:

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

## Documentation
Have a look at the [docs](DOCS.md) for all the configuration options, API methods and examples. For more examples, also have a look at the [example](example) or view the source on the [demo site](http://joelmukuthu.github.io/jquery-aslider/).

## License

[The MIT License](LICENSE.md)

## Contributing

Fork, update and submit a pull request.
