/*
 * testato e funzionante con una precedente versione
 * per farlo funzionare nell'attuale vanno implementati
 * tutti i metodi mancanti e gestito l'oggetto di ritorno serviceStatus
 */
var express = require('express');
var mysql = require('mysql');

var router = express.Router();
var queries = {
  readAll: 'SELECT * FROM `todos` ORDER BY `id`;',
  read: 'SELECT * FROM `todos` WHERE `id`=?;',
  insert: 'INSERT INTO `todos` (`title`,`note`,`created`) VALUES(?,?,?);',
  update: 'UPDATE `todos` SET `title`=?,`note`=? WHERE `id`=?;',
  remove: 'DELETE FROM `todos` WHERE `id`=?;'
};
var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'nodejs2015',
  database: 'MyApp'
});

router.get('/todo', function (req, res, next) {
  connection.query(queries.readAll, function (err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

router.get('/todo/:id', function (req, res, next) {
  var id = req.params.id;
  if (isNaN(id) || id < 0) {
    res.statusCode = 400;
    return res.send('Error 400: Invalid id');
  }
  var queryParams = [req.params.id];
  connection.query(queries.read, queryParams, function (err, rows, fields) {
    if (err) throw err;
    res.json(rows[0]);
  });
});

//insert
router.put('/todo', function (req, res, next) {
  if (req.body.hasOwnProperty('id')) {
    res.statusCode = 400;
    return res.send('Error 400: Ivalid `id` in POST');
  }
  if (!req.body.hasOwnProperty('title')) {
    res.statusCode = 400;
    return res.send('Error 400: Title required');
  }
  var note = null;
  if (req.body.hasOwnProperty('note'))
    note = req.body.note;

  var queryParams = [];
  queryParams.push(req.body.title);
  queryParams.push(note);
  queryParams.push(new Date());
  queryParams.push(req.body.id);

  connection.query(queries.insert, queryParams, function (err, result) {
    if (err) throw err;
    res.json({
      insertId: result.insertId
    });
  });
});

//update
router.post('/todo', function (req, res, next) {
  if (!req.body.hasOwnProperty('id') || isNaN(req.body.id) || req.body.id < 0) {
    res.statusCode = 400;
    return res.send('Error 400: Ivalid id');
  }
  if (!req.body.hasOwnProperty('title')) {
    res.statusCode = 400;
    return res.send('Error 400: Title required');
  }
  var note = null;
  if (req.body.hasOwnProperty('note'))
    note = req.body.note;

  var queryParams = [];
  queryParams.push(req.body.title);
  queryParams.push(note);
  queryParams.push(req.body.id);

  connection.query(queries.update, queryParams, function (err, result) {
    if (err) throw err;
    res.json({
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    });
  });
});

router.delete('/todo', function (req, res, next) {
  if (!req.body.hasOwnProperty('id')) {
    res.statusCode = 400;
    return res.send('Error 400: Ivalid id');
  }
  var id = req.body.id;
  if (isNaN(id) || id < 0) {
    res.statusCode = 404;
    return res.send('Error 404: Invalid id');
  }
  var queryParams = [id];
  console.log(queries.remove);
  console.log(queryParams);
  connection.query(queries.remove, queryParams, function (err, result) {
    if (err) throw err;
    res.json({
      affectedRows: result.affectedRows
    });
  });
});

module.exports = router;
