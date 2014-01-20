$(function() {
  var $btnLogin = $('.btn-login');
  var $username = $('.username');
  var $password = $('.password');

  $btnLogin.click(function() {
    $.ajax({
      type: 'POST',
      url: '/login',
      contentType: 'application/json',
      data: JSON.stringify({
        username: $username.val(),
        password: $password.val()
      })
    })
      .done(function(data) {
        if (data.isSuccess) {
          window.location.href = '/';
        } else {
          alert('账号密码错误');
        }
      })
      .fail(function() {
        alert('网络错误');
      });
  });

  $('input').keydown(function(e) {
    if (e.keyCode == 13) {
      $btnLogin.click();
    }
  });
});