$(function() {
  $.validator.addMethod('money', function(value, element) {
    return this.optional(element) || (/^\d{1,9}(\.\d{1,2})?$/.test(value));
  });

  var successClass = 'btn-success';
  var loadingClass = 'btn-info';

  var $err = $('.err-panel');
  var $change = $('.change-panel');
  var $changeBtn = $('.btn-change');
  var $form = $('#ProductForm');

  $form.find('input').focus(function() {
    $err.fadeOut(200, function() {
      $err.text('');
    });
  });

  var changedFunc = function(obj) {
    var $elem = $(obj);
    if ($elem.val() != $elem.data('old-val')) {
      $elem.addClass('changed');
      $change.fadeIn(200);
    } else {
      $elem.removeClass('changed');
      if ($('.changed').length == 0) {
        $change.fadeOut(200);
      }
    }
  };

  $('input').add('textarea').each(function() {
    var $elem = $(this);
    $elem.data('old-val', $elem.val());
  });

  $('textarea').blur(function() {
    changedFunc(this);
  });

  $form.validate({
    ignore: [],
    focusInvalid: false,
    onkeyup: false,
    onfocusout: function(element) {
      if ($(element).valid()) {
        changedFunc(element);
      } else {
        $err.fadeIn(200);
      }
    },
    focusCleanup: true,
    errorElement: "div",
    errorPlacement: function(error, element) {
      error.appendTo($err);
    },
    invalidHandler: function(form, validator) {
      if (!validator.numberOfInvalids()) return;

      $('html, body').animate({
        scrollTop: $(validator.errorList[0].element).offset().top - 80
      }, 500);
    }
  });

  $changeBtn.click(function() {
    var $btn = $(this);
    $err.text('');
    if ($form.valid()) {
      $btn.addClass(loadingClass);
      var subdata = {};
      $('.changed').each(function() {
        var $item = $(this);
        var itemid = $item.data('itemid');
        var field = $item.data('field');
        var val = encodeURIComponent($item.val());
        if (!subdata[itemid]) {
          subdata[itemid] = {};
        }
        subdata[itemid][field] = val;

      });
      $.ajax({
        type: 'POST',
        url: '/products/update',
        contentType: "application/json",
        data: JSON.stringify({
          update: subdata
        })
      })
        .done(function(data) {
          if (data.err) {
            alert(JSON.stringify(data.err));
            return;
          }
          if (data.isSuccess) {
            var $changed = $('.changed');
            $changed.data('old-val', $changed.val());
            $changed.removeClass('changed');
            $btn.addClass(successClass);
            setTimeout(function() {
              $change.fadeOut(200, function() {
                $btn.removeClass(successClass);
              });
            }, 3000);
          } else {
            alert('操作失败');
          }
        })
        .fail(function() {
          alert('网络错误');
        })
        .always(function() {
          $btn.removeClass(loadingClass);
        });
    } else {
      $err.show();
    }
  });

});