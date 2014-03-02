var async = require('async');
var taobao = require('../config/taobao').taobao();
var connection = require('../config/mysql').connection;
var utility = require('../config/utility');
var urls = utility.urls;
var localBaseUrl = urls.localBaseUrl;

var PAGE_SIZE = 40;

var productsExec = function (req, res, status) {
  var loginuser = utility.loginuser.get(req, res);
  var page = req.params.page;
  var conn = connection();
  var data = {
    status: status,
    currentPage: page
  };
  conn.connect();


  async.series([

    function (cb) {
      conn.query('SELECT * FROM products_json WHERE status = ? and batch_page = ? ORDER BY update_time DESC LIMIT 1', [status, page], function (err, rows) {
        if (err) {
          cb(err);
        } else {
          if (rows[0]) {
            var jsonObj = JSON.parse(decodeURIComponent(rows[0].json));
            cb(null, jsonObj[(status == 1) ? 'items_onsale_get_response' : 'items_inventory_get_response']);
          } else {
            cb('数据为空');
          }
        }
      });
    },
    function (cb) {
      conn.query('SELECT item_id,price_origin AS item_price_origin,comment AS item_comment,ali_seller_id AS seller_id FROM products_extend', function (err, rows) {
        if (err) {
          cb(err);
        } else {
          cb(null, rows);
        }
      });
    }
  ], function (err, result) {
    if (err) {
      data.err = err;
      console.log(err);
    } else {
      data.json = result[0];
      var totalResults = data['json']['total_results'];
      data.pages = Math.ceil(totalResults / PAGE_SIZE);
      console.log('pages: ' + data.pages + ' current page: ' + data.currentPage);
      var items = data.json.items.item;
      var extendItems = result[1];
      if (extendItems[0]) {
        for (var i = 0; i < items.length; i++) {
          for (var j = 0; j < extendItems.length; j++) {
            var item = items[i];
            var extend = extendItems[j];
            if (item.num_iid == extend.item_id) {
              item.item_price_origin = extend.item_price_origin;
              item.item_comment = extend.item_comment;
              item.seller_id = extend.seller_id;
              //item.seller_name = extend.seller_name;
              //item.seller_url = extend.seller_url;
              //item.seller_comment = extend.seller_comment;
            }
          }
        }
      }


    }
    conn.end();
    res.render('products', data);
  });
};

exports.index = function (req, res) {
  res.redirect('/products/onsale');
};

exports.onsale = function (req, res) {
  productsExec(req, res, 1);
};

exports.inventory = function (req, res) {
  productsExec(req, res, 2);
};

exports.update = function (req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  var data = {
    isSuccess: true
  };
  var updateData = req.body.update;
  if (updateData) {
    //updateData = JSON.parse(updateData);
    var itemidArr = [];
    for (var itemid in updateData) {
      itemidArr.push(itemid);
    }

    var count = 0;

    var conn = connection();
    conn.connect();
    async.whilst(function () {
      return count < itemidArr.length;
    }, function (next) {
      var itemid = itemidArr[count];
      var field = updateData[itemid];

      console.log(JSON.stringify(field));
      conn.query('SELECT item_id FROM products_extend WHERE item_id = ?', itemid, function (err, result) {
        if (err) {
          data.err = err;
          data.isSuccess = false;
        } else {
          if (result[0]) {
            conn.query('UPDATE products_extend SET ? WHERE item_id = ?', [field, itemid], function (err, rows) {
              if (err) {
                data.err = err;
                data.isSuccess = false;
              }
            });
          } else {
            field.item_id = itemid;
            conn.query('INSERT INTO products_extend SET ?', field, function (err, rows) {
              if (err) {
                data.err = err;
                data.isSuccess = false;
              }
            });
          }
        }
        count++;
        next();
      });
    }, function (err) {
      conn.end();
      res.end(JSON.stringify(data));
    });

  } else {
    data.isSuccess = false;
    res.end(JSON.stringify(data));
  }
};

exports.sync = function (req, res) {
  var token = utility.token.get(req, res, '/products/sync');
  var loginuser = utility.loginuser.get(req, res);
  res.render('sync');
};

var fetchProduct = function (res, token, data, status, page, uniqueId) {
  var method = (status == 1) ? 'onsale' : 'inventory';
  taobao.core.call({
    method: 'taobao.items.' + method + '.get',
    fields: 'num_iid,price,title,seller_cids,pic_url',
    session: token,
    page_size: PAGE_SIZE,
    page_no: page
  }, function (body) {
    var bodyObj = JSON.parse(body);
    var total_rerults = bodyObj['items_' + method + '_get_response']['total_results'];
    var isLastPage = (total_rerults <= page * PAGE_SIZE);
    if (bodyObj.error_response) {
      data.err = bodyObj.error_response.msg;
      res.end(JSON.stringify(data));
    } else {
      var conn = connection();
      conn.connect();
      conn.query('INSERT INTO products_json SET ?', {
        json: encodeURIComponent(body),
        status: status,
        update_time: utility.getMysqlDateTime(),
        batch_id: uniqueId,
        batch_page: page
      }, function (err, result) {
        conn.end();
        if (err) {
          console.log(err);
          data.isSuccess = false;
        } else {
          if (isLastPage) {
            data.isSuccess = true;
            res.end(JSON.stringify(data));
          } else {
            page++;
            fetchProduct(res, token, data, status, page, uniqueId);
          }
        }
      });
    }
  });
};

var syncExec = function (req, res, status) {
  var token = utility.token.get(req, res, '/products/sync');
  var loginuser = utility.loginuser.get(req, res);

  var data = {};


  res.writeHead(200, {
    "Content-Type": "application/json"
  });

  var uniqueId = Math.floor(Math.random() * 1000000);
  fetchProduct(res, token, data, status, 1, uniqueId);

};

exports.sync.onsale = function (req, res) {
  syncExec(req, res, 1);
};

exports.sync.inventory = function (req, res) {
  syncExec(req, res, 2);
};