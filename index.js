/**
 * Universal Module Shim
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['emitter'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('emitter'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.Emitter);
  }
}(this, function (Emitter) {

  var google;

  if (typeof window !== 'undefined') {
    google = window.google;
  }

  if (typeof google === 'undefined') {
    throw new Error('Cannot find global variable "google"');
  }

  /**
   * BetterWindow
   * @param {GMap} map - A Google map
   * @param {MVCObject} anchor - A google map overlay (ie. marker, rectangle, etc)
   * @param {Object} options (optional) - An object containing your options overrides
   */
  function BetterWindow(map, anchor, options){

    this.options = extend({
      css: 'BetterWindow',
      disableAutoPan: true,
      visible: true,
      zIndex: null,
      content: '',
      pane: 'floatPane',
      offset: 40,
      template: '<button class="close" style="float: right;">X</button><div class="triangle"><div class="top"></div><div class="bottom"></div></div>'
    }, options);

    this.el = null;
    this.map = map;
    this.anchor = anchor;
    this.bindings = {};

    google.maps.OverlayView.apply(this, this.options);
  }


  /**
   * Create the actual BetterWindow DIV on the map
   * @param  {GMap} map (optional) - A Google map
   * @param  {MVCObject} anchor (optional) - A google map overlay (ie. marker, rectangle, etc)
   * @return {[type]}        [description]
   */
  BetterWindow.prototype.create = function(map, anchor) {
    var self = this;
    this.map = map || this.map;
    this.anchor = anchor || this.anchor;
    this.options.position = this.anchor.getPosition();

    // Create DOM element
    this.el = this.createFragment();

    // Bind Events
    this.bindings.position = google.maps.event.addListener(this.anchor, 'position_changed', function(ev) {
      self.position(this.getPosition());
    });

    this.bindings.close = google.maps.event.addDomListener(this.el.firstChild, 'click', function(ev){
      ev.cancelBubble = true;
      ev.stopPropagation();

      // google.maps.event.trigger(self, 'closeclick');
      self.hide();
    });
    
    // Actually append the BetterWindow fragment to the DOM
    this.setMap(this.map);

    google.maps.event.trigger(this, 'domready');
    this.emit('created');

    return this;
  };


  /**
   * Create the BetterWindow document fragment
   * @return {DOM Fragment} - A document fragment styled and ready to go.
   */
  BetterWindow.prototype.createFragment = function() {
    var element = document.createElement('div');
    element.innerHTML = this.options.template;
    element.insertAdjacentHTML('beforeEnd', this.options.content);

    return this.style({}, element);
  };

  /**
   * Style the BetterWindow element
   * @param  {Object} styles - css you want to the BetterWindow
   * @return {BetterWindow} this - the BetterWindow instance
   */
  BetterWindow.prototype.style = function(styles, element) {
    styles = extend(styles, {
      height: '150px',
      width: '300px',
      position: 'absolute',
      visibility: this.options.visible ? 'visible' : 'hidden',
      overflow: 'auto',
      background: '#FFFFFF'
      // zIndex: this.options.zIndex
    });

    element = element || this.el;

    extend(element.style, styles);

    return element;
  };


  /**
   * A callback method called by Google maps when the 
   * BetterWindow is set on the map using .setMap(this.map).
   * Now we actually add the DOM node to the map.
   */
  BetterWindow.prototype.onAdd = function(){
    console.log('Adding to map', arguments);

    this.getPanes()[this.options.pane].appendChild(this.el);

    if (this.options.visible) {
      this.show();
    }
  };

  /**
   * A callback method called by Google maps when the 
   * BetterWindow DOM node is removed from the map. Destroy 
   * the BetterWindow and clean up all its bindings.
   */
  BetterWindow.prototype.onRemove = function(){
    console.log('Removing from map', arguments);

    // Unbind all listeners and remove from DOM
    for (var i in this.bindings) {
      google.maps.event.removeListener(this.bindings[i]);
    }

    // Clean everything up all nice :-)
    this.bindings = {};
    this.map = null;
    this.anchor = null;
    this.el.parentNode.removeChild(this.el);
    this.el = null;

    this.emit('destroyed');
  };


  /**
   * Draw the BetterWindow on the map. Google maps calls this method
   * after calling setMap(this.map).
   */
  BetterWindow.prototype.draw = function(){
    console.log('Drawing', arguments);
    
    this.position();
  };


  /**
   * Remove the BetterWindow from Google map
   */
  BetterWindow.prototype.destroy = function() {

    // Removing BetterWindow from map. This will then call .onRemove()
    this.setMap(null);
  };


  /**
   * Make the BetterWindow visible
   */
  BetterWindow.prototype.show = function() {
    this.options.visible = true;
    this.el.style.visibility = 'visible';

    this.emit('shown');
  };


  /**
   * Make the BetterWindow invisible
   */
  BetterWindow.prototype.hide = function() {
    this.options.visible = false;
    this.el.style.visibility = 'hidden';

    this.emit('hidden');
  };

  /**
   * [calculatePosition description]
   * @return {Google Maps Position} - The corrected pixel position of the popover
   */
  BetterWindow.prototype.calculatePosition = function() {
    var pixelPosition = this.getProjection().fromLatLngToDivPixel(this.options.position);

    pixelPosition.x = pixelPosition.x - (this.el.offsetWidth/2);
    pixelPosition.y = pixelPosition.y - this.el.offsetHeight - this.options.offset;

    return pixelPosition;
  };

  /**
   * Position the BetterWindow relative to its anchor point. This method
   * can be called directly. It also gets called by .draw() and when
   * the anchor's position changes.
   * @param  {Google Maps Position} 
   */
  BetterWindow.prototype.position = function(position) {
    this.options.position = position || this.options.position;

    var BetterWindowPosition = this.calculatePosition();

    this.style({
      top: BetterWindowPosition.y + 'px',
      left: BetterWindowPosition.x + 'px'
    });

    google.maps.event.trigger(this, 'position_changed');
    this.emit('changed:position', this.options.position);
  };


  /**
   * Mixin a given set of properties
   * @param obj The object to add the mixed in properties
   * @param properties The properties to mix in
   */
  var mixin = function(obj, properties) {
    properties = properties || {};

    for (var key in properties) {
      obj[key] = properties[key];
    }

    return obj;
  };

  var extend = mixin;

  mixin(BetterWindow.prototype, Emitter.prototype);
  mixin(BetterWindow.prototype, google.maps.OverlayView.prototype);
    
  return BetterWindow;
}));