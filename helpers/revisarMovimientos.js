var Movimiento = require('../models/movimiento/movimiento');
var async = require('async');


function revisar(callback){
    Movimiento.all(true, function(err, movimientos){
        if (err)
            callback(err)

        if (movimientos){

            var callbacks = []
            for (var idx in movimientos){
                var item = movimientos[idx];

                if (idx > 0){
                    var itemAnt = movimientos[idx-1];

                    var localTimeB = new Date(Date.parse(item.date));
                    var localTimeA = new Date(Date.parse(itemAnt.date));
                    var diffTime = (localTimeB.getTime() - localTimeA.getTime())/1000;
                    var tolerancia = 120; // 100 segundos

                    if (itemAnt.recorridoId == item.recorridoId && itemAnt.i == item.i && item.lat == itemAnt.lat && item.lon == itemAnt.lon && diffTime < tolerancia){
                        var query = { repetido:true};
                        var update = Movimiento.update.bind(null, { _id: itemAnt._id }, query);
                        callbacks.push(update);
                    }

                    if (itemAnt.recorridoId == item.recorridoId && itemAnt.i == item.i && diffTime < tolerancia &&  Number(item.hastaOrdenC) < Number(itemAnt.hastaOrdenC) ){
                        var query = { erroneo:true};
                        var update = Movimiento.update.bind(null, { _id: itemAnt._id }, query);
                        callbacks.push(update);
                    }
                }
            }

            async.parallel(callbacks, function(err, res){
                if (err)
                    callback(err)
                if (res){
                    callback(null, res);
                }
            })
        }

    })
}

exports.revisar = revisar;