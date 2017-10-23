var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('two-person', {
    title: 'Two-person Vehicle Reccomender.',
    description: 'See if owning an electric vehicle would be feasible based on your travel patterns'
  });
});

module.exports = router;
