$(function() {
  // bootstrap tooltip
  $('[data-toggle="tooltip"]').tooltip();

  // slimscroll
  if (typeof $.fn.slimScroll != 'undefined') {
    $(".sidebar .slimContent").slimScroll({
      height: "auto",
      color: "rgba(0,0,0,0.2)",
      size: "3px",
      // allowPageScroll: true
    });
  }

  // geopattern 背景生成
  $(".geopattern").each(function() {
    $(this).geopattern($(this).data('pattern-id'));
  });

  // okayNav
  var navigation = $('#nav-main').okayNav({
    swipe_enabled: false, // If true, you'll be able to swipe left/right to open the navigation
  });

  // donate
  $('.donate-box').on('click', '.pay_item', function() {
    var dataid = $(this).attr('data-id');
    var qrcode = $(this).attr('data-src') ? $(this).attr('data-src') : "assets/images/donate/" + dataid + "img.png";
    var text = dataid == "alipay" ? "支付宝" : "微信";
    $(this).addClass('checked').siblings('.pay_item').removeClass('checked');
    $(".donate-payimg img").attr("src", qrcode);
    $("#donate-pay_txt").text(text);
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
});
