var BookmarksView = Backbone.View.extend({

  initialize: function() {
    _.bindAll(this, 'fetch', 'render', 'unrender', 'scroll');

    this.collection = new BookmarksCollection();
    this.collection.bind('reset', this.render, this);
    this.collection.bind('add', this.render, this);

  },

  fetch: function(options) {
    this.search = false;
    if (options && typeof options.data != 'undefined') {
      this.search = true;
    }
    this.collection.fetch(options);
  },

  render: function() {

    this.offset = 50;

    if (this.search == false) {
      var self = this;
      $(window).scroll(function() { self.scroll(); });
    }

    //$(this.el).masonry('destroy');
    $('#app').html('').append(this.el);

    if (this.search == false && this.collection.models.length == 0) {

      $(this.el).css('width', '960px').css('margin', '0px auto');
      $(this.el).html(Templates.bookmarks);

    } else {

      $(this.el).css('margin', '90px auto 15px auto').css('width', 'auto').css('background', 'transparent');
      $(this.el).html('');
      //$(this.el).html(Templates.sort);
      $('#btn-sort-by-attributes-alt').addClass('active');

      var self = this;
      _(this.collection.models).each(function(bookmark) {
        var bmv = new BookmarkView({ model: bookmark });
        bmv.render();
        $(self.el).append(bmv.el);
      });

      $(this.el).masonry({
        itemSelector: '.item',
        columnWidth: 255,
        isFitWidth: true
      });

    }

  },

  unrender: function() {
    $(this.el).masonry('destroy').detach();
    $(window).unbind('scroll');
  },

  scroll: function() {
    var bottom = $(document).height() - $(window).height() - 50 <= $(window).scrollTop();

    var self = this;
    if (bottom) {
      $(window).unbind('scroll');
      $.getJSON('./api/v1/bookmark?offset=' + self.offset, function(data) {
        self.collection.unbind('add');

        self.offset += 50;
        self.collection.add(data);

        _(data).each(function(bookmark) {
          var bmv = new BookmarkView({ model: new Bookmark(bookmark) });
          bmv.render();
          $(self.el).append(bmv.el).masonry('appended', $(bmv.el), true);
        });

        $(window).scroll(function() { self.scroll(); });

        self.collection.bind('add', self.render, self);
      });
    }
  }

});
