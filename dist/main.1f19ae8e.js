// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.js":[function(require,module,exports) {
window.$ = window.jQuery;
var EventCenter = {
  on: function on(type, handler) {
    $(document).on(type, handler);
  },
  fire: function fire(type, data) {
    $(document).trigger(type, data);
  }
};
var Footer = {
  init: function init() {
    this.$footer = $('footer');
    this.$ul = this.$footer.find('ul');
    this.$box = this.$footer.find('.box');
    this.$leftBtn = this.$footer.find('.icon-left');
    this.$rightBtn = this.$footer.find('.icon-right');
    this.isToEnd = false;
    this.isToStart = true;
    this.isAnimate = false;
    this.bind();
    this.render();
  },
  bind: function bind() {
    var _this = this;

    this.$rightBtn.on('click', function () {
      if (_this.isAnimate) return;

      var itemWidth = _this.$box.find('li').outerWidth(true);

      var rowCount = Math.floor(_this.$box.width() / itemWidth);

      if (!_this.isToEnd) {
        _this.isAnimate = true;

        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false;
          _this.isToStart = false;

          if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
            _this.isToEnd = true;
          }
        });
      }
    });
    this.$leftBtn.on('click', function () {
      if (_this.isAnimate) return;

      var itemWidth = _this.$box.find('li').outerWidth(true);

      var rowCount = Math.floor(_this.$box.width() / itemWidth);

      if (!_this.isToStart) {
        _this.isAnimate = true;

        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false;
          _this.isToEnd = false;

          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true;
          }
        });
      }
    });
    this.$footer.on('click', 'li', function () {
      $(this).addClass('active').siblings().removeClass('active');
      EventCenter.fire('select-albumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      });
    });
  },
  render: function render() {
    var _this = this;

    $.getJSON('http://jirenguapi.applinzi.com/fm/v2/getChannels.php').done(function (ret) {
      _this.renderFooter(ret.channels);
    }).fail(function () {
      console.log('error');
    });
  },
  renderFooter: function renderFooter(channels) {
    var html = '';
    channels.forEach(function (channel) {
      html += '<li data-channel-id=' + channel.channel_id + ' data-channel-name=' + channel.name + '>' + '  <div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>' + '  <h3>' + "歌单" + '</h3>' + '</li>';
    });
    this.$ul.html(html);
    this.setStyle();
  },
  setStyle: function setStyle() {
    var count = this.$footer.find('li').length;
    var width = this.$footer.find('li').outerWidth(true);
    this.$ul.css({
      width: count * width + 'px'
    });
  }
};
var Fm = {
  init: function init() {
    this.$container = $('#page-music');
    this.audio = new Audio();
    this.audio.autoplay = true;
    this.bind();
  },
  bind: function bind() {
    var _this = this;

    EventCenter.on('select-albumn', function (e, channelObj) {
      _this.channelId = channelObj.channelId;
      _this.channelName = channelObj.channelName;

      _this.loadMusic();
    });
    this.$container.find('.btn-play').on('click', function () {
      var $btn = $(this);

      if ($btn.hasClass('icon-play')) {
        $btn.removeClass('icon-play').addClass('icon-pause');

        _this.audio.play();
      } else {
        $btn.removeClass('icon-pause').addClass('icon-play');

        _this.audio.pause();
      }
    });
    this.$container.find('.btn-next').on('click', function () {
      _this.loadMusic();
    });
    this.audio.addEventListener('play', function () {
      clearInterval(_this.statusClock);
      _this.statusClock = setInterval(function () {
        _this.updateStatus();
      }, 1000);
    });
    this.audio.addEventListener('pause', function () {
      clearInterval(_this.statusClock);
    });
  },
  loadMusic: function loadMusic() {
    var _this = this;

    $.getJSON('http://jirenguapi.applinzi.com/fm/v2/getSong.php', {
      channel: this.channelId
    }).done(function (ret) {
      _this.song = ret['song'][0];

      _this.setMusic();

      _this.loadLyric();
    });
  },
  loadLyric: function loadLyric() {
    var line = "这里本应该是歌词，但是歌词接口坏了";

    if (line) {
      this.$container.find('.lyric p').text(line).boomText();
    } // let _this = this
    // $.getJSON('http://jirenguapi.applinzi.com/fm/v2/getLyric.php', { sid: this.song.sid }).done(function (ret) {
    //   let lyric = ret.lyric
    //   console.log(ret)
    //   let lyricObj = {}
    //   lyric.split('\n').forEach(function (line) {
    //     let times = line.match(/\d{2}:\d{2}/g)
    //     let str = line.replace(/\[.+?\]/g, '')
    //     if (Array.isArray(times)) {
    //       times.forEach(function (time) {
    //         lyricObj[time] = str
    //       })
    //     }
    //   })
    // _this.lyricObj = lyricObj
    // })

  },
  setMusic: function setMusic() {
    this.audio.src = this.song.url;
    $('.bg').css('background-image', 'url(' + this.song.picture + ')');
    this.$container.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')');
    this.$container.find('.detail h1').text(this.song.title);
    this.$container.find('.detail .author').text(this.song.artist);
    this.$container.find('.tag').text(this.channelName);
    this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause');
  },
  updateStatus: function updateStatus() {
    var min = Math.floor(this.audio.currentTime / 60);
    var second = Math.floor(Fm.audio.currentTime % 60) + '';
    second = second.length === 2 ? second : '0' + second;
    this.$container.find('.current-time').text(min + ':' + second);
    this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%'); // let line = this.lyricObj['0' + min + ':' + second]
    // if (line) {
    //   this.$container.find('.lyric p').text(line)
    //     .boomText()
    // }
  }
};

$.fn.boomText = function (type) {
  type = type || 'rollIn';
  this.html(function () {
    var arr = $(this).text().split('').map(function (word) {
      return '<span class="boomText">' + word + '</span>';
    });
    return arr.join('');
  });
  var index = 0;
  var $boomTexts = $(this).find('span');
  var clock = setInterval(function () {
    $boomTexts.eq(index).addClass('animated ' + type);
    index++;

    if (index >= $boomTexts.length) {
      clearInterval(clock);
    }
  }, 300);
};

Footer.init();
Fm.init();
},{}],"C:/Users/lispr/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "15451" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/lispr/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map