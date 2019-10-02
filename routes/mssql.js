var express = require('express');
var sql = require('mssql'); // assicurati di aver abilitato il protocollo tcp di sql
var ServiceStatus = require('./serviceStatus'); // carico la classe base per la risposta
var config = require("../configs/mssql.json");
var router = express.Router();

sql.on('error', err => {
  console.log(err);
})

// preparo un oggetto con le query/storeprocedure necessarie
var queries = {
  search: 'spu_todos_search',
  read: 'SELECT T.[id], [date], [title], [note], [idCategory], [category], [completed], [created], [modified]'
    + ' FROM [todos] T INNER JOIN [categories] C ON T.[idCategory]=C.[id]'
    + ' WHERE T.[id]=@id;',
  insert: 'INSERT INTO [todos] ([date],[title],[note],[idCategory],[created],[modified]) VALUES(@date,@title,@note,@idCategory,GETDATE(),GETDATE());',
  update: 'UPDATE [todos] SET [title]=@title,[date]=@date,[note]=@note,[idCategory]=@idCategory,[completed]=@completed,[modified]=GETDATE() WHERE [id]=@id;',
  remove: 'DELETE FROM [todos] WHERE [id]=@id;',
  toggle: 'UPDATE [todos] SET [completed]=CASE WHEN [completed] is null THEN GETDATE() ELSE null END, [modified]=GETDATE() WHERE [id]=@id;',
  updateCategory: 'UPDATE [todos] SET [idCategory]=@idCategory,[modified]=GETDATE() WHERE [id]=@id;SELECT [id],[idCategory] FROM [todos] WHERE [id]=@id;',
  categories: 'SELECT [id],[category],[color] FROM [categories] ORDER BY [id];',
  statistics: 'SELECT c.[id],C.[category], C.[color], count(*) AS [count] FROM [todos] T'
    + ' INNER JOIN [dbo].[categories] C ON T.[IDCategory]=C.[ID]'
    + ' GROUP BY c.[ID],c.category, c.color'
    + ' ORDER BY c.[ID];'
};

/*var config = {
  user: 'nodejs',
  password: 'nodejs2015',
  server: 'localhost',
  database: 'NodeJsDB',
  options: {
    //InstanceName: 'SQLEXPRESS', //questa proprietà non sembra necessaria
    port: 1433, // va sempre indicata la porta (non funziona con le porte dinamiche)
    encrypt: false // Use this if you're on Windows Azure... non l'ho testato 
  }
};*/

router.get('/todo/search', function (req, res, next) {
  var result = new ServiceStatus();

  var pageNumber = parseInt(req.query.page);
  if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
  var pageSize = parseInt(req.query.size);
  if (isNaN(pageSize) || pageSize < 1) pageSize = 10;
  var startIndex = (pageNumber - 1) * pageSize;

  var text = null;
  if (req.query.hasOwnProperty('text'))
    text = req.query.text;

  var idCategory = null;
  if (req.query.hasOwnProperty('idCategory') && req.query.idCategory != null && req.query.idCategory != '') {
    idCategory = parseInt(req.query.idCategory);
  }

  var status = null;
  if (req.query.hasOwnProperty('status') && req.query.status != null && req.query.status != '') {
    status = parseInt(req.query.status);
  }
  var sort = null;
  if (req.query.hasOwnProperty('sort'))
    sort = req.query.sort;

  //console.log("Todo search: " + startIndex + " | " + pageSize + " | ");
  var connection = new sql.ConnectionPool(config, function (err) {
    if (err) console.log(err);

    //console.log('connection: ' + JSON.stringify(connection));
    var request = new sql.Request(connection);
    //request.verbose = true;
    request.input('startIndex', sql.Int, startIndex);
    request.input('pageSize', sql.Int, pageSize);
    request.input('text', sql.NVarChar(100), text);
    request.input('idCategory', sql.Int, idCategory);
    request.input('status', sql.Int, status);
    request.input('sort', sql.NVarChar(100), sort);
    request.execute(queries.search, function (err, data) {
      if (err) result.addError(err);
      else {
        result.data = data.recordset;
        if (result.data)
          result.addSuccess("Readed startIndex: " + startIndex + " items: " + result.data.length);
        else
          result.addSuccess("no data");
        result.success = true; // se tutto ok sempre true
      }
      res.json(result);
    });
  });
});

router.get('/todo/:id', function (req, res, next) {
  var result = new ServiceStatus();

  var id = req.params.id;
  if (isNaN(id) || id < 0) {
    result.addError('Invalid id');
    return res.send(result);
  }
  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.input('id', sql.Int);
    ps.prepare(queries.read, function (err) {
      if (err) result.addError(err);

      ps.execute({ id: id }, function (err, data) {
        if (err) result.addError(err);
        else if (data.length === 0) result.addError("Not found");
        else {
          result.data = data.recordset[0];
          result.addSuccess("Readed: " + result.data.length);
          result.success = true; // se tutto ok sempre true
        }
        res.json(result);
        //console.log("Read: " + JSON.stringify(recordset));
        ps.unprepare(function (err) {
          if (err) result.addError(err);
        });
      });
    });
  });
});

//insert
router.post('/todo/insert', function (req, res, next) {
  var result = new ServiceStatus();
  //controllo presenza parametri
  if (req.body.hasOwnProperty('id')) result.addError('Ivalid `id` in INSERT');
  if (!req.body.hasOwnProperty('date')) result.addError('`date` required');
  if (!req.body.hasOwnProperty('title')) result.addError('`title` required');
  if (!req.body.hasOwnProperty('idCategory')) result.addError('`idCategory` required');
  if (result.messages.length > 0) {
    return res.send(result);
  }

  var date = req.body.date;
  var title = req.body.title;
  var idCategory = req.body.idCategory;
  var note = null;
  if (req.body.hasOwnProperty('note'))
    note = req.body.note;

  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.input('date', sql.Date);
    ps.input('title', sql.VarChar(100));
    ps.input('note', sql.VarChar(4000));
    ps.input('idCategory', sql.Int);
    ps.prepare(queries.insert, function (err) {
      if (err) result.addError(err);
      else {
        ps.execute({
          date: date,
          title: title,
          note: note,
          idCategory: idCategory
        }, function (err, data) {
          if (err) result.addError(err);
          else {
            //result.data = data.recordset;
            result.addSuccess("Inserted");
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);
          ps.unprepare(function (err) {
            if (err) result.addError(err);
          });
        });
      }
    });
  });
});

//update
router.post('/todo/update', function (req, res, next) {
  var result = new ServiceStatus();

  if (!req.body.hasOwnProperty('id') || isNaN(req.body.id) || req.body.id < 0)
    err.push('`id` required');
  if (!req.body.hasOwnProperty('date')) result.addError('`date` required');
  if (!req.body.hasOwnProperty('title')) result.addError('`title` required');
  if (!req.body.hasOwnProperty('idCategory')) result.addError('`idCategory`required');
  if (result.messages.length > 0) {
    return res.send(result);
  }
  var id = req.body.id;
  var date = req.body.date;
  var title = req.body.title;
  var idCategory = req.body.idCategory;
  var note = null;
  if (req.body.hasOwnProperty('note'))
    note = req.body.note;
  var completed = null;
  if (req.body.hasOwnProperty('completed') && req.body.completed !== null) {
    completed = new Date(req.body.completed);
  }

  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.input('date', sql.Date);
    ps.input('title', sql.VarChar(100));
    ps.input('note', sql.VarChar(4000));
    ps.input('idCategory', sql.Int);
    ps.input('completed', sql.DateTime);
    ps.input('id', sql.Int);
    ps.prepare(queries.update, function (err) {
      if (err) result.addError(err);
      else {
        ps.execute({
          date: date,
          title: title,
          note: note,
          idCategory: idCategory,
          completed: completed,
          id: id
        }, function (err, data) {
          if (err) result.addError(err);
          else {
            //result.data = data.recordset;
            result.addSuccess("Updated id: " + id);
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);

          ps.unprepare(function (err) {
            if (err) result.addError(err);
          });
        });
      }
    });
  });
});

router.post('/todo/delete', function (req, res, next) {
  var result = new ServiceStatus();
  if (!req.body.hasOwnProperty('id') || isNaN(req.body.id) || req.body.id < 0) {
    result.addError('Invalid id');
    return res.send(result);
  }
  var id = req.body.id;
  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.input('id', sql.Int);
    ps.prepare(queries.remove, function (err) {
      if (err) result.addError(err);
      else {

        ps.execute({ id: id }, function (err, data) {
          if (err) result.addError(err);
          else {
            //result.data = data.recordset[0];
            result.addWarning("Deleted id: " + id, 7);  // esempio di impostazione timeout messaggio
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);

          ps.unprepare(function (err) {
            if (err) result.addError(err);
          });
        });
      }
    });
  });
});

//toggle
router.post('/todo/toggle', function (req, res, next) {
  var result = new ServiceStatus();
  if (!req.body.hasOwnProperty('id') || isNaN(req.body.id) || req.body.id < 0) {
    result.addError('Invalid id');
    return res.send(result);
  }
  var id = req.body.id;

  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.input('id', sql.Int);
    ps.prepare(queries.toggle + queries.read, function (err) {
      if (err) result.addError(err);
      else {

        ps.execute({ id: id }, function (err, data) {
          if (err) result.addError(err);
          else {
            result.data = data.recordset[0];
            result.addSuccess("Toggled id: " + id);
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);
          ps.unprepare(function (err) {
            if (err) result.addError(err);
          });
        });
      }
    });
  });
});

//category update
router.post('/todo/category', function (req, res, next) {
  var result = new ServiceStatus();
  if (!req.body.hasOwnProperty('id') || isNaN(req.body.id) || req.body.id < 0) {
    result.addError('Invalid id');
    return res.send(result);
  }
  var id = req.body.id;
  var idCategory = req.body.idCategory;

  var connection = new sql.ConnectionPool(config, function (err) {
    if(err)  result.addError(err);

    var ps = new sql.PreparedStatement(connection);
    ps.input('id', sql.Int);
    ps.input('idCategory', sql.Int);
    ps.prepare(queries.updateCategory + queries.read, function (err) {
      if (err) result.addError(err);
      else {
        ps.execute({ id: id, idCategory: idCategory }, function (err, data) {
          if (err) result.addError(err);
          else {
            result.data = data.recordset[0];
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);
          ps.unprepare(function (err) {
            if (err) throw err;
          });
        });
      }
    });
  });
});

router.get('/categories', function (req, res, next) {
  var result = new ServiceStatus();
  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.prepare(queries.categories, function (err) {
      if (err) result.addError(err);
      else {
        ps.execute(null, function (err, data) {
          ps.unprepare(function (err) {
            if (err) result.addError(err);
          });
          if (err) result.addError(err);
          else {
            result.data = data.recordset;
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);
        });
      }
    });
  });
});

router.get('/statistics', function (req, res, next) {
  var result = new ServiceStatus();
  var connection = new sql.ConnectionPool(config, function (err) {
    var ps = new sql.PreparedStatement(connection);
    ps.prepare(queries.statistics, function (err) {
      if (err) result.addError(err);
      else {
        ps.execute(null, function (err, data) {
          ps.unprepare(function (err) {
            if (err) result.addError(err);
          });
          if (err) result.addError(err);
          else {
            result.data = data.recordset;
            result.success = true; // se tutto ok sempre true
          }
          res.json(result);
        });
      }
    });
  });
});

module.exports = router;
