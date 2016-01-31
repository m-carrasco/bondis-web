var Recorrido = require('../models/recorrido/recorrido')
var recorridos = {}

function getDatos(id, callback){
	if (recorridos.hasOwnProperty(id)){
		callback(null, recorridos[linea]);
	}else{
		// hay que cargar los datos a la memoria
		//recorridos[id] = {};

		Recorrido.get(id, 
			function(err, doc){
				if (err)
					callback(err)
				if (doc){
					recorridos[id] = doc;
					callback(null, recorridos[id]);
				}
		})
	}
}

/*function getName(linea, id, callback){
	getDatos(linea, function(err, paradas){
		if (err)
			callback(err)
		if (paradas){
			callback(null, paradas[id].nombre)
		}
	})
}*/

//exports.getName = getName;
exports.getDatos = getDatos;