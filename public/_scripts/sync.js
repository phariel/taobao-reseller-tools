$(function() {
  //Sync
  var syncOnsaleClass = 'btn-sync-onsale';
  var syncInventoryClass = 'btn-sync-inventory';
  var $syncOnsaleBtn = $('.' + syncOnsaleClass);
  var $syncInventoryBtn = $('.' + syncInventoryClass);
  var successClass = 'btn-success';
  var loadingClass = 'btn-info';

  var syncExec = function() {
    var $btn = $(this);
    var method = '';
    if ($btn.attr('class').indexOf(syncOnsaleClass) > -1) method = 'onsale';
    if ($btn.attr('class').indexOf(syncInventoryClass) > -1) method = 'inventory';

    $btn.addClass(loadingClass);
    $.ajax({
      url: '/products/sync/' + method + '?_=' + (new Date()).getTime(),
      type: 'GET'
    })
      .done(function(data) {
        if (data.err) {
          alert('错误：' + err);
        }
        if (data.isSuccess) {
          $btn.addClass(successClass);
        } else {
          alert('写入数据库错误');
        }
      })
      .fail(function() {
        alert('网络错误');
      }).always(function() {
        $btn.removeClass(loadingClass);
      });
  };

  $syncOnsaleBtn.add($syncInventoryBtn).click(syncExec);

});