var Paradas = require('../models/paradas/paradas')
var paradas = {}

function getDatos(linea, callback){
	if (paradas.hasOwnProperty(linea)){
		callback(null, paradas[linea]);
	}else{
		// hay que cargar los datos a la memoria
		//paradas[linea] = {};

		Paradas.allByLinea(linea, 
			function(err, docs){
				if (err)
					callback(err)
				if (docs){
					paradas[linea] = {}
					for (var idx in docs)
					{
						var p = docs[idx];
						paradas[linea][p.id] = p;
					}

					callback(null, paradas[linea]);
				}
		})
	}
}

function getName(linea, id, callback){
	getDatos(linea, function(err, paradas){
		if (err)
			callback(err)
		if (paradas){
			callback(null, paradas[id].nombre)
		}
	})
}

exports.getName = getName;
exports.getDatos = getDatos;