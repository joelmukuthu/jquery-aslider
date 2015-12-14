# jquery-aslider [![Bower version](https://badge.fury.io/bo/jquery-aslider.svg)](http://badge.fury.io/bo/jquery-aslider)

slider plugin for jQuery, supports CSS animations and grid transitions. [Demo](http://joelmukuthu.github.io/jquery-aslider/)

## Features

* Supports CSS animations as well animating using jQuery i.e. by left or top properties
* Supports grid transitions - vertical/horizontal/diagonal. automatically detects what row and column an item is in when transitioning to it
* Plays nice with responsive designs - doesn't add any CSS to make the elements responsive but doesn't interfere with it either
* The slider items must not be of the same size. This comes in handy especially for vertical sliders
* provides an API for you to programmatically initiate sliding, among other functions
* No extra CSS is added to the elements, besides one of `transform`, `left` or `top`
* Supports previous/next (up/down) buttons
* Supports keyboard navigation, using the arrow keys

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

First, include jQuery and jquery-aslider on your page. To have a functional slider:

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
