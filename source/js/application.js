$(function() {
  // bootstrap tooltip
  $('[data-toggle="tooltip"]').tooltip();

  // slimscroll
  if (typeof $.fn.slimScroll != 'undefined') {
    $(".sidebar .slimContent").slimScroll({
      height: $(window).height(),
      color: "rgba(0,0,0,0.15)",
      size: "5px",
      position: 'right',
      // allowPageScroll: true
    });
  }

  $('#collapseToc').on('shown.bs.collapse', function () {
    // do something…
    // slimscroll
    if (typeof $.fn.slimScroll != 'undefined') {
      $(".sidebar .slimContent").slimScroll().on('slimscroll');
    }
  });

  // geopattern 背景生成
  $(".geopattern").each(function() {
    $(this).geopattern($(this).data('pattern-id'));
  });

  // okayNav
  var navigation = $('#nav-main').okayNav({
    swipe_enabled: false, // If true, you'll be able to swipe left/right to open the navigation
  });

  // modal居中
  // $('.modal').on('shown.bs.modal', function(e) {
  //   $(this).show();
  //   var modalDialog = $(this).find(".modal-dialog");
  //    // Applying the top margin on modal dialog to align it vertically center 
  //   modalDialog.css("margin-top", Math.max(0, ($(window).height() - modalDialog.height()) / 2));
  // });

  // sticky
  $('[data-stick-bottom]').keepInView({
    fixed: false,
    parentClass: "has-sticky",
    customClass: "sticky",
    trigger: 'bottom',
    zindex: 42,
    edgeOffset: 0
  });
  $('[data-stick-top]').keepInView({
    fixed: true,
    parentClass: "has-sticky",
    customClass: "sticky",
    trigger: 'top',
    zindex: 42,
    edgeOffset: 0
  });
  
  // menu auto highlight
  var menuHighlight = $("ul.main-nav").hasClass('menu-highlight');
  if (menuHighlight) {
    var currentPathname = location.pathname,
        $menuList = $("ul.main-nav>li"),
        activeIndex = -1;
    for (var i = 0, length = $menuList.length; i < length; i++) {
      var itemHref = $($menuList[i]).find('a').attr('href');
      if (currentPathname.indexOf(itemHref) > -1 ||
        (currentPathname === '/' && (itemHref === '/.' || itemHref === '/' || itemHref === 'index.html' || itemHref === '/index.html'))) {
        activeIndex = i;
      }
      $($menuList[i]).removeClass('active');
    }
    $menuList[activeIndex] && $($menuList[activeIndex]).addClass('active');
  }
});
