window.$ = window.jQuery
let EventCenter = {
  on: function (type, handler) {
    $(document).on(type, handler)
  },
  fire: function (type, data) {
    $(document).trigger(type, data)
  }
}
let Footer = {
  init: function () {
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$leftBtn = this.$footer.find('.icon-left')
    this.$rightBtn = this.$footer.find('.icon-right')
    this.isToEnd = false
    this.isToStart = true
    this.isAnimate = false

    this.bind()
    this.render()
  },

  bind: function () {
    let _this = this
    this.$rightBtn.on('click', function () {
      if (_this.isAnimate) return
      let itemWidth = _this.$box.find('li').outerWidth(true)
      let rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToEnd) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToStart = false
          if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
            _this.isToEnd = true
          }
        })
      }
    })

    this.$leftBtn.on('click', function () {
      if (_this.isAnimate) return
      let itemWidth = _this.$box.find('li').outerWidth(true)
      let rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToStart) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToEnd = false
          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true
          }
        })
      }
    })

    this.$footer.on('click', 'li', function () {
      $(this).addClass('active')
        .siblings().removeClass('active')

      EventCenter.fire('select-albumn', {
        channelId: $(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      })
    })
  },

  render () {
    let _this = this
    $.getJSON('http://jirenguapi.applinzi.com/fm/getChannels.php')
      .done(function (ret) {
        _this.renderFooter(ret.channels)
      }).fail(function () {
      console.log('error')
    })
  },

  renderFooter: function (channels) {
    let html = ''
    channels.forEach(function (channel) {
      html += '<li data-channel-id=' + channel.channel_id + ' data-channel-name=' + channel.name + '>'
        + '  <div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>'
        + '  <h3>' + channel.name + '</h3>'
        + '</li>'
    })
    this.$ul.html(html)
    this.setStyle()
  },

  setStyle: function () {
    let count = this.$footer.find('li').length
    let width = this.$footer.find('li').outerWidth(true)
    this.$ul.css({
      width: count * width + 'px'
    })
  }


}


let Fm = {
  init: function () {
    this.$container = $('#page-music')
    this.audio = new Audio()
    this.audio.autoplay = true
    this.bind()
  },
  bind: function () {
    let _this = this
    EventCenter.on('select-albumn', function (e, channelObj) {
      _this.channelId = channelObj.channelId
      _this.channelName = channelObj.channelName
        _this.loadMusic()
    })

    this.$container.find('.btn-play').on('click', function () {
      let $btn = $(this)
      if ($btn.hasClass('icon-play')) {
        $btn.removeClass('icon-play').addClass('icon-pause')
        _this.audio.play()
      } else {
        $btn.removeClass('icon-pause').addClass('icon-play')
        _this.audio.pause()
      }
    })

    this.$container.find('.btn-next').on('click', function () {
      _this.loadMusic()
    })

    this.audio.addEventListener('play', function () {
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function () {
        _this.updateStatus()
      }, 1000)
    })

    this.audio.addEventListener('pause', function () {
      clearInterval(_this.statusClock)
    })

  },
  loadMusic () {
    let _this = this
    $.getJSON('http://jirenguapi.applinzi.com/fm/getSong.php', { channel: this.channelId }).done(function (ret) {
      _this.song = ret['song'][0]
      _this.setMusic()
      _this.loadLyric()
    })
  },
  loadLyric () {
  let line = "这里本应该是歌词，但是歌词接口坏了"
  if (line) {
    this.$container.find('.lyric p').text(line)
      .boomText()
  }
    //let _this = this
    // $.getJSON('http://jirenguapi.applinzi.com/fm/getLyric.php', { sid: this.song.sid }).done(function (ret) {
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
    //_this.lyricObj = lyricObj
    //})
  },

  setMusic () {
    this.audio.src = this.song.url
    $('.bg').css('background-image', 'url(' + this.song.picture + ')')
    this.$container.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')')
    this.$container.find('.detail h1').text(this.song.title)
    this.$container.find('.detail .author').text(this.song.artist)
    this.$container.find('.tag').text(this.channelName)
    this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
  },
  updateStatus () {
    let min = Math.floor(this.audio.currentTime / 60)
    let second = Math.floor(Fm.audio.currentTime % 60) + ''
    second = second.length === 2 ? second : '0' + second
    this.$container.find('.current-time').text(min + ':' + second)
    this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')
    //let line = this.lyricObj['0' + min + ':' + second]
    // if (line) {
    //   this.$container.find('.lyric p').text(line)
    //     .boomText()
    // }
  }
}


$.fn.boomText = function (type) {
  type = type || 'rollIn'
  this.html(function () {
    let arr = $(this).text()
      .split('').map(function (word) {
        return '<span class="boomText">' + word + '</span>'
      })
    return arr.join('')
  })

  let index = 0
  let $boomTexts = $(this).find('span')
  let clock = setInterval(function () {
    $boomTexts.eq(index).addClass('animated ' + type)
    index++
    if (index >= $boomTexts.length) {
      clearInterval(clock)
    }
  }, 300)
}

Footer.init()
Fm.init()