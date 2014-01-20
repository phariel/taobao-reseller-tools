var mysql = require('mysql');
var keyfile = require('./key');

var services = keyfile.services;
var mysqlConfig = services['mysql-5.1'][0].credentials;
var mysqlKey = keyfile.mysqlkey;

console.log(mysqlKey.database);

var db_config = {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  user: mysqlConfig.username,
  password: mysqlConfig.password,
  database: mysqlKey.database
};

exports.connection = function() {
  var connection;

  connection = mysql.createConnection(db_config);
  return connection;
};