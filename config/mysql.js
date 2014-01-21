var mysql = require('mysql');
var keyfile = require('./key');

var services = keyfile.services;
var mysqlConfig = services['mysql-5.1'][0].credentials;

var db_config = {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  user: mysqlConfig.username,
  password: mysqlConfig.password,
  database: mysqlConfig.name
};

exports.connection = function() {
  var connection;

  connection = mysql.createConnection(db_config);
  return connection;
};