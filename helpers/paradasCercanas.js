var Parada = require('../models/parada/parada')
var Recorrido = require('../models/recorrido/recorrido')

// busca que paradas cercanas hay para una location dentro de un recorrido
function paradasCercanas(location, limit, recorridoId, callback)
{
    Recorrido.get(recorridoId, 
        function(err, doc){
            if (err){
                callback(err);
            } 
            if (doc){
                var ordenInv = doc.ordenInv;
                var paradas = Object.keys(ordenInv);

                var result = paradas.map(function (x) {
                    return Number(x);
                });
                paradas = result;
                Parada.geoNear(location, limit, paradas, 
                    function(err, doc){
                        var res = [];
                        if (doc)
                        {
                            for(var idx in doc)
                                res.push(doc[idx].obj);
                            callback(null, res);  
                        }

                        if (err)
                            callback(err);
                })
            }
        });
}

exports.paradasCercanas = paradasCercanas;

