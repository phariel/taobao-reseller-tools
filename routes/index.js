var connection = require('../config/mysql').connection;
var md5 = require('MD5');

var utility = require('../config/utility');
var loginuser = utility.loginuser;

exports.index = function(req, res) {
  var user = loginuser.get(req, res);
  res.render('index');
};

exports.login = function(req, res) {
  res.render('login');
};

exports.loginSvc = function(req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  var data = {
    isSuccess: false
  };
  var username = req.body.username;
  var password = req.body.password;

  if (!username || !password) {
    res.end(JSON.stringify(data));
  } else {
    var conn = connection();
    conn.connect();
    conn.query('SELECT * FROM whoami WHERE username = ?', [username], function(err, rows) {
      conn.end();
      if (err) {
        console.log('Login err: ' + err);
        data.err = err;
      } else {
        if (rows[0] && rows[0].password == md5(password)) {
          loginuser.set(req, rows[0].username);
          data.isSuccess = true;
        }
      }
      res.end(JSON.stringify(data));
    });
  }
};