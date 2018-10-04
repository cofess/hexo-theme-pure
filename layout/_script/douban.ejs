<script>
function show(id) {
  document.getElementById('reading').classList.remove('active');
  document.getElementById('read').classList.remove('active');
  document.getElementById('wish').classList.remove('active');
  document.getElementById('reading').classList.add('hide');
  document.getElementById('read').classList.add('hide');
  document.getElementById('wish').classList.add('hide');

  var ele = document.getElementById(id);
  ele.classList.remove('hide');
  ele.classList.add('active');

  document.getElementById('reading-tab').classList.remove('active');
  document.getElementById('read-tab').classList.remove('active');
  document.getElementById('wish-tab').classList.remove('active');
  document.getElementById(id + '-tab').classList.add('active');
};

(function() {
  var read = [];
  var wish = [];
  var reading = [];

  // XHR 获取豆瓣书单数据，数据格式json
  // function loadDoubanCollections() {
  //   var xhr = new XMLHttpRequest();
  //   // https://api.douban.com/v2/book/user/:name/collections
  //   xhr.open('GET', 'http://7b1fa0.com1.z0.glb.clouddn.com/douban-20170429-1.json', true);

  //   xhr.onload = function() {
  //     // console.log(this);
  //     if (this.status >= 200 && this.status < 300) {
  //       var res = JSON.parse(this.response);
  //       searchData = res;
  //       onLoadDouban(searchData);
  //     } else {
  //       console.error(this.statusText);
  //     }
  //   };

  //   xhr.onerror = function() {
  //     console.error(this.statusText);
  //   };

  //   xhr.send();
  // }
  
  // Ajax 获取豆瓣书单数据，数据格式json
  function loadDoubanCollections() {
    var _this = this;
    // https://api.douban.com/v2/book/user/:name/collections?start=0&count=100
    var url = "https://api.douban.com/v2/book/user/<%= theme.douban.user %>/collections"
    $.ajax({
      url: url,
      type: 'GET',
      data: {
        start:<%= theme.douban.start %>, // 从哪一条记录开始
        count:<%= theme.douban.count %> // 获取豆瓣书单数据条数
      },
      dataType: 'JSONP', //here
      success: function(data) {
        // console.log(data);
        onLoadDouban(data);
      }
    });
  }

  function onLoadDouban(data) {
    if (data['count'] > 0) {
      for (var i = 0; i < data['collections'].length; ++i) {
        resolveBook(data['collections'][i]);
      }
    }
    render();
  }

  function resolveBook(book) {
    if (book['status'] == 'read') {
      read.push(book);
    }
    if (book['status'] == 'wish') {
      wish.push(book);
    }
    if (book['status'] == 'reading') {
      reading.push(book);
    }
  }

  function render() {
    renderList(read, 'read');
    renderList(wish, 'wish');
    renderList(reading, 'reading');

    document.getElementById('reading-total').innerHTML = '(' + reading.length + ')';
    document.getElementById('read-total').innerHTML = '(' + read.length + ')';
    document.getElementById('wish-total').innerHTML = '(' + wish.length + ')';

    show('reading');
    document.getElementById('loading').classList.add('hide');
  }

  function renderList(list, id) {
    for (var i = 0; i < list.length; ++i) {
      var h = renderBook(list[i]);
      if (i > 0 && i % 4 == 3) {
        h += '<div class="clearfix"></div>';
      }
      document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + h;
    }
  }

  function renderBook(book) {
    var html = '<div class="col-sm-6 col-md-6"><div class="panel panel-default hover-grow"><div class="panel-body">'
      + '<div class="media media-middle book book-' + book['status'] + '" itemscope itemtype="http://schema.org/Book">' 
      + '<div class="media-left"><a class="media-middle" target="_blank" href="' + book.book.alt + '" rel="external nofollow noopener noreferrer"><img class="media-object" src="' + book.book.image + '" itemprop="image"/></a></div><div class="media-body">' 
      + '<h3 class="media-heading" itemprop="name"><a target="_blank" href="' + book.book.alt + '" rel="external nofollow noopener noreferrer">' + book.book.title + '</a></h3>' 
      + '<p class="meta text-nowrap-1x"><small itemprop="author">' + book.book.author[0] + '</small> / <small itemprop="datePublished">' + book.book.pubdate + '</small> / <small itemprop="ratingValue">' + book.book.rating.average + '分</small></p>' 
      + '<p class="meta text-nowrap-1x">' + book.updated.substring(0, 10) + resolveRating(book.rating) + resolveTags(book.tags) + '</p>' 
      + '<div class="comments text-muted text-nowrap-3x" itemprop="comment">' + (book.comment ? book.comment : '') + '</div>' 
      + '</div>' + '</div>' + '</div>' + '</div>' + '</div>';
    return html;
  }

  function resolveRating(rating) {
    if (rating && rating.value) {
      return ' / ' + rating.value + '星';
    }
    return '';
  }

  function resolveTags(tags) {
    if (tags && tags.length > 0) {
      var html = ' / ';
      for (var i = 0; i < tags.length; ++i) {
        html += tags[i] + ' ';
      }
      return html;
    }
    return '';
  }

  setTimeout(function() {
    loadDoubanCollections();
  }, 0)
})()
</script>
