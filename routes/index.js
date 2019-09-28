var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { // visualizzo la views/index.ejs
    title: 'TODO'
  });
});

module.exports = router;
