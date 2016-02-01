var express = require('express')
  , router = express.Router()
  , Recorrido = require('../../models/recorrido/recorrido')
  , Parada = require('../../models/parada/parada')

router.get('/mapa', function(req, res) {
    if (req.query.linea && req.query.recorridoId)
    {
      // habria que validar que sea alguna linea y recorrido correcto

      var linea = Number(req.query.linea);
      var recorridoId = Number(req.query.recorridoId);

      lineas = {};
      lineas[linea] = {};
      lineas[linea].paradas = {};

      Parada.allByLinea(linea, function(err, paradas){
          for (var idx in paradas){
            var parada = paradas[idx];
            lineas[linea].paradas[parada.id] = parada;
          }
          
          Recorrido.get(recorridoId, function(err, recorrido){
            locs = []
            var orden = recorrido.orden;
            for (var idx in orden){
              var bondicomId = orden[idx];
              var loc = lineas[linea].paradas[bondicomId].loc.coordinates;
              locs.push({lat:loc[1], lng:loc[0]});
            }
            res.render('maps', { layout: null, initialLoc: locs[0], locations : locs});
          });
      })  
    }  
})

module.exports = router