var taobao = require('taobao');
var keydata = require('./key').keydata;
exports.taobao = function() {
  taobao.config(keydata);
  return taobao;
}