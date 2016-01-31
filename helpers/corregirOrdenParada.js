var Movimiento = require('../models/movimiento/movimiento');
var Recorrido = require('../models/recorrido/recorrido');
var async = require('async');
var paradasCercanas = require('./paradasCercanas');

function corregirOrdenParadas(recorridoId, callback){

	callbacks = []

	Movimiento.allByRecorrido(recorridoId,
		function(err, movimientos){
			if (err)
				callback(err);

			if (movimientos){
				for (var idx in movimientos){
					var mov = movimientos[idx];
					fn = corregirOrdenParada.bind(null, mov._id, recorridoId);
					callbacks.push(fn)
				}

				async.parallel(callbacks, function(err, res){
					if (err)
						callback(err)
					if (res)
						callback(null, res)
				});
			}

		})
}

// id de un movimiento
function corregirOrdenParada(id, recorridoId, callback)
{
	Recorrido.get(recorridoId, 
		function(err, recorrido){
			if (err)
				callback(err)
			if (recorrido){
				Movimiento.get(id, 
					function(err, movimiento){
						if (err)
							callback(err)

						if (movimiento){

							var loc = [Number(movimiento.lon), Number(movimiento.lat)];
							// buscamos las dos paradas dentro del recorrido mas cercanas segun geoNear de Mongo
							paradasCercanas.paradasCercanas(loc, 2, recorrido.id, 
								function(err, paradas){
									if (err){
										callback(err)
									}

									if (paradas){
										var ordenInv = recorrido.ordenInv;
										var orden = recorrido.orden;

										// TODO: orden y ordenInv de las paradas deberian ser mapeos de ints con ints
										var desdeOrden = Math.min(Number(ordenInv[paradas[0].id.toString()]), Number(ordenInv[paradas[1].id.toString()]));
										var hastaOrden = Math.max(Number(ordenInv[paradas[0].id.toString()]), Number(ordenInv[paradas[1].id.toString()]));
								
										var desdeOrdenNombC = orden[desdeOrden.toString()] == paradas[0].id ? paradas[0].nombre : paradas[1].nombre;
										var hastaOrdenNombC = orden[hastaOrden.toString()] == paradas[0].id ? paradas[0].nombre : paradas[1].nombre;

					                    var desdeOrdenC = desdeOrden;
					                    var hastaOrdenC = hastaOrden;

					                    var query = { 'desdeOrdenNombC': desdeOrdenNombC, 'hastaOrdenNombC':hastaOrdenNombC, 'desdeOrdenC' : desdeOrdenC, 'hastaOrdenC': hastaOrdenC};
										Movimiento.update(movimiento._id, query, 
											function(err, raw){
												if (err)
													callback(err)
												if (raw)
													callback(null,raw)
											})
									}

								})
						}
					})
			}
	})	
}

exports.corregirOrdenParadas = corregirOrdenParadas;
exports.corregirOrdenParada = corregirOrdenParada;