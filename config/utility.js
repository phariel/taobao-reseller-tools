var keyfile = require('./key');
var localBaseUrl = keyfile.localBaseUrl;

exports.urls = {
  authUrl: 'https://oauth.taobao.com/authorize',
  tokenUrl: 'https://oauth.taobao.com/token',
  localBaseUrl: localBaseUrl,
  apiUrl: 'https://eco.taobao.com/router/rest',
  getApiUrl: function(token, options) {
    var apiUrl = 'https://eco.taobao.com/router/rest';
    apiUrl += '?access_token=' + token + '&v=2.0&format=json';
    if (options) {
      for (option in options) {
        apiUrl += '&' + option + '=' + options[option];
      }
    }
    return apiUrl;
  },
  postApiUrl: {
    url: 'https://eco.taobao.com/router/rest',
    v: '2.0',
    format: 'json'
  }
};

exports.loginuser = {
  get: function(req, res) {
    var loginuser = req.session.loginuser;
    if (loginuser) {
      return loginuser;
    } else {
      res.redirect(localBaseUrl + '/login');
    }

  },
  set: function(req, param) {
    req.session.loginuser = param;
  }
};

exports.token = {
  get: function(req, res, backurl) {
    var token = req.session.token;
    if (token) {
      return token;
    } else {
      res.redirect(localBaseUrl + '/auth' + (backurl ? '?backurl=' +
        backurl : ''));
    }
  },
  set: function(req, token) {
    req.session.token = token;
  }
};

exports.getMysqlDateTime = function() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  var time = year;
  time += '-' + month;
  time += '-' + day;
  time += ' ' + hour;
  time += ':' + minute;
  time += ':' + second;

  return time;
};