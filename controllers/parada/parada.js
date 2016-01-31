var express = require('express')
  , router = express.Router()
  , paradasCercanas = require('../../helpers/paradasCercanas');

router.get('/determinar', function(req, res) {
  if (req.query.lon && req.query.lat && req.query.recorridoId)
  {
    // TODO: hay que verificar que el recorridoId sea correcto y que cantidad sea un numero.

    var limit = req.query.cantidad ? req.query.cantidad : 2;
    var lon = req.query.lon;
    var lat = req.query.lat;
    var recorridoId =  Number(req.query.recorridoId);

    var loc = [Number(lon), Number(lat)];

    paradasCercanas.paradasCercanas(loc, limit, recorridoId, function(err, doc){
      if (err){
        console.log(err);
      }
      if (doc){
        res.json(doc);
      }
    })

  }
})

module.exports = router