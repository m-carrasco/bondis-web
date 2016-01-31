var express = require('express')
  , router = express.Router()

router.use('/recorrido', require('./recorrido/recorrido'))
router.use('/movimiento', require('./movimiento/movimiento'))
router.use('/parada', require('./parada/parada'))

router.get('/', function(req, res) {
    res.render('home');
});

// 404 catch-all handler (middleware)
router.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
router.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

module.exports = router