var BetterWindow = require('better-window');
var bWindow;
var map;
var anchor;

describe('Constructor', function() {

  it('extends the Google maps OverlayView', function() {
    expect(BetterWindow.prototype.setMap).to.be.a('function');
    expect(BetterWindow.prototype.draw).to.be.a('function');
  });

  it('extends emitter', function() {
    expect(BetterWindow.prototype.on).to.be.a('function');
    expect(BetterWindow.prototype.off).to.be.a('function');
  });

  it('mixes in options', function() {
    var options = {
      foo: 'bar',
      template: ''
    };

    bWindow = new BetterWindow(map, anchor, options);

    expect(bWindow.options).to.eql({
      css: 'better-window',
      disableAutoPan: true,
      visible: true,
      zIndex: null,
      content: '',
      pane: 'floatPane',
      offset: 40,
      foo: 'bar',
      template: ''
    });
  });

});

describe('.create', function() {
  it('uses the map passed at initialization', function() {

  });

  it('sets the map to the passed in map', function() {

  });

  it('uses the anchor passed at initialization', function() {

  });

  it('sets the el', function() {

  });

  it('binds to position_changed event', function() {

  });

  it('binds to click event', function() {

  });

  it('emits a created event', function() {

  });

});

describe('.createFragment', function() {
  it('creates a default fragment', function() {

  });

  it('creates a custom fragment', function() {

  });

});

describe('.style', function() {
  it('applies the default styles', function() {

  });

  it('applies custom styles', function() {

  });

});

describe('.show', function() {
  it('shows the window', function() {

  });

});

describe('.hide', function() {
  it('hides the window', function() {

  });

});
