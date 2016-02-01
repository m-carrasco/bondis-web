var express = require('express')
  , router = express.Router()
  , Movimiento = require('../../models/movimiento/movimiento')
  , Recorrido = require('../../models/recorrido/recorrido')
  , db = require('../../db')

router.post('/buscar', 
    function(req, res) {
        var answer = { success: true }
        if (req.body.selectLinea && req.body.selectRecorrido){
            Recorrido.getByLineaHacia(Number(req.body.selectLinea), req.body.selectRecorrido.toString(),
                function(err, recorrido) {

                    Movimiento.allByRecorrido(recorrido.id,
                        function(err, movimientos){
                            answer.data = movimientos;
                            res.send(answer);
                        })
                })
        }
})

router.post('/mapa', 
  function(req, res) {
    if (req.body.data)
    {
        var ids = req.body.data;
        if (ids instanceof Array){
            ids = ids.map(function(x,i) {
                return db.driver().Types.ObjectId(x);
            });

            Movimiento.allById(ids,
                function(err, movimientos){
                    var initial =  {lat:movimientos[0].lat, lng:movimientos[0].lon};

                    var locs = []
                    for (var i in movimientos){
                        locs.push({lat:movimientos[i].lat, lng:movimientos[i].lon});
                    }

                    res.render('maps', { layout: null, initialLoc: initial, locations : locs});
                })
        }
    }
})

router.get('/corregir',
    function(req, res) {
        if (req.query.recorridoId) {
            var helper = require('../../helpers/corregirOrdenParada')
            helper.corregirOrdenParadas(Number(req.query.recorridoId), function (err, r) {
                if (err)
                    console.log(err)
                if (r)
                    res.redirect("../../")
            })
        } else
        {
            // por ahi no es lo mas acertado mandar este error.
            res.status(500);
            res.render('500');
        }
    })

router.get('/revisar',
    function(req, res) {
        var helper = require('../../helpers/revisarMovimientos')
        helper.revisar( function(err, r){
            if (err)
                console.log(err)
            if (r)
                res.redirect("../../")
        })
    })

module.exports = router