var request = require('request');
var querystring = require('querystring');
var utility = require('../config/utility');

var keydata = require('../config/key').keydata;
var appkey = keydata.app_key;
var appsecret = keydata.app_secret;

var urls = require('../config/utility').urls;
var authUrl = urls.authUrl;
var tokenUrl = urls.tokenUrl;
var localBaseUrl = urls.localBaseUrl;
var localUrl = localBaseUrl + '/auth';

var getToken = function(code, req, res) {
  var params = {
    'client_id': appkey,
    'client_secret': appsecret,
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': localUrl
  };
  request.post({
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    uri: tokenUrl,
    body: querystring.stringify(params)
  }, function(error, response, body) {
    if (error) {
      res.render('simple', {
        'cont': error
      });
    }
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      //res.cookie('token', body.access_token, {
      //maxAge: 1000 * 60 * 60 * 12
      //});
      utility.token.set(req, body.access_token);
      console.log('token:' + body.access_token);
      res.redirect(localBaseUrl + req.session.backurl);
    }
  });
};

exports.auth = function(req, res) {
  var code = req.query.code;
  var backurl = req.query.backurl;
  if (backurl) {
    req.session.backurl = backurl;
  }

  if (req.query.error) {
    res.render('simple', {
      'cont': req.query.error_description
    });
  }

  if (!code) {
    var str = authUrl + '?response_type=code&client_id=' + appkey + '&redirect_uri=' + localUrl;
    res.redirect(str);
  } else {
    console.log('code:' + code);
    getToken(code, req, res);
  }
};